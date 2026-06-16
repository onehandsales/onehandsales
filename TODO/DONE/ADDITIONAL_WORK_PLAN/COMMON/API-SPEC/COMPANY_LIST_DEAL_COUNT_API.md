# Company List Deal Count API Spec

## 1. 목적

회사 목록 페이지네이션 API 응답에 회사별 연결 딜 수 `dealCount`를 추가한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/companies`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 기존 응답 item에 필수 숫자 필드 추가
- 변경 대상 응답: `CompanyListItemResponse`

## 3. 변경 요약

회사 목록의 각 item에 해당 회사에 연결된 딜 개수를 추가한다.

추가 필드:

```ts
dealCount: number
```

`contactCount`가 이미 존재한다면 `contactCount`와 `dealCount`를 함께 반환한다.

## 4. Request

기존 `GET /api/companies` 요청값은 변경하지 않는다.

- Request 이름: `ListCompaniesQuery`
- Method: `GET`
- Path: `/api/companies`

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| query | `page` | number | 아니오 | 정수, 1 이상 | 1부터 시작. 기본값 1 |
| query | `companyName` | string | 아니오 | trim 후 빈 문자열이면 미적용 | 회사명 부분 검색 |
| query | `companyFieldId` | string | 아니오 | UUID | 회사 분야 필터 |
| query | `companyRegionId` | string | 아니오 | UUID | 회사 지역 필터 |

## 5. Response

- Response 이름: `CompanyPageResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "items": [
    {
      "id": "company-id",
      "companyName": "삼성전자",
      "companyField": {
        "id": "field-id",
        "field": "제조"
      },
      "companyRegion": {
        "id": "region-id",
        "region": "서울"
      },
      "contactCount": 5,
      "dealCount": 12,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 100,
  "totalPages": 10
}
```

`CompanyListItemResponse` 변경:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `dealCount` | number | 아니오 | 해당 회사에 연결된 딜 수 |

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. 기존 회사 목록 query를 validation한다.
3. 회사 분야/지역 필터가 있으면 현재 사용자 소유인지 확인한다.
4. `Company.userId = currentUserId` 조건으로 회사 목록을 조회한다.
5. 각 회사에 연결된 `Deal` 개수를 함께 집계한다.
6. `items[].dealCount`에 회사별 딜 수를 넣어 반환한다.
7. `totalCount`는 기존처럼 검색/필터 조건에 맞는 회사 개수로 유지한다.

## 7. 연결 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Deal`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Deal.companyId`는 `Company.id`를 참조한다.
- `Company`와 `Deal`은 모두 `userId`로 현재 사용자 소유권을 가진다.

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## 9. Observability

- event key: `company.listed`
- audit log: 없음
- request id: 사용
- redaction: 회사 검색어 원문, 메모 원문 logging 금지
- log context 권장값: `userId`, `filterKeys`, `page`, `itemCount`

## 10. Error

기존 `GET /api/companies` 에러 정책을 유지한다.

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | refresh 또는 로그인 이동 | warn |
| 잘못된 page 또는 UUID | `ValidationError` | 400 | 목록 오류 상태 | log |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 | 필터 초기화 또는 오류 표시 | log |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 | 필터 초기화 또는 오류 표시 | log |

## 11. FE/BE 처리 기준

FE:

- 회사 목록 item에서 `dealCount`를 `딜 수` 표시 용도로 사용한다.
- `totalCount`는 회사 개수이며 딜 수로 해석하지 않는다.
- `dealCount`가 0인 회사도 정상 표시한다.

BE:

- N+1 count 쿼리가 생기지 않도록 목록 조회 단계에서 집계한다.
- Prisma relation `_count` 또는 group by 집계를 우선 검토한다.
- 다른 사용자의 딜 수가 섞이지 않도록 `userId` 조건을 유지한다.

## 12. 검증 기준

- 딜이 없는 회사는 `dealCount: 0`을 반환한다.
- 딜이 있는 회사는 실제 연결 수를 반환한다.
- `contactCount`가 기존대로 유지된다.
- 검색/필터/페이지네이션 결과는 기존과 동일하다.
- 다른 사용자의 회사나 딜 수가 섞이지 않는다.
