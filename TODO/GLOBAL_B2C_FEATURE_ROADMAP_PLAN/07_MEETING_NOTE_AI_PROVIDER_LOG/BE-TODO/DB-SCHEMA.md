# DB Schema TODO

상태: Draft

## 모델 후보

- `MeetingNoteProviderCallLog`
- `MeetingNoteTranscript`
- `MeetingNoteActionSuggestion`
- `MeetingNoteFollowUpDraft`
- `AiDataCleanupSuggestion`
- 공통 `AiProviderCallLog`

## 결정 필요

- provider log를 회의록 전용으로 둘지 공통 AI log로 둘지
- transcript 암호화 저장 여부
- 보관 기간과 삭제 요청 처리
- provider input/output 저장 범위
- follow-up 초안 저장 여부
- AI 제안 apply log 필요 여부

## migration 주의

- transcript와 provider response는 민감정보일 수 있다.
- Admin 원문 조회 기능과 결합하지 않는다.
