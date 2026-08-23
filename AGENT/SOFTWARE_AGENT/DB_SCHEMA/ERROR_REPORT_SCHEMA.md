# Error Report Schema

기준일: 2026-08-23

## 1. 목적

`ErrorReport`는 User Web 도움말 모달에서 접수된 사용자 에러 신고를 저장한다. 사용자가 작성한 에러 설명은 필수이며, 현재 화면 스크린샷은 선택 첨부다.

## 2. 모델

### `ErrorReport`

Prisma model 예정 이름:

- `ErrorReport`

DB table:

- `error_reports`

주요 column:

| column | nullable | 설명 |
| --- | --- | --- |
| `id` | no | UUID primary key |
| `userId` | no | 신고한 사용자 ID |
| `userEmail` | yes | 신고 당시 사용자 email snapshot |
| `userDisplayName` | yes | 신고 당시 사용자 이름 snapshot |
| `userRole` | no | 신고 당시 사용자 role snapshot |
| `description` | no | 사용자가 입력한 에러 내용. trim 후 비어 있지 않아야 함 |
| `pageUrl` | no | User Web 현재 주소 |
| `userAgent` | yes | 요청 user-agent |
| `requestId` | yes | Backend request id |
| `screenshotStorageProvider` | yes | screenshot 저장 provider. 현재 `SUPABASE` |
| `screenshotStorageBucket` | yes | Supabase Storage bucket |
| `screenshotStorageKey` | yes | Supabase Storage object key |
| `screenshotFileName` | yes | UTC timestamp + UUID 기반 파일명 |
| `screenshotMimeType` | yes | 현재 `image/png`만 허용 |
| `screenshotSizeBytes` | yes | screenshot byte 크기 |
| `screenshotChecksum` | yes | screenshot SHA-256 checksum |
| `status` | no | 처리 상태. 최초 `OPEN` |
| `createdAt` | no | UTC 생성 시각 |
| `updatedAt` | no | UTC 수정 시각 |

## 3. 관계

- `ErrorReport.userId -> User.id`
- `User.errorReports -> ErrorReport[]`

## 4. Index

- `userId, createdAt`: 사용자별 신고 이력 조회 대비
- `status, createdAt`: 후속 Admin 처리 queue 조회 대비

## 5. 보안/개인정보

- screenshot public URL은 DB에 저장하지 않는다.
- Admin 조회 기능은 후속 범위에서 관리자 권한 확인 후 signed URL 발급으로 확장한다.
- description 원문은 사용자 신고 본문이므로 일반 로그에 남기지 않는다.
- storage secret과 signed URL은 로그/문서/응답에 남기지 않는다.
