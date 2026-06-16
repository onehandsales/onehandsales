# P3 G17-G20 일정과 회의록 상세 명세

## 1. 목적

P3는 개인 영업자가 일정과 회의록을 딜 중심으로 연결하되, 딜 없이도 독립적으로 저장할 수 있게 하는 단계다.

## G17. Schedule Backend vertical slice

### 화면 영향

G18 일정 화면과 홈의 오늘 일정 영역이 사용할 API를 제공한다.

### API 연결

- Schedule CRUD
- Weekly schedule
- Google Calendar 실제 import
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- Schedule
- ScheduleReminder
- Deal
- Company
- Contact
- ExternalCalendarConnection

### 비즈니스 기준

- 일정은 딜 없이 저장 가능하다.
- 딜에서 만든 일정은 회사/담당자를 기본 상속할 수 있다.
- 일정 목록 기본 조회 기간은 사용자 timezone 기준 이번 달이다.
- User Web `/schedules`는 Google Calendar처럼 월간 캘린더를 기본으로 보여주고 월간/주간 view mode 전환을 제공한다.
- `/schedules` 주간 보기는 `GET /api/schedules`에 선택된 주의 `from`, `to`를 명시해 조회한다.
- 주간 보고서/Export는 별도 `/schedules/week` 화면에서 다룬다.
- Google Calendar 가져오기는 실제 Google Calendar API adapter를 사용한다.
- 가져온 일정은 `source = GOOGLE`로 구분한다.

### 완료 기준

- 일정 CRUD와 월간 기본 조회가 동작한다.
- 월간/주간 보기 전환 조회가 동작한다.
- 주간 보고서 조회는 별도 endpoint로 동작한다.
- 딜/회사/담당자 연결 ownership을 검증한다.

## G18. Schedule User Web 화면

### 화면 목적

사용자가 일정을 만들고 월간 일정 맥락을 기본으로 확인하되, 같은 화면에서 주간 보기로 전환할 수 있게 한다. 주간 보고서/Export는 별도 화면에서 확인한다.

### 화면 구성

#### 일정 목록/캘린더

- 경로: `/schedules`
- 주요 UI: 월간/주간 view mode 전환, 월/주 이동, 오늘로 이동, 일정 생성 버튼, 일정 카드, Google Calendar형 캘린더 UI
- 표시 정보: 일정 제목, 시간, 연결 딜/회사/담당자, source

#### 주간 보고서

- 경로: `/schedules/week`
- 주요 UI: 주간 이동, 보고서 preview, PDF/Excel export 버튼

#### 일정 생성/수정 form

- 필수 입력: 제목, 시작일시, 종료일시
- 선택 입력: 장소, 딜, 회사, 담당자, 알림 시간, 메모

### API 연결

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/:scheduleId`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`
- `GET /api/schedules/week`

### 상태/validation

- 종료일시는 시작일시보다 늦어야 한다.
- 일정 없음: 빈 월간 캘린더와 생성 CTA
- 주간 보기 일정 없음: 빈 주간 캘린더와 생성 CTA
- Google source 일정은 출처 배지를 표시한다.

### 완료 기준

- 일정 생성, 수정, 삭제, 월간 기본 조회가 가능하다.
- 월간/주간 보기 전환이 가능하다.
- 주간 보고서를 별도 화면에서 확인할 수 있다.
- 일정은 딜 없이 저장 가능하다.

## G19. MeetingNote Backend vertical slice

### 화면 영향

G20 회의록 화면과 G15 딜 상세의 회의록 연결 영역이 사용할 API를 제공한다.

### API 연결

- MeetingNote CRUD
- AI 회의록 실제 생성
- 딜 연결
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- MeetingNote
- AiJob
- Deal
- DealActivity

### 비즈니스 기준

- AI 회의록 생성은 port/interface 뒤에서 수행한다.
- MVP 회의록 AI 결과 항목은 9개 고정이며 API 필드명은 `meetingDate`, `companyName`, `contactName`, `department`, `productName`, `stageText`, `details`, `nextPlan`, `requiredAction`이다.
- 회의록 원문 입력값은 `EncryptionPort`로 암호화해 저장한다.
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
- 표시 정보: 날짜, 회사, 담당자, 품목(`productName`), 진행단계(`stageText`), 연결 딜 여부

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
- 품목(`productName`)
- 진행단계(`stageText`)
- 상세내용(`details`)
- 향후계획(`nextPlan`)
- 필요액션(`requiredAction`)

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
- raw input은 저장 시 암호화되며 client log에 남기지 않는다.
- AI 생성 중 loading
- AI 실패 시 원문은 보존
- 저장 전 사용자가 9개 항목을 수정 가능해야 한다.
- 딜 연결 실패 시 회의록 저장 자체는 유지한다.

### 완료 기준

- AI 실제 생성 결과를 수정해 저장할 수 있다.
- 저장 후 딜 연결이 가능하다.
- 딜 연결 시 딜 활동 로그가 자동 생성된다.

## 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
