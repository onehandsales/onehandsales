# Public Contact Request Schema

기준일: 2026-09-01

## 1. 목적

`PublicContactRequest`는 로그인 전 공개 사이트 `/contact`에서 접수된 도입/상담 문의를 저장한다. 기존 `SupportRequest`는 로그인한 사용자의 도움말 모달 지원 요청이므로 이 테이블과 분리한다.

## 2. Enum

### `PublicContactRequestStatus`

| 값 | 설명 |
| --- | --- |
| `OPEN` | 접수 후 아직 처리되지 않은 상태 |

## 3. 모델

### `PublicContactRequest`

Prisma model 이름:

- `PublicContactRequest`

DB table:

- `public_contact_requests`

주요 column:

| column | nullable | 설명 |
| --- | --- | --- |
| `id` | no | UUID primary key |
| `email` | no | 사용자가 문의 form에 입력한 이메일 |
| `normalizedEmail` | no | 회원 여부 확인과 검색에 사용할 trim/lower-case 이메일 |
| `companySize` | no | 사용 인원 규모. `1-9`, `10-49`, `50-199`, `200+` 중 하나 |
| `firstName` | no | 사용자가 입력한 이름 |
| `lastName` | no | 사용자가 입력한 성 |
| `companyName` | no | 사용자가 입력한 회사명 |
| `jobTitle` | no | 사용자가 입력한 직함 |
| `region` | no | 국가 또는 지역. `KR`, `US`, `CA` 중 하나 |
| `phone` | no | 사용자가 입력한 전화번호 |
| `plan` | no | 사용자가 입력한 OneHand 사용 계획 |
| `source` | no | 유입 경로 |
| `marketingAgreement` | no | 제품 소식/온보딩 안내 수신 동의 여부 |
| `wasExistingUserAtSubmission` | no | 제출 시점에 같은 정규화 이메일을 가진 삭제되지 않은 회원이 있었는지 여부 |
| `pageUrl` | yes | 제출 시점 공개 페이지 URL |
| `locale` | yes | 제출 시점 공개 사이트 언어 |
| `userAgent` | yes | 요청 user-agent |
| `requestId` | yes | Backend request id |
| `status` | no | 처리 상태. 최초 `OPEN` |
| `createdAt` | no | UTC 생성 시각 |
| `updatedAt` | no | UTC 수정 시각 |

## 4. 관계

- 없음.
- 이 테이블은 `User`를 포함한 어떤 테이블과도 FK를 연결하지 않는다.
- 회원 여부는 `User.email` 조회 결과를 `wasExistingUserAtSubmission` boolean snapshot으로만 저장한다.

## 5. Index

- `createdAt`: 접수 최신순 조회 대비
- `status, createdAt`: 이후 Admin 처리 queue 조회 대비
- `normalizedEmail`: 이메일 기준 검색/중복 확인 대비
- `wasExistingUserAtSubmission, createdAt`: 회원/비회원 제출 분류 대비

## 6. 보안/개인정보

- `email`, `normalizedEmail`, `firstName`, `lastName`, `companyName`, `jobTitle`, `phone`, `plan`은 개인정보 또는 사용자가 직접 입력한 원문이므로 일반 application log에 남기지 않는다.
- `wasExistingUserAtSubmission`은 account enumeration을 막기 위해 공개 API 응답으로 반환하지 않는다.
- 이 테이블은 공개 문의 접수 원장을 보존하기 위해 User row와 FK로 연결하지 않는다.
- Admin 조회/처리 API는 별도 범위에서 권한, masking, audit log 계약을 먼저 정의한 뒤 추가한다.
