# Company List Contact Count API Spec

## 1. 목적

이 문서는 회사 목록 페이지네이션 API에 회사별 거래처 수를 추가하는 계약을 정의한다.

작성 기준:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 2. 계약 상태

- API: `GET /api/companies`
- 소비자: User Web
- 계약 상태: draft
- 호환성: 기존 응답 item에 optional이 아닌 숫자 필드 추가
- 변경 대상 응답: `CompanyListItemResponse`

## 3. 변경 요약

회사 목록 페이지네이션 조회 시 각 회사 item에 해당 회사에 연결된 거래처 수를 추가한다.

추가 필드:

```ts
contactCount: number
```

## 4. Request

기존 `GET /api/companies` 요청값을 변경하지 않는다.

| 위치 | 필드 | 타입 | 필수 | 설명 |
|---|---|---|---:|---|
| query | `page` | number | 아니오 | 1부터 시작. 기본값 1 |
| query | `companyName` | string | 아니오 | 회사 이름 부분 검색어 |
| query | `companyFieldId` | string | 아니오 | 회사 분야 필터 ID |
| query | `companyRegionId` | string | 아니오 | 회사 지역 필터 ID |

## 5. Response

기존 `CompanyPageResponse` 구조를 유지하고 `items[].contactCount`만 추가한다.

```json
{
  "items": [
    {
      "id": "company-id",
      "companyName": "회사명",
      "companyField": {
        "id": "field-id",
        "field": "제조"
      },
      "companyRegion": {
        "id": "region-id",
        "region": "서울"
      },
      "createdAt": "2026-06-12T00:00:00.000Z",
      "contactCount": 3
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 100,
  "totalPages": 5
}
```

`CompanyListItemResponse` 변경:

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `contactCount` | number | 아니오 | 해당 회사에 연결된 거래처 수 |

## 6. 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. 기존 회사 목록 query를 validation한다.
3. `companyFieldId`, `companyRegionId`가 있으면 현재 사용자 소유인지 검증한다.
4. 기존과 동일하게 현재 사용자 `userId` ownership 기준으로 회사 목록을 조회한다.
5. 목록의 각 회사에 연결된 `Contact` 개수를 함께 계산한다.
6. `items[].contactCount`에 회사별 거래처 수를 넣어 응답한다.
7. `totalCount`는 기존처럼 검색/필터 조건에 맞는 회사 전체 개수로 유지한다.

## 7. 연결 DB 스키마

- 조회: `Company`, `CompanyField`, `CompanyRegion`, `Contact`
- 생성: 없음
- 수정: 없음
- 삭제: 없음
- transaction: 없음

관계 기준:

- `Contact.companyId`는 `Company.id`를 참조한다.
- `Company`와 `Contact`는 모두 `userId`를 가진 사용자 소유 데이터다.

## 8. Transaction

- 필요 여부: 없음
- 이유: 조회 전용 API다.
- rollback 범위: 없음
- 외부 Provider 호출: 없음

## 9. Observability

- event key: `company.listed`
- audit log: 없음
- request id: 사용
- redaction: 회사 검색어 원문과 메모 원문 logging 금지
- 추가 필드인 `contactCount`는 숫자 집계값이므로 민감 원문에 해당하지 않는다.

## 10. Error

기존 `GET /api/companies` 에러 정책을 유지한다.

| 상황 | 에러 | HTTP |
|---|---|---:|
| 인증 없음 또는 invalid | `Unauthorized` | 401 |
| 잘못된 page 또는 UUID | `ValidationError` | 400 |
| 본인 소유가 아닌 분야 ID | `CompanyFieldNotFound` | 404 |
| 본인 소유가 아닌 지역 ID | `CompanyRegionNotFound` | 404 |

## 11. FE/BE 처리 기준

FE:

- 회사 목록 item에서 `contactCount`를 거래처 수 표시 용도로 사용할 수 있다.
- `totalCount`를 거래처 수로 해석하지 않는다.
- `totalCount`는 회사 목록 페이지네이션의 전체 회사 개수로 유지한다.

BE:

- N+1 count 쿼리가 생기지 않도록 회사 목록 조회 단계에서 함께 집계한다.
- Prisma relation `_count` 사용을 우선 검토한다.
- 다른 사용자의 거래처 수가 섞이지 않도록 ownership 기준을 유지한다.

## 12. 검증 기준

- 거래처가 없는 회사는 `contactCount: 0`을 반환한다.
- 거래처가 1개 이상 연결된 회사는 실제 연결 수를 반환한다.
- 검색/필터 적용 시 `totalCount`는 회사 개수 기준으로 유지된다.
- `contactCount` 추가로 정렬, 페이지네이션, 필터 결과가 바뀌지 않는다.
- 다른 사용자의 회사 또는 거래처 수가 섞이지 않는다.
