# No New API Contract

상태: Draft / Skeleton
계약 상태: No new API

## 1. 목적

이 문서는 `BEFORE_12_TASKS`에서 새 API를 추가하지 않는다는 계약을 명시한다.

## 2. API 변경 없음

이번 계획에서는 다음을 하지 않는다.

- User API 추가
- Admin API 추가
- provider API adapter 추가
- `/api/exports` 추가
- `/api/drafts/*` 추가
- `/admin/api/*` billing/customer admin API 추가
- follow-up email delivery API path 변경

## 3. 기존 API 확인 대상

G01에서 기존 API 흐름을 운영 smoke에 사용할 수 있다.

- `GET /api/follow-up-delivery/settings`
- `POST /api/follow-up-delivery/email-connections/:provider/connect`
- `GET /api/follow-up-delivery/email-connections/:provider/callback`
- 기존 follow-up message send/retry 흐름

G03/G05에서는 실제 route/API 상태를 문서에 반영하기 위해 기존 API client와 controller를 확인한다.

## 4. 완료 기준

- API 변경이 필요 없다는 결론이 BE/FE TODO와 goal 문서에 일관되게 남는다.
- 새 API가 필요해 보이는 항목은 post-12 또는 12 Billing 종속 항목으로 분리된다.

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`
- `TODO/BEFORE_12_TASKS/BE-TODO/API-TODO.md`
