# Contact Deal List API Spec

## 1. 목적

담당자 단건 상세 페이지에서 해당 담당자에 연결된 딜 전체 목록을 조회하는 API 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DEAL_SCHEMA.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/contacts/:contactId/deals`
- 소비자: User Web
- 계약 상태: implemented
- 호환성: 신규 API
- 대상 화면: 담당자 단건 상세 페이지

## 3. API 요약

해당 담당자에 연결된 딜 전체 목록을 반환한다.

- 페이지네이션 없음
- 정렬: `createdAt DESC`, 보조 정렬 `id DESC`
- 응답 필드: `id`, `dealName`, `dealCost`, `createdAt`

## 4. Request

- Request 이름: `ListContactDealsRequest`
- Method: `GET`
- Path: `/api/contacts/:contactId/deals`
- 인증: Backend App access token 필요
- 권한: 본인 담당자에 연결된 딜만 조회

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---|---:|---|---|
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| path | `contactId` | string | 예 | UUID | 담당자 ID |
| query | 없음 | 없음 | 아니오 | 없음 | 페이지네이션과 필터 없음 |
| body | 없음 | 없음 | 아니오 | 없음 | body 없음 |

## 5. Response

- Response 이름: `ContactDealListResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "items": [
    {
      "id": "deal-id",
      "dealName": "송재근 부장 재계약",
      "dealCost": 3000000,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

`ContactDealListItemResponse`

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | string | 아니오 | Deal ID |
| `dealName` | string | 아니오 | 딜 이름 |
| `dealCost` | number | 아니오 | 딜 금액 |
| `createdAt` | string | 아니오 | 등록일 ISO string |

연결된 딜이 없으면 `items: []`를 반환한다.

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. `contactId` path param을 validation한다.
3. `Contact.id = contactId`, `Contact.userId = currentUserId` 조건으로 담당자 ownership을 확인한다.
4. 담당자가 없거나 현재 사용자 소유가 아니면 `ContactNotFound`를 반환한다.
5. `Deal.contactId = contactId`, `Deal.userId = currentUserId` 조건으로 딜 목록을 조회한다.
6. `createdAt DESC`, `id DESC`로 정렬한다.
7. 응답에는 `id`, `dealName`, `dealCost`, `createdAt`만 포함한다.

## 7. 연결 DB 스키마

- 조회: `Contact`, `Deal`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음
- audit log 포함: 없음

## 9. Observability

- event key: `contact.deals.listed`
- audit log: 없음
- request id: 사용
- redaction: 담당자 이름, 딜 이름, 딜 금액 원문 logging 금지
- log context 권장값: `userId`, `contactId`, `itemCount`

## 10. Error

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | refresh 또는 로그인 이동 | warn |
| `contactId` 형식 오류 | `ValidationError` | 400 | 담당자 상세 오류 상태 | log |
| 담당자 없음 또는 본인 소유 아님 | `ContactNotFound` | 404 | 담당자 not found 또는 목록 이동 | log |

## 11. FE/BE 처리 기준

FE:

- 담당자 상세 화면에서 연결 딜 목록 섹션으로 표시한다.
- 페이지네이션 UI를 만들지 않는다.
- item 클릭 시 `/deals/:dealId`로 이동할 수 있다.

BE:

- 기존 `GET /api/contacts/:contactId` 응답 shape는 변경하지 않는다.
- 담당자 ownership 확인 후 딜 목록을 조회한다.
- `Deal.contactId`와 `Deal.userId` 조건을 모두 포함한다.

## 12. 검증 기준

- 본인 담당자에 연결된 딜 목록만 반환한다.
- 연결 딜이 없으면 `items: []`를 반환한다.
- 다른 사용자 담당자 ID는 `ContactNotFound`로 처리한다.
- 정렬은 `createdAt DESC`, `id DESC` 기준이다.
