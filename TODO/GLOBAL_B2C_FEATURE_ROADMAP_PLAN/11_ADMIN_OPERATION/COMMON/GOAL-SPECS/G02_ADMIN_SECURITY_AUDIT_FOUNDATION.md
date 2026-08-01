# G02 Admin Security Audit Foundation

상태: Completed
목표: Admin API의 권한, 감사 로그, 민감 원문 접근 사유 입력 기반을 만든다.

## 1. 포함 범위

- AdminGuard 확인/보강
- `AdminAuditLog` schema/migration
- `AdminSensitiveAccessLog` schema/migration
- `GET /admin/api/audit-logs`
- `POST /admin/api/sensitive/raw-access`
- Admin Web audit logs 화면
- 민감 원문 조회 reason modal 공통 패턴

## 2. 제외 범위

- 도메인별 상세 탭 전체 구현
- provider failure 화면 전체 구현
- 결제/구독 관련 audit
- provider raw/prompt/token/quota detail 조회

## 3. Backend 작업

1. AdminGuard가 `User.role=ADMIN`을 기준으로 동작하는지 확인하고 보강한다.
2. Prisma schema에 `AdminAuditLog`, `AdminSensitiveAccessLog`와 필요한 enum을 추가한다.
3. 신규 migration을 만든다.
4. migration SQL에 table/column/index COMMENT를 추가한다.
5. audit repository를 만든다.
6. sensitive raw access use case를 만든다.
7. `GET /admin/api/audit-logs` controller/DTO/mapper를 만든다.
8. `POST /admin/api/sensitive/raw-access` controller/DTO/mapper를 만든다.
9. reason validation을 적용한다.
10. raw access response fieldSet allowlist를 구현한다.

## 4. Frontend 작업

1. `/audit-logs` page를 만든다.
2. audit table filter를 만든다.
3. audit detail drawer를 만든다.
4. 민감 원문 조회 공통 reason modal component를 만든다.
5. reason modal은 10~1000자 validation을 적용한다.
6. Admin API client에 audit/raw access method를 추가한다.

## 5. Request 계약

`GET /admin/api/audit-logs`

```text
query: cursor, limit, adminUserId, targetUserId, action, result, from, to
```

`POST /admin/api/sensitive/raw-access`

```json
{
  "targetUserId": "user-id",
  "targetType": "MEETING_NOTE",
  "targetId": "meeting-note-id",
  "fieldSet": "MEETING_NOTE_BODY",
  "reason": "사용자가 회의록 복구 문의를 남겨 본문 확인이 필요해요"
}
```

상세 계약: `COMMON/API-SPEC/ADMIN_AUDIT_SECURITY_API.md`

## 6. Response 계약

`AdminAuditLogListResponse`

```json
{
  "items": [
    {
      "id": "audit-id",
      "adminUserId": "admin-user-id",
      "adminEmailMasked": "lo***@example.com",
      "targetUserId": "target-user-id",
      "targetType": "USER",
      "targetId": "target-user-id",
      "action": "ADMIN_USER_DETAIL_VIEW",
      "result": "SUCCESS",
      "createdAt": "2026-07-31T02:10:00.000Z"
    }
  ],
  "nextCursor": null
}
```

`AdminSensitiveRawAccessResponse`

```json
{
  "accessId": "sensitive-access-log-id",
  "targetUserId": "user-id",
  "targetType": "MEETING_NOTE",
  "targetId": "meeting-note-id",
  "fieldSet": "MEETING_NOTE_BODY",
  "data": {
    "title": "삼성전자 meeting note",
    "details": "허용된 원문 본문"
  },
  "createdAt": "2026-07-31T02:10:00.000Z"
}
```

## 7. Business Logic

- raw access는 일반 상세 API에 섞지 않는다.
- reason 없이 raw access를 허용하지 않는다.
- raw access audit 기록 실패 시 원문을 반환하지 않는다.
- audit log에는 원문 값이 아니라 target/fieldSet/reason/returnedFieldNames만 저장한다.
- provider raw/prompt/token/quota detail fieldSet은 만들지 않는다.

## 8. User Flow

1. Admin이 masked field의 원문 조회를 누른다.
2. reason modal이 열린다.
3. 사유를 입력하고 확인한다.
4. Backend가 audit/sensitive log를 기록한다.
5. 허용 field만 원문으로 보여준다.
6. Admin은 `/audit-logs`에서 해당 기록을 확인할 수 있다.

## 9. DB/Prisma 영향

신규:

- `AdminAuditLog`
- `AdminSensitiveAccessLog`
- 관련 enum

수정:

- `User`에 relation field 추가 필요

주석 필수:

- Prisma schema 신규 enum/model/field에 `/// 기능 : ...`
- migration SQL에 `COMMENT ON TABLE`, `COMMENT ON COLUMN`, `COMMENT ON INDEX`

## 10. 주석 기준

Backend 예시:

```ts
// 역할 : Admin 감사 로그를 append-only로 기록합니다.
// API : Admin 민감 원문 조회 요청을 처리합니다.
// 기능 : 민감 원문 조회 사유를 검증하고 감사 로그를 같은 transaction에 저장합니다.
```

Frontend 예시:

```ts
// 기능 : 민감 원문 조회 사유를 입력받고 Admin raw access API를 호출합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- admin audit
```

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 12. Goal 체크리스트

- [x] AdminGuard가 `role=ADMIN` 기준으로 동작한다.
- [x] 일반 사용자는 `/admin/api/*`에 접근할 수 없다.
- [x] `AdminAuditLog` schema와 migration이 있다.
- [x] `AdminSensitiveAccessLog` schema와 migration이 있다.
- [x] 신규 Prisma 주석과 migration COMMENT가 있다.
- [x] `GET /admin/api/audit-logs`가 동작한다.
- [x] `POST /admin/api/sensitive/raw-access`가 reason 없이는 실패한다.
- [x] raw access와 sensitive log가 같은 transaction에 있다.
- [x] audit log에 원문 민감값이 저장되지 않는다.
- [x] provider raw/prompt/token/quota detail fieldSet이 없다.
- [x] Admin Web `/audit-logs` 화면이 있다.
- [x] reason modal validation이 있다.
- [x] 검증 command 결과를 기록했다.

## 13. 완료 기록

- 완료일: 2026-08-01
- 완료 내용:
  - `AdminAuditLog`, `AdminSensitiveAccessLog`, 관련 enum과 User relation이 schema/migration에 반영됨.
  - `GET /admin/api/audit-logs`, `POST /admin/api/sensitive/raw-access` 구현 확인.
  - raw access reason 10~1000자 validation과 `AdminAuditLog`/`AdminSensitiveAccessLog` 같은 transaction 기록 확인.
  - Admin Web `/audit-logs`와 공통 reason modal 구현 확인.
- 검증 결과:
  - `cd BE && pnpm run prisma:validate`: 통과.
  - `cd BE && pnpm run prisma:generate`: 통과.
  - `cd BE && pnpm run typecheck`: 통과.
  - `cd BE && pnpm run lint`: 통과.
  - `cd BE && pnpm run test`: 통과. 94 suites / 479 tests.
  - `cd BE && pnpm run build`: 통과.
  - `cd FE/admin-web && pnpm run typecheck`: 통과.
  - `cd FE/admin-web && pnpm run lint`: 통과.
  - `cd FE/admin-web && pnpm run build`: 통과.
  - `cd FE/admin-web && pnpm run test:e2e`: 통과. 1 test.
