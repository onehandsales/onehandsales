# Schedule Schema

## 1. 현재 상태

Schedule 도메인은 Backend `BE/src/modules/schedule`와 Prisma `Schedule`, `ScheduleDeal` 모델로 구현되어 있다.

구현 기준:

- 계획: `TODO/DONE/SCHEDULE_DOMAIN_PLAN`
- migration: `BE/prisma/migrations/20260614020000_add_schedule_domain/migration.sql`
- Backend module: `BE/src/modules/schedule`
- User Web feature: `FE/user-web/src/features/schedule`

## 2. 모델 책임

### Schedule

사용자 소유 일정을 저장한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | `String @db.Uuid` | 아니오 | 일정 ID |
| `userId` | `String @db.Uuid` | 아니오 | 일정 소유 사용자 ID |
| `scheduleTitle` | `String` | 아니오 | 일정 제목 |
| `startAt` | `DateTime @db.Timestamptz(3)` | 아니오 | UTC instant로 저장한 시작 시각 |
| `endAt` | `DateTime @db.Timestamptz(3)` | 아니오 | UTC instant로 저장한 종료 시각 |
| `timeZone` | `String` | 아니오 | 사용자가 입력한 일정의 IANA timezone ID |
| `location` | `String` | 예 | 장소 |
| `memo` | `String` | 예 | 일정 메모 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 생성 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 수정 시각 |

인덱스:

- `@@index([userId, startAt])`: 사용자별 월간/주간 범위 조회
- `@@index([userId, createdAt])`: 사용자별 등록일 기준 조회 확장 대비

### ScheduleDeal

일정과 딜의 N:M 연결을 저장한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | `String @db.Uuid` | 아니오 | 일정-딜 연결 ID |
| `userId` | `String @db.Uuid` | 아니오 | 연결 row 소유 사용자 ID |
| `scheduleId` | `String @db.Uuid` | 아니오 | 일정 ID |
| `dealId` | `String @db.Uuid` | 아니오 | 딜 ID |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 연결 생성 시각 |

제약과 인덱스:

- `@@unique([scheduleId, dealId])`: 같은 일정에 같은 딜이 중복 연결되지 않도록 차단
- `@@index([userId, scheduleId])`: 사용자 소유 일정의 연결 딜 조회와 삭제
- `@@index([userId, dealId])`: 사용자 소유 딜 기준 연결 조회 확장 대비

## 3. 관계

- `User` 1:N `Schedule`
- `User` 1:N `ScheduleDeal`
- `Schedule` 1:N `ScheduleDeal`
- `Deal` 1:N `ScheduleDeal`

`Schedule`에는 `dealId`를 직접 두지 않는다. 하나의 일정에 여러 딜을 연결할 수 있고, 하나의 딜도 여러 일정에 연결될 수 있으므로 `ScheduleDeal`이 연결을 담당한다.

## 4. 삭제 정책

현재 Schedule 도메인은 soft delete와 휴지통을 사용하지 않는다.

`DELETE /api/schedules/:scheduleId`는 application transaction 안에서 다음 순서로 처리한다.

1. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id`로 소유권을 확인한다.
2. `ScheduleDeal.userId = currentUser.id` AND `ScheduleDeal.scheduleId = scheduleId` 연결 row를 삭제한다.
3. `Schedule.id = scheduleId` AND `Schedule.userId = currentUser.id` 일정 row를 실제 삭제한다.

## 5. 시간 정책

- API request는 `startAt`, `endAt`, `timeZone`을 함께 받는다.
- offset 없는 local date-time은 `timeZone` 기준으로 UTC instant로 변환해 저장한다.
- API response의 `startAt`, `endAt`, `createdAt`, `updatedAt`은 ISO 8601 UTC string이다.
- Frontend는 사용자 입력 local date-time을 임의로 `toISOString()`으로 변환해 보내지 않는다.

상세 기준은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

## 6. 관련 API

- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`

API 계약은 `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`를 기준으로 확인한다.
