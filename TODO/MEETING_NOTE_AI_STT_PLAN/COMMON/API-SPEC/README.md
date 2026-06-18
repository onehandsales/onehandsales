# API Spec

- `MEETING_NOTE_AI_STT_API.md`: 회의록 AI/STT 초안 생성 API 계약

현재 Backend는 AI 초안 생성과 STT 변환을 별도 provider port로 분리한다. AI 초안 생성은 OpenAI를 기본으로 사용하고, STT는 현재 OpenAI adapter를 사용하되 Google, NAVER, AWS 같은 provider로 교체 가능해야 한다.
