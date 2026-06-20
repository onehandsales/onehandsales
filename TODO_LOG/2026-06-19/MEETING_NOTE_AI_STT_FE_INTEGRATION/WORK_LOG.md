# MeetingNote AI/STT FE Integration

## 작업 일시

- 2026-06-19 KST

## 목적

회의록 작성 화면에서 기존 직접 작성 저장 흐름을 유지하면서 텍스트 AI 초안과 음성 STT+AI 초안 생성 API를 User Web에 연결한다.

## 사전 확인

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/USER-FLOW.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/FE-TODO/G02-FE-MEETING-NOTE-AI-STT-DRAFT.goal.md`
- `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`
- `BE/src/modules/meeting-note/application/services/meeting-note-ai-draft-application.service.ts`

## 반영 내용

- User Web MeetingNote 타입에 AI/STT draft request/response 타입을 추가했다.
- `POST /api/meeting-notes/ai-draft` API client/hook을 추가했다.
- `POST /api/meeting-notes/stt-draft` multipart API client/hook을 추가했다.
- 회의록 생성 모달에 `AI 정리` 섹션을 추가했다.
- 텍스트 원문 입력 후 `AI로 정리`를 실행하면 `details`, `nextPlan`, `requiredAction` field에 초안을 반영한다.
- 음성 파일 선택 후 `음성으로 작성`을 실행하면 transcript를 검토용으로 표시하고 초안을 form field에 반영한다.
- 직접 작성 저장은 AI/STT draft API를 호출하지 않고 `sourceType: MANUAL`로 저장한다.
- AI/STT draft 저장은 기존 `POST /api/meeting-notes`에 `TEXT_AI` 또는 `STT_AI` sourceType을 전달한다.
- STT transcript와 provider raw response는 최종 저장 payload에 포함하지 않는다.

## 변경 파일

- `FE/user-web/src/features/meeting-note/types/meeting-note.ts`
- `FE/user-web/src/features/meeting-note/api/meeting-note-api.ts`
- `FE/user-web/src/features/meeting-note/hooks/use-meeting-note-mutations.ts`
- `FE/user-web/src/features/meeting-note/schemas/meeting-note-schema.ts`
- `FE/user-web/src/features/meeting-note/components/meeting-note-create-dialog.tsx`
- `FE/user-web/src/features/meeting-note/index.ts`
- `TODO/MEETING_NOTE_AI_STT_PLAN/**`
- `AGENT/**`
- `UX Design/**`

## 검증

- `pnpm --dir FE/user-web typecheck`
- `pnpm --dir FE/user-web exec eslint src/features/meeting-note/types/meeting-note.ts src/features/meeting-note/api/meeting-note-api.ts src/features/meeting-note/hooks/use-meeting-note-mutations.ts src/features/meeting-note/schemas/meeting-note-schema.ts src/features/meeting-note/components/meeting-note-create-dialog.tsx src/features/meeting-note/index.ts`
- `pnpm --dir FE/user-web build`
- `git diff --check`

## 참고

- `pnpm --dir FE/user-web typecheck`와 `pnpm --dir FE/user-web build`는 현재 shell Node가 `v25.7.0`이라 package engine `>=24 <25` 경고를 출력했지만 명령은 통과했다.
- `vite build`는 기존 bundle chunk size warning을 출력했지만 build는 성공했다.

## 남은 이슈

- 저장 후 딜 활동기록 자동 생성 API 계약 확정
- OpenAI provider 환경변수와 실제 음성/텍스트 provider 호출 환경에서 브라우저 smoke 확인
