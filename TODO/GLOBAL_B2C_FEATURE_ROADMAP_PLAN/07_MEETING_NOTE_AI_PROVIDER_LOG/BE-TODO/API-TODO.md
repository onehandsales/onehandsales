# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/meeting-notes/ai-draft` | provider log 연결 보강 |
| `POST` | `/api/meeting-notes/stt-draft` | transcript/provider log 보강 |
| 후보 | `/api/meeting-notes/:meetingNoteId/next-actions/draft` | 다음 행동 추출 후보 |
| 후보 | `/api/meeting-notes/:meetingNoteId/follow-up-draft` | follow-up 문구 초안 후보 |
| 후보 | `/api/ai/data-cleanup-suggestions` | AI 데이터 정리 제안 후보 |

## 계약 보강 필요

- provider log status enum
- transcript nullable/retention 기준
- raw provider response 저장 금지 기준
- AI usage/cost logging
- summary response field 계약
- follow-up output schema
- suggestion apply 전 사용자 확인 계약
