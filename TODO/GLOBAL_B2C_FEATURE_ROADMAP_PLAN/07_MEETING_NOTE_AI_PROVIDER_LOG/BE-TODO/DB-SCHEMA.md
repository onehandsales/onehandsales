# DB Schema TODO

상태: Draft

## 모델 후보

- 공통 `AiProviderCallLog`
- `MeetingNoteProviderCallLog` fallback 후보
- `MeetingNoteTranscript`
- `MeetingNoteActionSuggestion`
- `MeetingNoteFollowUpDraft`
- `AiDataCleanupSuggestion`

## 결정 baseline 반영 후 세부 확인

- 공통 `AiProviderCallLog` 우선, 회의록 전용 fallback 여부
- transcript 임시 저장/장기 저장 예외 암호화 방식
- 보관 기간과 삭제 요청 처리
- provider input/output 저장 범위
- follow-up 초안 status와 TTL
- AI 제안 apply log 필요 여부

## migration 주의

- transcript와 provider response는 민감정보일 수 있다.
- Admin 원문 조회 기능과 결합하지 않는다.
