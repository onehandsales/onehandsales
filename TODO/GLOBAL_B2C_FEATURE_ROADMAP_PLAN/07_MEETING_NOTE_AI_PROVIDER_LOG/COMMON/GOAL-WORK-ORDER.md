# Goal Work Order

상태: Confirmed
확정일: 2026-07-26

## 1. 원칙

07은 전체 목표를 문서화하지만 구현은 한 번에 하지 않는다. 각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

모든 goal은 구현 전에 아래 문서를 먼저 읽는다.

- `COMMON/SCOPE.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/USER-FLOW.md`
- `COMMON/SOURCE-PLAN-COVERAGE.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`
- `COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 2. 실행 순서

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_AI_PROVIDER_LOG_DB_PRISMA
-> G03_MEETING_NOTE_AI_LOG_BACKEND
-> G04_MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_BACKEND
-> G05_MEETING_NOTE_AI_USER_WEB
-> G06_QA_REVIEW_CLOSEOUT
```

## 3. G01 Planning API DB Contract

상세 명세: `COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`

목표:

- 현재 코드와 07 문서 계약을 대조한다.
- `AiProviderCallLog`, `MeetingNote`, 기존 following-action API의 충돌 여부를 확인한다.
- API request/response와 DTO 네이밍을 구현 전에 보정한다.
- G02~G06 구현 착수 blocking 질문이 없음을 확인한다.

## 4. G02 AI Provider Log DB Prisma

상세 명세: `COMMON/GOAL-SPECS/G02_AI_PROVIDER_LOG_DB_PRISMA.md`

목표:

- `AiProviderOperation`에 meeting-note 관련 operation을 추가한다.
- `AiProviderCallLog`에 `targetType`, `targetId`를 추가한다.
- Migration SQL과 Prisma schema에 한글 주석/COMMENT를 남긴다.
- raw text, transcript, follow-up draft 저장 table을 만들지 않는다.

## 5. G03 Meeting Note AI Log Backend

상세 명세: `COMMON/GOAL-SPECS/G03_MEETING_NOTE_AI_LOG_BACKEND.md`

목표:

- 기존 `POST /api/meeting-notes/ai-draft`에 provider call log를 연결한다.
- 기존 `POST /api/meeting-notes/stt-draft`에 STT log와 AI draft log를 연결한다.
- safe failure response와 redaction test를 구현한다.

## 6. G04 Meeting Note Next Action Follow Up Backend

상세 명세: `COMMON/GOAL-SPECS/G04_MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_BACKEND.md`

목표:

- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`를 구현한다.
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`를 구현한다.
- AI는 후보/초안만 반환하고 DB 저장/발송을 하지 않는다.

## 7. G05 Meeting Note AI User Web

상세 명세: `COMMON/GOAL-SPECS/G05_MEETING_NOTE_AI_USER_WEB.md`

목표:

- 회의록 생성 모달의 AI/STT 오류 UX와 transcript 임시 표시 정책을 보강한다.
- 회의록 상세에 다음 행동 후보와 follow-up draft UX를 추가한다.
- Notion/Attio 참고 방향을 유지한다.

## 8. G06 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G06_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, ownership, redaction, provider log, 모바일 QA를 점검한다.
- `COMMON/REVIEW-CHECKLIST.md` 기준으로 closeout한다.

## 9. 현재 상태

```text
G01, G02, G03, G04 완료. G05_MEETING_NOTE_AI_USER_WEB 착수 가능.
G06은 이전 goal 완료 후 진행한다.
```
