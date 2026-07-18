# MeetingNote Schema

## 1. 현재 상태

MeetingNote 도메인은 Backend `BE/src/modules/meeting-note`와 Prisma `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal` 모델로 구현되어 있다.

구현 기준:

- 계획: `TODO/DONE/MEETING_NOTE_MANUAL_PLAN`
- migration: `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`
- migration: `BE/prisma/migrations/20260626010000_add_meeting_note_title/migration.sql`
- migration: `BE/prisma/migrations/20260626020000_add_meeting_note_soft_delete_columns/migration.sql`
- Backend module: `BE/src/modules/meeting-note`
- User Web feature: `FE/user-web/src/features/meeting-note`

현재 범위는 수동 회의록 CRUD, AI/STT 초안 기반 저장, 저장 후 딜 추가 연동, 회의록 본문 row의 7일 휴지통 삭제/복구다. AI/STT 초안 API는 DB에 초안 결과를 저장하지 않는다. 저장 후 딜 추가 연동은 기존 `MeetingNoteDeal`과 `DealFollowingActionLog`를 사용하며, Admin API, rawText 암호화, 범용 DealActivity table은 후속 범위다.

## 2. 모델 책임

### MeetingNote

사용자 소유 회의록 제목, 본문, 회의 시각을 저장한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `id` | `String @db.Uuid` | 아니오 | 회의록 ID |
| `userId` | `String @db.Uuid` | 아니오 | 회의록 소유 사용자 ID |
| `sourceType` | `MeetingNoteSourceType` | 아니오 | 생성 방식. 현재 저장 API는 `MANUAL`, `TEXT_AI`, `STT_AI`를 허용 |
| `title` | `String` | 아니오 | 회의록 목록/상세/휴지통 표시용 제목 |
| `meetingAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 사용자 local date-time을 timezone 기준으로 변환한 UTC instant |
| `timeZone` | `String` | 아니오 | UTC 변환에 사용한 IANA timezone snapshot |
| `details` | `String` | 아니오 | 회의 상세 내용 |
| `nextPlan` | `String` | 예 | 향후 계획 |
| `requiredAction` | `String` | 예 | 필요 조치 |
| `rawText` | `String` | 예 | AI/STT 후속 범위 예약 필드. 현재 API request에서는 받지 않고 저장하지 않음 |
| `createdAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 생성 시각 |
| `updatedAt` | `DateTime @db.Timestamptz(3)` | 아니오 | 수정 시각 |
| `deletedAt` | `DateTime? @db.Timestamptz(3)` | 예 | 삭제 버튼을 누른 UTC 시각. `null`이면 활성 회의록 |
| `deletedByUserId` | `String? @db.Uuid` | 예 | 삭제를 수행한 `User.id` |
| `trashExpiresAt` | `DateTime? @db.Timestamptz(3)` | 예 | 7일 무료 복구 가능 기간 종료 시각 |

인덱스:

- `@@index([userId, meetingAt])`: 사용자별 회의 일시 정렬과 기간 조회 확장 대비
- `@@index([userId, title])`: 사용자별 회의록 제목 검색 대비
- `@@index([userId, createdAt])`: 사용자별 등록일 정렬
- `@@index([userId, deletedAt])`: 사용자별 활성/삭제 회의록 분리 조회 기준
- `@@index([userId, trashExpiresAt])`: 휴지통 만료 조회 기준

### MeetingNoteCompany

회의록과 회사의 연결 및 당시 회사 snapshot을 저장한다. `companyId`가 없으면 사용자가 입력한 snapshot-only 회사로 취급한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `companyId` | `String @db.Uuid` | 예 | 연결된 회사 ID |
| `companyNameSnapshot` | `String` | 아니오 | 회의록 작성 시점의 회사명 또는 입력 회사명 |
| `companyFieldSnapshot` | `String` | 예 | 회사 분야 snapshot |
| `companyRegionSnapshot` | `String` | 예 | 회사 지역 snapshot |

인덱스:

- `@@index([userId, meetingNoteId])`
- `@@index([userId, companyId])`

### MeetingNoteContact

회의록과 담당자의 연결 및 당시 담당자 snapshot을 저장한다. `contactId`가 없으면 사용자가 입력한 snapshot-only 담당자로 취급한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `contactId` | `String @db.Uuid` | 예 | 연결된 담당자 ID |
| `companyId` | `String @db.Uuid` | 예 | 담당자가 속한 회사 ID |
| `contactUsernameSnapshot` | `String` | 아니오 | 담당자 이름 snapshot |
| `contactEmailSnapshot` | `String` | 예 | 이메일 snapshot |
| `contactMobileSnapshot` | `String` | 예 | 휴대폰 번호 snapshot |
| `contactCompanyNameSnapshot` | `String` | 예 | 회사명 snapshot |
| `contactDepartmentSnapshot` | `String` | 예 | 부서 snapshot |
| `contactJobGradeSnapshot` | `String` | 예 | 직급 snapshot |

인덱스:

- `@@index([userId, meetingNoteId])`
- `@@index([userId, contactId])`
- `@@index([userId, companyId])`

### MeetingNoteProduct

회의록과 제품의 선택 연결 및 당시 제품 snapshot을 저장한다. 제품 연결은 없어도 회의록 저장이 가능하다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `productId` | `String @db.Uuid` | 예 | 연결된 제품 ID |
| `productNameSnapshot` | `String` | 아니오 | 제품명 snapshot |
| `productPriceSnapshot` | `Int` | 예 | 가격 snapshot |
| `productCategorySnapshot` | `String` | 예 | 카테고리 snapshot |
| `productStatusSnapshot` | `String` | 예 | 상태 snapshot |

인덱스:

- `@@index([userId, meetingNoteId])`
- `@@index([userId, productId])`

### MeetingNoteDeal

회의록과 딜의 선택 연결 및 당시 딜 snapshot을 저장한다. 딜 연결은 기존 `Deal`에만 허용한다.

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `dealId` | `String @db.Uuid` | 아니오 | 연결된 딜 ID |
| `dealNameSnapshot` | `String` | 아니오 | 딜 이름 snapshot |
| `dealStatusSnapshot` | `String` | 아니오 | 딜 상태 code snapshot |
| `dealCostSnapshot` | `Int` | 아니오 | 딜 금액 snapshot |
| `dealExpectedEndDateSnapshot` | `DateTime @db.Date` | 아니오 | 예상 종료일 snapshot |

제약과 인덱스:

- `@@unique([meetingNoteId, dealId])`: 같은 회의록에 같은 딜 중복 연결 차단
- `@@index([userId, meetingNoteId])`
- `@@index([userId, dealId])`

## 3. 관계와 소유권

- `User` 1:N `MeetingNote`
- `User` 1:N `MeetingNoteCompany`
- `User` 1:N `MeetingNoteContact`
- `User` 1:N `MeetingNoteProduct`
- `User` 1:N `MeetingNoteDeal`
- `MeetingNote` 1:N 각 snapshot 연결 테이블
- `Company` 1:N `MeetingNoteCompany`, 선택적으로 `MeetingNoteContact`
- `Contact` 1:N `MeetingNoteContact`
- `Product` 1:N `MeetingNoteProduct`
- `Deal` 1:N `MeetingNoteDeal`

조회와 변경은 항상 `MeetingNote.userId = currentUser.id`와 연결 row의 `userId` 기준으로 소유권을 제한한다. FK가 있는 연결 리소스도 각 도메인의 소유권을 검증한 뒤 snapshot을 저장한다.

## 4. 쓰기 정책

- 생성은 `MeetingNote`와 연결 row 전체를 같은 transaction 안에서 저장한다.
- 수정은 request에 포함된 연결 배열만 전체 교체한다.
- `companies`, `contacts`는 생성/수정에서 배열이 포함되면 1개 이상이어야 한다.
- `products`, `deals`는 빈 배열을 허용하며, 빈 배열은 해당 연결 전체 제거를 의미한다.
- 삭제 API는 row를 실제 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- `filter-companies`, `filter-contacts` 조회는 MeetingNote 연결 snapshot이 아니라 현재 Company/Contact 기준 옵션을 반환한다.

## 5. 조회 정책

- `GET /api/meeting-notes`는 page-number pagination을 사용한다.
- 목록 `pageSize`는 15개 고정이며 응답의 `pageSize`는 `15`이다.
- 목록 응답은 `totalCount`, `totalPages`를 포함하고 `hasNext`를 사용하지 않는다.
- User Web은 목록 조회 때 `page`, `search`, 필터/정렬 query를 보내며 `pageSize` query에 의존하지 않는다.
- 일반 목록/상세/수정/검색/필터 API는 `MeetingNote.deletedAt IS NULL`만 조회한다.
- 목록 `search`는 `MeetingNote.title`, `details`, `nextPlan`, `requiredAction` 중 하나라도 `contains search`인 조건으로 적용한다.
- 회의록 상세 연결 응답은 연결 원본 회사/담당자/제품/딜이 삭제된 경우 `isDeleted: true`를 포함해 User Web에서 `(삭제됨)`으로 표시한다.

## 6. 시간 정책

- API request는 `meetingLocalDateTime`을 선택적으로 받는다.
- request에서는 `timeZone`을 받지 않고 현재 사용자의 `User.timeZone`을 사용한다.
- `meetingAt`은 `meetingLocalDateTime`을 `User.timeZone`으로 해석해 UTC instant로 저장한다.
- `timeZone`은 변환에 사용한 사용자 timezone 값을 snapshot으로 저장한다.
- API response의 `meetingAt`, `createdAt`, `updatedAt`은 ISO 8601 UTC string이다.

상세 기준은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

## 7. 관련 API

- `GET /api/meeting-notes`
- `GET /api/meeting-notes/filter-companies`
- `GET /api/meeting-notes/filter-contacts`
- `GET /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/ai-draft`
- `POST /api/meeting-notes/stt-draft`
- `POST /api/meeting-notes`
- `PATCH /api/meeting-notes/:meetingNoteId`
- `DELETE /api/meeting-notes/:meetingNoteId`

수동 저장 API 계약은 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`를 기준으로 확인한다. AI/STT 초안 API 계약은 `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`를 기준으로 확인한다.
