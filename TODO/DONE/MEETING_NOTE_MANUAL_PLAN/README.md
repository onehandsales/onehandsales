# Meeting Note Manual Plan

## 1. 목적

이 계획은 회의록의 1차 구현 범위를 현재 프로젝트 구조에 맞게 실행 가능한 `/goal` 단위로 정리한다.

회의록은 영업 미팅 내용을 기록하고 회사, 담당자, 제품, 딜과 연결해 영업 맥락을 남기는 도메인이다. 이번 계획은 `meetingNote.md`의 최신 결정과 `AGENT`, `UX Design`의 현재 구현 상태를 기준으로 하되, AI Text/STT, 삭제/복구, Admin, 딜 활동 로그 자동 생성은 후속 범위로 분리한다.

## 2. 현재 상태

- Backend에는 `meeting-note` module과 Prisma `MeetingNote*` 모델이 구현되어 있다.
- User Web의 `/meeting-notes`, `/meeting-notes/new`, `/meeting-notes/:meetingNoteId` 라우트와 `features/meeting-note`는 수동 N:N 연결 계약으로 수정되어 있다.
- 이 계획은 2026-06-15에 완료되어 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN`으로 보관한다.
- `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`의 Meeting Note API는 오래된 계약이다. 이번 계획에서는 최신 `meetingNote.md`와 이 계획의 `COMMON/API-SPEC/MEETING_NOTE_API.md`를 구현 기준으로 삼는다.

## 3. 범위

포함:

- `MeetingNoteSourceType`, `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal` Prisma schema와 migration
- User API
  - `GET /api/meeting-notes`
  - `GET /api/meeting-notes/filter-companies`
  - `GET /api/meeting-notes/filter-contacts`
  - `GET /api/meeting-notes/:meetingNoteId`
  - `POST /api/meeting-notes`
  - `PATCH /api/meeting-notes/:meetingNoteId`
- 회의록과 회사/담당자/제품/딜 N:N 연결
- 연결 row snapshot 저장
- User Web 회의록 목록, 필터, 상세, 생성, 수정 화면을 새 API 계약으로 연결

제외:

- `POST /api/meeting-notes/generate`
- `POST /api/meeting-notes/transcribe`
- AI Text/STT 생성 UX
- 삭제/휴지통/복구
- Admin API와 Admin 화면
- 딜 활동 로그 자동 생성
- 캘린더 연동
- 원문 텍스트 암호화
- 음성 파일, VTT 저장

## 4. 구현 기준 결정

- 이번 구현의 생성 방식은 `MANUAL`만 허용한다.
- `TEXT_AI`, `STT_AI`, `rawText`는 후속 AI/STT 구현을 위한 예약 필드다.
- request에서는 `timeZone`을 받지 않는다.
- Backend는 인증 사용자의 `User.timeZone`을 사용해 `meetingLocalDateTime`을 UTC `meetingAt`으로 변환하고, 사용한 값을 `MeetingNote.timeZone`에 snapshot으로 저장한다.
- 회의록 생성 시 `companies`와 `contacts`는 필수이며 각각 1개 이상이어야 한다.
- `products`, `deals`는 선택이다. 없으면 빈 배열로 처리한다.
- 회사/담당자/제품은 FK 없이 snapshot-only 항목을 저장할 수 있다.
- 딜 연결은 기존 `Deal`에만 연결한다. `MeetingNoteDeal.dealId`는 필수다.
- 목록 응답의 `companies`, `contacts`, `products`, `deals` summary 객체는 항상 내려온다. 연결이 없으면 `{ "label": "", "count": 0 }`이다.

## 5. 문서 지도

- 공통 개요: `COMMON/README.md`
- 사용자 흐름: `COMMON/USER-FLOW.md`
- `/goal` 작업 순서: `COMMON/GOAL-WORK-ORDER.md`
- 구현 전 검토: `COMMON/PLANNING-REVIEW.md`
- API 계약: `COMMON/API-SPEC/MEETING_NOTE_API.md`
- BE DB 스키마: `BE-TODO/DB-SCHEMA.md`
- BE 실행 문서: `BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- FE 실행 문서: `FE-TODO/G02-FE-MEETING-NOTE-PAGES.goal.md`
- 통합 검증 실행 문서: `COMMON/G03-MEETING-NOTE-INTEGRATION.goal.md`
- Goal 상세:
  - `COMMON/GOAL-SPECS/G01-BE-MEETING-NOTE-DOMAIN.md`
  - `COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-PAGES.md`
  - `COMMON/GOAL-SPECS/G03-MEETING-NOTE-INTEGRATION.md`

## 6. `/goal` 실행 순서

1. `G01-BE-MEETING-NOTE-DOMAIN`: DB schema, migration, Backend module, User API 구현
2. `G02-FE-MEETING-NOTE-PAGES`: User Web 회의록 화면과 API client를 새 계약으로 수정
3. `G03-MEETING-NOTE-INTEGRATION`: BE/FE 통합 검증, 문서 상태 정리, TODO_LOG 작성

한 번의 `/goal`에는 위 작업 중 하나만 넣는다.

## 7. 완료 기준

- [x] Backend MeetingNote API가 계약대로 구현되고 ownership, validation, transaction 테스트가 통과한다.
- [x] User Web이 기존 단일 `dealId`, `stageText`, `hasNext`, `rawText`, request `timeZone` 계약을 더 이상 사용하지 않는다.
- [x] 회의록 생성/수정에서 회사와 담당자는 1개 이상 요구된다.
- [x] 제품과 딜은 선택 연결로 처리된다.
- [x] 생성/수정 transaction 실패 시 회의록 본문과 연결 row가 함께 rollback된다.
- [x] 목록 pagination은 `pageSize=10`, `totalCount`, `totalPages`를 사용한다.
- [x] 완료 후 `TODO_LOG`에 실행한 명령, 검증 결과, 남은 후속 범위를 기록한다.

완료 기록:

- 구현 커밋: `1d11a71` (`feat(meeting-note): add manual meeting note flow`)
- 작업 로그:
  - `TODO_LOG/2026-06-15/G01_BE_MEETING_NOTE_DOMAIN/WORK_LOG.md`
  - `TODO_LOG/2026-06-15/G02_FE_MEETING_NOTE_PAGES/WORK_LOG.md`
  - `TODO_LOG/2026-06-15/G03_MEETING_NOTE_INTEGRATION/WORK_LOG.md`

## 8. 관련 정본

- `meetingNote.md`
- `AGENT/README.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/UXUI_AGENT/DECISIONS/012_uxui_schedule_meeting_link.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `UX Design/FE_DOMAIN_COMPLETION_STATUS.md`
- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- `UX Design/PEN_UI_02_BACKEND_IMPACT.md`
- `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`
- `UX Design/PEN_UI_06_SHARED_FIRST_WORK_ORDER.md`
