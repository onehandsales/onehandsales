# Goal Completion Checklist

상태: Completed
최종 업데이트: 2026-07-26

## 1. 목적

06 Deal Activity Timeline의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Planning API DB Contract | Completed | 2026-07-25 | 현재 코드와 계약 대조, blocking 질문 없음 | `PLANNING-REVIEW.md`, `pnpm run prisma:validate` | G02 착수 가능 |
| [x] | G02 Deal Activity DB Prisma | Completed | 2026-07-26 | Prisma schema/migration/model/index 구현 | `BE/prisma/schema.prisma`, `20260726010000_add_deal_activity`, `pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run build` | 원격 Supabase target 확인. migrate/seed 미실행 |
| [x] | G03 Deal Activity Backend | Completed | 2026-07-26 | timeline API와 자동/수동 activity Backend 구현 | `G03_DEAL_ACTIVITY_BACKEND.md`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run test -- follow-up`, `pnpm run test -- schedule`, `pnpm run test -- meeting-note`, `pnpm run build` | G04 착수 가능 |
| [x] | G04 Deal Activity User Web | Completed | 2026-07-26 | 딜 상세 timeline UX 구현 | `G04_DEAL_ACTIVITY_USER_WEB.md`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm exec playwright test tests/e2e/deal-activity-timeline.spec.ts`, `pnpm run test:e2e` | G05 착수 가능 |
| [x] | G05 Deal Record Summary Backend | Completed | 2026-07-26 | Deal/Contact list summary Backend 구현 | `G05_DEAL_RECORD_SUMMARY_BACKEND.md`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run test -- contact`, `pnpm run test -- ownership-isolation`, `pnpm run build` | G06 착수 가능 |
| [x] | G06 Deal Record Summary User Web | Completed | 2026-07-26 | 목록 summary User Web 구현 | `G06_DEAL_RECORD_SUMMARY_USER_WEB.md`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm exec playwright test tests/e2e/deal-record-summary.spec.ts`, `pnpm run test:e2e` | G07 착수 가능 |
| [x] | G07 QA Review Closeout | Completed | 2026-07-26 | REVIEW-CHECKLIST 통과와 문서 closeout | `G07_QA_REVIEW_CLOSEOUT.md`, `REVIEW-CHECKLIST.md`, Backend/User Web 전체 검증 | 06 closeout 완료 |

## 3. Goal별 체크 조건

### G01

- [x] 현재 BE deal/follow-up/schedule/meeting-note 구현을 확인했다.
- [x] 현재 FE deal detail/list 구현을 확인했다.
- [x] `COMMON/SOURCE-PLAN-COVERAGE.md` 기준으로 상위 입력 계획의 포함/제외 범위를 확인했다.
- [x] `COMMON/BUSINESS-LOGIC.md`와 현재 mutation 흐름을 대조했다.
- [x] API path와 기존 route 충돌이 없다.
- [x] activity writer provider 배치가 module cycle을 만들지 않는다.
- [x] 회의록 연결 legacy `DealFollowingActionLog`와 새 `DealActivity` 중복 노출 처리 기준이 정해졌다.
- [x] 딜 생성 시 초기 `DealFollowingActionLog`가 `NEXT_ACTION_CREATED`로 함께 기록되는 기준을 확인했다.
- [x] follow-up sourceId 기준이 `FollowUpDeliveryAttempt.id`로 확정됐다.
- [x] `DealActivity` schema 후보와 현재 Prisma 관계 충돌이 없다.
- [x] API request/response 예시와 실제 DTO 네이밍 충돌이 없다.
- [x] G02~G07 착수 blocking 질문이 없다.

G01 증거:

- `COMMON/PLANNING-REVIEW.md`에 현재 코드 대조 결과를 기록했다.
- `COMMON/BUSINESS-LOGIC.md`, `COMMON/ARCHITECTURE-GUARDRAILS.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`에 보정 사항을 반영했다.
- G01은 소스 코드 구현 goal이 아니므로 신규 코드 주석은 없다. G02/G03 구현 시 한글 주석 규칙을 적용한다.
- `cd BE && pnpm run prisma:validate`가 통과했다.

### G02

- [x] `DealActivityType`, `DealActivitySourceType` enum이 있다.
- [x] `DealActivity` model이 있다.
- [x] `Deal` relation이 추가됐다.
- [x] migration SQL에 index/FK/주석 또는 `COMMENT ON`이 있다.
- [x] migration SQL에 table/column/index 의도 주석 또는 `COMMENT ON`이 있다.
- [x] 기존 migration 파일을 수정하지 않았다.
- [x] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.
- [x] `pnpm run prisma:validate`가 통과했다.

G02 증거:

- 신규 migration: `BE/prisma/migrations/20260726010000_add_deal_activity/migration.sql`
- Prisma schema: `DealActivityType`, `DealActivitySourceType`, `DealActivity`, `User.dealActivities`, `Deal.activities`
- repository contract/helper/test: `deal-activity.repository.ts`, `prisma-deal-activity.repository.ts`, `prisma-deal-activity.repository.spec.ts`
- DB target 확인: `DATABASE_URL`/`DIRECT_URL` host는 `aws-1-ap-northeast-2.pooler.supabase.com`, database는 `postgres`다. 원격 Supabase target이므로 `prisma migrate dev`, `prisma migrate deploy`, `prisma seed`는 실행하지 않았다.
- 검증 통과: `pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run build`

### G03

- [x] `GET /api/deals/:dealId/activities`가 구현됐다.
- [x] `POST /api/deals/:dealId/activities`가 구현됐다.
- [x] `PATCH /api/deals/:dealId/activities/:activityId`가 구현됐다.
- [x] 자동 activity 생성 지점이 transaction과 연결됐다.
- [x] 회의록 연결 변경은 delete/recreate 전 diff 기준으로 activity가 생성됐다.
- [x] 회의록 연결 legacy `DealFollowingActionLog` 문구를 activity summary로 재사용하지 않는다.
- [x] follow-up activity는 `DEAL` target message만 딜 timeline에 기록한다.
- [x] follow-up 발송 성공/실패 activity가 delivery attempt 단위로 기록됐다.
- [x] 자동 activity는 수정할 수 없다.
- [x] private memo/provider raw/follow-up body 전체가 response/log에 노출되지 않는다.

G03 증거:

- 구현 명세: `COMMON/GOAL-SPECS/G03_DEAL_ACTIVITY_BACKEND.md`
- Backend 검증 통과: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run test -- follow-up`, `pnpm run test -- schedule`, `pnpm run test -- meeting-note`, `pnpm run build`

### G04

- [x] 딜 상세에 timeline section이 있다.
- [x] 수동 activity 생성 form이 있다.
- [x] 수동 activity 수정 UX가 있다.
- [x] loading/empty/error/success 상태가 있다.
- [x] cursor는 FE에서 파싱하지 않고 API 응답의 `nextCursor`를 그대로 전달한다.
- [x] `DealDetailPanel` 안에서 새 timeline이 통합됐고 기존 placeholder component를 정본 host로 쓰지 않았다.
- [x] 모바일 390px/360px에서 timeline이 깨지지 않는다.

G04 증거:

- 구현 파일: `FE/user-web/src/features/deal/components/deal-activity-timeline-section.tsx`, `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
- API/query/form: `deal-api.ts`, `deal-query-keys.ts`, `use-deal-detail.ts`, `use-deal-mutations.ts`, `deal-schema.ts`, `deal.ts`
- E2E: `FE/user-web/tests/e2e/deal-activity-timeline.spec.ts`
- User Web 검증 통과: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm exec playwright test tests/e2e/deal-activity-timeline.spec.ts`, `pnpm run test:e2e`

### G05

- [x] `GET /api/deals` item에 products summary가 있다.
- [x] `GET /api/deals` item에 latestActivity가 있다.
- [x] `GET /api/contacts` item에 dealCount가 있다.
- [x] ownership/soft delete aggregation test가 있다.
- [x] page size 15 계약이 Backend/API/test에서 일치한다.

G05 증거:

- Deal Backend 구현: `BE/src/modules/deal/application/ports/deal.repository.ts`, `BE/src/modules/deal/application/services/deal-application.service.ts`, `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.ts`
- Contact Backend 구현: `BE/src/modules/contact/application/ports/contact.repository.ts`, `BE/src/modules/contact/application/services/contact-application.service.ts`, `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.ts`
- Aggregation test: `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.spec.ts`, `BE/src/modules/contact/infrastructure/persistence/prisma-contact.repository.spec.ts`
- Page size 15 test: `BE/src/modules/deal/application/services/deal-application.service.spec.ts`, `BE/src/modules/contact/application/services/contact-application.service.spec.ts`
- Backend 검증 통과: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- deal`, `pnpm run test -- contact`, `pnpm run test -- ownership-isolation`, `pnpm run build`

### G06

- [x] 딜 목록에 products summary가 표시된다.
- [x] 딜 목록에 latest activity가 표시된다.
- [x] 담당자 목록에 dealCount가 표시된다.
- [x] API 응답 없는 summary를 FE에서 꾸미지 않는다.
- [x] desktop/mobile list layout이 깨지지 않는다.

G06 증거:

- 구현 파일: `FE/user-web/src/features/deal/types/deal.ts`, `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`, `FE/user-web/src/features/contact/types/contact.ts`, `FE/user-web/src/features/contact/components/contact-list-screen.tsx`
- E2E: `FE/user-web/tests/e2e/deal-record-summary.spec.ts`
- E2E mock 계약: `FE/user-web/tests/e2e/support/user-web-api-mocks.ts`
- User Web 검증 통과: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm exec playwright test tests/e2e/deal-record-summary.spec.ts`, `pnpm run test:e2e`

### G07

- [x] Backend `typecheck`, `lint`, 관련 `test`, `build`를 실행했다.
- [x] User Web `typecheck`, `lint`, `build`, 필요한 E2E/수동 QA를 실행했다.
- [x] `COMMON/REVIEW-CHECKLIST.md`를 갱신했다.
- [x] README, API-SPEC, BE-TODO, FE-TODO가 구현 결과와 일치한다.

G07 증거:

- Backend 검증 통과: `pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`
- Backend test 결과: 56개 test suite, 288개 test 통과
- User Web 검증 통과: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`, `pnpm run test:e2e:mobile`
- User Web E2E 결과: desktop 27개, mobile 6개 통과
- `COMMON/REVIEW-CHECKLIST.md`, `README.md`, `COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`에 closeout 결과를 반영했다.
- S0/S1 blocker 없음
- 미실행 검증 없음
