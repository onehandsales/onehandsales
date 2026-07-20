# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/sales-reports/weekly/ai-draft` | 주간 AI 리포트 생성 |
| `GET` | `/api/sales-reports/weekly/:reportId` | 저장형이면 리포트 조회 |
| 후보 | `/api/sales-reports/weekly` | 저장형 목록이 필요하면 추가 |
| 후보 | `/api/sales-reports/weekly/:reportId/follow-ups` | 리포트 기반 follow-up 후보 조회 |
| 후보 | `/api/sales-reports/weekly/:reportId/data-cleanup-suggestions` | 리포트 기반 데이터 정리 후보 조회 |

## 계약 보강 필요

- AI input DTO
- AI output schema
- provider timeout/retry
- redaction 기준
- cost/user logging
- transaction 필요 여부
- follow-up/next action/data cleanup suggestion output schema
- 사용자 확인 전에는 데이터 mutation을 하지 않는 계약
