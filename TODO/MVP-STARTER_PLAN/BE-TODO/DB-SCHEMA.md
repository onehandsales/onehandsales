# DB 스키마 TODO

## 1. 목적

이 문서는 MVP 구현에 필요한 데이터베이스 스키마 초안을 정리한다.

기준은 Prisma와 PostgreSQL이다. 실제 구현 시 `BE/prisma/schema.prisma`에 반영하되, migration 적용 후에는 migration 파일을 수정하거나 삭제하지 않는다.

## 2. 설계 원칙

- 기본 PK는 UUID를 사용한다.
- 사용자 소유 데이터는 반드시 `userId`를 가진다.
- 주요 업무 데이터는 `deletedAt`으로 soft delete한다.
- 주요 테이블은 `createdAt`, `updatedAt`을 가진다.
- 확장 데이터는 `metadata Json?`으로 준비한다.
- FK 컬럼은 인덱스를 둔다.
- Admin 민감정보 원문 조회는 `AuditLog`를 남긴다.
- polymorphic 관계는 `targetType`, `targetId`를 사용하되, application layer에서 존재 여부와 소유권을 검증한다.

## 3. 주요 엔티티 관계

```text
User
  ├─ UserOAuthAccount
  ├─ UserSetting
  ├─ Company
  │   ├─ CompanyLog
  │   └─ Contact
  ├─ Product
  ├─ ProductConnection
  ├─ Deal
  │   └─ DealActivity
  ├─ Schedule
  │   └─ ScheduleReminder
  ├─ MeetingNote
  ├─ BusinessCardScan
  ├─ ImportJob
  │   └─ ImportJobRow
  ├─ ExportJob
  ├─ Tag
  ├─ TagAssignment
  ├─ PersonalMemo
  ├─ Notification
  ├─ ExternalCalendarConnection
  └─ AiJob

AuditLog은 actorUserId 기준으로 Admin 또는 시스템 행위를 기록한다.
```

## 4. Prisma schema 초안

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum OAuthProvider {
  KAKAO
  GOOGLE
  NAVER
  APPLE
}

enum DealStage {
  INITIAL_CONTACT
  IN_DISCUSSION
  WON
  LOST
}

enum DealLikelihoodStatus {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

enum NextActionStatus {
  NONE
  SCHEDULED
  DUE_SOON
  OVERDUE
  DONE
}

enum ProductConnectionTargetType {
  COMPANY
  CONTACT
  DEAL
}

enum ProductConnectionType {
  INTERESTED
  DELIVERED
  PROPOSED
  COMPETITOR
  MAINTENANCE
  OTHER
}

enum ScheduleSource {
  INTERNAL
  GOOGLE
}

enum TagTargetType {
  COMPANY
  CONTACT
  PRODUCT
  DEAL
  SCHEDULE
  MEETING_NOTE
}

enum PersonalMemoTargetType {
  COMPANY
  CONTACT
  PRODUCT
  DEAL
  SCHEDULE
  MEETING_NOTE
}

enum AuditAction {
  ADMIN_SENSITIVE_RAW_VIEW
  ADMIN_USER_STATUS_CHANGED
  ADMIN_DATA_UPDATED
  ADMIN_PAYMENT_STATUS_CHANGED
  USER_EXPORT_WITH_SENSITIVE_DATA
  TRASH_RESTORE
  PERMANENT_DELETE
}

enum AuditTargetType {
  USER
  COMPANY
  CONTACT
  PRODUCT
  DEAL
  SCHEDULE
  MEETING_NOTE
  PERSONAL_MEMO
  IMPORT_JOB
  EXPORT_JOB
  PAYMENT
}

enum NotificationType {
  SCHEDULE_REMINDER
  DEAL_DUE_REMINDER
  NEXT_ACTION_REMINDER
  MEETING_NOTE_GENERATED
  TRASH_PERMANENT_DELETE_WARNING
}

enum NotificationChannel {
  EMAIL
  BROWSER_PUSH
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  READ
  CANCELED
}

enum ImportTargetType {
  COMPANY
  CONTACT
  PRODUCT
  DEAL
}

enum ImportJobStatus {
  UPLOADED
  MAPPING_PENDING
  MAPPING_READY
  CONFIRMED
  PROCESSING
  COMPLETED
  FAILED
  CANCELED
}

enum ImportRowStatus {
  PENDING
  IMPORTED
  SKIPPED
  FAILED
}

enum ExportTargetType {
  COMPANY
  CONTACT
  PRODUCT
  DEAL
  SCHEDULE
  MEETING_NOTE
  WEEKLY_SCHEDULE_REPORT
}

enum ExportFormat {
  PDF
  EXCEL
}

enum ExportJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  EXPIRED
}

enum BusinessCardScanStatus {
  UPLOADED
  OCR_PROCESSING
  OCR_COMPLETED
  CONFIRMED
  FAILED
}

enum AiJobType {
  BUSINESS_CARD_OCR
  MEETING_NOTE_GENERATION
  IMPORT_COLUMN_MAPPING
}

enum AiJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ExternalCalendarProvider {
  GOOGLE
}

enum ExternalCalendarConnectionStatus {
  CONNECTED
  EXPIRED
  REVOKED
}

model User {
  id                    String                       @id @default(uuid()) @db.Uuid
  email                 String?
  displayName           String?
  role                  UserRole                     @default(USER)
  status                UserStatus                   @default(ACTIVE)
  lastLoginAt           DateTime?
  createdAt             DateTime                     @default(now())
  updatedAt             DateTime                     @updatedAt
  deletedAt             DateTime?

  oauthAccounts         UserOAuthAccount[]
  setting               UserSetting?
  companies             Company[]
  companyLogs           CompanyLog[]
  contacts              Contact[]
  products              Product[]
  productConnections    ProductConnection[]
  deals                 Deal[]
  dealActivities        DealActivity[]
  dealActivityTypes     DealActivityType[]
  schedules             Schedule[]
  scheduleReminders     ScheduleReminder[]
  meetingNotes          MeetingNote[]
  businessCardScans     BusinessCardScan[]
  tags                  Tag[]
  tagAssignments        TagAssignment[]
  personalMemos         PersonalMemo[]
  notifications         Notification[]
  importJobs            ImportJob[]
  exportJobs            ExportJob[]
  externalCalendars     ExternalCalendarConnection[]
  aiJobs                AiJob[]
  auditLogsAsActor      AuditLog[]                   @relation("AuditActor")

  @@index([role])
  @@index([status])
  @@index([createdAt])
}

model UserOAuthAccount {
  id                String         @id @default(uuid()) @db.Uuid
  userId            String         @db.Uuid
  provider          OAuthProvider
  providerUserId    String
  providerEmail     String?
  accessTokenHash   String?
  refreshTokenHash  String?
  tokenExpiresAt    DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  user              User           @relation(fields: [userId], references: [id])

  @@unique([provider, providerUserId])
  @@index([userId])
}

model UserSetting {
  id                                String   @id @default(uuid()) @db.Uuid
  userId                            String   @unique @db.Uuid
  defaultScheduleReminderMinutes    Int      @default(30)
  defaultNextActionReminderMinutes  Int      @default(1440)
  emailNotificationEnabled          Boolean  @default(true)
  browserPushEnabled                Boolean  @default(true)
  sensitiveSaveWarningEnabled       Boolean  @default(true)
  metadata                          Json?
  createdAt                         DateTime @default(now())
  updatedAt                         DateTime @updatedAt

  user                              User     @relation(fields: [userId], references: [id])
}

model Company {
  id                 String              @id @default(uuid()) @db.Uuid
  userId             String              @db.Uuid
  name               String
  location           String?
  industry           String?
  memo               String?
  metadata           Json?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  deletedAt          DateTime?

  user               User                @relation(fields: [userId], references: [id])
  logs               CompanyLog[]
  contacts           Contact[]
  deals              Deal[]
  schedules          Schedule[]
  meetingNotes       MeetingNote[]
  businessCardScans  BusinessCardScan[]

  @@index([userId])
  @@index([userId, name])
  @@index([userId, deletedAt])
}

model CompanyLog {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  companyId   String    @db.Uuid
  logDate     DateTime
  title       String
  content     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  user        User      @relation(fields: [userId], references: [id])
  company     Company   @relation(fields: [companyId], references: [id])

  @@index([userId])
  @@index([companyId])
  @@index([userId, logDate])
  @@index([userId, deletedAt])
}

model Contact {
  id                 String              @id @default(uuid()) @db.Uuid
  userId             String              @db.Uuid
  companyId          String?             @db.Uuid
  name               String
  department         String?
  position           String?
  location           String?
  phone              String?
  email              String?
  memo               String?
  metadata           Json?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  deletedAt          DateTime?

  user               User                @relation(fields: [userId], references: [id])
  company            Company?            @relation(fields: [companyId], references: [id])
  deals              Deal[]
  schedules          Schedule[]
  meetingNotes       MeetingNote[]
  businessCardScans  BusinessCardScan[]

  @@index([userId])
  @@index([companyId])
  @@index([userId, name])
  @@index([userId, phone])
  @@index([userId, email])
  @@index([userId, deletedAt])
}

model Product {
  id                  String               @id @default(uuid()) @db.Uuid
  userId              String               @db.Uuid
  name                String
  category            String?
  memo                String?
  unitPrice           Decimal?             @db.Decimal(18, 2)
  metadata            Json?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  deletedAt           DateTime?

  user                User                 @relation(fields: [userId], references: [id])
  productConnections  ProductConnection[]

  @@index([userId])
  @@index([userId, name])
  @@index([userId, category])
  @@index([userId, deletedAt])
}

model ProductConnection {
  id              String                       @id @default(uuid()) @db.Uuid
  userId          String                       @db.Uuid
  productId       String                       @db.Uuid
  targetType      ProductConnectionTargetType
  targetId        String                       @db.Uuid
  connectionType  ProductConnectionType
  memo            String?
  metadata        Json?
  createdAt       DateTime                     @default(now())
  updatedAt       DateTime                     @updatedAt
  deletedAt       DateTime?

  user            User                         @relation(fields: [userId], references: [id])
  product         Product                      @relation(fields: [productId], references: [id])

  @@index([userId])
  @@index([productId])
  @@index([targetType, targetId])
  @@index([userId, targetType, targetId])
  @@index([userId, deletedAt])
}

model Deal {
  id                  String                 @id @default(uuid()) @db.Uuid
  userId              String                 @db.Uuid
  companyId           String?                @db.Uuid
  contactId           String?                @db.Uuid
  title               String
  amount              Decimal                @db.Decimal(18, 2)
  currency            String                 @default("KRW")
  stage               DealStage              @default(INITIAL_CONTACT)
  likelihoodStatus    DealLikelihoodStatus   @default(NEUTRAL)
  likelihoodPercent   Int?
  nextActionTitle     String?
  nextActionDueAt     DateTime?
  nextActionStatus    NextActionStatus       @default(NONE)
  expectedCloseDate   DateTime?
  memo                String?
  metadata            Json?
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt
  deletedAt           DateTime?

  user                User                   @relation(fields: [userId], references: [id])
  company             Company?               @relation(fields: [companyId], references: [id])
  contact             Contact?               @relation(fields: [contactId], references: [id])
  activities          DealActivity[]
  schedules           Schedule[]
  meetingNotes        MeetingNote[]

  @@index([userId])
  @@index([companyId])
  @@index([contactId])
  @@index([userId, stage])
  @@index([userId, likelihoodStatus])
  @@index([userId, nextActionStatus])
  @@index([userId, nextActionDueAt])
  @@index([userId, expectedCloseDate])
  @@index([userId, deletedAt])
}

model DealActivityType {
  id          String          @id @default(uuid()) @db.Uuid
  userId      String?         @db.Uuid
  name        String
  isSystem    Boolean         @default(false)
  createdAt   DateTime        @default(now())

  user        User?           @relation(fields: [userId], references: [id])
  activities  DealActivity[]

  @@index([userId])
  @@unique([userId, name])
}

model DealActivity {
  id               String           @id @default(uuid()) @db.Uuid
  userId           String           @db.Uuid
  dealId           String           @db.Uuid
  typeId           String           @db.Uuid
  activityDate     DateTime
  title            String
  content          String?
  isAutoGenerated  Boolean          @default(false)
  metadata         Json?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  deletedAt        DateTime?

  user             User             @relation(fields: [userId], references: [id])
  deal             Deal             @relation(fields: [dealId], references: [id])
  type             DealActivityType @relation(fields: [typeId], references: [id])

  @@index([userId])
  @@index([dealId])
  @@index([typeId])
  @@index([userId, activityDate])
  @@index([userId, deletedAt])
}

model Schedule {
  id                   String              @id @default(uuid()) @db.Uuid
  userId               String              @db.Uuid
  companyId            String?             @db.Uuid
  contactId            String?             @db.Uuid
  dealId               String?             @db.Uuid
  title                String
  startAt              DateTime
  endAt                DateTime
  allDay               Boolean             @default(false)
  location             String?
  memo                 String?
  source               ScheduleSource      @default(INTERNAL)
  externalCalendarId   String?
  externalEventId      String?
  metadata             Json?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  deletedAt            DateTime?

  user                 User                @relation(fields: [userId], references: [id])
  company              Company?            @relation(fields: [companyId], references: [id])
  contact              Contact?            @relation(fields: [contactId], references: [id])
  deal                 Deal?               @relation(fields: [dealId], references: [id])
  reminders            ScheduleReminder[]

  @@index([userId])
  @@index([companyId])
  @@index([contactId])
  @@index([dealId])
  @@index([userId, startAt])
  @@index([userId, source])
  @@index([userId, externalEventId])
  @@index([userId, deletedAt])
}

model ScheduleReminder {
  id          String               @id @default(uuid()) @db.Uuid
  userId      String               @db.Uuid
  scheduleId  String               @db.Uuid
  channel     NotificationChannel
  remindAt    DateTime
  sentAt      DateTime?
  status      NotificationStatus   @default(PENDING)
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  user        User                 @relation(fields: [userId], references: [id])
  schedule    Schedule             @relation(fields: [scheduleId], references: [id])

  @@index([userId])
  @@index([scheduleId])
  @@index([userId, remindAt])
  @@index([status])
}

model MeetingNote {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @db.Uuid
  dealId          String?   @db.Uuid
  companyId       String?   @db.Uuid
  contactId       String?   @db.Uuid
  meetingDate     DateTime?
  companyName     String?
  contactName     String?
  department      String?
  productName     String?
  stageText       String?
  detail          String?
  futurePlan      String?
  requiredAction  String?
  rawInput        String
  aiOutput        Json?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  user            User      @relation(fields: [userId], references: [id])
  deal            Deal?     @relation(fields: [dealId], references: [id])
  company         Company?  @relation(fields: [companyId], references: [id])
  contact         Contact?  @relation(fields: [contactId], references: [id])

  @@index([userId])
  @@index([dealId])
  @@index([companyId])
  @@index([contactId])
  @@index([userId, meetingDate])
  @@index([userId, deletedAt])
}

model BusinessCardScan {
  id                  String                  @id @default(uuid()) @db.Uuid
  userId              String                  @db.Uuid
  companyId           String?                 @db.Uuid
  contactId           String?                 @db.Uuid
  status              BusinessCardScanStatus  @default(UPLOADED)
  imageUrl            String
  extractedCompany    String?
  extractedName       String?
  extractedDepartment String?
  extractedPosition   String?
  extractedPhone      String?
  extractedEmail      String?
  extractedAddress    String?
  aiOutput            Json?
  confirmedAt         DateTime?
  createdAt           DateTime                @default(now())
  updatedAt           DateTime                @updatedAt

  user                User                    @relation(fields: [userId], references: [id])
  company             Company?                @relation(fields: [companyId], references: [id])
  contact             Contact?                @relation(fields: [contactId], references: [id])

  @@index([userId])
  @@index([companyId])
  @@index([contactId])
  @@index([userId, status])
}

model Tag {
  id           String          @id @default(uuid()) @db.Uuid
  userId       String          @db.Uuid
  name         String
  color        String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  user         User            @relation(fields: [userId], references: [id])
  assignments  TagAssignment[]

  @@unique([userId, name])
  @@index([userId])
}

model TagAssignment {
  id          String        @id @default(uuid()) @db.Uuid
  userId      String        @db.Uuid
  tagId       String        @db.Uuid
  targetType  TagTargetType
  targetId    String        @db.Uuid
  createdAt   DateTime      @default(now())

  user        User          @relation(fields: [userId], references: [id])
  tag         Tag           @relation(fields: [tagId], references: [id])

  @@unique([tagId, targetType, targetId])
  @@index([userId])
  @@index([targetType, targetId])
  @@index([userId, targetType, targetId])
}

model PersonalMemo {
  id          String                  @id @default(uuid()) @db.Uuid
  userId      String                  @db.Uuid
  targetType  PersonalMemoTargetType
  targetId    String                  @db.Uuid
  content     String
  isSensitive Boolean                 @default(true)
  metadata    Json?
  createdAt   DateTime                @default(now())
  updatedAt   DateTime                @updatedAt
  deletedAt   DateTime?

  user        User                    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([targetType, targetId])
  @@index([userId, targetType, targetId])
  @@index([userId, deletedAt])
}

model Notification {
  id           String               @id @default(uuid()) @db.Uuid
  userId       String               @db.Uuid
  type         NotificationType
  channel      NotificationChannel
  targetType   String?
  targetId     String?              @db.Uuid
  title        String
  content      String?
  scheduledAt  DateTime
  sentAt       DateTime?
  readAt       DateTime?
  status       NotificationStatus   @default(PENDING)
  metadata     Json?
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  user         User                 @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([userId, scheduledAt])
  @@index([userId, status])
  @@index([targetType, targetId])
}

model ImportJob {
  id              String           @id @default(uuid()) @db.Uuid
  userId          String           @db.Uuid
  targetType      ImportTargetType
  fileName        String
  fileUrl         String?
  status          ImportJobStatus  @default(UPLOADED)
  aiMapping       Json?
  userMapping     Json?
  resultSummary   Json?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  completedAt     DateTime?

  user            User             @relation(fields: [userId], references: [id])
  rows            ImportJobRow[]

  @@index([userId])
  @@index([userId, targetType])
  @@index([userId, status])
  @@index([createdAt])
}

model ImportJobRow {
  id            String          @id @default(uuid()) @db.Uuid
  importJobId   String          @db.Uuid
  rowNumber     Int
  rawData       Json
  mappedData    Json?
  status        ImportRowStatus @default(PENDING)
  errorMessage  String?
  targetId      String?         @db.Uuid
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  importJob     ImportJob       @relation(fields: [importJobId], references: [id])

  @@index([importJobId])
  @@index([importJobId, status])
  @@unique([importJobId, rowNumber])
}

model ExportJob {
  id                      String           @id @default(uuid()) @db.Uuid
  userId                  String           @db.Uuid
  targetType              ExportTargetType
  format                  ExportFormat
  status                  ExportJobStatus  @default(PENDING)
  includeSensitiveData    Boolean          @default(false)
  sensitiveWarningAccepted Boolean         @default(false)
  fileName                String?
  fileUrl                 String?
  filter                  Json?
  resultSummary           Json?
  createdAt               DateTime         @default(now())
  updatedAt               DateTime         @updatedAt
  completedAt             DateTime?
  expiresAt               DateTime?

  user                    User             @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([userId, targetType])
  @@index([userId, status])
  @@index([createdAt])
}

model ExternalCalendarConnection {
  id                 String                            @id @default(uuid()) @db.Uuid
  userId             String                            @db.Uuid
  provider           ExternalCalendarProvider
  providerAccountId  String?
  accessTokenHash    String?
  refreshTokenHash   String?
  tokenExpiresAt     DateTime?
  status             ExternalCalendarConnectionStatus  @default(CONNECTED)
  metadata           Json?
  createdAt          DateTime                          @default(now())
  updatedAt          DateTime                          @updatedAt

  user               User                              @relation(fields: [userId], references: [id])

  @@unique([userId, provider])
  @@index([userId])
  @@index([status])
}

model AiJob {
  id             String       @id @default(uuid()) @db.Uuid
  userId         String       @db.Uuid
  type           AiJobType
  status         AiJobStatus  @default(PENDING)
  provider       String       @default("OPENAI")
  inputSummary   Json?
  output         Json?
  errorMessage   String?
  targetType     String?
  targetId       String?      @db.Uuid
  startedAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  user           User         @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([userId, type])
  @@index([userId, status])
  @@index([targetType, targetId])
}

model AuditLog {
  id            String           @id @default(uuid()) @db.Uuid
  actorUserId   String?          @db.Uuid
  action        AuditAction
  targetType    AuditTargetType
  targetId      String?          @db.Uuid
  targetUserId  String?          @db.Uuid
  reason        String?
  metadata      Json?
  createdAt     DateTime         @default(now())

  actorUser     User?            @relation("AuditActor", fields: [actorUserId], references: [id])

  @@index([actorUserId])
  @@index([targetUserId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}
```

## 5. 초기 seed 데이터

### DealActivityType 시스템 기본값

사용자별 커스텀 타입과 별개로 시스템 기본 타입을 생성한다.

| name | isSystem |
|---|---|
| 메모 | true |
| 전화 | true |
| 미팅 | true |
| 이메일 | true |
| 단계변경 | true |
| 회의록연결 | true |

### 제품 연결 타입 라벨

Prisma enum 값은 영어 식별자를 사용하고, UI 라벨은 한국어로 표시한다.

| enum | UI 라벨 |
|---|---|
| `INTERESTED` | 관심 제품 |
| `DELIVERED` | 기존 납품 제품 |
| `PROPOSED` | 제안 중 제품 |
| `COMPETITOR` | 경쟁 제품 |
| `MAINTENANCE` | 유지보수 대상 제품 |
| `OTHER` | 기타 |

## 6. 스키마 보완이 필요한 지점

### 인증 토큰 저장

G00에서 인증 1차 전략은 `Supabase Auth 중심 + Backend Supabase JWT 검증 + local User 동기화`로 확정했다.

따라서 MVP 1차에서는 다음 기준을 따른다.

- Backend는 local refresh token이나 session table을 직접 발급/저장하지 않는다.
- Supabase Auth가 session과 provider 인증을 담당한다.
- Backend는 Supabase access token을 검증하고 local `User`, `UserOAuthAccount`, `UserSetting`을 동기화한다.
- `UserOAuthAccount`의 token hash 필드는 MVP 1차에서 필수 사용 대상이 아니라 provider account mapping과 향후 확장용으로 둔다.

### 민감정보 암호화

개인 메모, 회의록 본문, 전화번호, 이메일, private image URL은 암호화 또는 field-level protection 전략이 필요하다.

초기 구현에서는 DB schema보다 application/infrastructure 계층의 암호화 adapter 설계를 먼저 확정해야 한다.

### 전문 검색

통합검색은 초기에는 `ILIKE` 기반으로 구현할 수 있다. 데이터가 늘어나면 PostgreSQL full-text search 또는 별도 search index를 검토한다.

### 결제

수동 계좌이체 관리는 MVP 이후 작업이다. 결제 관련 테이블은 초기 migration에 넣지 않고, 유료 운영 시작 전에 별도 결정 문서와 migration으로 추가한다.

## 7. 구현 체크리스트

- 모든 사용자 소유 테이블에 `userId`가 있는가?
- 주요 업무 데이터에 `deletedAt`이 있는가?
- FK 컬럼에 index가 있는가?
- Admin 조회용 필터에 필요한 index가 있는가?
- 민감 원문 조회 대상이 `AuditLog`와 연결될 수 있는가?
- Import/Export job 상태를 추적할 수 있는가?
- AI 작업 실패와 결과를 추적할 수 있는가?
- Google Calendar 가져오기 중복 방지를 위한 external event id가 있는가?

## 8. 테이블별 구현 명세

이 섹션은 Prisma schema를 실제 API와 화면 요구사항에 연결하기 위한 구현 직전 검토 기준이다.

| 모델 | 목적 | 주요 API/화면 | 민감정보 여부 | 주요 제약 |
|---|---|---|---|---|
| `User` | 서비스 사용자와 Admin 계정 | Auth, Admin 사용자 관리 | 이메일은 Admin 목록에서 마스킹 | `role`, `status`, OAuth account와 연결 |
| `UserOAuthAccount` | Supabase Auth provider 계정 연결 | `POST /api/auth/sync`, logout 상태 기록 | provider token hash는 MVP 1차 필수 사용 대상 아님 | provider/providerAccountId unique |
| `UserSetting` | 사용자별 알림/경고 설정 | 내 설정, 알림 설정 | 민감 아님 | userId 1:1 |
| `Company` | 회사 기준 데이터 | 회사 CRUD, 딜/일정/제품 연결 | 일반적으로 민감 아님 | userId ownership, soft delete |
| `CompanyLog` | 회사 자체 히스토리 | 회사 상세 로그 | 내용은 민감 가능 | Company ownership 상속 |
| `Contact` | 거래처(담당자) | 거래처 CRUD, 딜/일정 연결, OCR 저장 | 전화번호, 이메일, 개인 메모 관련 민감 | userId ownership, company optional |
| `Product` | 제품 기준 데이터 | 제품 CRUD, 딜 제품 선택 | 단가가 영업상 민감 가능 | userId ownership, KRW 기본 |
| `ProductConnection` | 제품과 회사/거래처/딜 연결 | 제품 연결, 딜 제품 연결 | 연결 관계가 영업상 민감 가능 | targetType/targetId ownership 검증 |
| `Deal` | 영업 딜 | 딜 목록/상세/단계/다음 행동 | 금액, 개인 메모 관련 민감 | amount 필수, userId ownership, soft delete |
| `DealActivityType` | 활동 로그 타입 | 딜 활동 로그 | 민감 아님 | system 기본값과 사용자 커스텀 구분 |
| `DealActivity` | 딜 활동 기록 | 딜 상세 timeline | 내용은 민감 가능 | 단계 변경/회의록 연결 자동 생성 |
| `Schedule` | 일정 | 일정 CRUD, 주간 일정표, 알림 | 장소/메모는 민감 가능 | 딜 없이 저장 가능, source 구분 |
| `ScheduleReminder` | 일정 알림 예약 | 일정 알림 | 민감 아님 | Schedule 소유권 상속 |
| `MeetingNote` | 회의록 | 회의록 AI 생성/저장/딜 연결 | 본문과 9개 항목 민감 가능 | 딜 없이 저장 가능, 딜 연결 시 활동 로그 |
| `BusinessCardScan` | 명함 OCR 처리 결과 | 명함 OCR | 이미지 URL, OCR 결과 민감 | 자동 저장 금지, confirm 필요 |
| `Tag` | 사용자 태그 | 주요 엔티티 태그 | 민감 아님 | userId ownership |
| `TagAssignment` | 태그 연결 | 태그 필터/표시 | 연결 관계 민감 가능 | targetType/targetId ownership 검증 |
| `PersonalMemo` | 개인 메모 | 딜/거래처/주요 엔티티 개인 메모 | 민감 | Admin 기본 마스킹, 원문 조회 audit 필요 |
| `Notification` | 알림 데이터 | 알림 목록/읽음 | target 내용에 따라 민감 가능 | 사용자별 조회 |
| `ImportJob` | Import 작업 | Import flow | 업로드 파일명/매핑 민감 가능 | 사용자 확인 후 실행 |
| `ImportJobRow` | Import row별 결과 | Import 결과 화면 | row 원본 데이터 민감 가능 | 실패 사유 추적 |
| `ExportJob` | Export 작업 | Export flow | 민감 데이터 포함 여부 중요 | includeSensitiveData와 confirm 분리 |
| `ExternalCalendarConnection` | 외부 캘린더 연결 | Google Calendar 가져오기 | token hash 민감 | provider/user unique |
| `AiJob` | AI/OCR/Import 매핑 작업 | AI 회의록, OCR, Import mapping | input/output 민감 가능 | provider 직접 노출 금지 |
| `AuditLog` | Admin 위험 행동 감사 | 민감 원문 조회, 상태 변경 | reason과 target은 민감 가능 | append-only, 원문 PII 저장 금지 |

## 9. API와 DB 연결 기준

- User API는 모든 사용자 소유 모델에서 `userId` 조건을 필수로 사용한다.
- Admin API는 기본적으로 마스킹된 response만 반환한다.
- 민감정보 원문 조회는 대상 모델 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.
- soft delete 대상은 목록 API에서 기본 제외하고, 휴지통 API에서만 조회한다.
- Import/Export/Ai/OCR 작업은 job 상태와 실패 사유를 저장해 사용자가 처리 상태를 확인할 수 있어야 한다.

## 10. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`


