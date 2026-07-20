# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/schedules/google/connect` | Calendar 연결 시작 |
| `POST` | `/api/schedules/google/callback` | OAuth callback 후보 |
| `GET` | `/api/schedules/google/status` | 연결 상태 조회 |
| `DELETE` | `/api/schedules/google/connection` | 연결 해제 |
| `POST` | `/api/schedules/google/import` | 일정 가져오기 |

## 계약 보강 필요

- OAuth state 처리
- scope와 token 보관
- import 중복 처리
- externalEventId unique 기준
- provider failure error mapping
- audit/observability event key
