# DB Schema TODO

상태: Done
최종 업데이트: 2026-07-23

## 1. Migration 방향

04는 DB migration을 만든다.

추가:

- `ExternalCalendarConnection`
- `ExternalCalendarSource`
- Google Calendar 관련 enum
- `Schedule` source/meetingUrl/soft delete 필드
- `Trash` target/domain type에 `SCHEDULE`

`ExternalCalendarEventMapping` model은 04에서 만들지 않는다. 한손 `Schedule` row가 import된 Google event의 운영 row가 되므로, external event key와 sync metadata를 `Schedule`에 둔다.

## 2. Enum

| Enum | 값 | 설명 |
|---|---|---|
| `ExternalCalendarProvider` | `GOOGLE` | 04는 Google만 지원 |
| `ExternalCalendarConnectionStatus` | `CONNECTED`, `RECONNECT_REQUIRED`, `DISCONNECTED` | 연결 상태 |
| `ExternalCalendarSourceStatus` | `SELECTED`, `UNSELECTED` | calendar 선택 상태 |
| `ScheduleSourceType` | `INTERNAL`, `GOOGLE` | 한손 생성 일정 vs Google-origin schedule |
| `ScheduleExternalSyncStatus` | `SYNCED`, `LOCAL_MODIFIED`, `GOOGLE_DELETED`, `LOCAL_DELETED` | Google-origin schedule 운영 상태. 연결 끊김/선택 해제 표시 여부는 connection/source 상태로 계산한다. |

## 3. ExternalCalendarConnection

목적: 사용자 Google Calendar 연결과 암호화 token을 저장한다.

| field | type | null | 설명 |
|---|---|---:|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | 아니오 | connection id |
| `userId` | `String @db.Uuid` | 아니오 | owner |
| `provider` | `ExternalCalendarProvider` | 아니오 | `GOOGLE` |
| `providerAccountId` | `String?` | 예 | Google OIDC `sub`. 내부 계정 식별용이며 response에 노출하지 않음 |
| `providerAccountEmail` | `String?` | 예 | Google 계정 email |
| `status` | `ExternalCalendarConnectionStatus` | 아니오 | 연결 상태 |
| `encryptedAccessToken` | `String?` | 예 | 암호화 access token |
| `encryptedRefreshToken` | `String?` | 예 | 암호화 refresh token |
| `tokenExpiresAt` | `DateTime? @db.Timestamptz(3)` | 예 | access token 만료 |
| `grantedScopes` | `String[]` | 아니오 | 승인 scope |
| `connectedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 연결 성공 시각 |
| `disconnectedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 연결 해제 시각 |
| `reconnectRequiredAt` | `DateTime? @db.Timestamptz(3)` | 예 | 재연결 필요 전환 시각 |
| `lastSyncedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 마지막 성공 sync |
| `lastSyncStartedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 마지막 sync 시작 |
| `lastSyncFailedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 마지막 sync 실패 |
| `lastSyncErrorCode` | `String?` | 예 | 사용자 노출 허용 error code |
| `syncLockExpiresAt` | `DateTime? @db.Timestamptz(3)` | 예 | connection-level sync 중복 실행 방지 lock 만료 시각 |
| `createdAt` | `DateTime @default(now()) @db.Timestamptz(3)` | 아니오 | 생성일 |
| `updatedAt` | `DateTime @updatedAt @db.Timestamptz(3)` | 아니오 | 수정일 |

Index:

- `@@unique([userId, provider])`
- `@@index([userId, status])`
- `@@index([provider, providerAccountId])`
- `@@index([userId, lastSyncedAt])`
- `@@index([userId, syncLockExpiresAt])`

주석:

- model과 relation에는 한글 `/// 기능 : ...` 주석을 둔다.
- token field 주석에는 "응답과 log에 노출하지 않는다"를 명시한다.
- `providerAccountId`는 Google `sub` claim을 저장한다. 사용자가 볼 표시는 `providerAccountEmail`만 사용한다.

## 4. ExternalCalendarSource

목적: Google Calendar 안의 개별 calendar 선택 상태와 sync token을 저장한다.

| field | type | null | 설명 |
|---|---|---:|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | 아니오 | source id |
| `userId` | `String @db.Uuid` | 아니오 | owner |
| `connectionId` | `String @db.Uuid` | 아니오 | connection |
| `provider` | `ExternalCalendarProvider` | 아니오 | `GOOGLE` |
| `calendarId` | `String` | 아니오 | Google calendar id |
| `calendarName` | `String` | 아니오 | 표시 이름 |
| `calendarTimeZone` | `String?` | 예 | Google calendar timezone |
| `isPrimary` | `Boolean @default(false)` | 아니오 | primary calendar 여부 |
| `isSystemCalendar` | `Boolean @default(false)` | 아니오 | holidays/birthdays 등 system 성격 |
| `status` | `ExternalCalendarSourceStatus` | 아니오 | `SELECTED` 또는 `UNSELECTED` |
| `syncToken` | `String?` | 예 | provider incremental sync token |
| `lastSyncedAt` | `DateTime? @db.Timestamptz(3)` | 예 | calendar별 마지막 성공 sync |
| `lastSyncFailedAt` | `DateTime? @db.Timestamptz(3)` | 예 | calendar별 마지막 실패 |
| `lastSyncErrorCode` | `String?` | 예 | calendar별 실패 code |
| `createdAt` | `DateTime @default(now()) @db.Timestamptz(3)` | 아니오 | 생성일 |
| `updatedAt` | `DateTime @updatedAt @db.Timestamptz(3)` | 아니오 | 수정일 |

Index:

- `@@unique([userId, provider, calendarId])`
- `@@index([connectionId, status])`
- `@@index([userId, status])`

## 5. Schedule 변경

추가 field:

| field | type | null | 설명 |
|---|---|---:|---|
| `meetingUrl` | `String?` | 예 | 추출 우선순위로 선택한 `https://` meeting/link URL |
| `isAllDay` | `Boolean @default(false)` | 아니오 | Google all-day event 여부. 내부 일정 생성은 기본 `false` |
| `sourceType` | `ScheduleSourceType @default(INTERNAL)` | 아니오 | 한손 생성 또는 Google-origin |
| `externalCalendarSourceId` | `String? @db.Uuid` | 예 | Google calendar source |
| `externalEventId` | `String?` | 예 | Google event id |
| `externalEventICalUid` | `String?` | 예 | Google iCalUID |
| `externalEventEtag` | `String?` | 예 | Google etag |
| `externalHtmlLink` | `String?` | 예 | Google event web link |
| `externalUpdatedAt` | `DateTime? @db.Timestamptz(3)` | 예 | Google event updated |
| `lastExternalSyncedAt` | `DateTime? @db.Timestamptz(3)` | 예 | schedule별 마지막 sync |
| `externalDeletedAt` | `DateTime? @db.Timestamptz(3)` | 예 | Google에서 deleted/cancelled 확인 시각 |
| `externalSyncStatus` | `ScheduleExternalSyncStatus?` | 예 | Google-origin schedule sync 상태 |
| `deletedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 사용자 soft delete 시각 |
| `deletedByUserId` | `String? @db.Uuid` | 예 | 삭제 사용자 |
| `trashExpiresAt` | `DateTime? @db.Timestamptz(3)` | 예 | 영구 삭제 예정 시각 |

Index:

- `@@unique([userId, externalCalendarSourceId, externalEventId])`
- `@@index([userId, sourceType, startAt])`
- `@@index([userId, externalSyncStatus, startAt])`
- `@@index([userId, deletedAt])`
- `@@index([userId, trashExpiresAt])`

호환:

- 기존 schedule row는 `sourceType=INTERNAL`, `externalSyncStatus=NULL`, `deletedAt=NULL`로 migrate한다.
- 기존 schedule row는 `isAllDay=false`로 migrate한다.
- 기존 API의 기본 조회는 `deletedAt IS NULL` 조건을 추가한다.
- Google-origin schedule도 `ScheduleDeal`을 그대로 사용해 딜 연결을 지원한다.

## 6. 데이터 보안

- access token과 refresh token은 existing private memo encryption style과 같은 AES-GCM 형태의 envelope string으로 암호화 저장한다.
- Calendar token 암호화 env는 아래 우선순위로 읽는다.
  1. `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY`
  2. `ENCRYPTION_MASTER_KEY`
- Calendar token key version env는 아래 우선순위로 읽는다.
  1. `GOOGLE_CALENDAR_TOKEN_ENCRYPTION_KEY_VERSION`
  2. `ENCRYPTION_KEY_VERSION`
- 두 encryption key가 모두 없으면 앱 부팅은 허용하되 Google Calendar connect/callback/sync/disconnect API는 500 `GoogleCalendarTokenEncryptionKeyMissing`으로 실패시킨다.
- token, authorization code, provider raw response body는 response/log/test snapshot에 남기지 않는다.
- Google description은 최초 import 시 plain text로 정규화하고 2000자 제한 후 `Schedule.memo`에 저장한다.
- provider raw description HTML은 저장하지 않는다.

## 7. Schedule soft delete

- `DELETE /api/schedules/:scheduleId`는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 채운다.
- `ScheduleDeal` row는 삭제하지 않는다. 복구 시 기존 연결이 유지되어야 한다.
- pending `SCHEDULE_START_REMINDER`는 삭제 시 취소한다.
- `trashExpiresAt`은 `BE/src/shared/application/trash/trash-retention.ts`의 `createTrashRetentionTimestamps(now)`를 사용한다.
- 현재 retention은 `now+7일`이다.
- Google-origin schedule 삭제 시 `externalSyncStatus=LOCAL_DELETED`로 둔다.
- 복구 시 `deletedAt/deletedByUserId/trashExpiresAt=NULL`로 되돌리고 Google-origin이면 `externalSyncStatus=LOCAL_MODIFIED`로 둔다.

## 8. Migration 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:migrate -- --name google_calendar_integration
pnpm run typecheck
pnpm run test -- schedule
pnpm run test -- trash
```
