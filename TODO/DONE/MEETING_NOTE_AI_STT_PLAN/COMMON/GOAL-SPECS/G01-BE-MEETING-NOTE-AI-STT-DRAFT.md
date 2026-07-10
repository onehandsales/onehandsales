# G01-BE-MEETING-NOTE-AI-STT-DRAFT

## 목표

회의록 AI/STT 초안 생성 Backend API를 구현한다.

## 요구사항

- `POST /api/meeting-notes/ai-draft`를 제공한다.
- `POST /api/meeting-notes/stt-draft`를 제공한다.
- 사용자가 선택한 회사, 담당자, 제품, 딜, 회의 일시는 Backend가 검증만 하고 AI가 생성하지 않는다.
- AI/STT는 `details`, `nextPlan`, `requiredAction`만 생성한다.
- 초안 생성 결과는 DB에 저장하지 않는다.
- AI 초안 생성은 `MeetingNoteAiDraftProvider` application port 뒤에 둔다.
- STT 변환은 `MeetingNoteSttProvider` application port 뒤에 둔다.
- AI provider 기본 구현은 OpenAI adapter를 사용한다.
- STT provider 기본 구현은 OpenAI adapter를 사용하되 Google, AWS 등으로 교체 가능해야 한다.
- 기본 테스트는 provider fake로 검증한다.

## 완료 기준

- 두 API가 controller에 등록되어 있다.
- application service가 선택 ID ownership을 검증한다.
- `stt-draft`는 STT provider로 transcript를 만든 뒤 AI provider로 본문 초안을 만든다.
- provider 실패가 일관된 외부 provider 오류로 변환된다.
- `.env.example`에 AI/STT provider 설정이 추가되어 있다.
- typecheck와 관련 테스트가 통과한다.
