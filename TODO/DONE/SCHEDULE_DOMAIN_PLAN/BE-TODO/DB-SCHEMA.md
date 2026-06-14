# Schedule DB Schema

## 1. Schedule

```prisma
model Schedule {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid
  scheduleTitle String
  startAt       DateTime @db.Timestamptz(3)
  endAt         DateTime @db.Timestamptz(3)
  timeZone      String   @default("Asia/Seoul")
  location      String?
  memo          String?
  createdAt     DateTime @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime @updatedAt @db.Timestamptz(3)

  user          User           @relation(fields: [userId], references: [id])
  scheduleDeals ScheduleDeal[]

  @@index([userId, startAt])
  @@index([userId, createdAt])
}
```

## 2. ScheduleDeal

```prisma
model ScheduleDeal {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  scheduleId String   @db.Uuid
  dealId     String   @db.Uuid
  createdAt  DateTime @default(now()) @db.Timestamptz(3)

  user     User     @relation(fields: [userId], references: [id])
  schedule Schedule @relation(fields: [scheduleId], references: [id])
  deal     Deal     @relation(fields: [dealId], references: [id])

  @@unique([scheduleId, dealId])
  @@index([userId, scheduleId])
  @@index([userId, dealId])
}
```

## 3. Relation 추가

`User`에 추가:

```prisma
schedules     Schedule[]
scheduleDeals ScheduleDeal[]
```

`Deal`에 추가:

```prisma
scheduleDeals ScheduleDeal[]
```

## 4. 정책

- `Schedule`에는 `dealId`를 두지 않는다.
- 같은 일정에 같은 딜은 한 번만 연결할 수 있다.
- 일정 삭제는 hard delete다.
- `ScheduleDeal`은 FK cascade 또는 transaction 선삭제로 정리한다.
- 기존 migration은 수정하지 않고 새 migration을 추가한다.
