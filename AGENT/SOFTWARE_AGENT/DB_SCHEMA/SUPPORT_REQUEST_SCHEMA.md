# Support Request Schema

기준일: 2026-08-24

## 1. 목적

`SupportRequest`는 User Web 도움말 모달에서 접수된 사용자 지원 요청을 저장한다. 사용자가 선택한 문의 유형과 작성한 문의 내용은 필수이며, 스크린샷이나 첨부 파일은 받지 않는다.

## 2. Enum

### `SupportRequestType`

| 값 | 설명 |
| --- | --- |
| `FEATURE_QUESTION` | 기능 문의 |
| `PRICING_QUESTION` | 요금제 문의 |
| `PHONE_CONSULTATION` | 전화 상담 요청 |
| `FEATURE_SUGGESTION` | 기능 제안 |
| `OTHER` | 기타 문의 |

### `SupportRequestStatus`

| 값 | 설명 |
| --- | --- |
| `OPEN` | 접수 후 아직 처리되지 않은 상태 |

## 3. 모델

### `SupportRequest`

Prisma model 이름:

- `SupportRequest`

DB table:

- `support_requests`

주요 column:

| column | nullable | 설명 |
| --- | --- | --- |
| `id` | no | UUID primary key |
| `userId` | no | 지원 요청을 남긴 사용자 ID |
| `userEmail` | yes | 접수 당시 사용자 email snapshot |
| `userDisplayName` | yes | 접수 당시 사용자 이름 snapshot |
| `userRole` | no | 접수 당시 사용자 role snapshot |
| `type` | no | 문의 유형. `SupportRequestType` |
| `description` | no | 사용자가 입력한 지원 요청 본문. trim 후 비어 있지 않아야 하며 API에서 1000자 이하로 제한 |
| `pageUrl` | no | User Web 현재 주소 |
| `userAgent` | yes | 요청 user-agent |
| `requestId` | yes | Backend request id |
| `status` | no | 처리 상태. 최초 `OPEN` |
| `createdAt` | no | UTC 생성 시각 |
| `updatedAt` | no | UTC 수정 시각 |

## 4. 관계

- `SupportRequest.userId -> User.id`
- `User.supportRequests -> SupportRequest[]`

## 5. Index

- `userId, createdAt`: 사용자별 지원 요청 이력 조회 대비
- `status, createdAt`: 후속 Admin 처리 queue 조회 대비
- `type, createdAt`: 문의 유형별 분류 조회 대비

## 6. 보안/개인정보

- `description`에는 전화번호, 요금제 문의 내용 등 사용자가 직접 입력한 정보가 들어갈 수 있으므로 일반 로그에 남기지 않는다.
- `userEmail`, `userDisplayName`은 접수 당시 확인을 위한 snapshot으로 DB에만 저장하고 구조화 로그에는 남기지 않는다.
- Admin 조회/처리 API는 후속 범위에서 관리자 권한 확인 후 별도 계약으로 확장한다.
