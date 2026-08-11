# Planning Review

상태: Completed
검토일: 2026-07-26
완료일: 2026-07-26

## 1. 결론

G01 검토 결과, 07은 추가 사용자 의사결정 없이 G02~G06 구현 착수가 가능하다.

현재 문서는 Global B2C 제품 방향, 사용자 의사결정, 기존 BE/FE/Prisma 구조, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 기준으로 구현 가능한 계약 상태다.

## 2. 확인한 현재 코드 기준

### 2.1 Prisma/DB

- `BE/prisma/schema.prisma`에 공통 `AiProviderCallLog`가 이미 있다.
- `AiProviderOperation`은 현재 `WEEKLY_SALES_REPORT`, `FOLLOW_UP_EMAIL_DRAFT`, `FOLLOW_UP_SMS_DRAFT`만 있다.
- `AiProviderCallLog`에는 현재 `reportId`, `jobId`가 있고 `targetType`, `targetId`는 없다.
- `AiJob`에는 이미 `targetType`, `targetId`가 있으나 `AiProviderCallLog`와 별도 모델이므로 07 migration과 충돌하지 않는다.
- `MeetingNote`에는 `details`, `nextPlan`, `requiredAction`, `rawText` field가 있지만 STT transcript 별도 저장 table은 없다.
- 현재 회의록 생성 흐름은 `rawText: null`로 저장한다. 따라서 07의 raw text/transcript 저장 금지 정책과 충돌하지 않는다.
- `pnpm run prisma:validate`는 통과했다. 단, 현재 로컬 Node는 `v22.21.1`이고 `BE/package.json`은 `>=24 <25`를 요구해 engine warning이 표시됐다.

### 2.2 Backend API

- 기존 Meeting Note AI API는 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`다.
- `CreateMeetingNoteTextAiDraftDto`, `CreateMeetingNoteSttAiDraftDto`는 `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`의 request 필드와 충돌하지 않는다.
- STT draft response는 `transcript`를 반환하지만 저장은 별도 생성 API에서 사용자가 확정한 field만 저장한다.
- 신규 `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`, `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`는 현재 MeetingNote controller route와 충돌하지 않는다.
- 기존 다음 행동 저장 API는 `POST /api/deals/:dealId/following-action-logs`이며 request body는 `followingAction` 문자열만 받는다.
- 따라서 next action 후보의 `recommendedDueDate`, `memo`, `reason`은 07 1차에서 표시/판단용으로만 두고 저장 API에는 보내지 않는 계약이 맞다.

### 2.3 Safe failure/FE

- 전역 `HttpExceptionFilter`는 `MeetingNoteAiDraftFailed`를 502, `MeetingNoteAiDraftProviderUnavailable`을 503으로 응답한다.
- 현재 전역 오류 body는 `statusCode`, `error`, `message` 중심이다.
- FE `ApiClientError`는 `statusCode`, `code`, `raw`를 보존하고 User Web의 `/admin/api/*` 호출을 차단한다.
- 07 구현에서 `retryable`은 전역 filter 확장 또는 `ApiClientError.raw`로 읽을 수 있는 동등 구조로 제공하면 된다.
- User Web meeting-note feature는 생성 모달, 목록, 상세, 편집 화면이 이미 있고 07은 생성 모달 보강과 상세 `AI 후속 작업` section 추가가 자연스럽다.

## 3. 사용자 결정 반영

- 공통 `AiProviderCallLog`를 확장한다.
- STT transcript는 기본 저장하지 않는다.
- Provider raw response, prompt, raw input은 저장하지 않는다.
- AI next action은 후보만 만들고 사용자가 확인한다.
- Follow-up draft는 초안만 만들고 사용자가 확인/수정/복사한다.
- Admin/ops 조회 화면은 07에서 제외한다.
- UX/UI는 Notion과 Attio 참고 방향으로 간다.

## 4. 상위 계획 반영 확인

- `NBA-011`은 transcript table 생성이 아니라 공통 `AiProviderCallLog` 확장으로 반영한다.
- `NBA-004`는 목록 summary가 아니라 저장된 회의록 상세의 next action 후보로 축소 반영한다.
- `NBA-014`의 DB/Prisma 운영 gate는 G02/G06에서 적용한다.
- `NBA-003`, `NBA-005`, `NBA-007`, `NBA-012`, `NBA-013`은 07에 섞지 않는다.
- payment, billing, localization, analytics, backup/restore, Admin minimal operation은 07이 아니라 Global B2C first-sale 후속 gate로 남긴다.

## 5. Blocking 질문

현재 구현 착수를 막는 질문은 없다.

## 6. G02~G05 구현 메모

- G02는 새 전용 table 없이 `AiProviderOperation`, `AiProviderCallLog.targetType`, `AiProviderCallLog.targetId`, index만 추가한다.
- G03은 `retryable`을 FE가 판단할 수 있도록 전역 filter 확장 또는 `ApiClientError.raw` 기반 구조 중 하나로 구현한다.
- G03/G04는 OpenAI provider adapter에서 requestId, token, cost를 얻을 수 없을 때 null 허용 계약을 유지한다.
- G04/G05는 다음 행동 후보의 `recommendedDueDate`를 표시/판단용으로만 두고 저장은 기존 `followingAction` 문자열만 사용한다.
