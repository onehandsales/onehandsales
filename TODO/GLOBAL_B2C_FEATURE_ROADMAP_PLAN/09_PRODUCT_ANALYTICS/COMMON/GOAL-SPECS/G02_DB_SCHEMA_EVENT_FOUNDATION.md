# G02 DB Schema Event Foundation

상태: Ready
목표: 제품 분석 raw event와 snapshot을 위한 Prisma schema, migration, repository 기반을 만든다.

## 1. 목적

G02는 09의 DB 정본을 만든다. `ProductAnalyticsEvent`를 raw event table로 만들고, activation/retention 계산에 필요한 snapshot table을 준비한다.

## 2. 포함 범위

- Prisma enum/model 추가
- 신규 migration 작성
- Analytics module/repository skeleton
- Event taxonomy domain file skeleton
- Analytics eventDate helper
- Prisma validate/generate 검증

## 3. 제외 범위

- Collector HTTP API 구현
- Server event 기록 지점 연결
- User Web client wrapper
- Snapshot runner 실제 계산
- Admin API/UI
- Billing/paywall/churn table

## 4. 작업

1. `BE/prisma/schema.prisma`에 analytics enum/model을 추가한다.
2. User/AuthSession/AuthDevice relation을 추가한다.
3. 신규 migration을 만든다.
4. migration에 table/column/index COMMENT를 남긴다.
5. `BE/src/modules/analytics` 기본 module/repository 파일을 만든다.
6. `BE/src/modules/analytics/application/services/product-analytics-date.ts`를 만든다.
7. event taxonomy allowlist skeleton을 만든다.
8. `BE/src/app.module.ts`에 AnalyticsModule을 연결한다.

## 5. Request 계약

G02는 HTTP request를 만들지 않는다.

내부 repository 입력 계약:

```ts
type ProductAnalyticsTargetTypeCode =
  | "USER"
  | "DEAL"
  | "SCHEDULE"
  | "MEETING_NOTE"
  | "BUSINESS_CARD_SCAN"
  | "IMPORT_JOB"
  | "EXPORT";

interface CreateProductAnalyticsEventInput {
  readonly userId: string;
  readonly authSessionId: string | null;
  readonly authDeviceId: string | null;
  readonly eventName: string;
  readonly eventVersion: number;
  readonly source: "CLIENT" | "SERVER" | "SYSTEM";
  readonly occurredAt: Date;
  readonly eventDate: string;
  readonly timeZone: string;
  readonly idempotencyKey?: string | null;
  readonly targetType?: ProductAnalyticsTargetTypeCode | null;
  readonly targetId?: string | null;
  readonly payloadJson: Record<string, unknown>;
}
```

Repository 입력에서 `idempotencyKey`가 nullable인 이유는 `source=CLIENT` event가 null을 사용하기 때문이다. `source=SERVER` recorder는 G04/G03 계약에 따라 non-empty string을 검증한 뒤 repository를 호출한다.

## 6. Response 계약

G02는 HTTP response를 만들지 않는다.

Repository response 계약:

```ts
interface ProductAnalyticsEventRecord {
  readonly id: string;
}
```

Repository interface 필수 method:

```ts
interface ProductAnalyticsRepository {
  createEvent(input: CreateProductAnalyticsEventInput): Promise<ProductAnalyticsEventRecord>;
  findAuthDeviceIdBySessionId(sessionId: string): Promise<string | null>;
}
```

`findAuthDeviceIdBySessionId`는 `AuthSession.id`로 row를 조회해 `authDeviceId`만 반환한다. AuthGuard가 이미 ACTIVE 세션만 `CurrentUserContext`로 만들기 때문에 이 method는 상태 검증을 반복하지 않는다. 세션 row가 삭제되어 없으면 null을 반환하고, analytics event 저장은 `authDeviceId=null`로 계속 진행한다.

## 7. Business Logic

- raw event는 자체 DB 정본이다.
- `payloadJson`은 application allowlist를 통과한 값만 받는다.
- `occurredAt`은 UTC instant다.
- `eventDate`는 사용자 timezone 기준 날짜다.
- `ProductAnalyticsEvent.userId`는 account hard delete 시 함께 삭제 가능해야 한다.
- `RetentionCohortSnapshot`은 userId를 저장하지 않는 aggregate다.
- `source=SERVER` event는 repository 저장 전에 non-empty `idempotencyKey`를 가져야 한다.
- auth device 보강은 `ProductAnalyticsRepository.findAuthDeviceIdBySessionId`로만 수행한다.
- `eventDate`는 `resolveProductAnalyticsEventDate(occurredAt, timeZone)` helper가 반환하는 `YYYY-MM-DD` string을 사용한다.
- `resolveProductAnalyticsEventDate`는 `Intl.DateTimeFormat(...).formatToParts()`로 year/month/day를 추출하고 서버 로컬 timezone에 의존하지 않는다.
- `addDaysToProductAnalyticsDate(eventDate, dayOffset)` helper는 date-only retention 계산에만 사용한다.
- `addDaysToProductAnalyticsDate`는 `YYYY-MM-DD`를 year/month/day로 분해하고 `Date.UTC(year, month - 1, day + dayOffset)`로 계산한 뒤 `YYYY-MM-DD`를 반환한다.
- `toProductAnalyticsDateOnlyDate(eventDate)` helper는 repository persistence에서 `YYYY-MM-DD`를 `DateTime @db.Date` 저장용 `Date`로 변환할 때만 사용한다.
- `toProductAnalyticsDateOnlyDate`는 `Date.UTC(year, month - 1, day)`로 UTC midnight `Date`를 만들고 서버 local timezone을 쓰지 않는다.
- `formatProductAnalyticsDateOnlyDate(value)` helper는 Prisma `DateTime @db.Date` 값을 `YYYY-MM-DD`로 되돌릴 때만 사용한다.
- `formatProductAnalyticsDateOnlyDate`는 `value.toISOString().slice(0, 10)` 기준으로 처리한다.

## 8. User Flow

사용자-facing flow 변화는 없다.

간접 흐름:

1. 이후 G03/G04/G05에서 event가 들어온다.
2. G02에서 만든 DB table이 event를 저장한다.
3. G06에서 snapshot이 이 table을 읽는다.

## 9. DB/Prisma 영향

추가 대상:

- `ProductAnalyticsEventSource`
- `UserActivationStatus`
- `ProductAnalyticsTargetType`
- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`

Prisma 주석:

- 모든 신규 enum/model/field에 `/// 기능 : ...`를 둔다.

Migration 주석:

- table comment
- column comment
- 주요 index comment

## 10. 코드 주석 기준

Backend:

- `AnalyticsModule`: `// 역할 : ...`
- repository interface/class: `// 역할 : ...`
- repository method/helper: `// 기능 : ...`
- date helper: `// 기능 : UTC instant를 사용자 timezone 기준 eventDate로 변환합니다.`
- date add helper: `// 기능 : 사용자 timezone 기준 date-only 값에 retention day offset을 더합니다.`
- date persistence helper: `// 기능 : YYYY-MM-DD date-only 값을 Prisma @db.Date 저장용 UTC Date로 변환합니다.`
- date format helper: `// 기능 : Prisma @db.Date 값을 YYYY-MM-DD date-only 문자열로 변환합니다.`
- taxonomy helper: `// 기능 : ...`

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
```

테스트 기준:

```powershell
cd BE
pnpm run test -- product-analytics
```

## 12. Goal 검토 체크리스트

- [ ] 기존 migration 파일을 수정하지 않았다.
- [ ] 새 migration 파일을 만들었다.
- [ ] 신규 enum/model/field에 Prisma 한국어 주석이 있다.
- [ ] migration에 COMMENT 또는 의도 주석이 있다.
- [ ] `ProductAnalyticsEvent`가 `userId`, `authSessionId`, `authDeviceId`를 가진다.
- [ ] repository에 `createEvent`와 `findAuthDeviceIdBySessionId`가 있다.
- [ ] `resolveProductAnalyticsEventDate` helper가 서버 로컬 timezone에 의존하지 않는다.
- [ ] `addDaysToProductAnalyticsDate` helper가 서버 로컬 timezone에 의존하지 않는다.
- [ ] `toProductAnalyticsDateOnlyDate` helper가 서버 로컬 timezone에 의존하지 않는다.
- [ ] `formatProductAnalyticsDateOnlyDate` helper가 서버 로컬 timezone에 의존하지 않는다.
- [ ] `occurredAt`, `eventDate`, `timeZone`이 있다.
- [ ] `payloadJson`이 기본 `{}`를 가진다.
- [ ] retention/cohort query를 위한 index가 있다.
- [ ] server event는 repository 호출 전에 non-empty idempotencyKey가 검증된다.
- [ ] `prisma:validate`, `prisma:generate`를 실행했다.
