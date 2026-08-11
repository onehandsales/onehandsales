# G09 System Operation Gate

상태: Implemented
목표: DB/migration/backup/restore/provider smoke 운영 점검 상태를 Admin에서 기록하고 확인한다.

## 1. 포함 범위

- `AdminOperationCheckRun` schema/migration
- `GET /admin/api/system/operation-checks/latest`
- `POST /admin/api/system/operation-checks`
- Admin Web `/system`
- migration/seed/backup/restore/provider smoke checklist

## 2. 제외 범위

- Admin API에서 직접 migrate/seed 실행
- Admin API에서 직접 backup/restore 실행
- DB URL/secret/token 저장
- 결제 provider smoke

## 3. Backend 작업

1. `AdminOperationCheckRun` schema/migration을 만든다.
2. latest 조회 API를 만든다.
3. check run 생성 API를 만든다.
4. notes에 secret/DB URL/token 의심 pattern 차단 validation을 둔다.
5. operation check 생성 audit를 남긴다.
6. Admin API에서 shell command로 migrate/seed를 실행하지 않는다.

## 4. Frontend 작업

1. `/system` page를 만든다.
2. operation check latest summary를 표시한다.
3. check item status form을 만든다.
4. notes textarea를 만든다.
5. secret 금지 validation error를 표시한다.
6. destructive 실행 버튼은 만들지 않는다.

## 5. Request 계약

```json
{
  "environment": "production",
  "status": "PASS",
  "items": {
    "prismaValidate": "PASS",
    "prismaGenerate": "PASS",
    "migrationStatus": "PASS",
    "seedNotRunOnSharedDb": "PASS",
    "backupVerified": "PASS",
    "restoreDryRun": "WARN",
    "providerSmoke": "WARN"
  },
  "notes": "restore dry-run은 staging 기준으로만 확인했어요"
}
```

상세 계약: `COMMON/API-SPEC/ADMIN_SYSTEM_OPERATION_API.md`

## 6. Response 계약

```json
{
  "id": "check-run-id",
  "environment": "production",
  "status": "PASS",
  "checkedAt": "2026-07-31T00:00:00.000Z",
  "checkedByAdminUserId": "admin-user-id",
  "items": {
    "prismaValidate": "PASS",
    "prismaGenerate": "PASS",
    "migrationStatus": "PASS",
    "seedNotRunOnSharedDb": "PASS",
    "backupVerified": "PASS",
    "restoreDryRun": "WARN",
    "providerSmoke": "WARN"
  },
  "notes": "restore dry-run은 staging 기준으로만 확인했어요"
}
```

최신 점검 기록이 아직 없으면 `GET /admin/api/system/operation-checks/latest`는 `200`과 `null`을 반환한다.

## 7. Business Logic

- Admin은 운영 점검 결과를 기록만 한다.
- Admin API가 DB migration, seed, backup, restore를 직접 실행하지 않는다.
- DB URL, secret, token은 request validation에서 차단한다.
- production check run은 audit 필수다.
- latest 조회도 `ADMIN_SYSTEM_CHECK_VIEW` audit를 남긴다.
- 10/11/12 같은 큰 goal 종료 시 system gate 최신 상태를 확인한다.

## 8. User Flow

1. Admin이 `/system`에 진입한다.
2. 최신 operation check 상태를 본다.
3. 새 점검 결과를 입력한다.
4. 저장한다.
5. audit log가 남는다.

## 9. DB/Prisma 영향

신규:

- `AdminOperationCheckRun`
- `AdminOperationCheckRunStatus`

주석 필수:

- 신규 model/field/enum에 `/// 기능 : ...`
- migration SQL COMMENT

## 10. 주석 기준

```ts
// 기능 : 운영 DB gate 점검 결과를 secret 없이 기록합니다.
// 기능 : notes에 DB URL 또는 token 의심값이 포함됐는지 검사합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run test -- admin system
```

```powershell
cd FE/admin-web
pnpm run build
```

실행 결과:

- `cd BE && pnpm run prisma:validate`: pass
- `cd BE && pnpm run prisma:generate`: pass
- `cd BE && pnpm run test -- admin system`: pass, 16 suites / 53 tests
- `cd BE && pnpm run typecheck`: pass
- `cd BE && pnpm run lint`: pass
- `cd FE/admin-web && pnpm run build`: pass
- `cd FE/admin-web && pnpm run lint`: pass

참고: 현재 로컬 Node는 `v22.21.1`이라 package engine `>=24 <25` 경고가 표시된다.

## 12. Goal 체크리스트

- [x] `AdminOperationCheckRun` schema와 migration이 있다.
- [x] 신규 Prisma 주석과 migration COMMENT가 있다.
- [x] latest 조회 API가 있다.
- [x] check run 생성 API가 있다.
- [x] notes secret/DB URL/token 차단 validation이 있다.
- [x] Admin API가 migrate/seed/backup/restore를 직접 실행하지 않는다.
- [x] operation check 생성 audit가 남는다.
- [x] Admin Web `/system` 화면이 있다.
- [x] destructive 실행 버튼이 없다.
- [x] 검증 command 결과를 기록했다.
