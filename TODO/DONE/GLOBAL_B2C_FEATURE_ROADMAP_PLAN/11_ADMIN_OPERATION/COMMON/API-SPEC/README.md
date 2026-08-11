# API Spec

상태: Implemented

## 1. 원칙

- Admin API는 `/admin/api/*`다.
- User API는 `/api/*`다.
- Admin API는 AuthGuard + AdminGuard 필수다.
- Admin API response는 기본 masked다.
- 민감 원문은 별도 raw access API에서 reason + audit log 후 반환한다.
- 결제/구독 API는 11에 만들지 않는다.

## 2. 계약 목록

| 문서 | 소비자 | Goal |
|---|---|---|
| `ADMIN_AUDIT_SECURITY_API.md` | Admin Web | G02 |
| `ADMIN_USER_OPERATION_API.md` | Admin Web | G03 |
| `ADMIN_DOMAIN_READONLY_API.md` | Admin Web | G04 |
| `ADMIN_TRASH_OPERATION_API.md` | Admin Web | G05 |
| `TRASH_USER_RECOVERY_API.md` | User Web | G05 |
| `ADMIN_PROVIDER_FAILURE_API.md` | Admin Web | G06 |
| `ADMIN_ANALYTICS_API.md` | Admin Web | G07 |
| `ACCOUNT_DATA_REQUEST_API.md` | User Web, Admin Web | G08 |
| `ADMIN_SYSTEM_OPERATION_API.md` | Admin Web | G09 |

## 3. 공통 Error

```json
{
  "code": "ADMIN_FORBIDDEN",
  "message": "관리자 권한이 필요해요"
}
```

```json
{
  "code": "ADMIN_REASON_REQUIRED",
  "field": "reason"
}
```

```json
{
  "code": "ADMIN_TARGET_NOT_FOUND"
}
```

권한 없음과 target 없음은 정보 노출을 줄이기 위해 상황별로 같은 status를 사용할 수 있다. 구체 status는 각 API 문서에서 정한다.
