# G30-G32 엔드포인트별 구현 계약

## 1. 목적

이 문서는 `G30-G32-ADMIN-AUDIT-API.md`를 Admin 조회, 민감정보 원문 조회, 감사 로그 API별 구현 계약으로 확장한다.

Admin API는 운영 편의를 위해 존재하지만 사용자 민감정보 노출 위험이 크므로, 기본 목록/상세 response는 마스킹하고 원문 조회는 사유 입력과 감사 로그 transaction을 반드시 거친다.

## 2. 공통 Admin 처리 기준

- 모든 Admin API는 `AuthGuard`와 `AdminGuard`를 모두 통과해야 한다.
- Admin 목록/상세 API는 원문 PII를 기본 반환하지 않는다.
- 이메일, 전화번호, 금액, 개인 메모, 회의록 원문 등 민감 필드는 기본 마스킹하거나 존재 여부만 반환한다.
- 원문 조회 API는 `reason`을 필수로 받고, 원문 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.
- application log, client log, server error log에 원문 PII와 reason 전문을 남기지 않는다.
- 감사 로그 response에는 원문 민감정보를 포함하지 않는다.

## 3. G30 Admin 조회 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| Admin 대시보드 API | `GetAdminDashboard` | `GetAdminDashboardRequest`: query 없음 또는 기간 필터 선택 | Admin 권한을 확인한다. 사용자, 회사, 거래처, 제품, 딜 전체 count와 최근 감사 로그를 집계한다. 민감 원문은 반환하지 않는다. | `AdminDashboardResponse`: `userCount`, `activeUserCount`, 도메인 count, `recentAuditLogs[]` | `User`, `Company`, `Contact`, `Product`, `Deal`, `AuditLog` 조회. transaction 없음. | `Unauthorized` 401, `Forbidden` 403 |
| 사용자 목록 API | `ListAdminUsers` | `ListAdminUsersRequest`: `page`, `pageSize`, `search`, `status`, `role` | Admin 권한을 확인한다. 서버 페이지네이션과 검색을 적용한다. 이메일은 마스킹해서 반환한다. | `AdminUserListResponse`: `items:AdminUserResponse[]`, pagination | `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 사용자 상세 API | `GetAdminUser` | `GetAdminUserRequest`: `userId` path 필수 | Admin 권한과 대상 사용자 존재를 확인한다. 설정과 주요 사용량 요약을 함께 조회한다. 원문 민감정보는 제외한다. | `AdminUserDetailResponse`: `user`, `settings`, `usageSummary`, `recentAuditLogs` | `User`, `UserSetting`, `AuditLog` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 사용자 상태 변경 API | `UpdateAdminUserStatus` | `UpdateAdminUserStatusRequest`: `userId`, `status`, `reason` | Admin 권한과 사유를 확인한다. 대상 사용자의 상태를 변경하고 같은 transaction에서 `AuditLog`를 생성한다. 자기 자신 비활성화는 금지한다. | `AdminUserResponse`: 변경된 사용자 상태 | `User.status` update, `AuditLog` insert. transaction 필수. | `UserNotFound` 404, `AuditReasonRequired` 400, `CannotSuspendSelf` 409 |
| 전체 회사 목록 API | `ListAdminCompanies` | `ListAdminCompaniesRequest`: `page`, `pageSize`, `search`, `userId`, `includeDeleted` | Admin 권한을 확인한다. 사용자 필터와 삭제 포함 여부를 적용한다. 회사 메모는 기본 요약 또는 제외한다. | `AdminCompanyListResponse`: `items[].id`, `userId`, `userName`, `name`, `industry`, `deletedAt`, pagination | `Company`, `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 전체 거래처 목록 API | `ListAdminContacts` | `ListAdminContactsRequest`: `page`, `pageSize`, `search`, `userId`, `companyId`, `includeDeleted` | Admin 권한을 확인한다. 연락처 전화번호/이메일은 마스킹하고 개인 메모는 원문 대신 `hasPrivateMemo`만 반환한다. | `AdminContactListResponse`: `items[].name`, `companyName`, `phoneMasked`, `emailMasked`, `hasPrivateMemo`, pagination | `Contact`, `Company`, `User`, `PersonalMemo` 존재 여부 조회. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 전체 제품 목록 API | `ListAdminProducts` | `ListAdminProductsRequest`: `page`, `pageSize`, `search`, `userId`, `includeDeleted` | Admin 권한을 확인한다. 제품 목록과 사용자 정보를 조회한다. 금액은 운영 정책에 따라 원문 또는 마스킹값 중 하나로 고정한다. MVP 기본은 원문 단가 표시 허용이다. | `AdminProductListResponse`: `items[].name`, `category`, `unitPrice`, `currency`, pagination | `Product`, `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 전체 딜 목록 API | `ListAdminDeals` | `ListAdminDealsRequest`: `page`, `pageSize`, `search`, `userId`, `stage`, `includeDeleted` | Admin 권한을 확인한다. 딜 금액과 개인 메모는 기본 마스킹한다. 회사/거래처명은 운영 조회 목적상 표시한다. | `AdminDealListResponse`: `items[].title`, `companyName`, `contactName`, `amountMasked`, `stage`, `likelihoodStatus`, pagination | `Deal`, `Company`, `Contact`, `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 특정 사용자 회사 목록 API | `ListAdminUserCompanies` | `ListAdminUserCompaniesRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한 뒤 해당 사용자의 회사만 조회한다. | `AdminCompanyListResponse`: 특정 사용자 회사 목록 | `User`, `Company` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 거래처 목록 API | `ListAdminUserContacts` | `ListAdminUserContactsRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한다. 연락처 민감 필드는 마스킹한다. | `AdminContactListResponse`: 특정 사용자 거래처 목록 | `User`, `Contact`, `Company` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 제품 목록 API | `ListAdminUserProducts` | `ListAdminUserProductsRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인하고 제품 목록을 조회한다. | `AdminProductListResponse`: 특정 사용자 제품 목록 | `User`, `Product` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 딜 목록 API | `ListAdminUserDeals` | `ListAdminUserDealsRequest`: `userId` path, `page`, `pageSize`, `stage`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한다. 딜 금액과 민감 메모는 기본 마스킹한다. | `AdminDealListResponse`: 특정 사용자 딜 목록 | `User`, `Deal`, `Company`, `Contact` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |

## 4. G32 민감정보 원문 조회 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 공통 민감 원문 조회 API | `ViewSensitiveRawData` | `ViewSensitiveRawDataRequest`: `targetType`, `targetId`, `fields`, `reason` | Admin 권한과 사유 길이를 검증한다. targetType별 허용 field 목록을 확인한다. 대상 레코드에서 원문을 읽고 같은 transaction에서 `AuditLog`를 생성한다. | `SensitiveRawDataResponse`: `targetType`, `targetId`, `fields[].name`, `fields[].value`, `auditLogId`, `viewedAt` | target 모델 조회, `AuditLog` insert. transaction 필수. | `AuditReasonRequired` 400, `SensitiveFieldNotAllowed` 400, `SensitiveTargetNotFound` 404 |
| 딜 민감 원문 조회 API | `ViewDealSensitiveRawData` | `ViewDealSensitiveRawDataRequest`: `dealId`, `fields`, `reason` | Admin 권한과 사유를 확인한다. 딜 존재를 확인하고 허용된 딜 민감 필드만 원문 조회한다. `AuditLog`에는 targetType `DEAL`과 reason 요약을 저장한다. | `SensitiveRawDataResponse`: 요청 field 원문, `auditLogId` | `Deal`, `PersonalMemo`, `AuditLog` insert. transaction 필수. | `DealNotFound` 404, `SensitiveFieldNotAllowed` 400, `AuditLogRequiredTransactionFailed` 500 |
| 회의록 원문 조회 API | `ViewMeetingNoteSensitiveRawData` | `ViewMeetingNoteSensitiveRawDataRequest`: `meetingNoteId`, `fields`, `reason` | Admin 권한과 사유를 확인한다. 회의록 존재를 확인하고 `rawText`, `details`, `nextPlan`, `requiredAction` 등 허용 필드만 조회한다. | `SensitiveRawDataResponse`: 요청 field 원문, `auditLogId` | `MeetingNote`, `AuditLog` insert. transaction 필수. | `MeetingNoteNotFound` 404, `SensitiveFieldNotAllowed` 400, `AuditReasonRequired` 400 |

## 5. G32 감사 로그 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 감사 로그 목록 API | `ListAuditLogs` | `ListAuditLogsRequest`: `page`, `pageSize`, `actorUserId`, `targetUserId`, `action`, `targetType`, `from`, `to` | Admin 권한을 확인한다. 기간과 필터를 validation한다. reason은 원문 전문 대신 요약 또는 redacted 형태로 반환한다. | `AuditLogListResponse`: `items:AuditLogResponse[]`, pagination | `AuditLog`, `User` 조회와 count. transaction 없음. | `ValidationError` 400, `Forbidden` 403 |
| 감사 로그 상세 API | `GetAuditLog` | `GetAuditLogRequest`: `auditLogId` path 필수 | Admin 권한을 확인한다. 감사 로그 단건을 조회한다. 원문 민감정보는 포함하지 않는다. | `AuditLogResponse`: `id`, `actorUserId`, `actorUserName`, `targetUserId`, `action`, `targetType`, `targetId`, `reasonSummary`, `ipAddress`, `userAgent`, `createdAt` | `AuditLog`, `User` 조회. transaction 없음. | `AuditLogNotFound` 404, `Forbidden` 403 |

## 6. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
