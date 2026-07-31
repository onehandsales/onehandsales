# G01 Document Contract Sync

상태: Ready
목표: 11 Admin Operation 구현 전 현재 코드/DB/문서 계약을 다시 대조하고, 이후 goal이 참조할 계약을 확정 상태로 맞춘다.

## 1. 포함 범위

- `BE/prisma/schema.prisma` 확인
- `BE/prisma/migrations` 최신 migration 확인
- `FE/admin-web` route/placeholder 상태 확인
- `BE` AdminGuard/AuthGuard 현재 구현 확인
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 기반 항목 coverage 확인
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN` 기반 항목 coverage 확인
- 10번 Mobile/PWA와 BusinessCard safe failure migration 충돌 여부 확인

## 2. 제외 범위

- 실제 API 구현
- DB migration 작성
- Admin Web 화면 구현
- User Web Trash/account 화면 수정

## 3. Backend 작업

1. `/admin/api/me` 현재 controller/use case/guard를 확인한다.
2. AdminGuard가 없거나 약하면 G02에서 처리하도록 TODO를 기록한다.
3. `BE/prisma/schema.prisma`에서 Admin 관련 신규 model 부재를 확인한다.
4. provider failure source model을 확인한다.
5. Trash soft delete field가 있는 domain을 확인한다.

## 4. Frontend 작업

1. `FE/admin-web/src/app/router/router.tsx` route 상태를 확인한다.
2. `/users`, `/analytics`, `/audit-logs`, `/provider-failures`, `/system` route placeholder 여부를 기록한다.
3. Admin Web이 User Web feature를 import하고 있지 않은지 확인한다.

## 5. Request 계약

신규 HTTP request 없음.

확인 대상 API 계약:

- `COMMON/API-SPEC/ADMIN_AUDIT_SECURITY_API.md`
- `COMMON/API-SPEC/ADMIN_USER_OPERATION_API.md`
- `COMMON/API-SPEC/ADMIN_TRASH_OPERATION_API.md`
- `COMMON/API-SPEC/ADMIN_PROVIDER_FAILURE_API.md`
- `COMMON/API-SPEC/ADMIN_ANALYTICS_API.md`
- `COMMON/API-SPEC/ADMIN_SYSTEM_OPERATION_API.md`

## 6. Response 계약

신규 HTTP response 없음.

문서 산출 response:

```text
G01 완료 기록에 확인한 코드 파일, schema 상태, migration 상태, 구현 전 blocker를 적는다.
```

## 7. Business Logic

- 11의 모든 구현은 G02 audit/security foundation 이후 진행한다.
- 결제/구독이 11에 들어오면 G01에서 blocker로 기록한다.
- 10번 BusinessCard safe failure migration이 이미 존재하면 11에서 중복 DB 변경을 만들지 않는다.

## 8. User Flow

1. 작업자가 G01 문서를 연다.
2. references 문서와 AGENT 문서를 읽는다.
3. 현재 BE/FE/DB 상태를 대조한다.
4. blocker가 있으면 G02 이후 goal에 넘긴다.
5. 문서 완료 기록을 남긴다.

## 9. DB/Prisma 영향

DB 변경 없음.

필수 확인:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`

## 10. 주석 기준

코드 변경이 없으므로 신규 주석 없음.

## 11. 검증

```powershell
rg -n "model Admin|AdminAudit|SensitiveAccess|TrashRecovery|AccountDeletion|DataExport|OperationCheck" BE/prisma/schema.prisma
rg -n "/admin/api|AdminGuard|role.*ADMIN" BE/src FE/admin-web/src
rg -n "BusinessCardScanLog|safeErrorCode|safeErrorMessage|retryable" BE/prisma/schema.prisma BE/prisma/migrations
```

## 12. Goal 체크리스트

- [ ] `BE/prisma/schema.prisma`를 확인했다.
- [ ] migration 목록과 최신 migration을 확인했다.
- [ ] `FE/admin-web` route 상태를 확인했다.
- [ ] `/admin/api/me` 현재 구현을 확인했다.
- [ ] Admin audit/security 신규 DB model 부재를 확인했다.
- [ ] Trash soft delete field와 만료 의미를 확인했다.
- [ ] provider failure source model을 확인했다.
- [ ] 10번 BusinessCard safe failure와 충돌하지 않음을 확인했다.
- [ ] 결제/구독 범위가 11에 없는지 확인했다.
- [ ] 확인 결과와 blocker를 완료 기록에 남겼다.
