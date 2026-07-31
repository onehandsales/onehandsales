# DB Schema TODO

상태: Confirmed Planning

## 1. 현재 DB 기반

현재 `BE/prisma/schema.prisma` 기준:

- `User.role=ADMIN`이 존재한다.
- 핵심 도메인은 `userId` 소유권을 가진다.
- Company/Contact/Product/Deal/Schedule/MeetingNote/메모 로그류는 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기반 soft delete를 가진다.
- `AiProviderCallLog`, `BusinessCardScanLog`, `NotificationDeliveryAttempt`, `FollowUpDeliveryAttempt`, `ExternalCalendarConnection/Source`에 provider 실패를 safe field 중심으로 추적할 기반이 있다.
- `ProductAnalyticsEvent`, `UserActivationSnapshot`, `RetentionCohortSnapshot`이 09에서 구현됐다.

## 2. 신규 model 후보

| Goal | Model | 목적 | 필수 여부 |
|---|---|---|---|
| G02 | `AdminAuditLog` | Admin 주요 조회/action append-only 감사 | 필수 |
| G02 | `AdminSensitiveAccessLog` | 민감 원문 조회 사유와 결과 추적 | 필수 |
| G05 | `TrashRecoveryRequest` | 7일 이후 복구 문의 queue | 추천 |
| G08 | `AccountDeletionRequest` | 계정 삭제 30일 유예 workflow | 필수 |
| G08 | `UserDataExportRequest` | 사용자 데이터 export 요청 workflow | 필수 |
| G09 | `AdminOperationCheckRun` | DB/migration/backup/provider smoke 운영 점검 기록 | 추천 |

## 3. 신규 enum 후보

```prisma
enum AdminAuditAction {
  ADMIN_LOGIN
  ADMIN_USER_LIST_VIEW
  ADMIN_USER_DETAIL_VIEW
  ADMIN_DOMAIN_RECORDS_VIEW
  ADMIN_TRASH_VIEW
  ADMIN_PROVIDER_FAILURE_VIEW
  ADMIN_ANALYTICS_VIEW
  ADMIN_ACCOUNT_DELETION_VIEW
  ADMIN_DATA_EXPORT_VIEW
  ADMIN_SYSTEM_CHECK_VIEW
  ADMIN_SYSTEM_CHECK_RECORDED
  ADMIN_SENSITIVE_RAW_ACCESS
}

enum AdminAuditResult {
  SUCCESS
  DENIED
  FAILED
}

enum AdminTargetType {
  USER
  COMPANY
  CONTACT
  PRODUCT
  DEAL
  SCHEDULE
  MEETING_NOTE
  BUSINESS_CARD_SCAN
  IMPORT_JOB
  NOTIFICATION
  PROVIDER_FAILURE
  TRASH_RECORD
  ACCOUNT_DELETION_REQUEST
  DATA_EXPORT_REQUEST
  SYSTEM_OPERATION_CHECK
}

enum AdminSensitiveFieldSet {
  USER_CONTACT
  DOMAIN_MEMO
  MEETING_NOTE_BODY
  TRASH_RECORD_DETAIL
}

enum TrashRecoveryRequestStatus {
  REQUESTED
  REVIEWING
  WAITING_RECOVERY_POLICY
  RECOVERY_AVAILABLE
  REJECTED
  CLOSED
}

enum AccountDeletionRequestStatus {
  REQUESTED
  CANCELLED
  SCHEDULED
  PROCESSING
  COMPLETED
  FAILED
}

enum UserDataExportRequestStatus {
  REQUESTED
  PROCESSING
  READY
  EXPIRED
  FAILED
  CANCELLED
}

enum UserDataExportFormat {
  ZIP_JSON_XLSX
}

enum AdminOperationCheckRunStatus {
  PASS
  WARN
  FAIL
}
```

## 4. 신규 model 초안

```prisma
model AdminAuditLog {
  /// 기능 : Admin 감사 로그 row의 고유 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : 작업을 수행한 관리자 사용자 ID입니다.
  adminUserId String @db.Uuid

  /// 기능 : 감사 대상 사용자 ID입니다. 시스템 점검처럼 특정 사용자가 없으면 null입니다.
  targetUserId String? @db.Uuid

  /// 기능 : 감사 대상 종류입니다.
  targetType AdminTargetType

  /// 기능 : 감사 대상 record ID입니다.
  targetId String? @db.Uuid

  /// 기능 : 수행된 Admin action입니다.
  action AdminAuditAction

  /// 기능 : 수행 결과입니다.
  result AdminAuditResult @default(SUCCESS)

  /// 기능 : 운영자가 입력한 사유입니다. 원문 접근과 위험 action에서는 필수입니다.
  reason String? @db.Text

  /// 기능 : 요청 추적 ID입니다.
  requestId String?

  /// 기능 : IP 원문 대신 HMAC hash를 저장합니다.
  ipHash String?

  /// 기능 : User-Agent 원문 대신 hash를 저장합니다.
  userAgentHash String?

  /// 기능 : 원문 없는 구조화 metadata입니다.
  metadataJson Json @default("{}")

  /// 기능 : 감사 로그 생성 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  adminUser User @relation("AdminAuditActor", fields: [adminUserId], references: [id], onDelete: Restrict)
  sensitiveAccessLog AdminSensitiveAccessLog?

  @@index([adminUserId, createdAt])
  @@index([targetUserId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId, createdAt])
}
```

```prisma
model AdminSensitiveAccessLog {
  /// 기능 : 민감 원문 조회 감사 row의 고유 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : 연결된 AdminAuditLog ID입니다.
  auditLogId String @unique @db.Uuid

  /// 기능 : 작업을 수행한 관리자 사용자 ID입니다.
  adminUserId String @db.Uuid

  /// 기능 : 민감정보 소유 사용자 ID입니다.
  targetUserId String @db.Uuid

  /// 기능 : 민감정보 대상 종류입니다.
  targetType AdminTargetType

  /// 기능 : 민감정보 대상 record ID입니다.
  targetId String @db.Uuid

  /// 기능 : 조회한 민감 필드 묶음입니다.
  fieldSet AdminSensitiveFieldSet

  /// 기능 : 운영자가 입력한 원문 조회 사유입니다.
  reason String @db.Text

  /// 기능 : 원문 값 없이 반환 필드명과 masking 상태만 저장합니다.
  returnedFieldNames String[]

  /// 기능 : 민감 원문 조회 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  auditLog AdminAuditLog @relation(fields: [auditLogId], references: [id], onDelete: Restrict)
  adminUser User @relation("AdminSensitiveAccessActor", fields: [adminUserId], references: [id], onDelete: Restrict)

  @@index([adminUserId, createdAt])
  @@index([targetUserId, createdAt])
  @@index([targetType, targetId, createdAt])
}
```

```prisma
model TrashRecoveryRequest {
  /// 기능 : 사용자가 무료 복구 기간 이후 복구 문의를 남긴 요청 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : 복구를 문의한 사용자 ID입니다.
  userId String @db.Uuid

  /// 기능 : 복구 문의 대상 종류입니다.
  targetType AdminTargetType

  /// 기능 : 복구 문의 대상 record ID입니다.
  targetId String @db.Uuid

  /// 기능 : 문의 당시 사용자에게 보여줄 수 있는 제목 snapshot입니다.
  titleSnapshot String?

  /// 기능 : 대상 삭제 시각입니다.
  deletedAt DateTime @db.Timestamptz(3)

  /// 기능 : 무료 복구 만료 시각입니다.
  trashExpiresAt DateTime @db.Timestamptz(3)

  /// 기능 : 사용자 문의 사유입니다.
  userMessage String? @db.Text

  /// 기능 : 복구 문의 처리 상태입니다.
  status TrashRecoveryRequestStatus @default(REQUESTED)

  /// 기능 : 담당 관리자 ID입니다.
  assignedAdminUserId String? @db.Uuid

  /// 기능 : 운영 메모입니다. 사용자에게 노출하지 않습니다.
  adminNote String? @db.Text

  /// 기능 : 문의 생성 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : 문의 수정 시각입니다.
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@index([userId, status, createdAt])
  @@index([status, createdAt])
}
```

```prisma
model AccountDeletionRequest {
  /// 기능 : 사용자의 계정 삭제 요청 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : 삭제를 요청한 사용자 ID입니다.
  userId String @db.Uuid

  /// 기능 : 계정 삭제 요청 처리 상태입니다.
  status AccountDeletionRequestStatus @default(REQUESTED)

  /// 기능 : 사용자가 선택한 삭제 사유 code입니다.
  reasonCode String?

  /// 기능 : 사용자가 입력한 삭제 사유입니다. 운영 로그에는 원문을 남기지 않습니다.
  reasonMessage String? @db.Text

  /// 기능 : 삭제 요청 시각입니다.
  requestedAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : 사용자가 취소할 수 있는 유예 만료 시각입니다.
  scheduledDeletionAt DateTime @db.Timestamptz(3)

  /// 기능 : 삭제 요청 취소 시각입니다.
  cancelledAt DateTime? @db.Timestamptz(3)

  /// 기능 : 실제 삭제 또는 익명화 처리 완료 시각입니다.
  completedAt DateTime? @db.Timestamptz(3)

  /// 기능 : 처리 실패 시 사용자에게 노출 가능한 안전한 실패 code입니다.
  safeErrorCode String?

  /// 기능 : 처리 실패 시 사용자에게 노출 가능한 안전한 실패 문구입니다.
  safeErrorMessage String?

  /// 기능 : 요청 생성 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : 요청 수정 시각입니다.
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
  @@index([status, scheduledDeletionAt])
}
```

```prisma
model UserDataExportRequest {
  /// 기능 : 사용자 데이터 export 요청 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : export를 요청한 사용자 ID입니다.
  userId String @db.Uuid

  /// 기능 : export 요청 처리 상태입니다.
  status UserDataExportRequestStatus @default(REQUESTED)

  /// 기능 : 민감정보 포함 요청 여부입니다. provider raw/token/Admin audit는 포함하지 않습니다.
  includeSensitive Boolean @default(false)

  /// 기능 : export 파일 형식입니다.
  format UserDataExportFormat

  /// 기능 : export 파일 저장소 key입니다. public URL이나 secret을 저장하지 않습니다.
  storageKey String?

  /// 기능 : export 파일 SHA-256 checksum입니다.
  checksumSha256 String?

  /// 기능 : export 요청 시각입니다.
  requestedAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : export 처리 시작 시각입니다.
  processingStartedAt DateTime? @db.Timestamptz(3)

  /// 기능 : export 준비 완료 시각입니다.
  readyAt DateTime? @db.Timestamptz(3)

  /// 기능 : 다운로드 가능 만료 시각입니다.
  expiresAt DateTime? @db.Timestamptz(3)

  /// 기능 : 처리 실패 시 사용자에게 노출 가능한 안전한 실패 code입니다.
  safeErrorCode String?

  /// 기능 : 처리 실패 시 사용자에게 노출 가능한 안전한 실패 문구입니다.
  safeErrorMessage String?

  /// 기능 : 요청 생성 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : 요청 수정 시각입니다.
  updatedAt DateTime @updatedAt @db.Timestamptz(3)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
  @@index([status, createdAt])
  @@index([expiresAt])
}
```

```prisma
model AdminOperationCheckRun {
  /// 기능 : Admin 운영 gate 점검 기록 ID입니다.
  id String @id @default(uuid()) @db.Uuid

  /// 기능 : 점검을 기록한 관리자 사용자 ID입니다.
  adminUserId String @db.Uuid

  /// 기능 : 점검 대상 환경입니다. 예: local, qa, staging, production.
  environment String

  /// 기능 : 전체 점검 결과입니다.
  status AdminOperationCheckRunStatus

  /// 기능 : prisma validate/generate, migration status, backup, restore dry-run, provider smoke 결과 JSON입니다. secret을 저장하지 않습니다.
  itemsJson Json @default("{}")

  /// 기능 : 운영자가 남긴 점검 메모입니다. DB URL, token, secret 저장은 validation으로 차단합니다.
  notes String? @db.Text

  /// 기능 : 점검 기준 시각입니다.
  checkedAt DateTime @default(now()) @db.Timestamptz(3)

  /// 기능 : 기록 생성 시각입니다.
  createdAt DateTime @default(now()) @db.Timestamptz(3)

  adminUser User @relation(fields: [adminUserId], references: [id], onDelete: Restrict)

  @@index([environment, checkedAt])
  @@index([status, checkedAt])
  @@index([adminUserId, checkedAt])
}
```

`User` model에는 아래 relation field를 함께 추가한다.

```prisma
model User {
  /// 기능 : 이 관리자가 수행한 Admin 감사 로그 목록입니다.
  adminAuditLogs AdminAuditLog[] @relation("AdminAuditActor")

  /// 기능 : 이 관리자가 수행한 민감 원문 조회 로그 목록입니다.
  adminSensitiveAccessLogs AdminSensitiveAccessLog[] @relation("AdminSensitiveAccessActor")

  /// 기능 : 사용자가 생성한 Trash 복구 문의 목록입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  trashRecoveryRequests TrashRecoveryRequest[]

  /// 기능 : 사용자의 계정 삭제 요청 목록입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  accountDeletionRequests AccountDeletionRequest[]

  /// 기능 : 사용자의 데이터 export 요청 목록입니다. 계정 실제 삭제 시 함께 삭제됩니다.
  dataExportRequests UserDataExportRequest[]

  /// 기능 : 이 관리자가 기록한 운영 gate 점검 기록 목록입니다.
  adminOperationCheckRuns AdminOperationCheckRun[]
}
```

구현 주의:

- `AdminAuditLog.targetUserId`와 `AdminSensitiveAccessLog.targetUserId`는 감사 대상 사용자 ID snapshot이다. User FK로 묶으면 계정 실제 삭제를 막을 수 있으므로 11 1차 초안에서는 FK를 만들지 않는다.
- 사용자 소유 요청 table은 계정 실제 삭제 시 함께 제거될 수 있도록 `onDelete: Cascade` 후보로 둔다.
- `AdminAuditLog.adminUserId`와 `AdminSensitiveAccessLog.adminUserId`는 내부 관리자 행위자 추적을 위해 `User` FK를 유지한다.

## 5. DB 변경 금지/주의

- 기존 migration 파일은 수정하지 않는다.
- 공유/운영성 DB에 무단 `migrate dev`, `migrate deploy`, `seed`를 실행하지 않는다.
- Trash 7일 만료를 이유로 Company/Contact/Product/Deal/Schedule/MeetingNote row를 hard delete하지 않는다.
- provider raw response, prompt, token, quota detail을 저장하는 column을 추가하지 않는다.
- audit log table에는 원문 민감값을 저장하지 않는다.
- Prisma schema 신규 model/field/enum에는 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에는 table/column/index `COMMENT ON ...` 또는 `-- 기능 : ...` 의도 주석을 추가한다.
