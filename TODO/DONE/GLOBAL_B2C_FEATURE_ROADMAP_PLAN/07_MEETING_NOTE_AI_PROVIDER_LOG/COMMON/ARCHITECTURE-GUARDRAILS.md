# Architecture Guardrails

상태: Confirmed
확정일: 2026-07-26

## 1. 정본 기준

UX/UI:

- `AGENT/UXUI_AGENT`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

Software:

- `AGENT/SOFTWARE_AGENT`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 2. Backend 구조

- 1차 구현은 기존 `meeting-note` module 중심으로 둔다.
- AI provider log 저장은 공통 AI log 구조를 재사용한다.
- 기존 `sales-report` module 내부에 갇힌 provider log repository가 있으면 07에서 공통 port/adapter로 분리하거나 MeetingNote 전용 최소 adapter를 만들되, Prisma model은 `AiProviderCallLog`를 사용한다.
- Controller는 request validation과 application 호출만 담당한다.
- Application layer가 provider 호출 전후 log 기록을 조율한다.
- Prisma 접근은 infrastructure repository/adapter에서만 수행한다.
- Provider SDK/fetch 호출은 infrastructure provider adapter에서만 수행한다.
- Domain layer는 NestJS, Prisma, HTTP, logger를 import하지 않는다.
- User API는 `/api/*`만 사용한다.
- Admin API는 만들지 않는다.

## 3. API 구조

- 기존 `/api/meeting-notes/ai-draft`, `/api/meeting-notes/stt-draft`는 response shape를 최대한 유지하고 provider log side effect와 safe failure 계약만 보강한다.
- 신규 next action/follow-up draft API는 `/api/meeting-notes/:meetingNoteId/*` 아래에 둔다.
- AI 후보 저장은 기존 업무 API를 사용한다. 후보 생성 API가 자동 mutation하지 않는다.

## 4. Transaction 기준

- 외부 provider 호출은 DB transaction 안에서 실행하지 않는다.
- provider call log 생성/갱신은 짧은 DB write로 처리한다.
- next action/follow-up draft API는 초안/후보를 DB에 저장하지 않으므로 업무 데이터 transaction이 없다.
- 사용자가 next action 후보를 저장할 때는 기존 딜 다음 행동 API transaction을 따른다.

## 5. DB/Migration 기준

G02에서 `AiProviderOperation` enum과 `AiProviderCallLog` target field migration을 허용한다.

필수:

- 기존 migration 파일을 수정하지 않는다.
- 공유/운영성 DB에 사용자 결정 없이 migrate/seed를 실행하지 않는다.
- Prisma schema model/field/relation/index에는 한국어 `/// 기능 : ...` 주석을 둔다.
- migration SQL에는 한글 SQL 주석 또는 `COMMENT ON`을 둔다.

## 6. 한글 주석 규칙

Backend/Frontend 코드 작업 시 반드시 적용한다.

- class/interface: `// 역할 : ...`
- controller method: `// API : ...`
- internal method/function: `// 기능 : ...`
- application orchestration: 필요한 경우 `// 1. ...`, `// 2. ...`
- Frontend API client, hook, 복잡한 component handler에는 `// 기능 : ...` 주석을 둔다.

주석은 이름 번역이 아니라 책임, 보안, transaction, redaction 의도를 설명해야 한다.

## 7. Logging/Redaction

Structured log와 DB metadata에 허용:

- count
- status
- operation
- provider
- model
- latency
- token count
- cost
- retryable
- safe error code

금지:

- 회의록 원문
- transcript 원문
- prompt 원문
- provider raw response
- 음성 파일
- API key/token
- quota detail
- contact email/phone 원문

## 8. Frontend 구조

- `FE/user-web/src/features/meeting-note` 안에 API, hooks, components, types를 둔다.
- 서버 상태는 TanStack Query로 관리한다.
- API 호출은 `src/lib/api-client.ts`를 통한다.
- User Web에서 `/admin/api/*`를 호출하지 않는다.
- form validation은 React Hook Form + Zod를 따른다.
- page component는 조립만 담당한다.

## 9. UX/UI 기준

- MeetingNote 상세는 Notion식 page/detail 구조를 유지한다.
- AI 후속 작업은 Attio식 CRM record relationship 맥락으로 회의록, 딜, 담당자를 연결해 보여준다.
- 사용자가 확인하기 전에는 AI 후보를 실제 업무 데이터처럼 표시하지 않는다.
- desktop은 section/list를 우선한다.
- mobile은 card/list를 우선한다.
- 버튼은 lucide icon과 짧은 label을 쓴다.
- 사용자 문구는 해요체를 따른다.
- API 응답에 없는 summary/count/latest를 FE에서 사실처럼 꾸미지 않는다.

## 10. Scope Control

07에서 금지:

- MeetingNote 목록 summary 구현
- AI data cleanup 구현
- Admin API/UI 구현
- transcript table 구현
- follow-up draft table 구현
- 자동 발송
- 자동 일정 생성
- 자동 딜 단계 변경
- 자동 next action 저장
