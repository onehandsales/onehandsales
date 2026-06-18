# 통합검색 API

## 1. API 개요

- API 이름: 통합검색 API
- API 식별자: `SearchAll`
- 계약 상태: `implemented`
- 서비스: User Web
- Method: `GET`
- Path: `/api/search`
- 인증: `Authorization: Bearer {accessToken}`
- 권한: 현재 사용자 본인 데이터만 조회

## 2. 목적

회사, 담당자, 제품, 딜, 일정, 회의록을 같은 검색어로 조회하고, Frontend가 결과 선택 시 바로 상세 화면으로 이동할 수 있는 최소 결과 정보를 반환한다.

## 3. Request

Request 이름: `SearchAllQuery`

### Query

| 필드 | 타입 | 필수 | nullable | validation | 예시 | 설명 |
|---|---|---:|---:|---|---|---|
| `q` | string | 필수 | 불가 | trim 후 두 글자 미만이면 빈 결과 | `세손` | 검색어 |
| `types` | string | 선택 | 불가 | comma-separated enum. 허용값: `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`, `SCHEDULE`, `MEETING_NOTE` | `COMPANY,DEAL` | 검색 대상 제한 |
| `limit` | number | 선택 | 불가 | integer, `1..20`, 기본값 `5` | `5` | 도메인별 최대 결과 수 |

### Header

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `Authorization` | string | 필수 | App access token bearer header |

Body 없음.

## 4. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. `q`를 trim한다.
3. `q`가 두 글자 미만이면 DB를 조회하지 않고 `{ "groups": [] }`를 반환한다.
4. `types`가 없으면 전체 검색 대상 타입을 사용한다.
5. `types`가 있으면 comma 단위로 분리하고 중복을 제거한다.
6. 허용하지 않는 type이 있으면 validation error를 반환한다.
7. `limit`는 기본 `5`, 최대 `20`으로 정규화한다.
8. 각 도메인 repository query는 반드시 `userId` 조건을 포함한다.
9. 조회 결과를 도메인별 `SearchGroup`으로 변환한다.
10. 결과에는 상세 이동에 필요한 `targetPath`를 포함한다.
11. `search.executed` 구조화 로그를 남기되 검색어 원문은 남기지 않는다.

## 5. Response

Response 이름: `SearchAllResponse`

Status: `200 OK`

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
| `items[].title` | string | 불가 | 결과 제목 |
| `items[].subtitle` | string | 가능 | 결과 보조 설명. 민감 원문 전체를 넣지 않는다. |
| `items[].targetId` | string | 불가 | 상세 조회 대상 ID |
| `items[].targetPath` | string | 가능 | User Web 이동 경로 |

## 6. 연결 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`
- 조회: `Contact`, `Company`, `ContactDepartment`, `ContactJobGrade`
- 조회: `Product`, `ProductCategory`, `ProductStatus`
- 조회: `Deal`, `Company`, `Contact`
- 조회: `Schedule`, `ScheduleDeal`, `Deal`
- 조회: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- 생성/수정/삭제: 없음
- transaction: 없음

## 7. Observability

- log event key: `search.executed`
- audit log: 없음
- request id: 사용
- redaction: 검색어 원문, 이메일, 전화번호, 회의록 본문 원문 전체를 로그에 남기지 않는다.
- provider call: 없음

## 8. 에러 응답

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인 갱신 또는 로그인 화면 이동 | warn |
| `q` 누락 | 400 | 검색 오류 메시지 표시 | warn |
| `types` 값 오류 | 400 | 검색 오류 메시지 표시 | warn |
| `limit` 범위 오류 | 400 | 검색 오류 메시지 표시 | warn |

## 9. FE/BE 처리 기준

- FE: `q` 두 글자 이상에서만 호출한다.
- FE: 결과 선택 시 `targetPath`로 이동한다.
- FE: 일정 결과는 `/schedules/:scheduleId` route에서 `GET /api/schedules/{scheduleId}`로 다시 조회한다.
- BE: controller는 request를 application service에 위임한다.
- BE: application service는 query 정규화, type validation, log event를 담당한다.
- BE: Prisma 조회는 search infrastructure repository에만 둔다.

## 10. 관련 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
