# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/analytics/events` | client event 수집 후보 |
| 내부 | application event logging | server-side domain event 후보 |
| 후보 | `/admin/api/analytics/*` | Admin analytics 조회 후보 |
| 후보 | `/api/experiments/assignments` | growth experiment assignment 후보 |
| 후보 | `/api/feedback/churn-surveys` | churn survey 수집 후보 |

## 계약 보강 필요

- event name allowlist
- payload schema
- user/session/device 식별 기준
- PII 금지 기준
- sampling/retention
- provider adapter 기준
- experiment id/variant schema
- billing event와 analytics event 연결 기준
