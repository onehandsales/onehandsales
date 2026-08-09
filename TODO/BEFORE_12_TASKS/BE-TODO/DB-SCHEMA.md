# DB Schema

상태: Ready For Goal
계약 상태: confirmed / No new migration

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 DB schema 변경이 필요한지 기록한다.

## 2. 결론

이번 계획에서는 Prisma schema와 migration을 추가하지 않는다.

G01 provider smoke는 기존 follow-up delivery DB 모델을 사용한다. G02~G05는 문서 정합성 closeout이므로 DB 변경이 없다.

## 3. 현재 DB 기준

실제 source of truth:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`

이번 계획에서 확인할 기존 모델:

- `ExternalEmailConnection`
- `ExternalEmailOAuthState`
- `FollowUpConsentNotice`
- `FollowUpMessage`
- `FollowUpMessageTarget`
- `FollowUpDeliveryAttempt`
- `AdminAuditLog`
- `AdminOperationCheckRun`
- `AccountDataRequest`
- `TrashRecoveryRequest`
- `Notification`
- `BrowserPushSubscription`
- `ProductAnalyticsEvent`

이번 계획에서 만들지 않는 모델:

- `Plan`
- `Subscription` (billing subscription)
- `Payment`
- `Invoice`
- `Refund`
- `Entitlement`
- `TaxProfile`
- `Tenant`
- `Organization`
- `OrgMember`
- `CustomerAdmin`
- `UserDraft`
- `ExportJob`

## 4. 확인 기준

- `BE/prisma/schema.prisma`의 실제 상태를 기준으로 한다.
- `UserRole`은 현재 `USER`, `ADMIN` 기준이다.
- billing plan/subscription/tenant/customer admin 정본 모델은 이 계획에서 만들지 않는다.
- `BrowserPushSubscription`은 기존 notification push token 모델이며 billing subscription 모델로 보지 않는다.
- G01 smoke 결과 확인은 기존 row의 상태만 읽고 기록한다.
- G01 smoke가 만든 test data를 정리해야 하면 운영 DB 정책과 사용자 테스트 계정 범위를 먼저 확인한다.

## 5. 금지

- billing `Subscription`, `Plan`, `Invoice`, `Payment`, `Entitlement`, `TaxProfile` 모델 추가
- `Tenant`, `Organization`, `OrgMember`, `CustomerAdmin` 모델 추가
- `UserDraft`, `ExportJob` 모델 추가
- account deletion hard delete/anonymization job용 schema 임시 추가
- Admin paid recovery용 schema 임시 추가
- applied migration 파일 수정
- G01 smoke 편의를 위한 임시 column 추가

## 6. DB 변경 필요 발견 시 처리

1. 현재 goal에서 schema/migration을 만들지 않는다.
2. 필요 사유를 goal 결과 문서에 기록한다.
3. billing 관련이면 `12_BILLING_SUBSCRIPTION_TAX`로 넘긴다.
4. post-12 후보이면 PRE12 post-12 목록 또는 새 TODO 후보로 넘긴다.
5. 실제 DB 변경이 승인되면 `BE/prisma/schema.prisma`와 migrations를 먼저 확인한다.
6. DB 변경 시 한국어 Prisma 주석 또는 SQL `COMMENT ON`/`-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.

## 7. 완료 기준

- [ ] DB 변경 없음이 각 goal 문서와 일치한다.
- [ ] billing/B2B/export/draft 관련 schema 후보가 12 전 구현으로 섞이지 않는다.
- [x] G01 smoke 결과 확인에 필요한 기존 모델이 명시되어 있다.
- [ ] Prisma schema/migration 변경이 발생하지 않았다.

## 8. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `BE/prisma/schema.prisma`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
