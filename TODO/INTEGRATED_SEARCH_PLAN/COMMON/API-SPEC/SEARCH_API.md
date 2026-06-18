# 통합검색 API

## 1. API 개요

- API 이름: 통합검색 API
- API 식별자: `SearchAll`
- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 신규 API, 기존 API breaking change 없음
- Method: `GET`
- Path: `/api/search`
- 인증: `Authorization: Bearer {accessToken}`
- 권한: 현재 사용자 본인 데이터만 조회

## 2. 목적

회사, 담당자, 제품, 딜, 일정, 회의록을 같은 키워드로 검색하고, Frontend가 결과를 클릭했을 때 바로 상세 화면으로 이동할 수 있는 최소 결과 정보를 반환한다.

## 3. Request

- Request 이름: `SearchAllQuery`

### Query

| 필드 | 타입 | 필수 | nullable | validation | 예시 | 설명 |
|---|---|---:|---:|---|---|---|
| `q` | string | 필수 | 불가 | trim 후 문자열, 두 글자 미만이면 빈 결과 | `세손` | 검색어 |
| `types` | string | 선택 | 불가 | comma-separated enum. 허용값: `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE` | `COMPANY,DEAL` | 검색 대상 제한 |
| `limit` | number | 선택 | 불가 | integer, `1..20`, 기본값 `5` | `5` | 도메인별 최대 결과 수 |

### Header

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `Authorization` | string | 필수 | App access token bearer header |

Body 없음.

## 4. 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `q`를 trim한다.
3. `q`가 두 글자 미만이면 DB를 조회하지 않고 `{ "groups": [] }`를 반환한다.
4. `types`가 없으면 전체 검색 타입을 기본 순서로 사용한다.
5. `types`가 있으면 comma 단위로 분리하고 중복을 제거한다.
6. 허용되지 않는 type이 있으면 `ValidationError`를 반환한다.
7. `limit`은 기본 `5`, 최대 `20`으로 정규화한다.
8. 각 도메인 repository query는 반드시 `userId` 조건을 포함한다.
9. 조회 결과를 도메인별 `SearchGroup`으로 변환한다.
10. 결과에는 상세 이동에 필요한 `targetPath`를 포함한다.
11. 구조화 로그 `search.executed`를 남기되 검색어 원문은 남기지 않는다.

## 5. Response

- Response 이름: `SearchAllResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "groups": [
    {
      "type": "COMPANY",
      "items": [
        {
          "title": "세손상사",
          "subtitle": "제조 · 서울",
          "targetId": "00000000-0000-4000-8000-000000000001",
          "targetPath": "/companies/00000000-0000-4000-8000-000000000001"
        }
      ]
    },
    {
      "type": "SCHEDULE",
      "items": [
        {
          "title": "세손상사 미팅",
          "subtitle": "2026. 06. 18. 14:00 · 세손상사 본사 · 세손상사 신규 공급 계약",
          "targetId": "00000000-0000-4000-8000-000000000002",
          "targetPath": "/schedules/00000000-0000-4000-8000-000000000002"
        }
      ]
    }
  ]
}
```

### Response 필드

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `groups` | `SearchGroup[]` | 불가 | 검색 대상별 결과 그룹 |
| `groups[].type` | `SearchTargetType` | 불가 | 검색 대상 타입 |
| `groups[].items` | `SearchItem[]` | 불가 | 해당 타입의 결과 목록 |
| `items[].title` | string | 불가 | 결과 첫 줄 제목 |
| `items[].subtitle` | string | 가능 | 결과 보조 설명. 민감 원문 전체를 싣지 않는다. |
| `items[].targetId` | string | 불가 | 상세 조회 대상 ID |
| `items[].targetPath` | string | 가능 | User Web 이동 경로 |

## 6. 연결된 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`
- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 조회: `Product`, `ProductCategory`, `ProductStatus`
- 조회: `Deal`, `Company`, `Contact`
- 조회: `Schedule`, `ScheduleDeal`, `Deal`
- 조회: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

## 7. Transaction

- 필요 여부: 없음
- 이유: 통합검색은 읽기 전용 API이며 여러 도메인 조회 결과 사이에 원자성이 필요하지 않다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

## 8. Observability

- log event key: `search.executed`
- audit log: 없음
- request id: 사용
- redaction: 검색어 원문, 이메일, 전화번호, 회의록 본문 원문 전체를 로그에 남기지 않는다.
- provider error context: 없음

## 9. 에러 응답

| 상황 | error code | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 | `Unauthorized` | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `q` 누락 | `BadRequest` 또는 validation error | 400 | 검색 에러 메시지 표시 | warn |
| `types` 값 오류 | `ValidationError` | 400 | 검색 에러 메시지 표시 | warn |
| `limit` 범위 오류 | validation error | 400 | 검색 에러 메시지 표시 | warn |

## 10. FE/BE 처리 기준

- FE: `q` 두 글자 이상일 때 호출하고, 결과 선택 시 `targetPath`로 이동한다.
- FE: 현재 User Web에는 일정 단건 route가 없으므로 후속 goal에서 `/schedules/:scheduleId`를 추가한다.
- BE: controller는 request를 application service에 위임한다.
- BE: application service는 query 정규화, type validation, log event를 담당한다.
- BE: Prisma 조회는 search infrastructure repository에만 둔다.
- 검증: service 단위 테스트, controller route/DTO 테스트, `pnpm typecheck`, `pnpm lint`.

## 11. 관련 문서

- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/USER-FLOW.md`
- `TODO/INTEGRATED_SEARCH_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
