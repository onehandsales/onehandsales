# G05 Admin Web Architecture Legacy Closeout

상태: Ready For Goal
연결 PRE12 ID: `PRE12-F34`
성격: Admin Web architecture/legacy route 문서 정합성 closeout

## 0. 착수 체크리스트

- [ ] `FE/admin-web/src/app/router/router.tsx`를 확인한다.
- [ ] `FE/admin-web/ARCHITECTURE.md`를 확인한다.
- [ ] `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`를 확인한다.
- [ ] `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`의 Admin 관련 설명을 확인한다.
- [ ] `features/admin-query`와 inactive page 상태를 확인한다.
- [ ] Admin Web은 `/admin/api/*`만 호출해야 한다는 기준을 확인한다.
- [ ] 코드 변경 발생 시 한글 주석 규칙과 typecheck/lint gate를 확인한다.

## 1. 목표

Admin Web architecture와 legacy route 설명을 실제 11 Admin Web route/API 기준으로 정리한다.

## 2. 포함 범위

- 활성 Admin Web route 문서 반영
- redirect Admin Web route 문서 반영
- legacy `features/admin-query` 상태 문서화
- `pages/dashboard`, `pages/organizations` 같은 inactive page 상태 문서화
- Admin Web E2E 설명이 실제 현재 test와 충돌하는지 확인
- Software/UXUI Admin 문서 중 stale route 설명 정리
- inactive legacy code가 현재 활성 계약으로 오해되는 경우 case-by-case 삭제 또는 격리 판단

## 3. 제외 범위

- legacy `admin-query` route/API 활성화
- `/organizations` 고객/tenant admin으로 활성화
- `/subscriptions` Billing Admin으로 활성화
- `/support` 운영 지원 화면 활성화
- Admin Web에서 User Web API/client import
- 새로운 Admin mutation 추가
- Billing Admin, Customer/B2B tenant admin 구현

## 4. 확인 대상

- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/components/layout/admin-shell.tsx`
- `FE/admin-web/src/features/admin-query`
- `FE/admin-web/src/features/provider-failure-management`
- `FE/admin-web/src/features/account-request-management`
- `FE/admin-web/src/features/trash-management`
- `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`

## 5. 실제 route 기준

현재 Admin Web route 기준:

- 활성: `/users`
- 활성: `/users/:userId`
- 활성: `/users/:userId/domain`
- 활성: `/users/:userId/trash`
- 활성: `/provider-failures`
- 활성: `/account-requests`
- 활성: `/trash/recovery-requests`
- 활성: `/analytics`
- 활성: `/audit-logs`
- 활성: `/system`
- redirect: `/organizations`
- redirect: `/subscriptions`
- redirect: `/support`

문서는 위 실제 상태와 맞아야 한다.

## 6. Request/Response 체크

G05는 API 변경 작업이 아니다.

- Admin Web API client를 새로 연결하지 않는다.
- `/admin/api/subscriptions`, `/admin/api/billing-events`를 만들지 않는다.
- User API인 `/api/*`를 Admin Web에서 호출하지 않는다.
- request/response 변경 필요가 보이면 12 또는 post-12 후보로 기록한다.

## 7. Business Logic / User Flow 체크

G05는 Admin Web business logic 또는 운영자 flow 변경 작업이 아니다.

- active Admin route는 현재 활성 상태로 문서화하되 새 운영 action을 만들지 않는다.
- redirect route인 `/organizations`, `/subscriptions`, `/support`를 활성 user flow로 열지 않는다.
- `/subscriptions`는 12 Billing 전 Admin Billing flow로 구현하지 않는다.
- legacy `admin-query`를 현재 주력 운영 flow로 되살리지 않는다.
- business logic 또는 user flow 변경 필요가 보이면 12 또는 post-12 후보로 기록한다.

## 8. DB/Prisma 체크

G05는 DB schema 또는 Prisma 변경 작업이 아니다.

- Prisma model, migration, seed를 추가하지 않는다.
- Billing/Admin customer 기능을 위해 `Subscription`, `BillingEvent`, `Tenant`, `Organization`류 모델을 만들지 않는다.
- legacy cleanup 과정에서 DB contract를 새로 만들지 않는다.
- DB 변경 필요가 보이면 12 또는 post-12 후보로 기록한다.

## 9. UX/UI 체크

- Admin Web은 데스크톱 우선 운영 도구다.
- 카드 중심의 장식적 화면보다 표, 필터, 상세 패널 중심의 실무형 레이아웃을 유지한다.
- Billing/Admin customer 기능이 아직 없는데 메뉴나 route로 노출하지 않는다.
- 사용자 노출 문구를 바꾸면 해요체와 운영자에게 명확한 짧은 문구를 사용한다.

## 10. Legacy 처리 기준

legacy `admin-query` 또는 inactive page는 아래 기준으로 처리한다.

- 실제 active route/API 계약과 충돌하지 않으면 문서에 legacy/inactive 상태로 남긴다.
- 빌드, lint, route 오해, 문서 충돌을 만들면 case-by-case로 삭제 또는 격리한다.
- 삭제/격리해도 새 route나 API를 활성화하지 않는다.
- 코드 변경이 발생하면 `// 기능 : ...` 한글 주석 규칙을 지킨다.

## 11. 작업 순서

1. Admin router의 active/redirect route를 표로 정리한다.
2. Admin Web architecture 문서와 Software/UXUI Admin 문서를 실제 상태와 비교한다.
3. legacy `admin-query` 상태를 확인한다.
4. inactive page와 E2E 설명이 현재 route 상태와 충돌하는지 확인한다.
5. 필요한 문서만 수정한다.
6. code cleanup이 필요하면 case-by-case로 삭제 또는 격리하고 검증한다.

## 12. 검증 명령

Frontend:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
rg -n "\"/api/" FE/admin-web/src
rg -n "organizations|subscriptions|support|admin-query" FE/admin-web/ARCHITECTURE.md AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md
git diff --check
```

## 13. 완료 기준

- [ ] 활성 route와 redirect route가 문서에서 분리됐다.
- [ ] legacy `admin-query`가 현재 주력 route/API 계약이 아님을 명시했다.
- [ ] Admin Web E2E 설명이 현재 test 상태와 충돌하지 않는다.
- [ ] Billing Admin/customer tenant admin을 추가하지 않았다.
- [ ] Admin Web에서 User API/client를 사용하지 않는다.
- [ ] 새 request/response, business logic, user flow, DB/Prisma 변경을 만들지 않았다.
- [ ] FE admin-web typecheck/lint가 통과했다.

## 14. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT/WORK_LOG.md
```

## 15. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md 기준으로 G05를 진행해줘.
```

## 16. 관련 문서

- `TODO/BEFORE_12_TASKS/FE-TODO/ADMIN-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
