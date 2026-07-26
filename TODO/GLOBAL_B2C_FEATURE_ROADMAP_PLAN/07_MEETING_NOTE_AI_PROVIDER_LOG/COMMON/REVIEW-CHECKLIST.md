# Review Checklist

상태: Ready
최종 업데이트: 2026-07-26
목적: 07 구현 후 검토자가 확인할 체크리스트

## 1. Product Scope

- [ ] 07의 1차 목표가 회의 후 다음 행동/follow-up 실행 보조로 유지됐다.
- [ ] Provider log가 사용자 가치와 무관한 내부 화면으로 확장되지 않았다.
- [ ] Admin 운영 API/UI가 07에 섞이지 않았다.
- [ ] AI data cleanup이 07에 섞이지 않았다.
- [ ] Meeting Note list AI summary가 07에 섞이지 않았다.
- [ ] 자동 저장/자동 발송이 구현되지 않았다.
- [ ] `NEXT_BACKEND_API_BACKLOG_PLAN` 반영 범위가 `SOURCE-PLAN-COVERAGE.md`와 일치한다.
- [ ] `USER_WEB_PRODUCTIZATION_GAP_PLAN` 반영 범위가 `SOURCE-PLAN-COVERAGE.md`와 일치한다.
- [ ] BusinessCard, Trash, Admin, Payment, Localization, Analytics, Backup/restore가 07에 섞이지 않았다.
- [ ] `NBA-011`은 transcript table이 아니라 공통 `AiProviderCallLog` 확장으로 처리됐다.
- [ ] `NBA-004` 목록 summary는 제외되고 회의록 상세 next action/follow-up 후보만 포함됐다.

## 2. UX/UI

- [ ] Notion식 문서 편집 흐름이 유지됐다.
- [ ] Attio식 linked record 맥락이 보인다.
- [ ] AI 결과는 후보/초안임이 명확하다.
- [ ] 다음 행동 후보는 확인/수정 후 저장된다.
- [ ] Follow-up draft는 확인/수정/복사 중심이다.
- [ ] 버튼 문구가 짧고 행동형이다.
- [ ] 사용자 노출 문구가 해요체 기준을 따른다.
- [ ] 모바일 390px/360px에서 텍스트와 버튼이 겹치지 않는다.

## 3. Backend API

- [ ] `POST /api/meeting-notes/ai-draft`가 API spec과 일치한다.
- [ ] `POST /api/meeting-notes/stt-draft`가 API spec과 일치한다.
- [ ] `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`가 API spec과 일치한다.
- [ ] `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`가 API spec과 일치한다.
- [ ] 모든 API가 AuthGuard를 사용한다.
- [ ] user ownership 조건이 모든 조회/생성에 들어간다.
- [ ] 다른 사용자 회의록/딜/담당자 접근이 안전한 not found로 처리된다.
- [ ] request/response DTO가 JSON 예시와 충돌하지 않는다.

## 4. DB / Migration

- [ ] 기존 migration 파일을 수정하지 않았다.
- [ ] Prisma schema에 한글 `/// 기능 : ...` 주석이 있다.
- [ ] migration SQL에 의도 주석 또는 COMMENT가 있다.
- [ ] `AiProviderOperation`에 meeting-note operation이 추가됐다.
- [ ] `AiProviderCallLog.targetType`과 `targetId`가 있다.
- [ ] target 조회 index가 있다.
- [ ] transcript/follow-up draft/raw provider response 저장 table이 없다.
- [ ] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.

## 5. Provider Log / Redaction

- [ ] Text AI draft 성공/실패가 `AiProviderCallLog`에 기록된다.
- [ ] STT transcription 성공/실패가 `AiProviderCallLog`에 기록된다.
- [ ] STT 후 AI draft 성공/실패가 `AiProviderCallLog`에 기록된다.
- [ ] Next action draft 성공/실패가 `AiProviderCallLog`에 기록된다.
- [ ] Follow-up draft 성공/실패가 `AiProviderCallLog`에 기록된다.
- [ ] provider raw request/response가 저장되지 않는다.
- [ ] prompt 전문이 저장되지 않는다.
- [ ] 회의 원문 text 전문이 저장되지 않는다.
- [ ] STT transcript 전문이 저장되지 않는다.
- [ ] follow-up subject/body 전문이 log에 저장되지 않는다.
- [ ] contact email/phone 전문이 log에 남지 않는다.

## 6. Transaction

- [ ] Provider 호출은 DB transaction 밖에서 수행된다.
- [ ] Provider call log write는 짧은 DB write로 처리된다.
- [ ] AI/STT draft API는 회의록 row를 자동 생성하지 않는다.
- [ ] Next action draft API는 following-action row를 자동 생성하지 않는다.
- [ ] Follow-up draft API는 follow-up message row를 자동 생성하지 않는다.
- [ ] 사용자가 확정한 다음 행동 저장은 기존 deal following-action transaction을 따른다.

## 7. User Web

- [ ] Meeting Note API client/type/query/mutation이 갱신됐다.
- [ ] 생성 모달 AI/STT loading/error/success 상태가 있다.
- [ ] STT transcript가 임시 확인 영역에만 표시된다.
- [ ] 저장 API body에 transcript가 없다.
- [ ] 회의록 상세에 AI 후속 작업 section이 있다.
- [ ] 다음 행동 후보를 편집 후 저장할 수 있다.
- [ ] Follow-up draft를 편집/복사할 수 있다.
- [ ] User Web이 `/admin/api/*`를 호출하지 않는다.

## 8. Verification

- [ ] Backend `pnpm run prisma:validate` 통과
- [ ] Backend `pnpm run typecheck` 통과
- [ ] Backend `pnpm run lint` 통과
- [ ] Backend 관련 test 통과
- [ ] Backend `pnpm run build` 통과
- [ ] User Web `pnpm run typecheck` 통과
- [ ] User Web `pnpm run lint` 통과
- [ ] User Web `pnpm run build` 통과
- [ ] User Web E2E 또는 수동 QA 결과 기록

## 9. Documentation Closeout

- [ ] API-SPEC이 구현 결과와 일치한다.
- [ ] BE-TODO/DB-SCHEMA가 구현 결과와 일치한다.
- [ ] FE-TODO/USER-WEB-TODO가 구현 결과와 일치한다.
- [ ] README 상태가 갱신됐다.
- [ ] GOAL-COMPLETION-CHECKLIST가 갱신됐다.
- [ ] 실행하지 못한 검증은 미실행 사유를 기록했다.
