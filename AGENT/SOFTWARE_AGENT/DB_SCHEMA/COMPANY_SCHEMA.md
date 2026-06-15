# Company DB Schema

## 1. 기준

이 문서는 현재 확정된 회사 도메인의 데이터베이스 구조를 설명한다.

구현 기준 파일:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260611000000_add_company_domain/migration.sql`

현재 Company 도메인은 Prisma schema와 migration에 반영되어 있다. 실제 DB 변경 내역은 migration 파일을 기준으로 확인하고, 이 문서는 테이블 역할과 관계를 이해하기 위한 구현 설명서로 유지한다.

## 2. 전체 관계

```text
User 1 ─ N Company
User 1 ─ N CompanyField
User 1 ─ N CompanyRegion
CompanyField 1 ─ N Company
CompanyRegion 1 ─ N Company
Company 1 ─ N CompanyMemoLog
Company 1 ─ N CompanyUserPrivateMemoLog
Company 1 ─ N Contact
Company 1 ─ N Deal
Company 1 ─ N MeetingNoteCompany
Company 1 ─ N MeetingNoteContact
```

관계 요약:

- `Company`는 사용자가 등록한 회사 본문 데이터다.
- `CompanyField`는 사용자별 회사 분야 필터 옵션이다.
- `CompanyRegion`은 사용자별 회사 지역 필터 옵션이다.
- `CompanyMemoLog`는 회사 특징에 대한 일반 메모 로그다.
- `CompanyUserPrivateMemoLog`는 회사별 사용자 비밀 메모 로그다.
- `Contact`는 회사에 소속된 거래처 담당자다.
- `Deal`은 특정 회사에 속한 딜이다.
- `MeetingNoteCompany`와 `MeetingNoteContact`는 회의록 작성 시점의 회사/담당자 snapshot 연결이다.

## 3. 현재 제외한 구조

현재 회사 기본 기능에는 아래 항목을 넣지 않는다.

- 휴지통과 soft delete 컬럼
- 회사 목록의 최근 수정일 응답
- 회사 단건 응답에 거래처 수와 딜 수를 직접 병합하는 구조
- 회사분야/회사지역 수정 API
- Admin 원문 조회용 회사 개인 비밀 메모 복호화
- 기존 공통 `PersonalMemo(targetType=COMPANY)` 방식

회사 목록의 연결 거래처 수는 `Contact.companyId` 관계를 기준으로 `contactCount` 집계값으로 제공한다. 회사 목록의 연결 딜 수는 `Deal.companyId` 관계를 기준으로 `dealCount` 집계값으로 제공한다. 회사 단건 조회 응답 자체에는 거래처 수와 딜 수를 병합하지 않으며, 회사 단건 화면의 연결 Contact/Deal 목록은 별도 API로 조회한다.

## 4. Table: Company

사용자가 등록한 회사의 기준 테이블이다. 회사 분야와 회사 지역은 문자열을 직접 저장하지 않고 각각 `CompanyField`, `CompanyRegion`의 ID를 FK로 가진다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 회사 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 회사를 생성한 내부 `User.id` FK |
| `companyName` | `String` | 아니오 | 없음 | 회사 이름. 회사 목록 검색 대상 |
| `companyFieldId` | `String @db.Uuid` | 아니오 | 없음 | 회사 분야 `CompanyField.id` FK |
| `companyRegionId` | `String @db.Uuid` | 아니오 | 없음 | 회사 지역 `CompanyRegion.id` FK |
| `createdAt` | `DateTime` | 아니오 | `now()` | 회사 등록일. 회사 목록은 이 값을 기준으로 DESC 정렬한다. |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 회사 최근 수정일. 회사 목록 응답에는 포함하지 않고 단건 조회 응답에만 포함한다. |

Relations:

- `user`: `User`
- `companyField`: `CompanyField`
- `companyRegion`: `CompanyRegion`
- `memoLogs`: `CompanyMemoLog[]`
- `privateMemoLogs`: `CompanyUserPrivateMemoLog[]`
- `contacts`: `Contact[]`
- `deals`: `Deal[]`
- `meetingNoteCompanies`: `MeetingNoteCompany[]`
- `meetingNoteContacts`: `MeetingNoteContact[]`

Indexes:

- `userId + createdAt`: 사용자별 회사 목록 등록일 DESC 정렬 기준
- `userId + companyName`: 사용자별 회사 이름 검색 기준
- `userId + companyFieldId`: 사용자별 회사 분야 필터 기준
- `userId + companyRegionId`: 사용자별 회사 지역 필터 기준

주석:

- 모든 회사 조회는 `userId` ownership을 먼저 적용한다.
- 회사 목록 응답은 `updatedAt`을 반환하지 않는다.
- 회사 목록 응답은 `Contact.companyId` 기준 집계값 `contactCount`를 반환한다.
- 회사 기본 정보 수정 API는 `companyName`, `companyFieldId`, `companyRegionId` 중 최소 1개를 수정할 수 있다.
- 회사 생성 요청의 `companyMemo`는 이 테이블에 저장하지 않고 `CompanyMemoLog` 첫 데이터로 저장한다.

## 5. Table: CompanyField

회사 분야 필터 옵션 테이블이다. 사용자가 직접 생성하고 삭제할 수 있지만, 수정은 제공하지 않는다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 회사 분야 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 분야를 생성한 내부 `User.id` FK |
| `field` | `String` | 아니오 | 없음 | 회사 분야 이름 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 분야 생성 시각. API 응답에는 현재 포함하지 않는다. |

Relations:

- `user`: `User`
- `companies`: `Company[]`

Constraints:

- 사용자 한 명 안에서 같은 `field` 이름 중복은 허용하지 않는 것을 기본으로 한다.

Indexes:

- `userId`: 사용자별 회사 분야 전체 조회 기준
- `userId + field`: 사용자별 분야 중복 검사 기준

주석:

- 회사 분야 전체 조회 API는 `id`, `field`만 반환한다.
- 이미 회사에 매핑된 분야는 삭제할 수 없다.
- 삭제 성공 시 API는 `204 No Content`를 반환한다.

## 6. Table: CompanyRegion

회사 지역 필터 옵션 테이블이다. 사용자가 직접 생성하고 삭제할 수 있지만, 수정은 제공하지 않는다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 회사 지역 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 지역을 생성한 내부 `User.id` FK |
| `region` | `String` | 아니오 | 없음 | 회사 지역 이름 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 지역 생성 시각. API 응답에는 현재 포함하지 않는다. |

Relations:

- `user`: `User`
- `companies`: `Company[]`

Constraints:

- 사용자 한 명 안에서 같은 `region` 이름 중복은 허용하지 않는 것을 기본으로 한다.

Indexes:

- `userId`: 사용자별 회사 지역 전체 조회 기준
- `userId + region`: 사용자별 지역 중복 검사 기준

주석:

- 회사 지역 전체 조회 API는 `id`, `region`만 반환한다.
- 이미 회사에 매핑된 지역은 삭제할 수 없다.
- 삭제 성공 시 API는 `204 No Content`를 반환한다.

## 7. Table: CompanyMemoLog

회사 특징에 대한 일반 메모 로그 테이블이다. 회사 생성 시 `companyMemo`가 있으면 첫 데이터로 저장한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 회사 메모 로그 PK |
| `companyId` | `String @db.Uuid` | 아니오 | 없음 | 메모가 속한 `Company.id` FK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 메모를 작성한 내부 `User.id` FK |
| `memoType` | `String` | 아니오 | 없음 | 메모의 간단한 설명 또는 유형. 예: 첫 접촉, 전화 통화, 영업 방문 |
| `memo` | `String` | 아니오 | 없음 | 회사 특징 메모 원문 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 메모 작성 시각 |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 메모 수정 시각 |

Relations:

- `company`: `Company`
- `user`: `User`

Indexes:

- `companyId + createdAt`: 회사 단건 화면의 메모 로그 무한스크롤 기준
- `userId + companyId`: 사용자 ownership 검증 기준

주석:

- 회사 생성 시 `companyMemo`로 만들어지는 첫 메모 로그는 서버가 `memoType`을 `초기 메모`로 저장한다.
- 독립적인 회사 메모 로그 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 조회 API는 10개씩 무한스크롤 방식으로 반환한다.
- 조회 응답은 `id`, `memoType`, `memo`, `createdAt`을 반환한다.
- 수정 API는 `memoType`, `memo`를 함께 수정할 수 있다.
- 생성 성공 시 API는 `201 Created`와 빈 body를 반환한다.
- 수정 성공 시 현재 요구사항은 `201 Created`와 빈 body를 반환한다.

## 8. Table: CompanyUserPrivateMemoLog

회사별 사용자 비밀 메모 로그 테이블이다. 메모 원문은 데이터베이스에 암호화된 값으로만 저장한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 회사 개인 비밀 메모 로그 PK |
| `companyId` | `String @db.Uuid` | 아니오 | 없음 | 메모가 속한 `Company.id` FK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 비밀 메모를 작성한 내부 `User.id` FK |
| `memoCiphertext` | `String` | 아니오 | 없음 | 암호화된 비밀 메모 본문 |
| `memoKeyVersion` | `String` | 아니오 | 없음 | 암호화 key version |
| `createdAt` | `DateTime` | 아니오 | `now()` | 비밀 메모 작성 시각 |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 비밀 메모 수정 시각 |

Relations:

- `company`: `Company`
- `user`: `User`

Indexes:

- `companyId + createdAt`: 회사 단건 화면의 개인 비밀 메모 무한스크롤 기준
- `userId + companyId`: 작성자 본인 조회와 복호화 권한 검증 기준

주석:

- 독립적인 회사 개인 비밀 메모 로그 생성 API는 `memo`만 필수로 받는다.
- API 요청/응답 이름은 `memo`를 사용하지만 DB에는 평문 `memo` 컬럼을 두지 않는다.
- 저장 시 `EncryptionPort`로 암호화한 뒤 `memoCiphertext`, `memoKeyVersion`에 저장한다.
- 조회 시 작성자 본인에게만 복호화된 `memo`를 반환한다.
- 관리자는 이 테이블의 원문을 볼 수 없다.
- 수정 API는 `memo`만 수정할 수 있고, 저장 시 다시 암호화한다.
- 수정 성공 시 현재 요구사항은 `201 Created`와 빈 body를 반환한다.

## 9. 주석 포함 Prisma 기준 구조

```prisma
model Company {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid
  companyName     String
  companyFieldId  String   @db.Uuid
  companyRegionId String   @db.Uuid
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  /// 기능 : 회사를 생성한 사용자다. 모든 회사 API는 이 userId로 소유권을 검증한다.
  user            User          @relation(fields: [userId], references: [id])
  /// 기능 : 회사 목록 필터에 사용되는 회사 분야다.
  companyField    CompanyField  @relation(fields: [companyFieldId], references: [id])
  /// 기능 : 회사 목록 필터에 사용되는 회사 지역이다.
  companyRegion   CompanyRegion @relation(fields: [companyRegionId], references: [id])
  /// 기능 : 회사 특징에 대한 일반 메모 로그 목록이다.
  memoLogs        CompanyMemoLog[]
  /// 기능 : 작성자 본인만 복호화해 볼 수 있는 회사 개인 비밀 메모 로그 목록이다.
  privateMemoLogs CompanyUserPrivateMemoLog[]
  /// 기능 : 회사에 소속된 거래처 담당자 목록이다.
  contacts        Contact[]

  @@index([userId, createdAt])
  @@index([userId, companyName])
  @@index([userId, companyFieldId])
  @@index([userId, companyRegionId])
}

model CompanyField {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  field     String
  createdAt DateTime @default(now())

  /// 기능 : 회사 분야를 생성한 사용자다.
  user      User      @relation(fields: [userId], references: [id])
  /// 기능 : 이 분야를 사용하는 회사 목록이다. 하나라도 있으면 분야 삭제를 막는다.
  companies Company[]

  @@unique([userId, field])
  @@index([userId])
}

model CompanyRegion {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  region    String
  createdAt DateTime @default(now())

  /// 기능 : 회사 지역을 생성한 사용자다.
  user      User      @relation(fields: [userId], references: [id])
  /// 기능 : 이 지역을 사용하는 회사 목록이다. 하나라도 있으면 지역 삭제를 막는다.
  companies Company[]

  @@unique([userId, region])
  @@index([userId])
}

model CompanyMemoLog {
  id        String   @id @default(uuid()) @db.Uuid
  companyId String   @db.Uuid
  userId    String   @db.Uuid
  memoType  String
  memo      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// 기능 : 메모가 속한 회사다.
  company   Company @relation(fields: [companyId], references: [id])
  /// 기능 : 메모를 작성한 사용자다.
  user      User    @relation(fields: [userId], references: [id])

  @@index([companyId, createdAt])
  @@index([userId, companyId])
}

model CompanyUserPrivateMemoLog {
  id              String   @id @default(uuid()) @db.Uuid
  companyId       String   @db.Uuid
  userId          String   @db.Uuid
  memoCiphertext  String
  memoKeyVersion  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  /// 기능 : 비밀 메모가 속한 회사다.
  company         Company @relation(fields: [companyId], references: [id])
  /// 기능 : 비밀 메모를 작성한 사용자다. 이 사용자만 복호화된 memo를 볼 수 있다.
  user            User    @relation(fields: [userId], references: [id])

  @@index([companyId, createdAt])
  @@index([userId, companyId])
}
```

## 10. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
