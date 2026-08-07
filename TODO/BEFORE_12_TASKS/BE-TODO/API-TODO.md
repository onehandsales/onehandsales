# Backend API TODO

상태: Draft / Skeleton
계약 상태: No new API

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 Backend API 작업이 필요한지 기록한다.

## 2. 결론

이번 계획에서는 새 Backend API를 만들지 않는다.

`PRE12-F04`는 기존 follow-up delivery email provider 연결/발송 흐름의 운영 smoke 기록이고, `PRE12-F31`~`PRE12-F34`는 문서 정합성 closeout이다.

## 3. 확인 대상

- `BE/src/modules/follow-up`
- `BE/src/modules/notification`
- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `BE/prisma/schema.prisma`

## 4. 금지

- `/api/exports` 추가
- `/api/drafts/*` 추가
- `/admin/api/*` billing/customer admin API 추가
- Admin direct mutation API 추가
- provider adapter 신규 구현
- SMS vendor 구현

## 5. 완료 기준

- [ ] G01 smoke closeout에서 기존 API 상태와 운영 smoke 결과가 기록된다.
- [ ] G02~G05에서 문서 정합성을 위해 필요한 실제 BE 코드 확인 결과가 기록된다.
- [ ] 새 API가 없다는 계약이 `COMMON/API-SPEC`와 일치한다.

## 6. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
