# Meeting Note AI/STT DB 스키마

## 1. 결론

이번 Backend 작업은 새 DB table, column, migration을 만들지 않는다.

## 2. 기존 schema 사용

최종 저장은 기존 `MeetingNote`와 snapshot link table을 사용한다.

사용 model:

- `MeetingNote`
- `MeetingNoteCompany`
- `MeetingNoteContact`
- `MeetingNoteProduct`
- `MeetingNoteDeal`
- `Company`
- `Contact`
- `Product`
- `Deal`

## 3. sourceType

기존 `MeetingNoteSourceType` enum 값을 사용한다.

- `MANUAL`
- `TEXT_AI`
- `STT_AI`

이번 Backend 작업에서 최종 저장 API가 `TEXT_AI`, `STT_AI` sourceType을 받을 수 있게 한다.

## 4. 저장하지 않는 데이터

이번 범위에서는 아래 값을 저장하지 않는다.

- 회의 원문 text
- STT transcript
- provider raw response
- provider prompt
- provider 호출 이력
- provider 비용/사용량

## 5. 후속 범위

아래 기능이 필요해지면 별도 계획에서 DB 설계를 추가한다.

- transcript 영구 저장
- rawText 암호화 저장
- provider call log
- provider 비용/사용량 집계
- 회의록 삭제/복구
- DealActivity 자동 로그
