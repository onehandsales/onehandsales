# Error Report API

기준일: 2026-08-23

## 1. 상태

- 상태: confirmed
- 범위: User Web 도움말 모달 `에러신고` 접수
- 제외: Admin Web 에러 신고 목록/상세 조회, 처리 상태 변경 UI

## 2. 목표

사용자가 서비스 이용 중 발견한 오류를 이메일이 아니라 서비스 내부 API로 접수한다. 에러 내용은 필수이며, 현재 화면 스크린샷은 자동 생성 후 사용자가 포함 여부를 선택한다.

## 3. Endpoint

### POST `/api/error-reports`

로그인한 사용자가 에러 신고를 접수한다.

인증:

- `AuthGuard` 필수
- FE request body의 `userId`는 신뢰하지 않는다.
- Backend는 `CurrentUserContext.id`로 로그인 사용자를 식별하고, DB에서 사용자 계정 정보를 다시 조회한다.

Content-Type:

- `multipart/form-data`

Request fields:

| field | type | required | rule |
| --- | --- | --- | --- |
| `description` | string | yes | trim 후 최소 10자, 최대 2000자 |
| `pageUrl` | string | yes | User Web 브라우저 현재 주소를 그대로 전달. `window.location.href` |
| `screenshot` | file | no | PNG만 허용. 최대 10MB |

Response `201`:

```json
{
  "id": "73a9ed9f-1d8f-45df-8d40-f02b0cdb894f",
  "message": "신고가 접수되었어요. 문제를 빠르게 해결할게요."
}
```

## 4. Frontend 흐름

1. 사용자가 도움말 모달의 `에러신고` 탭에서 `에러 신고하기` 버튼을 누른다.
2. FE는 현재 화면을 PNG로 캡처한다.
3. 도움말 모달 자체는 캡처에서 제외한다.
4. 사용자는 스크린샷 포함 여부를 ON/OFF로 선택한다.
5. `description`은 trim 후 10자 이상일 때만 `신고하기` 버튼을 활성화한다.
6. 제출 성공 시 작은 성공 모달을 표시한다.
7. 1초 후 성공 모달과 도움말 모달을 닫는다.

## 5. Backend 처리

1. `AuthGuard`로 로그인 사용자를 확인한다.
2. `description`, `pageUrl`, optional `screenshot`을 검증한다.
3. `CurrentUserContext.id`로 `User` row를 조회한다.
4. 사용자 snapshot(`userId`, `email`, `displayName`, `role`)을 만든다.
5. screenshot이 있으면 Supabase Storage에 업로드한다.
6. `ErrorReport` row를 생성한다.
7. 성공 응답을 반환한다.

## 6. Storage

Storage provider:

- Supabase Storage

Bucket:

- `SUPABASE_STORAGE_ERROR_REPORT_BUCKET`

파일명:

```text
yyyyMMdd_HHmmss_uuid.png
```

예:

```text
20260503_170302_73a9ed9f-1d8f-45df-8d40-f02b0cdb894f.png
```

Storage key:

```text
error-reports/{userId}/yyyy/MM/dd/{fileName}
```

DB에는 public URL을 저장하지 않고 bucket과 storage key를 저장한다. 후속 Admin 조회 기능은 관리자 권한 확인 후 signed URL을 발급하는 방식으로 확장한다.

## 7. DB

사용 table:

- `error_reports`
- `users`

`error_reports` 주요 column:

- `id`
- `userId`
- `userEmail`
- `userDisplayName`
- `userRole`
- `description`
- `pageUrl`
- `userAgent`
- `requestId`
- screenshot metadata
- `status`
- `createdAt`
- `updatedAt`

관계:

- `ErrorReport.userId -> User.id`

## 8. Error

| code | status | 상황 |
| --- | --- | --- |
| `ERROR_REPORT_DESCRIPTION_REQUIRED` | 400 | 내용이 비어 있음 |
| `ERROR_REPORT_DESCRIPTION_TOO_SHORT` | 400 | trim 후 10자 미만 |
| `ERROR_REPORT_DESCRIPTION_TOO_LONG` | 400 | 2000자 초과 |
| `ERROR_REPORT_PAGE_URL_REQUIRED` | 400 | 현재 페이지 주소 누락 |
| `ERROR_REPORT_PAGE_URL_TOO_LONG` | 400 | 페이지 주소 2000자 초과 |
| `ERROR_REPORT_SCREENSHOT_TYPE_UNSUPPORTED` | 400 | PNG가 아닌 파일 |
| `ERROR_REPORT_SCREENSHOT_TOO_LARGE` | 413 | 10MB 초과 |
| `ERROR_REPORT_USER_NOT_FOUND` | 404 | 인증된 사용자 ID로 User row를 찾지 못함 |
| `ERROR_REPORT_SCREENSHOT_STORAGE_FAILED` | 503 | Supabase Storage 업로드 실패 |

## 9. Transaction

- Supabase Storage 업로드와 DB transaction은 같은 ACID transaction으로 묶을 수 없다.
- screenshot이 포함된 요청은 storage 업로드 후 DB row를 생성한다.
- DB 저장 실패 시 storage orphan 가능성이 있으므로 후속 cleanup 정책을 별도 Admin/maintenance 범위에서 다룬다.
- 이번 범위에서는 DB row 생성 성공이 신고 접수 완료 기준이다.

## 10. Observability

- raw screenshot, description 원문, Supabase secret은 로그에 남기지 않는다.
- structured log가 필요한 경우 `requestId`, `userId`, error code, storage provider safe status만 기록한다.
- DB에는 신고 처리에 필요한 사용자 snapshot과 storage metadata만 저장한다.
