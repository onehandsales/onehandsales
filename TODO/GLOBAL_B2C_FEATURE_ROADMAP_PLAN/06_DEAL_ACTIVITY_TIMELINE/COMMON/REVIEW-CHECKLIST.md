# Review Checklist

상태: Completed
최종 업데이트: 2026-07-26
목적: 06 구현 후 검토자가 확인할 체크리스트

## 1. Product Scope

- [x] 06의 1차 목표가 `DealActivity` 정본 + 딜 상세 timeline으로 유지됐다.
- [x] 수동 activity 삭제가 1차에 섞이지 않았다.
- [x] 자동 activity 수정/삭제가 노출되지 않았다.
- [x] 메모 activity 통합이 정책 없이 섞이지 않았다.
- [x] 목록 summary는 G05/G06 범위로 분리됐다.
- [x] `NEXT_BACKEND_API_BACKLOG_PLAN` 반영 범위가 `SOURCE-PLAN-COVERAGE.md`와 일치한다.
- [x] `USER_WEB_PRODUCTIZATION_GAP_PLAN` 반영 범위가 `SOURCE-PLAN-COVERAGE.md`와 일치한다.
- [x] `NBA-003`은 Deal latest activity subset만 포함되고 나머지 record summary가 섞이지 않았다.
- [x] Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 데이터 모델, 제품 분석이 06에 섞이지 않았다.
- [x] 고급 검색/필터, 딜 확률/score, AI activity 판단이 섞이지 않았다.
- [x] `COMMON/BUSINESS-LOGIC.md`의 불변 조건과 구현이 일치한다.

## 2. UX/UI

- [x] Notion식 page/detail 구조가 유지됐다.
- [x] Attio식 activity timeline 맥락이 보인다.
- [x] 딜 상세에서 활동 흐름이 시간순으로 읽힌다.
- [x] linked record link가 명확하다.
- [x] 버튼 문구가 짧고 행동형이다.
- [x] 사용자 노출 문구가 해요체 기준을 따른다.
- [x] 모바일 390px/360px에서 timeline과 form이 겹치지 않는다.
- [x] 긴 activity title/body가 부모 영역을 뚫지 않는다.

## 3. Backend API

- [x] `GET /api/deals/:dealId/activities`가 API spec과 일치한다.
- [x] `POST /api/deals/:dealId/activities`가 API spec과 일치한다.
- [x] `PATCH /api/deals/:dealId/activities/:activityId`가 API spec과 일치한다.
- [x] request/response DTO가 API spec의 JSON 예시와 충돌하지 않는다.
- [x] timeline cursor는 opaque string으로 처리되고 FE가 파싱하지 않는다.
- [x] 모든 API가 AuthGuard를 사용한다.
- [x] user ownership 조건이 모든 조회/변경에 들어간다.
- [x] 다른 사용자 activity 접근이 404 또는 안전한 not found로 처리된다.
- [x] 자동 activity 수정 시도가 막힌다.

## 4. DB / Migration

- [x] `NBA-014` DB/Prisma 운영 gate를 확인했다.
- [x] 기존 migration 파일을 수정하지 않았다.
- [x] Prisma schema에 한글 `/// 기능 : ...` 주석이 있다.
- [x] migration SQL에 의도 주석 또는 COMMENT가 있다.
- [x] migration SQL이 `BE-TODO/DB-SCHEMA.md`의 DDL 예시와 의도상 일치한다.
- [x] `DealActivity` index가 timeline 조회에 맞다.
- [x] sourceType/sourceId 조회 index가 있다.
- [x] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.

## 5. Transaction

- [x] 딜 생성과 `DEAL_CREATED` activity가 같은 transaction에 있다.
- [x] 딜 생성 transaction에서 초기 `NEXT_ACTION_CREATED` 처리 기준이 문서와 일치한다.
- [x] 단계 변경과 `STAGE_CHANGED` activity가 같은 transaction에 있다.
- [x] 다음 행동 생성/완료 변경 activity가 본 변경과 같은 transaction에 있다.
- [x] 일정 연결/해제 activity가 연결 변경과 같은 transaction에 있다.
- [x] 회의록 연결/해제 activity가 연결 변경과 같은 transaction에 있다.
- [x] 회의록 relation delete/recreate 구현은 삭제 전 diff를 계산해 link/unlink activity를 만든다.
- [x] 회의록 연결 legacy `DealFollowingActionLog`와 새 `DealActivity`가 중복 노출되지 않는다.
- [x] follow-up 발송 상태와 activity 생성이 provider 호출 이후 DB transaction에서 처리된다.
- [x] follow-up activity는 `DEAL` target이 있는 message만 딜 timeline에 기록한다.
- [x] follow-up activity의 `sourceId`는 `FollowUpDeliveryAttempt.id`이고 `messageId`는 redacted metadata로만 저장된다.
- [x] activity writer 연결이 Nest module cycle을 만들지 않는다.

## 6. Security / Redaction

- [x] activity title/body 원문이 structured log에 남지 않는다.
- [x] private memo 원문이 timeline response에 섞이지 않는다.
- [x] follow-up body 전체가 timeline list에 노출되지 않는다.
- [x] meeting note details/rawText 전문이 timeline summary에 노출되지 않는다.
- [x] provider raw response/token/API key/quota detail이 log/response에 없다.
- [x] contact email/phone 원문이 log에 남지 않는다.

## 7. User Web

- [x] Deal API client/type/query key가 갱신됐다.
- [x] 딜 상세 timeline loading/empty/error/success가 있다.
- [x] 수동 activity 생성/수정 form validation이 있다.
- [x] mutation 후 관련 query가 invalidate된다.
- [x] 자동 activity item에는 수정 action이 없다.
- [x] linked record `targetPath`가 `/app/*` User Web route로 정규화된다.
- [x] source soft delete는 1차 기준대로 별도 deleted activity를 만들지 않고 linked record omission으로 처리된다.
- [x] `DealDetailPanel`에 새 timeline이 통합되고, 기존 placeholder `deal-activity-section.tsx`를 정본 host로 되살리지 않았다.
- [x] User Web이 `/admin/api/*`를 호출하지 않는다.
- [x] FE가 API 응답에 없는 summary/count를 꾸미지 않는다.

## 8. Record Summary

- [x] Deal list products summary가 API 응답 기준으로 표시된다.
- [x] Deal list latest activity가 API 응답 기준으로 표시된다.
- [x] Contact list dealCount가 API 응답 기준으로 표시된다.
- [x] page size 15 계약이 FE/BE/test에서 일치한다.
- [x] soft-deleted deal이 dealCount에 포함되지 않는다.

## 9. Verification

- [x] Backend `pnpm run prisma:validate` 통과
- [x] Backend `pnpm run typecheck` 통과
- [x] Backend `pnpm run lint` 통과
- [x] Backend `pnpm run test` 또는 관련 test 통과
- [x] Backend `pnpm run build` 통과
- [x] User Web `pnpm run typecheck` 통과
- [x] User Web `pnpm run lint` 통과
- [x] User Web `pnpm run build` 통과
- [x] User Web E2E 또는 수동 QA 결과 기록

## 10. Documentation Closeout

- [x] API-SPEC이 구현 결과와 일치한다.
- [x] BE-TODO/DB-SCHEMA가 구현 결과와 일치한다.
- [x] FE-TODO/USER-WEB-TODO가 구현 결과와 일치한다.
- [x] README 상태가 갱신됐다.
- [x] GOAL-COMPLETION-CHECKLIST가 갱신됐다.
- [x] 실행하지 못한 검증은 미실행 사유를 기록했다.

## 11. G07 Closeout Evidence

- Backend 검증 통과: `cd BE && pnpm run prisma:validate`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`
- Backend test 결과: 56개 test suite, 288개 test 통과
- User Web 검증 통과: `cd FE/user-web && pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test:e2e`, `pnpm run test:e2e:mobile`
- User Web E2E 결과: desktop 27개, mobile 6개 통과
- `FE/user-web/src/lib/api-client.ts`에서 User Web `/admin/api/*` 호출 guard를 확인했다.
- `DealApplicationService`, follow-up, schedule, meeting-note transaction 경로와 redaction test를 확인했다.
- 미실행 검증: 없음
