# /goal G01-BE-MEETING-NOTE-DOMAIN

## 1. Goal

Backend MeetingNote 도메인 DB와 User API를 구현한다.

## 2. 먼저 읽을 문서

- `TODO/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G01-BE-MEETING-NOTE-DOMAIN.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`

## 3. 작업 체크리스트

- [ ] `BE/prisma/schema.prisma`에 `MeetingNoteSourceType`과 MeetingNote 모델 6개를 추가한다.
- [ ] `User`, `Company`, `Contact`, `Product`, `Deal` relation을 추가한다.
- [ ] migration을 생성한다.
- [ ] Prisma Client를 생성한다.
- [ ] `meeting-note` module을 기존 Backend module 구조에 맞춰 추가한다.
- [ ] request DTO validation을 작성한다.
- [ ] response DTO와 mapper를 작성한다.
- [ ] repository port를 작성한다.
- [ ] Prisma repository에서 ownership 조건과 snapshot 조회를 구현한다.
- [ ] application service에서 목록/필터/상세/생성/수정을 구현한다.
- [ ] 생성/수정 transaction을 구현한다.
- [ ] `User.timeZone` 기준 local date-time -> UTC 변환을 구현하거나 기존 schedule helper를 재사용 가능한 형태로 추출한다.
- [ ] `GET /api/meeting-notes/filter-companies`를 구현한다.
- [ ] `GET /api/meeting-notes/filter-contacts`를 구현한다.
- [ ] `GET /api/meeting-notes`를 구현한다.
- [ ] `GET /api/meeting-notes/:meetingNoteId`를 구현한다.
- [ ] `POST /api/meeting-notes`를 구현한다.
- [ ] `PATCH /api/meeting-notes/:meetingNoteId`를 구현한다.
- [ ] `filter-companies`, `filter-contacts` route를 `:meetingNoteId`보다 먼저 선언한다.
- [ ] 정상/에러/ownership/transaction 테스트를 추가한다.
- [ ] typecheck/lint/test/build를 실행한다.

## 4. API 완료 목록

- [ ] `GET /api/meeting-notes`
- [ ] `GET /api/meeting-notes/filter-companies`
- [ ] `GET /api/meeting-notes/filter-contacts`
- [ ] `GET /api/meeting-notes/:meetingNoteId`
- [ ] `POST /api/meeting-notes`
- [ ] `PATCH /api/meeting-notes/:meetingNoteId`

## 5. Acceptance Criteria

- 인증 없이는 401을 반환한다.
- 타 사용자 회의록 또는 연결 리소스 접근은 404를 반환한다.
- 생성 시 회사와 담당자는 1개 이상이어야 한다.
- 제품과 딜은 없어도 저장된다.
- 같은 회의록에 같은 딜은 중복 연결되지 않는다.
- 생성은 `MeetingNote`와 연결 row 전체를 같은 transaction에서 생성한다.
- 수정은 request에 포함된 연결 배열만 전체 교체한다.
- `companies`, `contacts` 빈 배열은 validation error다.
- `products`, `deals` 빈 배열은 연결 제거다.
- request body에 `timeZone`, `rawText`, `stageText`, 단일 `dealId`를 받지 않는다.
- 목록 response는 `totalPages`를 포함하고 `hasNext`를 포함하지 않는다.
- response 시간 필드는 ISO 8601 UTC string이다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G01_BE_MEETING_NOTE_DOMAIN/WORK_LOG.md
```

기록 항목:

- 구현한 API 목록
- migration 이름
- 수정한 주요 파일
- 실행한 검증 명령과 결과
- 남은 이슈 또는 후속 작업
