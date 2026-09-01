# Error Report API

기준일: 2026-08-31

## 1. 상태

- API 이름: 에러 신고 접수 API
- API 식별자: CreateErrorReport
- 계약 상태: implemented
- 범위: User Web 도움말 모달 `에러신고` 접수
- 소비자: User Web
- 호환성:
  - breaking change 여부: 없음
  - 기존 FE 영향: 기존 User Web 도움말 모달의 multipart 요청과 성공 응답 의미 유지
  - migration 또는 fallback: 기존 `ErrorReport`, `User`, Supabase Storage 연동을 그대로 사용
- 제외: Admin Web 에러 신고 목록/상세 조회, 처리 상태 변경 UI, signed URL 발급 API

## 2. 목표

사용자가 서비스 이용 중 발견한 오류를 이메일이 아니라 서비스 내부 API로 접수한다. 에러 내용은 필수이며, 현재 화면 스크린샷은 자동 생성 후 사용자가 포함 여부를 선택한다.

## 3. API

Method:

- `POST`

Path:

- `/api/error-reports`

로그인한 사용자가 에러 신고를 접수한다.

인증:

- `AuthGuard` 필수
- Backend app access token 필요

권한:

- 로그인한 User Web 사용자만 호출한다.
- FE request body의 `userId`는 받지 않고 신뢰하지 않는다.
- Backend는 `CurrentUserContext.id`로 로그인 사용자를 식별하고, DB에서 사용자 계정 정보를 다시 조회한다.
- 생성되는 에러 신고는 인증 사용자 본인 snapshot 기준으로만 저장한다.
- Admin Web 조회/처리 권한은 이번 API 범위에 포함하지 않는다.

Content-Type:

- `multipart/form-data`

Request 이름:

- `CreateErrorReportDto` (BE)
- `CreateErrorReportInput` (FE)

Request body:

| field | type | required | nullable | empty string | validation | 설명 |
| --- | --- | --- | --- | --- | --- | --- |
| `description` | string | yes | no | no | BE: trim 후 1자 이상. FE: 500자 이하로 입력 제한 | 사용자가 작성한 에러 내용 |
| `pageUrl` | string | yes | no | no | trim 후 1자 이상, 2000자 이하 | User Web 브라우저 현재 주소. `window.location.href` |
| `screenshot` | file | no | no | n/a | PNG만 허용, 최대 10MB | 사용자가 포함을 선택한 현재 화면 스크린샷 |

Header:

| field | required | 설명 |
| --- | --- | --- |
| `Authorization` | yes | Backend app access token |
| `user-agent` | no | Backend가 접수 row에 선택 저장 |
| `x-request-id` | no | 없으면 Backend request id middleware가 생성 |

Response 이름:

- `CreateErrorReportResponse`

Response:

- Status: `201 Created`
- Body: 있음

Response fields:

| field | type | nullable | 설명 |
| --- | --- | --- | --- |
| `id` | string | no | 생성된 에러 신고 ID |
| `message` | string | no | 사용자 성공 안내 문구 |

예시:

```json
{
  "id": "73a9ed9f-1d8f-45df-8d40-f02b0cdb894f",
  "message": "문제를 빠르게 해결할게요."
}
```

## 4. Frontend 흐름

1. 사용자가 도움말 모달의 `에러신고` 탭에 진입한다.
2. FE는 에러 내용 입력 화면을 먼저 열고 현재 화면을 PNG로 캡처한다.
3. 도움말 모달 자체는 캡처에서 제외한다.
4. 사용자는 스크린샷 포함 여부를 ON/OFF로 선택한다.
5. `description`은 FE에서 500자까지만 입력받고 `0/500` 글자 수를 표시한다.
6. `description`은 trim 후 비어 있지 않을 때만 `보내기` 버튼을 활성화한다.
7. 제출 시 `createErrorReport` API client가 `/api/error-reports`로 `multipart/form-data`를 전송한다.
8. 제출 성공 시 Backend response `message`를 성공 모달에 표시한다.
9. 2초 후 성공 모달과 도움말 모달을 닫는다.
10. 실패 시 `getApiErrorMessage`로 변환한 메시지를 submit error 영역에 표시한다.

## 5. Backend 처리

1. `AuthGuard`로 로그인 사용자를 확인한다.
2. `description`, `pageUrl`, optional `screenshot`을 검증한다.
3. `CurrentUserContext.id`로 `User` row를 조회한다.
4. 사용자 snapshot(`userId`, `email`, `displayName`, `role`)을 만든다.
5. screenshot이 있으면 MIME type과 크기를 검증한 뒤 Supabase Storage에 업로드한다.
6. storage reference를 screenshot metadata로 변환한다.
7. `ErrorReport` row를 생성한다.
8. description 원문 없이 `errorReport.created` 구조화 로그를 남긴다.
9. 성공 응답을 반환한다.

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

연결된 DB 스키마:

- 생성: `ErrorReport`
- 조회: `User`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음
- 외부 Provider: Supabase Storage

`ErrorReport` 주요 column:

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

| 상황 | error code | HTTP | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 없음 또는 만료 | `Unauthorized` | 401 | `getApiErrorMessage`로 로그인 안내 표시 | filter/guard 기준 |
| 내용이 비어 있음 | `ERROR_REPORT_DESCRIPTION_REQUIRED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 현재 페이지 주소 누락 | `ERROR_REPORT_PAGE_URL_REQUIRED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 현재 페이지 주소 2000자 초과 | `ERROR_REPORT_PAGE_URL_TOO_LONG` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| PNG가 아닌 screenshot | `ERROR_REPORT_SCREENSHOT_TYPE_UNSUPPORTED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| screenshot 10MB 초과 | `ERROR_REPORT_SCREENSHOT_TOO_LARGE` | 413 | submit error 영역에 메시지 표시 | upload filter 또는 exception filter 기준 |
| 인증된 사용자 ID로 User row를 찾지 못함 | `ERROR_REPORT_USER_NOT_FOUND` | 404 | submit error 영역에 메시지 표시 | exception filter 기준 |
| Supabase Storage 업로드 실패 | `ERROR_REPORT_SCREENSHOT_STORAGE_FAILED` | 503 | submit error 영역에 실패 메시지 표시, 사용자가 재시도 가능 | `errorReport.screenshotStorageFailed`, adapter 실패 시 `errorReport.supabaseScreenshotUploadFailed` |

## 9. Transaction

- 필요 여부: 없음
- 이유: Supabase Storage 업로드와 DB row 생성은 같은 ACID transaction으로 묶을 수 없다.
- transaction model: 없음
- rollback 범위: DB row 생성 실패 시 요청은 실패한다. 이미 업로드된 screenshot은 orphan이 될 수 있으며 cleanup은 후속 Admin/maintenance 범위에서 다룬다.
- 외부 Provider 호출 위치: screenshot이 포함된 요청에서 DB row 생성 전 `ErrorReportScreenshotStorage` port를 통해 Supabase Storage를 호출한다.
- audit log 포함 여부: 없음
- idempotency: 없음. 사용자가 중복 제출하면 별도 row로 접수한다.
- outbox: 없음
- 재시도 정책: FE는 실패 메시지를 표시하고 사용자가 다시 보낼 수 있다.
- 완료 기준: DB row 생성 성공이 신고 접수 완료 기준이다.

## 10. Observability

- log event key: `errorReport.created`
- storage failure event key: `errorReport.screenshotStorageFailed`
- storage adapter failure event key: `errorReport.supabaseScreenshotUploadFailed`
- request id: 사용
- audit log: 없음
- redaction: `description`, raw screenshot, `pageUrl` query 원문, `userEmail`, `userDisplayName`, Supabase secret, storage response body logging 금지
- provider error context: Supabase Storage `statusCode`, `storageProvider`, application error name처럼 운영 판단에 필요한 안전한 값만 기록

## 11. FE/BE 처리 기준

FE:

- `ErrorReportHelpContent`는 description form 값을 관리하고 500자 이하로 제한한다.
- 화면 캡처 성공 여부와 무관하게 사용자는 screenshot 포함 여부를 선택할 수 있다.
- 제출 시 `createErrorReport` API client가 `FormData`에 `description`, `pageUrl`, optional `screenshot`을 담아 전송한다.
- 성공 시 Backend response `message`를 성공 모달에 표시하고 2초 후 도움말 모달을 닫는다.
- 실패 시 `getApiErrorMessage`로 변환한 메시지를 submit error 영역에 표시한다.

BE:

- `ErrorReportController`는 인증 context, multipart body, optional screenshot, request id, user-agent를 application service로 전달한다.
- `ErrorReportApplicationService`는 description/pageUrl/screenshot을 정규화하고 검증한다.
- `ErrorReportApplicationService`는 `CurrentUserContext.id`로 User snapshot을 다시 조회한다.
- `ErrorReportScreenshotStorage` port는 Supabase Storage adapter 뒤에 숨긴다.
- `PrismaErrorReportRepository`는 `ErrorReport` row를 생성한다.
- 에러 신고 본문, screenshot 원문, 사용자 email/displayName 원문은 structured log에 남기지 않는다.

검증:

- BE application service 검증 실패와 정상 저장 테스트
- BE controller `AuthGuard`, multipart body, request id, screenshot 전달 테스트
- FE API client `FormData` 생성 테스트
- `pnpm --dir BE typecheck`, `pnpm --dir FE/user-web typecheck`, 관련 lint/test
