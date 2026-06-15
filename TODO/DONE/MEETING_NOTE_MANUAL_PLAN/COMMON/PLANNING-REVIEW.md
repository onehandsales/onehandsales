# Meeting Note Planning Review

## 1. 검토 결과

- 검토일: 2026-06-15
- 판정: 통과
- 상태: 완료. 2026-06-15에 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN`으로 보관

## 2. 통과 근거

- 계획 수립 당시 Backend에 MeetingNote module이 없었으므로 새 활성 계획으로 분리하는 것이 맞았다.
- User Web에는 meeting-note feature/page가 있었고, 구현 완료 후 새 API 계약으로 교체됐다.
- `meetingNote.md`에서 AI Text/STT가 후속 범위로 분리됐고, 이번 계획도 수동 회의록 CRUD로 범위를 좁혔다.
- request `timeZone`을 받지 않고 `User.timeZone`을 사용하는 정책이 확정됐다.
- 회사와 담당자는 필수 연결, 제품과 딜은 선택 연결로 구현 기준을 고정했다.
- API 계약, DB schema, FE 작업, BE 작업, 검증 goal이 분리되어 있다.

## 3. 충돌 정리

### `UX Design/PEN_UI_05_API_CHANGE_TRACKER.md`

오래된 Meeting Note 계약으로 아래 항목이 남아 있다.

- `POST /api/meeting-notes/generate`
- `POST /api/meeting-notes/:meetingNoteId/link-deal`
- `DELETE /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/:meetingNoteId/restore`
- `dealId`, `stageText`, `hasNext`, `pageSize`

이번 계획에서는 사용하지 않는다.

### `meetingNote.md`

테이블 구조 예시의 `String`/`String?` 표기와 하단 설명이 일부 충돌할 수 있다.

구현 기준은 이 계획의 `BE-TODO/DB-SCHEMA.md`다.

정규화한 기준:

- `meetingAt`은 request `meetingLocalDateTime`이 선택이므로 nullable이다.
- `nextPlan`, `requiredAction`, `rawText`는 nullable이다.
- snapshot-only 회사/담당자/제품을 허용하므로 `companyId`, `contactId`, `productId`는 nullable이다.
- snapshot 보조 필드는 원본 엔티티 또는 사용자 입력에 없을 수 있으므로 nullable이다.

## 4. 구현 전 주의

- `filter-companies`, `filter-contacts` route는 `:meetingNoteId` route보다 먼저 선언한다.
- 목록 페이지네이션은 join row 때문에 중복되지 않도록 `MeetingNote.id` 기준으로 수행한다.
- 생성/수정 시 연결 row는 transaction 안에서 함께 생성 또는 교체한다.
- 수정 request에서 연결 배열이 빠진 경우와 빈 배열인 경우를 구분한다.
- 회사와 담당자 배열은 생성과 수정 모두 빈 배열이면 validation error다.
- 제품과 딜 배열은 빈 배열을 허용한다.
- meeting note 본문, rawText, 연락처 email/mobile 원문은 structured log에 남기지 않는다.

## 5. 후속 범위

- AI Text 초안 생성
- STT 변환
- 딜 상세에서 회의록 생성/연결 UX
- 딜 활동 로그 자동 생성
- 삭제/복구
- Admin 회의록 조회
- rawText 암호화
