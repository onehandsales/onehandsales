# DB Schema

상태: Draft / Skeleton
계약 상태: No new migration

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 DB schema 변경이 필요한지 기록한다.

## 2. 결론

이번 계획에서는 Prisma schema와 migration을 추가하지 않는다.

## 3. 확인 기준

- `BE/prisma/schema.prisma`의 실제 상태를 기준으로 한다.
- `UserRole`은 현재 `USER`, `ADMIN` 기준이다.
- billing/subscription/tenant/customer admin 정본 모델은 이 계획에서 만들지 않는다.

## 4. 금지

- `Subscription`, `Plan`, `Invoice`, `Payment`, `Entitlement`, `TaxProfile` 모델 추가
- `Tenant`, `Organization`, `OrgMember`, `CustomerAdmin` 모델 추가
- `UserDraft`, `ExportJob` 모델 추가
- account deletion hard delete/anonymization job용 schema 임시 추가
- Admin paid recovery용 schema 임시 추가

## 5. 완료 기준

- [ ] DB 변경 없음이 각 goal 문서와 일치한다.
- [ ] billing/B2B/export/draft 관련 schema 후보가 12 전 구현으로 섞이지 않는다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `BE/prisma/schema.prisma`
