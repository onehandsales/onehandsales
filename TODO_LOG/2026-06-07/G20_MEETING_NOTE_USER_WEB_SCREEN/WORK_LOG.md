# G20 MeetingNote User Web Screen

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- 회의록 목록 화면을 구현한다.
- 회의록 생성 화면에서 raw input textarea와 AI 생성 버튼을 제공한다.
- AI 결과 9개 항목을 사용자가 수정할 수 있게 한다.
- 회의록은 딜 없이 저장 가능해야 한다.
- 저장 후 딜 연결 UI를 제공한다.
- 딜 연결 실패 시 저장된 회의록 자체는 유지한다.
- raw input은 client log에 남기지 않는다.

## 제외 범위
- STT
- 사용자 템플릿 커스터마이즈

## 작업 로그
- G20 기준 문서와 API 계약을 확인했다.
- 최신 상세 명세의 경로 `/meeting-notes`를 기준으로 구현하기로 확인했다.
- 기존 `meeting-note` feature는 placeholder만 있는 상태임을 확인했다.
- 기존 Schedule/Deal feature의 API, hook, form, 라우터 패턴을 확인했다.
- MeetingNote API client, query key, query/mutation hook, 타입, Zod schema를 추가했다.
- `/meeting-notes` 목록 화면을 실제 API 목록과 연결했다.
- `/meeting-notes/new` AI 회의록 작성 화면을 추가했다.
- `/meeting-notes/:meetingNoteId` 상세/수정 화면을 추가했다.
- raw input textarea, AI 생성 버튼, 9개 항목 수정 form, 딜 검색/선택 UI를 구현했다.
- 새 회의록 저장은 먼저 `POST /api/meeting-notes`로 저장하고, 선택된 딜은 이후 `POST /api/meeting-notes/:id/link-deal`로 연결하도록 분리했다.
- 딜 연결 실패 시 저장된 회의록은 유지되고 상세 화면에서 연결 실패 메시지를 표시하도록 했다.
- 이미 연결된 딜에 대한 중복 연결 버튼을 비활성화해 중복 DealActivity 생성을 방지했다.
- 라우터에 `/meeting-notes/new`, `/meeting-notes/:meetingNoteId`를 연결했다.

## 검토
- G20 요구사항의 목록, 생성 화면, raw input, AI 생성 요청, 9개 항목 수정, 딜 없이 저장, 딜 연결 UI를 모두 반영했다.
- raw input은 console/client log로 출력하지 않고 form state와 API request에만 사용한다.
- 딜 연결은 `PATCH`가 아니라 `link-deal` API로 수행해 Backend의 DealActivity 자동 생성 계약을 지킨다.
- FE-TODO의 `/meetings` 표기는 G20 상세 명세와 현재 라우터 기준의 `/meeting-notes`로 정리했다.

## 검증
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run build`
- Playwright API mock smoke: 목록, AI 생성, 9개 항목 반영, 저장 후 딜 연결, 상세 진입, 이미 연결된 딜 버튼 비활성화, 모바일 목록 확인
- 스크린샷:
  - `/tmp/g20-meeting-notes-list.png`
  - `/tmp/g20-meeting-notes-new.png`
  - `/tmp/g20-meeting-notes-detail.png`
  - `/tmp/g20-meeting-notes-mobile.png`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G20 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
