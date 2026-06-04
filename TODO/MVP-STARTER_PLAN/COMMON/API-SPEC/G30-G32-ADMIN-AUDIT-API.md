# G30-G32 Admin/Audit API 명세

## 1. 목적

이 문서는 Admin Web이 사용자와 전체 도메인 데이터를 조회하고, 민감정보 원문 조회를 사유 입력과 감사 로그로 통제하기 위한 API 계약을 정의한다.

Admin API는 운영 편의를 위해 존재하지만, 사용자 민감정보를 보호해야 하므로 기본 response는 마스킹하고 원문 조회는 별도 API와 감사 로그를 반드시 거친다.

## 2. 포함 goal

- G30. Admin Backend 목록 API
- G31. Admin Web 기본 운영 화면
- G32. 민감정보 원문 조회와 감사 로그

구현 시 API별 request 필드, 비즈니스 로직 흐름, response 필드, 연결 DB, masking, transaction, 에러 기준은 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`를 상세 계약 정본으로 본다.

## 3. 공통 Admin 원칙

- 모든 Admin API는 `/admin/api/*` 경로를 사용한다.
- 모든 Admin API는 `AuthGuard`와 `AdminGuard`를 통과해야 한다.
- Admin 목록/상세 API는 민감정보를 기본 마스킹한다.
- 민감정보 원문 조회 API는 `reason`을 필수로 받고, 같은 transaction에서 `AuditLog`를 생성한다.
- client log, server application log에 원문 PII와 reason 전문을 남기지 않는다.

## 4. Admin 조회 API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| Admin 대시보드 API | `GetAdminDashboard` | `GET` | `/admin/api/dashboard` | `GetAdminDashboardRequest` | `AdminDashboardResponse` | User, Deal, Company, Contact, Product |
| 사용자 목록 API | `ListAdminUsers` | `GET` | `/admin/api/users` | `ListAdminUsersRequest` | `AdminUserListResponse` | User |
| 사용자 상세 API | `GetAdminUser` | `GET` | `/admin/api/users/:userId` | `GetAdminUserRequest` | `AdminUserDetailResponse` | User, UserSetting |
| 사용자 상태 변경 API | `UpdateAdminUserStatus` | `PATCH` | `/admin/api/users/:userId/status` | `UpdateAdminUserStatusRequest` | `AdminUserResponse` | User, AuditLog |
| 전체 회사 목록 API | `ListAdminCompanies` | `GET` | `/admin/api/companies` | `ListAdminCompaniesRequest` | `AdminCompanyListResponse` | Company, User |
| 전체 거래처 목록 API | `ListAdminContacts` | `GET` | `/admin/api/contacts` | `ListAdminContactsRequest` | `AdminContactListResponse` | Contact, Company, User |
| 전체 제품 목록 API | `ListAdminProducts` | `GET` | `/admin/api/products` | `ListAdminProductsRequest` | `AdminProductListResponse` | Product, User |
| 전체 딜 목록 API | `ListAdminDeals` | `GET` | `/admin/api/deals` | `ListAdminDealsRequest` | `AdminDealListResponse` | Deal, Company, Contact, User |
| 특정 사용자 회사 목록 API | `ListAdminUserCompanies` | `GET` | `/admin/api/users/:userId/companies` | `ListAdminUserCompaniesRequest` | `AdminCompanyListResponse` | Company |
| 특정 사용자 거래처 목록 API | `ListAdminUserContacts` | `GET` | `/admin/api/users/:userId/contacts` | `ListAdminUserContactsRequest` | `AdminContactListResponse` | Contact |
| 특정 사용자 제품 목록 API | `ListAdminUserProducts` | `GET` | `/admin/api/users/:userId/products` | `ListAdminUserProductsRequest` | `AdminProductListResponse` | Product |
| 특정 사용자 딜 목록 API | `ListAdminUserDeals` | `GET` | `/admin/api/users/:userId/deals` | `ListAdminUserDealsRequest` | `AdminDealListResponse` | Deal |

### 4.1 Admin 조회 request 필드

| Request 이름 | 필드 |
|---|---|
| `ListAdminUsersRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `status?:UserStatus`, `role?:UserRole` |
| `GetAdminUserRequest` | `userId:string path 필수` |
| `UpdateAdminUserStatusRequest` | `userId:string path 필수`, `status:ACTIVE|SUSPENDED|DELETED`, `reason:string 필수` |
| `ListAdminCompaniesRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `userId?:string`, `includeDeleted?:boolean` |
| `ListAdminContactsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `userId?:string`, `companyId?:string`, `includeDeleted?:boolean` |
| `ListAdminProductsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `userId?:string`, `includeDeleted?:boolean` |
| `ListAdminDealsRequest` | `page?:number`, `pageSize?:number`, `search?:string`, `userId?:string`, `stage?:DealStage`, `includeDeleted?:boolean` |

### 4.2 Admin 조회 response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `AdminDashboardResponse` | `userCount`, `activeUserCount`, `companyCount`, `contactCount`, `productCount`, `dealCount`, `recentAuditLogs[]` |
| `AdminUserResponse` | `id`, `name`, `emailMasked`, `role`, `status`, `createdAt`, `lastLoginAt` |
| `AdminCompanyListResponse` | `items[]`, `items[].id`, `items[].userId`, `items[].userName`, `items[].name`, `items[].industry`, `items[].deletedAt`, pagination |
| `AdminContactListResponse` | `items[]`, `items[].name`, `items[].companyName`, `items[].phoneMasked`, `items[].emailMasked`, `items[].hasPrivateMemo`, pagination |
| `AdminProductListResponse` | `items[]`, `items[].name`, `items[].category`, `items[].unitPrice`, `items[].currency`, pagination |
| `AdminDealListResponse` | `items[]`, `items[].title`, `items[].companyName`, `items[].contactName`, `items[].amountMasked`, `items[].stage`, `items[].likelihoodStatus`, pagination |

### 4.3 Admin 조회 비즈니스 로직과 DB

1. AuthGuard로 현재 사용자를 확인한다.
2. AdminGuard로 `role = ADMIN`인지 확인한다.
3. query validation 후 서버 페이지네이션을 적용한다.
4. 민감 필드는 기본 마스킹한다.
5. 원문 데이터가 필요한 경우 목록/상세 API에서 내려주지 않고 원문 조회 API를 사용하게 한다.
6. 사용자 상태 변경은 위험 액션이므로 사유를 필수로 받고 `AuditLog`를 기록한다.

- 생성: AuditLog. 사용자 상태 변경 시
- 조회: User, Company, Contact, Product, Deal, UserSetting
- 수정: User.status
- 삭제: 없음
- 감사 로그: 상태 변경, 위험 액션
- transaction: 사용자 상태 변경과 AuditLog 생성은 transaction 필요

### 4.4 Admin 조회 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| Admin 아님 | `Forbidden` | 403 |
| 대상 사용자 없음 | `UserNotFound` | 404 |
| 상태 변경 사유 없음 | `AuditReasonRequired` | 400 |

## 5. 민감정보 원문 조회 API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 공통 민감 원문 조회 API | `ViewSensitiveRawData` | `POST` | `/admin/api/sensitive/raw` | `ViewSensitiveRawDataRequest` | `SensitiveRawDataResponse` | 대상 모델, AuditLog |
| 딜 민감 원문 조회 API | `ViewDealSensitiveRawData` | `POST` | `/admin/api/deals/:dealId/sensitive/raw` | `ViewDealSensitiveRawDataRequest` | `SensitiveRawDataResponse` | Deal, PersonalMemo, AuditLog |
| 회의록 원문 조회 API | `ViewMeetingNoteSensitiveRawData` | `POST` | `/admin/api/meeting-notes/:meetingNoteId/sensitive/raw` | `ViewMeetingNoteSensitiveRawDataRequest` | `SensitiveRawDataResponse` | MeetingNote, AuditLog |

### 5.1 민감정보 request 필드

| Request 이름 | 필드 |
|---|---|
| `ViewSensitiveRawDataRequest` | `targetType:DEAL|CONTACT|MEETING_NOTE|PERSONAL_MEMO`, `targetId:string 필수`, `fields:string[] 필수`, `reason:string 필수` |
| `ViewDealSensitiveRawDataRequest` | `dealId:string path 필수`, `fields:string[] 필수`, `reason:string 필수` |
| `ViewMeetingNoteSensitiveRawDataRequest` | `meetingNoteId:string path 필수`, `fields:string[] 필수`, `reason:string 필수` |

### 5.2 민감정보 response 필드

| Response 이름 | 주요 필드 |
|---|---|
| `SensitiveRawDataResponse` | `targetType`, `targetId`, `fields`, `fields[].name`, `fields[].value`, `auditLogId`, `viewedAt` |

### 5.3 민감정보 비즈니스 로직 흐름

1. AuthGuard와 AdminGuard를 통과한다.
2. `reason`이 비어 있거나 너무 짧으면 실패한다.
3. targetType과 targetId가 실제 대상 모델에 존재하는지 확인한다.
4. 요청한 fields가 허용된 민감 필드인지 확인한다.
5. 원문 데이터를 조회한다.
6. 같은 transaction에서 `AuditLog`를 생성한다.
7. response에 `auditLogId`를 포함한다.
8. application log에는 원문 값과 reason 전문을 남기지 않는다.

### 5.4 민감정보 연결 DB 스키마

- 생성: AuditLog
- 조회: Deal, Contact, MeetingNote, PersonalMemo, User
- 수정: 없음
- 삭제: 없음
- 감사 로그: 필수
- transaction: 원문 조회와 AuditLog 기록을 같은 transaction으로 처리

### 5.5 민감정보 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| Admin 아님 | `Forbidden` | 403 |
| 사유 누락 | `AuditReasonRequired` | 400 |
| 허용되지 않은 필드 | `SensitiveFieldNotAllowed` | 400 |
| 대상 없음 | `SensitiveTargetNotFound` | 404 |
| AuditLog 기록 실패 | `AuditLogRequiredTransactionFailed` | 500 |

## 6. 감사 로그 API

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 | 연결 DB |
|---|---|---|---|---|---|---|
| 감사 로그 목록 API | `ListAuditLogs` | `GET` | `/admin/api/audit-logs` | `ListAuditLogsRequest` | `AuditLogListResponse` | AuditLog, User |
| 감사 로그 상세 API | `GetAuditLog` | `GET` | `/admin/api/audit-logs/:auditLogId` | `GetAuditLogRequest` | `AuditLogResponse` | AuditLog, User |

### 6.1 감사 로그 request/response

| Request 이름 | 필드 |
|---|---|
| `ListAuditLogsRequest` | `page?:number`, `pageSize?:number`, `actorUserId?:string`, `targetUserId?:string`, `action?:AuditAction`, `targetType?:AuditTargetType`, `from?:string`, `to?:string` |
| `GetAuditLogRequest` | `auditLogId:string path 필수` |

| Response 이름 | 주요 필드 |
|---|---|
| `AuditLogResponse` | `id`, `actorUserId`, `actorUserName`, `targetUserId`, `action`, `targetType`, `targetId`, `reasonSummary`, `ipAddress`, `userAgent`, `createdAt` |
| `AuditLogListResponse` | `items:AuditLogResponse[]`, pagination |

### 6.2 감사 로그 비즈니스 로직과 DB

1. Admin 권한을 확인한다.
2. 검색 조건과 기간을 validation한다.
3. 감사 로그는 수정/삭제하지 않는다.
4. reason은 원문 전문 대신 요약 또는 redacted 형태로 표시할 수 있다.
5. 민감 원문 데이터 자체는 감사 로그 response에 포함하지 않는다.

- 생성: 없음. 다른 위험 API에서 생성
- 조회: AuditLog, User
- 수정: 없음
- 삭제: 없음
- 감사 로그: 감사 로그 조회 자체도 필요 시 별도 action으로 확장 가능
- transaction: 없음

### 6.3 감사 로그 에러 응답

| 상황 | 에러 | HTTP |
|---|---|---|
| Admin 아님 | `Forbidden` | 403 |
| 감사 로그 없음 | `AuditLogNotFound` | 404 |
| 기간 query 오류 | `ValidationError` | 400 |

## 7. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
