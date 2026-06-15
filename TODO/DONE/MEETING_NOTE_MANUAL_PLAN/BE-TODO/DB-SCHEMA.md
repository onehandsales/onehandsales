# Meeting Note DB Schema

## 1. Enum

```prisma
enum MeetingNoteSourceType {
  MANUAL
  TEXT_AI
  STT_AI
}
```

이번 구현은 `MANUAL`만 생성한다. `TEXT_AI`, `STT_AI`는 후속 예약 값이다.

## 2. MeetingNote

```prisma
model MeetingNote {
  id             String                @id @default(uuid()) @db.Uuid
  userId         String                @db.Uuid
  sourceType     MeetingNoteSourceType @default(MANUAL)

  meetingAt      DateTime?             @db.Timestamptz(3)
  timeZone       String                @default("Asia/Seoul")

  details        String
  nextPlan       String?
  requiredAction String?
  rawText        String?

  createdAt      DateTime              @default(now()) @db.Timestamptz(3)
  updatedAt      DateTime              @updatedAt @db.Timestamptz(3)

  user           User                  @relation(fields: [userId], references: [id])
  companies      MeetingNoteCompany[]
  contacts       MeetingNoteContact[]
  products       MeetingNoteProduct[]
  deals          MeetingNoteDeal[]

  @@index([userId, meetingAt])
  @@index([userId, createdAt])
}
```

정책:

- `meetingAt`은 회의 일시를 입력하지 않을 수 있으므로 nullable이다.
- `timeZone`은 request에서 받지 않고 `User.timeZone` snapshot으로 저장한다.
- `rawText`는 이번 구현에서 request로 받지 않는다. 후속 AI/STT용 예약 필드다.

## 3. MeetingNoteCompany

```prisma
model MeetingNoteCompany {
  id                    String      @id @default(uuid()) @db.Uuid
  userId                String      @db.Uuid
  meetingNoteId         String      @db.Uuid
  companyId             String?     @db.Uuid

  companyNameSnapshot   String
  companyFieldSnapshot  String?
  companyRegionSnapshot String?

  createdAt             DateTime    @default(now()) @db.Timestamptz(3)

  user                  User        @relation(fields: [userId], references: [id])
  meetingNote           MeetingNote @relation(fields: [meetingNoteId], references: [id])
  company               Company?    @relation(fields: [companyId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, companyId])
}
```

정책:

- 생성/수정 request에서 회사 연결은 1개 이상 필수다.
- `companyId`는 nullable이다. 아직 등록되지 않은 회사도 snapshot-only로 저장할 수 있다.
- `companyNameSnapshot`은 필수다.

## 4. MeetingNoteContact

```prisma
model MeetingNoteContact {
  id                      String      @id @default(uuid()) @db.Uuid
  userId                  String      @db.Uuid
  meetingNoteId           String      @db.Uuid
  contactId               String?     @db.Uuid
  companyId               String?     @db.Uuid

  contactUsernameSnapshot String
  contactEmailSnapshot    String?
  contactMobileSnapshot   String?
  companyNameSnapshot     String?
  departmentSnapshot      String?
  jobGradeSnapshot        String?

  createdAt               DateTime    @default(now()) @db.Timestamptz(3)

  user                    User        @relation(fields: [userId], references: [id])
  meetingNote             MeetingNote @relation(fields: [meetingNoteId], references: [id])
  contact                 Contact?    @relation(fields: [contactId], references: [id])
  company                 Company?    @relation(fields: [companyId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, contactId])
  @@index([userId, companyId])
}
```

정책:

- 생성/수정 request에서 담당자 연결은 1개 이상 필수다.
- `contactId`는 nullable이다. 아직 등록되지 않은 참석자도 snapshot-only로 저장할 수 있다.
- `contactUsernameSnapshot`은 필수다.

## 5. MeetingNoteProduct

```prisma
model MeetingNoteProduct {
  id                      String      @id @default(uuid()) @db.Uuid
  userId                  String      @db.Uuid
  meetingNoteId           String      @db.Uuid
  productId               String?     @db.Uuid

  productNameSnapshot     String
  productPriceSnapshot    Int?
  productCategorySnapshot String?
  productStatusSnapshot   String?

  createdAt               DateTime    @default(now()) @db.Timestamptz(3)

  user                    User        @relation(fields: [userId], references: [id])
  meetingNote             MeetingNote @relation(fields: [meetingNoteId], references: [id])
  product                 Product?    @relation(fields: [productId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, productId])
}
```

정책:

- 제품 연결은 선택이다.
- `productId`는 nullable이다. 아직 등록되지 않은 제품도 snapshot-only로 저장할 수 있다.
- 제품 연결 row가 있으면 `productNameSnapshot`은 필수다.

## 6. MeetingNoteDeal

```prisma
model MeetingNoteDeal {
  id                          String      @id @default(uuid()) @db.Uuid
  userId                      String      @db.Uuid
  meetingNoteId               String      @db.Uuid
  dealId                      String      @db.Uuid

  dealNameSnapshot            String
  dealStatusSnapshot          String
  dealCostSnapshot            Int
  dealExpectedEndDateSnapshot DateTime    @db.Date

  createdAt                   DateTime    @default(now()) @db.Timestamptz(3)

  user                        User        @relation(fields: [userId], references: [id])
  meetingNote                 MeetingNote @relation(fields: [meetingNoteId], references: [id])
  deal                        Deal        @relation(fields: [dealId], references: [id])

  @@unique([meetingNoteId, dealId])
  @@index([userId, meetingNoteId])
  @@index([userId, dealId])
}
```

정책:

- 딜 연결은 선택이다.
- 딜 연결 row가 있으면 `dealId`는 필수다.
- 같은 회의록에 같은 딜은 한 번만 연결한다.
- 딜 snapshot은 현재 `Deal` 필드가 필수이므로 non-null로 저장한다.

## 7. Relation 추가

`User`:

```prisma
meetingNotes         MeetingNote[]
meetingNoteCompanies MeetingNoteCompany[]
meetingNoteContacts  MeetingNoteContact[]
meetingNoteProducts  MeetingNoteProduct[]
meetingNoteDeals     MeetingNoteDeal[]
```

`Company`:

```prisma
meetingNoteCompanies MeetingNoteCompany[]
meetingNoteContacts  MeetingNoteContact[]
```

`Contact`:

```prisma
meetingNoteContacts MeetingNoteContact[]
```

`Product`:

```prisma
meetingNoteProducts MeetingNoteProduct[]
```

`Deal`:

```prisma
meetingNoteDeals MeetingNoteDeal[]
```

## 8. Migration 기준

- 기존 migration은 수정하지 않는다.
- 새 migration 이름 후보: `add_meeting_note_domain`
- FK delete 정책은 기본 Prisma 정책을 따르되, 회의록 삭제 API가 없으므로 이번 구현에서는 cascade 삭제 흐름을 만들지 않는다.
- 삭제/복구 도입 시 soft delete 또는 cascade 정책을 별도 계획에서 재검토한다.
