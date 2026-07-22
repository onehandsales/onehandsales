# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/admin/api/users` | 사용자 목록 |
| `GET` | `/admin/api/users/:userId` | 사용자 상세 |
| `GET` | `/admin/api/users/:userId/companies` | 사용자 회사 조회 후보 |
| `GET` | `/admin/api/users/:userId/deals` | 사용자 딜 조회 후보 |
| `POST` | `/admin/api/*/sensitive/raw` | 민감 원문 조회 후보 |
| `GET` | `/admin/api/audit-logs` | 감사 로그 조회 |
| 후보 | `/admin/api/trash/*` | 만료/purge/복구 운영 후보 |
| 후보 | `/api/trash/*` | `NBA-007` private memo response restriction 반영 후보 |
| 후보 | `/api/users/me/data-export` | 사용자 자기 데이터 export 요청 |
| 후보 | `/api/users/me/delete-account` | 계정 삭제 요청 |
| 후보 | `/admin/api/provider-failures` | provider 실패 조회 |
| 후보 | `/admin/api/system/db-status` | DB/migration gate 상태 후보 |

## 계약 보강 필요

- AdminGuard 권한
- masking DTO
- raw access reason body
- audit log event
- pagination/sort/filter
- redaction 기준
- irreversible delete 확인값
- account deletion business flow
- data export privacy contract
- Trash private memo response redaction contract
- provider failure log redaction
- DB/migration/backup observability
