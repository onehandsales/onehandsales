# Admin Web Todo

상태: Draft / confirmed Admin Web 구현 작업 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-07

## 1. 목적

이 문서는 11 Admin Operation 재검토에서 나온 Admin Web 후속 후보를 기록한다. 현재 이 계획만으로 새 Admin Web 화면, route, API client, mutation을 만들지 않는다.

## 2. 현재 기준

| 영역 | 현재 기준 |
| --- | --- |
| Admin route | `FE/admin-web/src/app/router/router.tsx` 기준 `/users`, `/users/:userId`, `/users/:userId/domain`, `/users/:userId/trash`, `/provider-failures`, `/account-requests`, `/trash/recovery-requests`, `/analytics`, `/audit-logs`, `/system`이 활성화되어 있다. |
| Admin navigation | `FE/admin-web/src/components/layout/admin-shell.tsx` 기준 사용자, Provider 실패, 사용량 분석, 계정 요청, Trash 요청, 감사 로그, 운영 gate가 메뉴에 있다. |
| Redirect route | `/organizations`, `/subscriptions`, `/support`는 `/`로 redirect한다. 이 상태는 11에서 Billing/Admin subscription 또는 Customer/B2B tenant admin을 구현했다는 의미가 아니다. |
| Admin API client | `FE/admin-web/src/lib/admin-api-client.ts`는 `/admin/api${path}`를 호출한다. |
| Smoke E2E | `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 11 Admin 운영 route와 mock API를 검증한다. |
| Architecture 문서 | `FE/admin-web/ARCHITECTURE.md`는 실제 route/API 구현 전 상태 설명이 남아 있어 stale이다. |
| Legacy admin-query | `FE/admin-web/src/features/admin-query`, `pages/dashboard`, `pages/organizations`에는 현재 router/API 계약과 맞지 않는 legacy 잔여 코드가 있다. `/dashboard`는 route로 열려 있지 않고 `/organizations`는 redirect이므로 11 미완성으로 보지 않는다. |

## 3. 구현 금지

G12 closeout과 별도 Admin Web contract 확정 전에는 아래 변경을 하지 않는다.

- stale architecture 문서에 맞추기 위해 실제 Admin route를 redirect로 되돌림
- `subscriptions` placeholder를 활성 Billing Admin 화면으로 연결
- legacy `admin-query`의 `/dashboard`, `/sensitive/raw`, domain별 API path를 현재 계약 없이 활성 route에 연결
- Admin 직접 Trash 복구 실행 버튼 추가
- 유료 복구 결제 버튼, refund/invoice/payment action 추가
- Trash hard delete/purge 버튼 추가
- Admin 도메인 records 화면에 Company/Contact/Product/Deal/Schedule/MeetingNote/BusinessCard/Import 직접 edit/delete/restore action 추가
- `/organizations` redirect를 customer-facing tenant admin, organization/member management 화면으로 활성화
- ImportJob cleanup failure 전용 Admin dashboard/gate를 `PRE12-F13` 전략 없이 추가
- data export artifact 생성/다운로드 버튼을 실제 API 없이 표시
- 자동 민감정보 감지 결과 화면 추가
- User Web feature/client를 Admin Web에 직접 import

## 4. 후보별 Admin Web 영향

| 후보 | 예상 FE 영향 | 현재 상태 |
| --- | --- | --- |
| 11 Admin 문서 체크리스트 정합성 | 11 `FE-TODO/ADMIN-WEB-TODO.md`와 goal checklist를 실제 route/API 완료 상태와 맞추는 문서 정리. 새 화면 없음 | pre-12-doc-cleanup |
| Admin Web architecture/legacy route 정합성 | `FE/admin-web/ARCHITECTURE.md`의 route/API 설명과 비활성 legacy `admin-query` 잔여 코드를 실제 router와 feature-first 구조 기준으로 정리 | pre-12-doc-cleanup |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | recovery request detail, 실행 confirmation, billing/payment 연결, audit/result 표시 기준 필요 | Question / 정책 및 billing 필요 |
| User data export artifact/download | Admin queue에서 artifact 상태, 만료, failed reason, download 가능 여부 표시 기준 필요. 실제 download는 User/export contract와 연결 | post-12-seed / `PRE12-F09` 연결 |
| 자동 민감정보 감지 | scan result, confidence, override, audit trail 화면 필요 여부 결정 | defer / 정책 필요 |
| Admin direct domain data mutation and recovery action policy | read-only domain records를 edit/delete/restore action으로 바꿀지, confirmation/audit/result/rollback/user notification UX 기준 필요 | defer / ops-policy / `PRE12-F44` |
| Customer/B2B tenant admin and organization admin model | `/organizations`를 customer admin으로 활성화할지, tenant/org/member/role/billing/support UX 경계 필요. 내부 Admin Web route를 재사용하지 않는다 | defer / B2B-strategy / `PRE12-F45` |
| ImportJob cleanup failure aggregate/system gate | cleanup failure trend, aggregate, retry/escalation view를 만들지 여부는 Import/Admin ops 전략에서 판단 | post-12-seed / `PRE12-F13` |

## 5. UX 기준

- Admin Web은 read-only 운영 조회를 기본값으로 유지한다.
- 위험 action은 정책, 권한, audit, rollback 기준이 확정되기 전 화면에 배치하지 않는다.
- masked/safe summary로 충분한 화면에 raw field를 추가하지 않는다.
- `/subscriptions` redirect는 12 Billing 전에는 유지한다.
- `/organizations` redirect는 tenant/org/admin 전략 전에는 유지한다.
- architecture 문서가 stale이면 문서를 고치고 route를 되돌리지 않는다.
- legacy `admin-query` 잔여 코드는 실제 11 API 계약 기준으로 정리하고, 오래된 API path를 다시 열지 않는다.

## 6. 관련 문서

- `../COMMON/GOAL-SPECS/G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`
- `FE/admin-web/ARCHITECTURE.md`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/components/layout/admin-shell.tsx`
