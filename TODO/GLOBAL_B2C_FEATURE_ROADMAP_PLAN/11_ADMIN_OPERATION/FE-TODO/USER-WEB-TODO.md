# Admin Web TODO

상태: Draft

## 화면 후보

- `/`
- `/users`
- `/users/:userId`
- `/organizations`
- `/analytics`
- `/audit-logs`
- `/system`
- `/support`
- User Web account/data settings 후보

## 작업 후보

- Admin shell
- user list/detail
- domain read-only tabs
- masked sensitive fields
- raw access reason modal
- audit log list
- provider failure view
- trash retention/purge operation view
- account deletion/data deletion request view
- user data export request/status view
- DB/migration/backup checklist view 후보
- sensitive data detection review 후보

## 검증 후보

- 일반 사용자는 Admin route/API에 접근할 수 없다.
- User Web client가 `/admin/api/*`를 호출하지 않는다.
- 긴 사용자/도메인 데이터가 table을 깨지 않는다.
- 원문 조회는 사유 없이 실행되지 않는다.
- 계정/데이터 삭제 기능은 확인 절차 없이 실행되지 않는다.
