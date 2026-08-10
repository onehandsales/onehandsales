# Goal Work Order

상태: G01-G06 Done / 12 Billing Handoff Ready
고도화일: 2026-08-08

## 0. 실행 준비 체크리스트

- [x] `PRE12_FOLLOWUP_RECHECK`의 12 전 후보 5개만 goal로 분리했다.
- [x] G01~G05 뒤 G06 handoff를 두는 순서로 확정했다.
- [x] G01은 Gmail과 Microsoft 365 실제 smoke가 모두 성공해야 완료로 판정한다.
- [x] G02~G05는 문서 정합성 closeout이며, 새 API/DB/route를 만들지 않는다.
- [x] 관련 앱 code cleanup이 발생하면 `typecheck`와 `lint`를 실행하도록 각 goal에 명시했다.
- [x] 코드 작업이 발생하면 한글 주석 규칙을 지키도록 명시했다.
- [x] DB 작업이 발생하면 `BE/prisma` 확인과 한국어 주석을 필수로 명시했다.

## 1. 원칙

이 계획은 12 Billing 착수 전 closeout만 다룬다.

각 `/goal`은 문서 정합성 또는 운영 smoke 기록 하나만 처리한다. 새 API, 새 DB, 새 route, 새 제품 기능은 만들지 않는다.

모든 goal은 아래 공통 기준을 따른다.

- 실제 코드 상태를 먼저 확인한다.
- `AGENT/UXUI_AGENT`와 `AGENT/SOFTWARE_AGENT`를 판단 기준으로 둔다.
- request/response/business logic/user flow/DB 영향이 생기면 해당 계약 문서와 `BE/prisma`를 먼저 확인한다.
- 코드 변경이 생기면 Backend/Frontend 한글 주석 규칙을 따른다.
- DB schema/migration/raw SQL 변경이 생기면 한국어 Prisma 주석 또는 SQL `COMMENT ON`/`-- 한글 주석`을 남긴다.
- 비밀값, token, 수신자 email 원문, provider raw response, follow-up 제목/본문 원문을 문서나 로그에 기록하지 않는다.

## 2. 실행 순서

| 순서 | Goal | PRE12 ID | 상태 | 목적 |
| --- | --- | --- | --- | --- |
| G01 | Provider Smoke Closeout | `PRE12-F04` | Done / Production Provider Smoke Verified | Gmail/Microsoft provider smoke 상태를 닫는다. |
| G02 | 10 Mobile Checklist Closeout | `PRE12-F31` | Done | 10 Mobile Field Use 문서 체크리스트를 실제 완료 상태와 맞춘다. |
| G03 | User Web Route Architecture Closeout | `PRE12-F32` | Done | User Web route/architecture 문서를 실제 route와 맞춘다. |
| G04 | 11 Admin Checklist Closeout | `PRE12-F33` | Done | 11 Admin Operation checklist, goal index, User Web 영향 문서를 실제 완료 상태와 맞춘다. |
| G05 | Admin Web Architecture Legacy Closeout | `PRE12-F34` | Done | Admin Web architecture와 legacy route 설명을 실제 route/API와 맞춘다. |
| G06 | Before 12 Closeout And Handoff | closeout | Done / 12 Billing Handoff Ready | 12 Billing 착수 전 상태를 정리하고 handoff한다. |

## 3. G01 Provider Smoke Closeout

상세 명세: `COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`

목표:

- 05 G10 Gmail/Microsoft provider smoke verified closeout 상태를 문서화한다.

작업:

1. `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`와 `05_AI_WEEKLY_SALES_REPORT` G10 문서를 확인한다.
2. `BE/.env` 또는 실행 환경에 follow-up provider env key가 있는지 비밀값 없이 확인한다.
3. provider console callback URL이 `VITE_API_URL` 기반 callback URL과 일치하는지 확인한다.
4. Gmail OAuth 연결 smoke를 실행한다.
5. Gmail allowlist 수신자 실제 발송 smoke를 실행한다.
6. Gmail allowlist 밖 수신자 차단을 확인한다.
7. Microsoft 365 OAuth 연결 smoke를 실행한다.
8. Microsoft allowlist 수신자 실제 발송 smoke를 실행한다.
9. Microsoft allowlist 밖 수신자 차단을 확인한다.
10. `FollowUpDeliveryAttempt`와 safe log/redaction 상태를 확인한다.
11. 05 G10 pending 문서와 BEFORE_12 결과 문서를 갱신한다.

검증:

```bash
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- follow-up
```

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

완료 기준:

- Gmail 실제 발송이 production-equivalent 환경에서 성공한다.
- Microsoft 365 실제 발송이 production-equivalent 환경에서 성공한다.
- allowlist 밖 수신자가 provider 호출 없이 safe failed attempt로 차단된다.
- provider raw/token/body/recipient 원문이 log/문서/response에 남지 않는다.
- env/callback/account 미준비는 완료가 아니라 blocker다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md 기준으로 G01을 진행해줘.
```

## 4. G02 10 Mobile Checklist Closeout

상세 명세: `COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md`

목표:

- 10 Mobile Field Use의 stale TODO/checklist를 실제 완료 상태와 맞춘다.

작업:

1. 10 README, G07 closeout, GOAL-COMPLETION-CHECKLIST, FE/BE TODO를 확인한다.
2. 실제 `FE/user-web` mobile/local draft/notification 관련 코드 상태를 확인한다.
3. 실제 `BE` notification/analytics/meeting-note 관련 코드와 `BE/prisma/schema.prisma`를 확인한다.
4. 완료된 항목은 체크하고, post-12 후보는 완료 범위에 넣지 않는다.
5. 문서 상단에 closeout 근거와 확인 일자를 남긴다.

검증:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

완료 기준:

- 10 README, checklist, FE/BE TODO가 실제 상태와 맞는다.
- PWA/offline/native, server draft, `/api/exports`를 새로 만들지 않는다.
- 10 완료 범위와 post-12 후보가 섞이지 않는다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md 기준으로 G02를 진행해줘.
```

## 5. G03 User Web Route Architecture Closeout

상세 명세: `COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md`

목표:

- User Web route/architecture 문서를 실제 route와 맞춘다.

작업:

1. `FE/user-web/src/app/router/router.tsx`의 실제 route를 확인한다.
2. `/app/notifications`, `/app/schedules/week`, `/app/export` 상태를 문서에 반영한다.
3. `FE/ARCHITECTURE.md`, `FE/user-web/ARCHITECTURE.md`, 관련 AGENT 문서의 stale route 설명을 정리한다.
4. User Web이 `/admin/api/*`를 호출하지 않는지 확인한다.
5. route 정합성을 이유로 코드 rollback이나 신규 route 활성화를 하지 않는다.

검증:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
rg -n "/admin/api" FE/user-web/src
git diff --check
```

완료 기준:

- User Web architecture 문서가 실제 route 상태와 맞는다.
- AGENT 문서의 stale route 설명이 실제 코드와 충돌하지 않는다.
- `/app/notifications`와 `/app/schedules/week`를 rollback하지 않는다.
- `/app/export`를 활성화하지 않는다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G03_USER_WEB_ROUTE_ARCHITECTURE_CLOSEOUT.md 기준으로 G03을 진행해줘.
```

## 6. G04 11 Admin Checklist Closeout

상세 명세: `COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md`

목표:

- 11 Admin Operation의 상위 checklist, goal index, BE/FE TODO 상태를 실제 완료 상태와 맞춘다.

작업:

1. 11 README, G10 closeout, GOAL-COMPLETION-CHECKLIST, GOAL-SPECS README를 확인한다.
2. 실제 `BE/src/modules/admin-operation`, `account-request`, `trash` 상태를 확인한다.
3. 실제 `FE/admin-web/src/app/router/router.tsx`와 Admin features 상태를 확인한다.
4. 11 User Web 영향 문서와 실제 `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준을 확인한다.
5. 완료된 checklist는 `[x]`로 보정하고 closeout 근거를 남긴다.
6. Billing/Admin mutation/B2B tenant admin 후속 후보는 11 미완성으로 표시하지 않는다.

검증:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

완료 기준:

- 11 상위 checklist가 G10 closeout 및 실제 코드 상태와 맞는다.
- 11 goal index가 G01~G10 완료/구현 상태와 맞는다.
- 11 User Web 영향 문서가 `/app/trash`, `/app/settings`, `/admin/api/*` 차단 기준과 맞는다.
- BE/FE TODO가 planning 상태로 오해되지 않는다.
- Billing/B2B/Admin mutation 후속 후보가 11 완료 범위에 섞이지 않는다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G04_11_ADMIN_CHECKLIST_CLOSEOUT.md 기준으로 G04를 진행해줘.
```

## 7. G05 Admin Web Architecture Legacy Closeout

상세 명세: `COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md`

목표:

- Admin Web architecture와 legacy `admin-query` 설명을 실제 11 route/API 기준으로 정리한다.

작업:

1. `FE/admin-web/src/app/router/router.tsx`의 active/redirect route를 확인한다.
2. `FE/admin-web/ARCHITECTURE.md`와 Software/UXUI Admin 문서의 stale 설명을 정리한다.
3. `features/admin-query`와 inactive page 상태를 문서화한다.
4. legacy code가 실제 빌드/문서 충돌을 만들면 case-by-case로 삭제 또는 격리한다.
5. Billing Admin, customer tenant admin, organization admin route를 새로 열지 않는다.

검증:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
rg -n "\"/api/" FE/admin-web/src
git diff --check
```

완료 기준:

- 활성 Admin route와 redirect route가 문서에서 분리된다.
- legacy `admin-query`가 현재 주력 route/API 계약이 아님을 명시한다.
- Admin Web E2E 설명이 현재 test 상태와 충돌하지 않는다.
- Billing Admin/customer tenant admin을 추가하지 않는다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G05_ADMIN_WEB_ARCHITECTURE_LEGACY_CLOSEOUT.md 기준으로 G05를 진행해줘.
```

## 8. G06 Before 12 Closeout And Handoff

상세 명세: `COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md`

목표:

- G01~G05 결과를 정리하고 `12_BILLING_SUBSCRIPTION_TAX` 착수 가능 상태를 만든다.

작업:

1. G01~G05 결과 문서와 검증 명령 결과를 확인한다.
2. `PRE12_FOLLOWUP_RECHECK`와 `BEFORE_12_TASKS` 상태가 충돌하지 않는지 확인한다.
3. post-12 후보와 billing 종속 후보가 이번 범위에 섞이지 않았는지 확인한다.
4. `COMMON/PLANNING-REVIEW.md`, `COMMON/FINAL-SERVICE-SHAPE.md`, `COMMON/RELEASE-SCOPE-CHECK.md`를 최종 상태로 갱신한다.
5. 12 Billing 착수 가능 여부를 명확히 기록한다.

검증:

```bash
git diff --check
rg -n "^(상태: Draft|판정: .*필요)" TODO/BEFORE_12_TASKS
```

완료 기준:

- G01~G05가 모두 완료됐다.
- G01 Gmail/Microsoft production-equivalent smoke가 배포 환경 verified 기준으로 모두 성공 처리됐다.
- 12 전 blocker가 없다.
- 12 Billing 착수 가능 판정과 근거가 기록됐다.

실행 결과:

- 2026-08-09 G06에서 G01~G05 결과 문서와 work log를 확인했고, 2026-08-10 G01 배포 provider smoke verified 결과를 반영했다.
- G01은 `Production Provider Smoke Verified` 성격으로 12 전 provider smoke closeout을 닫았다.
- PRE12 final classification의 12 전 항목 5개는 G01~G05와 1:1로 연결되어 있고, post-12 후보와 billing 종속 후보는 BEFORE_12 완료 범위에 섞이지 않았다.
- `12_BILLING_SUBSCRIPTION_TAX`는 아직 Draft Slot이므로, G06은 Billing 구현이 아니라 문서 작성/상세화 착수 가능 상태만 handoff한다.

권장 실행 문구:

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G06_BEFORE_12_CLOSEOUT_AND_HANDOFF.md 기준으로 G06을 진행해줘.
```
