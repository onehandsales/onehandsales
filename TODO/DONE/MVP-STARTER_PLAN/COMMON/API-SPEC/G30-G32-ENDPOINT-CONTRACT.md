# G30-G32 엔드포인트별 구현 계약

## 1. 목적

이 문서는 `G30-G32-ADMIN-AUDIT-API.md`를 Admin 조회, 민감정보 원문 조회, 감사 로그 API별 구현 계약으로 확장한다.

Admin API는 운영 편의를 위해 존재하지만 사용자 민감정보 노출 위험이 크므로, 기본 목록/상세 response는 마스킹하고 원문 조회는 사유 입력과 감사 로그 transaction을 반드시 거친다.

## 2. 공통 Admin 처리 기준

- 모든 Admin API는 `AuthGuard`와 `AdminGuard`를 모두 통과해야 한다.
- Admin 목록/상세 API는 원문 PII를 기본 반환하지 않는다.
- 이메일, 전화번호, 금액, Memo 원문, 회의록 원문 등 민감 필드는 기본 마스킹하거나 존재 여부만 반환한다.
- 원문 조회 API는 `reason`을 필수로 받고, 원문 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.
- Memo 원문과 회의록 원문 입력값은 암호화 저장되므로, 원문 조회 승인 전에는 복호화하지 않는다.
- application log, client log, server error log에 원문 PII와 reason 전문을 남기지 않는다.
- 감사 로그 response에는 원문 민감정보를 포함하지 않는다.

## 3. G30 Admin 조회 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| Admin 대시보드 API | `GetAdminDashboard` | `GetAdminDashboardRequest`: query 없음 또는 기간 필터 선택 | Admin 권한을 확인한다. 사용자, 회사, 거래처, 제품, 딜 전체 count와 최근 감사 로그를 집계한다. 민감 원문은 반환하지 않는다. | `AdminDashboardResponse`: `userCount`, `activeUserCount`, 도메인 count, `recentAuditLogs[]` | `User`, `Company`, `Contact`, `Product`, `Deal`, `AuditLog` 조회. transaction 없음. | `Unauthorized` 401, `Forbidden` 403 |
| 사용자 목록 API | `ListAdminUsers` | `ListAdminUsersRequest`: `page`, `pageSize`, `search`, `status`, `role` | Admin 권한을 확인한다. 서버 페이지네이션과 검색을 적용한다. 이메일은 마스킹해서 반환한다. 삭제 계정도 상태 필터로 조회할 수 있다. | `AdminUserListResponse`: `items:AdminUserResponse[]`, pagination. `AdminUserResponse`는 `deletedAt`, `permanentDeleteAt` 포함 | `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 사용자 상세 API | `GetAdminUser` | `GetAdminUserRequest`: `userId` path 필수 | Admin 권한과 대상 사용자 존재를 확인한다. 설정과 주요 사용량 요약을 함께 조회한다. 원문 민감정보는 제외한다. 삭제 계정이면 완전 삭제 예정일을 함께 반환한다. | `AdminUserDetailResponse`: `user`, `settings`, `usageSummary`, `recentAuditLogs` | `User`, `UserSetting`, `AuditLog` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 사용자 상태 변경 API | `UpdateAdminUserStatus` | `UpdateAdminUserStatusRequest`: `userId`, `status`, `reason` | Admin 권한과 사유를 확인한다. 자기 자신 상태 변경은 금지한다. `status = DELETED`이면 강제 계정 삭제로 처리해 `User.status`, `deletedAt`, `permanentDeleteAt = deletedAt + 30일`을 기록하고 active `AuthSession`을 revoke한다. `DELETED -> ACTIVE`는 30일 이내 계정 복구로 처리해 `deletedAt`, `permanentDeleteAt`을 null로 되돌린다. 같은 transaction에서 `AuditLog`를 생성한다. | `AdminUserResponse`: 변경된 사용자 상태, `deletedAt`, `permanentDeleteAt` | `User.status`, `User.deletedAt`, `User.permanentDeleteAt` update, `AuthSession.revokedAt` update, `AuditLog` insert. transaction 필수. | `UserNotFound` 404, `AuditReasonRequired` 400, `CannotChangeSelf` 409, `DeletedUserExpired` 410 |
| 전체 회사 목록 API | `ListAdminCompanies` | `ListAdminCompaniesRequest`: `page`, `pageSize`, `search`, `userId`, `includeDeleted` | Admin 권한을 확인한다. 사용자 필터와 삭제 포함 여부를 적용한다. 회사 Memo 원문은 반환하지 않고 요약 또는 존재 여부만 반환한다. | `AdminCompanyListResponse`: `items[].id`, `userId`, `userName`, `name`, `industry`, `deletedAt`, `permanentDeleteAt`, pagination | `Company`, `User`, `PersonalMemo` 요약 조회. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 회사 상세 API | `GetAdminCompany` | `GetAdminCompanyRequest`: `companyId` path 필수 | Admin 권한과 회사 존재를 확인한다. 삭제된 회사도 운영 조회 목적으로 반환한다. Memo 원문은 제외하고 `memoSummary`, `recentLogs`, 연결 거래처/딜/제품 count를 반환한다. | `AdminCompanyDetailResponse`: `company`, `owner`, `usageSummary`, `memoSummary`, `recentLogs[]` | `Company`, `User`, `CompanyLog`, `Contact`, `Deal`, `ProductConnection`, `PersonalMemo` 요약 조회. transaction 없음. | `CompanyNotFound` 404, `Forbidden` 403 |
| 전체 거래처 목록 API | `ListAdminContacts` | `ListAdminContactsRequest`: `page`, `pageSize`, `search`, `userId`, `companyId`, `includeDeleted` | Admin 권한을 확인한다. 연락처 전화번호/이메일은 마스킹하고 Memo는 원문 대신 `hasMemo`, `memoCount`, `latestMemoAt`만 반환한다. | `AdminContactListResponse`: `items[].name`, `companyName`, `phoneMasked`, `emailMasked`, `hasMemo`, `memoCount`, `latestMemoAt`, `deletedAt`, `permanentDeleteAt`, pagination | `Contact`, `Company`, `User`, `PersonalMemo` 요약 조회. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 거래처 상세 API | `GetAdminContact` | `GetAdminContactRequest`: `contactId` path 필수 | Admin 권한과 거래처 존재를 확인한다. 삭제된 거래처도 운영 조회 목적으로 반환한다. 전화번호/이메일은 마스킹하고 Memo 원문은 제외한다. | `AdminContactDetailResponse`: `contact`, `owner`, `company`, `usageSummary`, `memoSummary`, `recentLogs[]` | `Contact`, `User`, `Company`, `ContactLog`, `Deal`, `PersonalMemo` 요약 조회. transaction 없음. | `ContactNotFound` 404, `Forbidden` 403 |
| 전체 제품 목록 API | `ListAdminProducts` | `ListAdminProductsRequest`: `page`, `pageSize`, `search`, `userId`, `includeDeleted` | Admin 권한을 확인한다. 제품 목록과 사용자 정보를 조회한다. 제품 단가는 민감 가능 필드이므로 기본 목록에서는 마스킹한다. | `AdminProductListResponse`: `items[].name`, `category`, `unitPriceMasked`, `currency`, `deletedAt`, `permanentDeleteAt`, pagination | `Product`, `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 제품 상세 API | `GetAdminProduct` | `GetAdminProductRequest`: `productId` path 필수 | Admin 권한과 제품 존재를 확인한다. 삭제된 제품도 운영 조회 목적으로 반환한다. 단가는 마스킹하고 제품 Log와 Memo 원문은 제외 또는 요약만 반환한다. | `AdminProductDetailResponse`: `product`, `owner`, `connectionSummary`, `memoSummary`, `recentLogs[]` | `Product`, `User`, `ProductLog`, `ProductConnection`, `PersonalMemo` 요약 조회. transaction 없음. | `ProductNotFound` 404, `Forbidden` 403 |
| 전체 딜 목록 API | `ListAdminDeals` | `ListAdminDealsRequest`: `page`, `pageSize`, `search`, `userId`, `stage`, `includeDeleted` | Admin 권한을 확인한다. 딜 금액과 Memo 원문은 기본 마스킹한다. 회사/거래처명은 운영 조회 목적상 표시한다. | `AdminDealListResponse`: `items[].title`, `companyName`, `contactName`, `amountMasked`, `stage`, `likelihoodStatus`, `deletedAt`, `permanentDeleteAt`, pagination | `Deal`, `Company`, `Contact`, `User` 조회와 count. transaction 없음. | `Forbidden` 403, `ValidationError` 400 |
| 딜 상세 API | `GetAdminDeal` | `GetAdminDealRequest`: `dealId` path 필수 | Admin 권한과 딜 존재를 확인한다. 삭제된 딜도 운영 조회 목적으로 반환한다. 금액과 Memo 원문은 제외 또는 마스킹하고 활동/일정/회의록은 요약만 반환한다. | `AdminDealDetailResponse`: `deal`, `owner`, `company`, `contact`, `productSummary`, `activitySummary`, `memoSummary`, `schedulesSummary`, `meetingNotesSummary` | `Deal`, `User`, `Company`, `Contact`, `ProductConnection`, `DealActivity`, `Schedule`, `MeetingNote`, `PersonalMemo` 요약 조회. transaction 없음. | `DealNotFound` 404, `Forbidden` 403 |
| 특정 사용자 회사 목록 API | `ListAdminUserCompanies` | `ListAdminUserCompaniesRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한 뒤 해당 사용자의 회사만 조회한다. | `AdminCompanyListResponse`: 특정 사용자 회사 목록 | `User`, `Company` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 거래처 목록 API | `ListAdminUserContacts` | `ListAdminUserContactsRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한다. 연락처 민감 필드는 마스킹한다. | `AdminContactListResponse`: 특정 사용자 거래처 목록 | `User`, `Contact`, `Company` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 제품 목록 API | `ListAdminUserProducts` | `ListAdminUserProductsRequest`: `userId` path, `page`, `pageSize`, `search`, `includeDeleted` | 대상 사용자 존재를 확인하고 제품 목록을 조회한다. | `AdminProductListResponse`: 특정 사용자 제품 목록 | `User`, `Product` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |
| 특정 사용자 딜 목록 API | `ListAdminUserDeals` | `ListAdminUserDealsRequest`: `userId` path, `page`, `pageSize`, `stage`, `search`, `includeDeleted` | 대상 사용자 존재를 확인한다. 딜 금액과 Memo 원문은 기본 마스킹한다. | `AdminDealListResponse`: 특정 사용자 딜 목록 | `User`, `Deal`, `Company`, `Contact` 조회. transaction 없음. | `UserNotFound` 404, `Forbidden` 403 |

## 4. G32 민감정보 원문 조회 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 공통 민감 원문 조회 API | `ViewSensitiveRawData` | `ViewSensitiveRawDataRequest`: `targetType`, `targetId`, `fields`, `reason` | Admin 권한과 사유 길이를 검증한다. targetType별 허용 field 목록을 확인한다. 암호화 필드는 ciphertext/keyVersion만 조회하고 같은 transaction에서 `AuditLog`를 생성한다. AuditLog 성공 후 허용 필드를 복호화한다. | `SensitiveRawDataResponse`: `targetType`, `targetId`, `fields[].name`, `fields[].value`, `auditLogId`, `viewedAt` | target 모델 조회, `AuditLog` insert. transaction 필수 | `AuditReasonRequired` 400, `SensitiveFieldNotAllowed` 400, `SensitiveTargetNotFound` 404, `DecryptionFailed` 500 |
| 딜 민감 원문 조회 API | `ViewDealSensitiveRawData` | `ViewDealSensitiveRawDataRequest`: `dealId`, `fields`, `reason` | Admin 권한과 사유를 확인한다. 딜 존재를 확인하고 허용된 딜 민감 필드만 원문 조회한다. Memo는 `PersonalMemo.contentCiphertext`를 복호화한다. `AuditLog`에는 targetType `DEAL`과 reason 요약을 저장한다. | `SensitiveRawDataResponse`: 요청 field 원문, `auditLogId` | `Deal`, `PersonalMemo`, `AuditLog` insert. transaction 필수 | `DealNotFound` 404, `SensitiveFieldNotAllowed` 400, `AuditLogRequiredTransactionFailed` 500, `DecryptionFailed` 500 |
| 회의록 원문 조회 API | `ViewMeetingNoteSensitiveRawData` | `ViewMeetingNoteSensitiveRawDataRequest`: `meetingNoteId`, `fields`, `reason` | Admin 권한과 사유를 확인한다. 회의록 존재를 확인하고 `rawText`, `details`, `nextPlan`, `requiredAction` 등 허용 필드만 조회한다. `rawText`는 `rawTextCiphertext`를 복호화해 반환한다. | `SensitiveRawDataResponse`: 요청 field 원문, `auditLogId` | `MeetingNote`, `AuditLog` insert. transaction 필수 | `MeetingNoteNotFound` 404, `SensitiveFieldNotAllowed` 400, `AuditReasonRequired` 400, `DecryptionFailed` 500 |

## 5. G32 감사 로그 엔드포인트 계약

| API 이름 | API 식별자 | Request 이름/필드 | 비즈니스 로직 흐름 | Response 이름/필드 | 연결 DB/transaction | 주요 에러 |
|---|---|---|---|---|---|---|
| 감사 로그 목록 API | `ListAuditLogs` | `ListAuditLogsRequest`: `page`, `pageSize`, `actorUserId`, `targetUserId`, `action`, `targetType`, `from`, `to` | Admin 권한을 확인한다. 기간과 필터를 validation한다. reason은 원문 전문 대신 요약 또는 redacted 형태로 반환한다. | `AuditLogListResponse`: `items:AuditLogResponse[]`, pagination | `AuditLog`, `User` 조회와 count. transaction 없음. | `ValidationError` 400, `Forbidden` 403 |
| 감사 로그 상세 API | `GetAuditLog` | `GetAuditLogRequest`: `auditLogId` path 필수 | Admin 권한을 확인한다. 감사 로그 단건을 조회한다. 원문 민감정보는 포함하지 않는다. | `AuditLogResponse`: `id`, `actorUserId`, `actorUserName`, `targetUserId`, `action`, `targetType`, `targetId`, `reasonSummary`, `ipAddress`, `userAgent`, `createdAt` | `AuditLog`, `User` 조회. transaction 없음. | `AuditLogNotFound` 404, `Forbidden` 403 |

## 6. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
