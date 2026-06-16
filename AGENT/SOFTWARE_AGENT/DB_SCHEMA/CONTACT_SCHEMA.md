# Contact DB Schema

## 1. 기준

이 문서는 현재 구현된 담당자(Contact) 도메인의 데이터베이스 구조를 설명한다.

구현 기준 파일:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260611010000_add_contact_domain/migration.sql`

현재 Contact 도메인은 Prisma schema와 migration에 반영되어 있다. 실제 DB 변경 내역은 migration 파일을 기준으로 확인하고, 이 문서는 테이블 역할과 관계를 이해하기 위한 구현 설명서로 유지한다.

## 2. 전체 관계

```text
User 1 ─ N Contact
User 1 ─ N ContactJobGrade
User 1 ─ N ContactDepartment
User 1 ─ N ContactMemoLog
User 1 ─ N ContactUserPrivateMemoLog
Company 1 ─ N Contact
ContactJobGrade 1 ─ N Contact
ContactDepartment 1 ─ N Contact
Contact 1 ─ N ContactMemoLog
Contact 1 ─ N ContactUserPrivateMemoLog
Contact 1 ─ N Deal
Contact 1 ─ N MeetingNoteContact
```

관계 요약:

- `Contact`는 회사에 소속된 담당자다.
- `ContactJobGrade`는 사용자별 담당자 직급 필터 옵션이다.
- `ContactDepartment`는 사용자별 담당자 부서 필터 옵션이다.
- `ContactMemoLog`는 담당자 일반 메모 로그다.
- `ContactUserPrivateMemoLog`는 담당자별 사용자 비밀 메모 로그다.
- `Deal`은 특정 담당자와 진행하는 딜이다.
- `MeetingNoteContact`는 회의록 작성 시점의 담당자 snapshot 연결이다.

## 3. 현재 제외한 구조

현재 담당자 기본 기능에는 아래 항목을 넣지 않는다.

- 담당자 휴지통과 soft delete 컬럼
- 담당자 삭제/복구/영구삭제 API
- 회사 없이 저장되는 담당자
- 담당자 부서/직급 수정 API
- 담당자 목록의 최근 수정일 응답
- 담당자 상세 응답 자체에 딜 수, 제품 수, 일정 수, 회의록 수를 병합하는 구조
- 명함 OCR 저장 연동
- 기존 `ContactLog` 방식
- 기존 공통 `PersonalMemo(targetType=CONTACT)` 방식

## 4. Table: Contact

사용자가 등록한 담당자 기준 테이블이다. 담당자는 반드시 `Company`에 소속되며, 부서와 직급은 문자열 직접 저장이 아니라 각각 `ContactDepartment`, `ContactJobGrade`의 ID를 FK로 가진다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 담당자 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 담당자를 생성한 내부 `User.id` FK |
| `companyId` | `String @db.Uuid` | 아니오 | 없음 | 담당자가 소속된 `Company.id` FK |
| `username` | `String` | 아니오 | 없음 | 담당자 이름. 담당자 목록 검색 대상 |
| `mobile` | `String` | 아니오 | 없음 | 핸드폰번호. API validation 기준은 `010-1111-2222` 형식 |
| `email` | `String` | 아니오 | 없음 | 이메일 |
| `contactJobGradeId` | `String @db.Uuid` | 아니오 | 없음 | 담당자 직급 `ContactJobGrade.id` FK |
| `contactDepartmentId` | `String @db.Uuid` | 아니오 | 없음 | 담당자 부서 `ContactDepartment.id` FK |
| `createdAt` | `DateTime` | 아니오 | `now()` | 담당자 등록일. 담당자 목록은 이 값을 기준으로 DESC 정렬한다. |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 담당자 최근 수정일. 담당자 목록 응답에는 포함하지 않고 단건 조회 응답에만 포함한다. |

Relations:

- `user`: `User`
- `company`: `Company`
- `contactJobGrade`: `ContactJobGrade`
- `contactDepartment`: `ContactDepartment`
- `memoLogs`: `ContactMemoLog[]`
- `privateMemoLogs`: `ContactUserPrivateMemoLog[]`
- `deals`: `Deal[]`
- `meetingNoteContacts`: `MeetingNoteContact[]`

Indexes:

- `userId + createdAt`: 사용자별 담당자 목록 등록일 DESC 정렬 기준
- `userId + username`: 사용자별 담당자 이름 검색 기준
- `userId + companyId`: 사용자별 회사 필터 기준
- `userId + contactDepartmentId`: 사용자별 담당자 부서 필터 기준
- `userId + contactJobGradeId`: 사용자별 담당자 직급 필터 기준

주석:

- 모든 담당자 조회는 `userId` ownership을 먼저 적용한다.
- 담당자 목록 API는 10개 단위 page-number pagination이며 `totalCount`, `totalPages`를 반환한다.
- 담당자 목록 정렬은 기본 `createdAtDesc`와 이름순 `usernameAsc`를 지원한다.
- `usernameAsc`는 `username ASC`, `createdAt DESC`, `id DESC` 순서로 정렬한다.
- 담당자 목록 응답은 `updatedAt`을 반환하지 않는다.
- 담당자 기본 정보 수정 API는 `username`, `mobile`, `email`, `companyId`, `contactDepartmentId`, `contactJobGradeId` 중 최소 1개를 수정할 수 있다.
- 담당자 생성 요청의 `contactMemo`는 이 테이블에 저장하지 않고 `ContactMemoLog` 첫 데이터로 저장한다.

## 5. Table: ContactJobGrade

담당자 직급 필터 옵션 테이블이다. 사용자가 직접 생성하고 삭제할 수 있지만, 수정은 제공하지 않는다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 담당자 직급 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 직급을 생성한 내부 `User.id` FK |
| `jobGradeName` | `String` | 아니오 | 없음 | 담당자 직급명 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 직급 생성 시각. API 응답에는 현재 포함하지 않는다. |

Relations:

- `user`: `User`
- `contacts`: `Contact[]`

Constraints:

- 사용자 한 명 안에서 같은 `jobGradeName` 이름 중복은 허용하지 않는다.

Indexes:

- `userId`: 사용자별 담당자 직급 전체 조회 기준
- `userId + jobGradeName`: 사용자별 직급 중복 검사 기준

주석:

- 담당자 직급 전체 조회 API는 `id`, `jobGradeName`만 반환한다.
- 이미 담당자에 매핑된 직급은 삭제할 수 없다.
- 삭제 성공 시 API는 `204 No Content`를 반환한다.

## 6. Table: ContactDepartment

담당자 부서 필터 옵션 테이블이다. 사용자가 직접 생성하고 삭제할 수 있지만, 수정은 제공하지 않는다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 담당자 부서 PK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 부서를 생성한 내부 `User.id` FK |
| `departmentName` | `String` | 아니오 | 없음 | 담당자 부서명 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 부서 생성 시각. API 응답에는 현재 포함하지 않는다. |

Relations:

- `user`: `User`
- `contacts`: `Contact[]`

Constraints:

- 사용자 한 명 안에서 같은 `departmentName` 이름 중복은 허용하지 않는다.

Indexes:

- `userId`: 사용자별 담당자 부서 전체 조회 기준
- `userId + departmentName`: 사용자별 부서 중복 검사 기준

주석:

- 담당자 부서 전체 조회 API는 `id`, `departmentName`만 반환한다.
- 이미 담당자에 매핑된 부서는 삭제할 수 없다.
- 삭제 성공 시 API는 `204 No Content`를 반환한다.

## 7. Table: ContactMemoLog

담당자 일반 메모 로그 테이블이다. 담당자 생성 시 `contactMemo`가 있으면 첫 데이터로 저장한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 담당자 일반 메모 로그 PK |
| `contactId` | `String @db.Uuid` | 아니오 | 없음 | 메모가 속한 `Contact.id` FK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 메모를 작성한 내부 `User.id` FK |
| `memoType` | `String` | 아니오 | 없음 | 메모의 간단한 설명 또는 유형 |
| `memo` | `String` | 아니오 | 없음 | 담당자 일반 메모 원문 |
| `createdAt` | `DateTime` | 아니오 | `now()` | 메모 작성 시각 |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 메모 수정 시각 |

Relations:

- `contact`: `Contact`
- `user`: `User`

Indexes:

- `contactId + createdAt`: 담당자 단건 화면의 일반 메모 로그 무한스크롤 기준
- `userId + contactId`: 사용자 ownership 검증 기준

주석:

- 담당자 생성 시 `contactMemo`로 만들어지는 첫 메모 로그는 서버가 `memoType`을 `초기 메모`로 저장한다.
- 독립적인 담당자 일반 메모 로그 생성 API는 `memoType`, `memo`를 필수로 받는다.
- 조회 API는 10개씩 무한스크롤 방식으로 반환한다.
- 조회 응답은 `id`, `memoType`, `memo`, `createdAt`을 반환한다.
- 수정 API는 `memoType`, `memo` 중 최소 1개를 수정할 수 있다.
- 생성/수정 성공 시 API는 `201 Created`와 빈 body를 반환한다.

## 8. Table: ContactUserPrivateMemoLog

담당자별 사용자 비밀 메모 로그 테이블이다. 메모 원문은 데이터베이스에 암호화된 값으로만 저장한다.

| 컬럼 | 타입 | Null | 기본값 | 주석 |
|---|---|---:|---|---|
| `id` | `String @db.Uuid` | 아니오 | `uuid()` | 담당자 개인 비밀 메모 로그 PK |
| `contactId` | `String @db.Uuid` | 아니오 | 없음 | 메모가 속한 `Contact.id` FK |
| `userId` | `String @db.Uuid` | 아니오 | 없음 | 비밀 메모를 작성한 내부 `User.id` FK |
| `memoCiphertext` | `String` | 아니오 | 없음 | 암호화된 비밀 메모 본문 |
| `memoKeyVersion` | `String` | 아니오 | 없음 | 암호화 key version |
| `createdAt` | `DateTime` | 아니오 | `now()` | 비밀 메모 작성 시각 |
| `updatedAt` | `DateTime` | 아니오 | `@updatedAt` | 비밀 메모 수정 시각 |

Relations:

- `contact`: `Contact`
- `user`: `User`

Indexes:

- `contactId + createdAt`: 담당자 단건 화면의 개인 비밀 메모 무한스크롤 기준
- `userId + contactId`: 작성자 본인 조회와 복호화 권한 검증 기준

주석:

- 독립적인 담당자 개인 비밀 메모 로그 생성 API는 `memo`만 필수로 받는다.
- API 요청/응답 이름은 `memo`를 사용하지만 DB에는 평문 `memo` 컬럼을 두지 않는다.
- 저장 시 암호화 port로 암호화한 뒤 `memoCiphertext`, `memoKeyVersion`에 저장한다.
- 조회 시 작성자 본인에게만 복호화된 `memo`를 반환한다.
- 관리자는 이 테이블의 원문을 볼 수 없다.
- 수정 API는 `memo`만 수정할 수 있고, 저장 시 다시 암호화한다.
- 생성/수정 성공 시 API는 `201 Created`와 빈 body를 반환한다.

## 9. 관련 문서

- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/COMPANY_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md`
