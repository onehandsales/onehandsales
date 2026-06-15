# /goal G02-FE-MEETING-NOTE-PAGES

## 1. Goal

User Web 회의록 목록/상세/생성/수정 화면을 Backend MeetingNote API 계약에 맞게 구현한다.

## 2. 선행 조건

- `G01-BE-MEETING-NOTE-DOMAIN`이 완료되어 있다.
- local Backend에서 `GET /api/meeting-notes`, `POST /api/meeting-notes`, `PATCH /api/meeting-notes/:meetingNoteId`를 포함한 MeetingNote API가 동작한다.

## 3. 먼저 읽을 문서

- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-PAGES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `UX Design/FE_DOMAIN_COMPLETION_STATUS.md`
- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`

## 4. 작업 체크리스트

- [x] 기존 `features/meeting-note`에서 stale field 사용 위치를 찾는다.
- [x] `dealId`, `stageText`, `hasNext`, request `timeZone`, request `rawText` 의존성을 제거한다.
- [x] 새 MeetingNote DTO type을 정의한다.
- [x] MeetingNote API client 함수를 작성한다.
- [x] TanStack Query key와 hook을 작성한다.
- [x] 목록 페이지를 `GET /api/meeting-notes`와 연결한다.
- [x] 회사 필터를 `GET /api/meeting-notes/filter-companies`와 연결한다.
- [x] 담당자 필터를 `GET /api/meeting-notes/filter-contacts`와 연결한다.
- [x] 목록 pagination을 `page`, `totalPages` 기준으로 수정한다.
- [x] 상세 페이지를 `GET /api/meeting-notes/:meetingNoteId`와 연결한다.
- [x] 생성 form을 `POST /api/meeting-notes`와 연결한다.
- [x] 수정 form을 `PATCH /api/meeting-notes/:meetingNoteId`와 연결한다.
- [x] 회사와 담당자 1개 이상 선택/입력을 form validation으로 강제한다.
- [x] 제품과 딜은 선택 연결로 처리한다.
- [x] `products`, `deals` 빈 배열 제거 동작을 구현한다.
- [x] 생성/수정 후 관련 query를 invalidate한다.
- [x] loading/empty/error/pending 상태를 정리한다.
- [x] desktop/mobile 레이아웃을 확인한다.
- [x] typecheck/lint/build를 실행한다.

## 5. Acceptance Criteria

- `/meeting-notes` 진입 시 회의록 목록이 조회된다.
- 목록 query는 `page`, `companyIds`, `contactIds`, `sort`만 보낸다.
- 목록 response의 `totalPages`로 pagination을 렌더링한다.
- 목록에서 회사/담당자 필터를 선택하고 해제할 수 있다.
- 제품/딜 summary는 연결이 없어도 화면이 깨지지 않는다.
- `/meeting-notes/new`에서 회사와 담당자가 없으면 저장할 수 없다.
- 제품과 딜 없이도 저장할 수 있다.
- 생성 request body에 `timeZone`, `rawText`, `stageText`, 단일 `dealId`가 없다.
- 생성 성공 후 상세 화면으로 이동한다.
- 상세 화면은 snapshot과 현재 연결 정보를 표시한다.
- 수정 성공 후 상세 query와 목록 query가 갱신된다.
- User Web typecheck/lint/build가 통과한다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G02_FE_MEETING_NOTE_PAGES/WORK_LOG.md
```

기록 항목:

- 수정한 주요 파일
- 연결한 API 목록
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
