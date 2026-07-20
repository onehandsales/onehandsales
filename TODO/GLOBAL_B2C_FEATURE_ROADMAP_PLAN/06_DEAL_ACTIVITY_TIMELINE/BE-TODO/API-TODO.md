# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/deals/:dealId/activities` | timeline 조회 |
| `POST` | `/api/deals/:dealId/activities` | 수동 activity 생성 |
| `PATCH` | `/api/deals/:dealId/activities/:activityId` | 수정 후보 |
| `DELETE` | `/api/deals/:dealId/activities/:activityId` | 삭제 후보 |
| 후보 | `/api/deals` response field 추가 | products summary, latest activity, next action |
| 후보 | `/api/contacts` response field 추가 | dealCount |
| 후보 | `/api/companies`, `/api/products` response field 추가 | latest activity/next action summary |
| 후보 | `/api/search` query 확장 | 고급 검색/필터 후보 |

## 계약 보강 필요

- activity type enum
- 자동/수동 source
- linked entity reference 구조
- cursor pagination
- private memo 제외 정책
- activity 생성 transaction 범위
- aggregation ownership 기준
- soft delete 제외 기준
- page size/pagination default
- advanced filter query DTO
- deal probability/score validation
