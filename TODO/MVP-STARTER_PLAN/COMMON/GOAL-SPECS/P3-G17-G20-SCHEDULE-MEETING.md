# P3 G17-G20 일정과 회의록 상세 명세

## 1. 목적

P3는 개인 영업자가 일정과 회의록을 딜 중심으로 연결하되, 딜 없이도 독립적으로 저장할 수 있게 하는 단계다.

## G17. Schedule Backend vertical slice

### 화면 영향

G18 일정 화면과 홈의 오늘 일정 영역이 사용할 API를 제공한다.

### API 연결

- Schedule CRUD
- Weekly schedule
- Google Calendar import mock
- API 요약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- 엔드포인트 구현 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- Schedule
- ScheduleReminder
- Deal
- Company
- Contact
- ExternalCalendarConnection

### 비즈니스 기준

- 일정은 딜 없이 저장 가능하다.
- 딜에서 만든 일정은 회사/거래처를 기본 상속할 수 있다.
- Google Calendar 가져오기는 mock adapter를 먼저 사용한다.
- 가져온 일정은 `source = GOOGLE`로 구분한다.

### 완료 기준

- 일정 CRUD와 주간 일정 조회가 동작한다.
- 딜/회사/거래처 연결 ownership을 검증한다.

## G18. Schedule User Web 화면

### 화면 목적

사용자가 일정을 만들고 주간 일정표를 확인할 수 있게 한다.

### 화면 구성

#### 일정 목록/주간표

- 경로: `/schedules`
- 주요 UI: 주간 이동, 오늘로 이동, 일정 생성 버튼, 일정 카드
- 표시 정보: 일정 제목, 시간, 연결 딜/회사/거래처, source

#### 일정 생성/수정 form

- 필수 입력: 제목, 시작일시, 종료일시
- 선택 입력: 장소, 딜, 회사, 거래처, 알림 시간, 메모

### API 연결

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:scheduleId`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `GET /api/schedules/week`

### 상태/validation

- 종료일시는 시작일시보다 늦어야 한다.
- 일정 없음: 빈 주간표와 생성 CTA
- Google source 일정은 출처 배지를 표시한다.

### 완료 기준

- 일정 생성, 수정, 삭제, 주간 조회가 가능하다.
- 일정은 딜 없이 저장 가능하다.

## G19. MeetingNote Backend vertical slice

### 화면 영향

G20 회의록 화면과 G15 딜 상세의 회의록 연결 영역이 사용할 API를 제공한다.

### API 연결

- MeetingNote CRUD
- AI 회의록 생성 mock
- 딜 연결
- API 요약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- 엔드포인트 구현 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- MeetingNote
- AiJob
- Deal
- DealActivity

### 비즈니스 기준

- AI 회의록 생성은 port/interface 뒤에서 수행한다.
- MVP 회의록 AI 결과 항목은 9개 고정이다.
- 회의록은 딜 없이 저장 가능하다.
- 딜 연결 시 `DealActivity`가 자동 생성된다.

### 완료 기준

- 회의록 저장과 수정이 가능하다.
- 딜 연결 시 활동 로그가 자동 생성된다.

## G20. MeetingNote User Web 화면

### 화면 목적

사용자가 회의 내용을 입력하고 AI 결과를 수정한 뒤 저장하고, 필요하면 딜과 연결할 수 있게 한다.

### 화면 구성

#### 회의록 목록

- 경로: `/meeting-notes`
- 표시 정보: 날짜, 회사, 담당자, 품목, 진행단계, 연결 딜 여부

#### 회의록 생성 화면

- raw input textarea
- AI 생성 버튼
- 9개 항목 수정 form
- 저장 버튼
- 딜 연결 combobox

### AI 결과 항목

- 날짜
- 회사
- 담당자
- 부서
- 품목
- 진행단계
- 상세내용
- 향후계획
- 필요액션

### API 연결

- `POST /api/meeting-notes/generate`
- `POST /api/meeting-notes`
- `GET /api/meeting-notes`
- `GET /api/meeting-notes/:meetingNoteId`
- `PATCH /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/:meetingNoteId/link-deal`
- `GET /api/deals`

### 상태/validation

- raw input은 비어 있으면 AI 생성 불가
- AI 생성 중 loading
- AI 실패 시 원문은 보존
- 저장 전 사용자가 9개 항목을 수정 가능해야 한다.
- 딜 연결 실패 시 회의록 저장 자체는 유지한다.

### 완료 기준

- AI mock 결과를 수정해 저장할 수 있다.
- 저장 후 딜 연결이 가능하다.
- 딜 연결 시 딜 활동 로그가 자동 생성된다.

## 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
