# G04 Currency Product Deal

상태: Done
목표: Product/Deal 금액에 통화 의미를 명시한다.

## 1. 포함 범위

- `Product.currencyCode`
- `Deal.currencyCode`
- KRW/USD validation
- 정수 금액 유지
- Product/Deal create/update/list/detail/report/export type 보강
- Deal 생성 시 Product currency 기본값
- FE currency format utility 적용

## 2. 제외 범위

- USD cent/minor unit
- 환율 변환
- 결제/세금
- 다중 통화 합산 리포트 고도화

## 3. Backend 작업

1. Prisma schema에 Product/Deal `currencyCode`를 추가한다.
2. 기존 데이터 default를 `KRW`로 둔다.
3. create/update DTO에 `currencyCode`를 추가한다.
4. 허용 통화는 `KRW`, `USD`로 제한한다.
5. Deal 생성 시 Product currency를 기본값으로 사용한다.
6. Product가 없으면 User default currency를 사용한다.
7. export/report 응답이 currency 의미를 잃지 않게 한다.

## 4. Frontend 작업

1. Product/Deal type/API client를 갱신한다.
2. Product/Deal form에 currency 선택을 추가한다.
3. 기존 `₩`, `원`, `ko-KR`, `KRW` 하드코딩을 format utility로 교체한다.
4. Deal 생성 시 Product 선택 변경에 따른 currency 기본값을 처리한다.

## 5. Request 계약

Product create/update 요청은 `currencyCode`를 포함한다.

```json
{
  "productName": "Starter Package",
  "productPrice": 99,
  "currencyCode": "USD"
}
```

Deal create/update 요청은 `currencyCode`를 포함한다.

```json
{
  "dealName": "Q3 Renewal",
  "dealCost": 1200,
  "currencyCode": "USD"
}
```

## 6. Response 계약

Product/Deal 목록, 상세, export/report 관련 응답은 `currencyCode`를 포함한다.

```json
{
  "dealCost": 1200,
  "currencyCode": "USD"
}
```

에러 후보:

```json
{
  "code": "CURRENCY_UNSUPPORTED",
  "field": "currencyCode"
}
```

## 7. Business Logic

- 허용 통화는 `KRW`, `USD`다.
- 금액은 정수만 허용한다.
- 기존 Product/Deal 데이터는 `KRW`로 의미를 유지한다.
- Deal 생성 기본값은 Product currency를 우선한다.
- Product currency가 없으면 `User.defaultCurrencyCode`를 사용한다.
- 환율 변환과 USD cent는 구현하지 않는다.

## 8. User Flow

1. 사용자가 Product 생성/수정 form에서 currency를 선택한다.
2. 사용자가 Deal 생성 시 Product를 선택한다.
3. Deal currency가 Product currency로 자동 설정된다.
4. 사용자는 Deal currency를 KRW/USD 중 하나로 바꿀 수 있다.
5. 목록/상세/export에서 금액과 통화가 함께 표시된다.

## 9. DB/Prisma 영향

필수 참조:

- `BE/prisma/schema.prisma`의 `model Product`
- `BE/prisma/schema.prisma`의 `model Deal`
- 기존 Product/Deal migration
- `BE/prisma/seed.ts`

DB 변경:

- `Product.currencyCode String @default("KRW")`
- `Deal.currencyCode String @default("KRW")`

주석 필수:

- Prisma schema 새 column에 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에 `COMMENT ON COLUMN`을 추가한다.

## 10. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- product deal schedule sales-report
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 11. Goal 검토 체크리스트

- [x] Product/Deal currency DB 필드가 있다.
- [x] 기존 데이터는 KRW 의미를 유지한다.
- [x] 허용 통화는 KRW/USD다.
- [x] 금액 입력은 정수만 허용한다.
- [x] Product/Deal request에 `currencyCode`가 있다.
- [x] Product/Deal response에 `currencyCode`가 있다.
- [x] business logic이 Product currency 우선, User default fallback을 따른다.
- [x] user flow에서 Deal currency 변경이 가능하다.
- [x] `BE/prisma`를 참고했고 신규 column에 한글 주석이 있다.
- [x] Deal은 Product currency를 기본값으로 가져온다.
- [x] Deal currency는 변경 가능하다.
- [x] Product/Deal export/report가 currency-aware하다.
- [x] 신규 코드에 한글 주석 규칙이 적용됐다.
- [x] 실행한 검증 결과를 기록했다.

## 12. 완료 기록

- 완료일: 2026-07-28
- DB 변경: `Product.currencyCode`, `Deal.currencyCode`
- 신규 migration: `BE/prisma/migrations/20260728020000_add_product_deal_currency/migration.sql`
- Backend 주요 구현: Product/Deal DTO, application service, Prisma repository, company/contact 연결 딜 응답, schedule/AI weekly report snapshot 통화 보존
- Frontend 주요 구현: Product/Deal form 통화 선택, Deal 생성 Product 통화 기본값, currency formatter 표시, schedule/AI weekly report 개별 딜 통화 표시
- 오류 계약: `CURRENCY_UNSUPPORTED`, `AMOUNT_INTEGER_REQUIRED`

검증 결과:

```powershell
cd BE
pnpm.cmd run prisma:validate
pnpm.cmd run prisma:generate
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- product deal schedule sales-report
pnpm.cmd run build
```

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

- BE `prisma:validate`, `prisma:generate`, `typecheck`, `lint`, `test -- product deal schedule sales-report`, `build` 통과.
- FE `typecheck`, `lint`, `build` 통과.
- FE `build`는 기존 번들 크기 경고만 출력했다.
