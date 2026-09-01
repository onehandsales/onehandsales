# Support Request API

기준일: 2026-08-24

## 1. 상태

- API 이름: 지원 요청 접수 API
- API 식별자: CreateSupportRequest
- 계약 상태: implemented
- 범위: User Web 도움말 모달 `지원요청` 접수
- 소비자: User Web
- 호환성:
  - breaking change 여부: 없음
  - 기존 FE 영향: 기존 도움말 모달의 지원요청 mock submit을 실제 API 호출로 교체
  - migration 또는 fallback: `SupportRequest` 신규 table 추가, 기존 데이터 영향 없음
- 제외: Admin Web 지원 요청 목록/상세 조회, 처리 상태 변경 UI, 전화 발신 provider 연동

## 2. 목표

사용자가 서비스 이용 중 기능 문의, 요금제 문의, 전화 상담 요청, 기능 제안, 기타 문의를 서비스 내부 API로 접수한다. 문의 유형과 문의 내용은 필수이며, 스크린샷이나 첨부 파일은 받지 않는다.

## 3. API

Method:

- `POST`

Path:

- `/api/support-requests`

로그인한 사용자가 지원 요청을 접수한다.

인증:

- `AuthGuard` 필수

권한:

- 로그인한 User Web 사용자만 호출한다.
- FE request body의 `userId`는 받지 않는다.
- Backend는 `CurrentUserContext.id`로 로그인 사용자를 식별하고, DB에서 사용자 계정 정보를 다시 조회한다.
- 생성되는 지원 요청은 인증 사용자 본인 snapshot 기준으로만 저장한다.
- Admin Web 조회/처리 권한과 전화 발신 provider 연동은 이번 API 범위에 포함하지 않는다.

Content-Type:

- `application/json`

Request 이름:

- `CreateSupportRequestRequest`

Request body:

| field | type | required | nullable | empty string | validation | 설명 |
| --- | --- | --- | --- | --- | --- | --- |
| `type` | string | yes | no | no | `FEATURE_QUESTION`, `PRICING_QUESTION`, `PHONE_CONSULTATION`, `FEATURE_SUGGESTION`, `OTHER` 중 하나 | 문의 유형 |
| `description` | string | yes | no | no | trim 후 1자 이상, 1000자 이하 | 사용자가 작성한 문의 내용 |
| `pageUrl` | string | yes | no | no | trim 후 1자 이상, 2000자 이하 | User Web 브라우저 현재 주소. `window.location.href` |

Header:

| field | required | 설명 |
| --- | --- | --- |
| `Authorization` | yes | Backend app access token |
| `user-agent` | no | Backend가 접수 row에 선택 저장 |
| `x-request-id` | no | 없으면 Backend request id middleware가 생성 |

Response 이름:

- `CreateSupportRequestResponse`

Response:

- Status: `201 Created`
- Body: 있음

Response fields:

| field | type | nullable | 설명 |
| --- | --- | --- | --- |
| `id` | string | no | 생성된 지원 요청 ID |
| `message` | string | no | 사용자 성공 안내 문구 |

예시:

```json
{
  "id": "73a9ed9f-1d8f-45df-8d40-f02b0cdb894f",
  "message": "지원 요청을 보냈어요."
}
```

## 4. Frontend 흐름

1. 사용자가 도움말 모달의 `지원요청` 탭에 진입한다.
2. FE는 기본 문의 유형을 `기능 문의`로 선택하고 기능 문의 템플릿을 입력창에 표시한다.
3. 사용자가 템플릿 기본 문구 외 내용을 추가 작성하면 `보내기` 버튼을 활성화한다.
4. 사용자가 템플릿 외 내용을 작성한 상태에서 문의 유형을 바꾸면 교체 확인 모달을 표시한다.
5. 제출 시 `type`, `description`, `pageUrl`을 JSON body로 전송한다.
6. 제출 성공 시 `지원 요청을 보냈어요.` 성공 모달을 표시한다.
7. 2초 후 성공 모달과 도움말 모달을 닫는다.

## 5. Backend 처리

1. `AuthGuard`로 로그인 사용자를 확인한다.
2. `type`, `description`, `pageUrl`을 검증한다.
3. `CurrentUserContext.id`로 `User` row를 조회한다.
4. 사용자 snapshot(`userId`, `email`, `displayName`, `role`)을 만든다.
5. `SupportRequest` row를 생성한다.
6. description 원문 없이 `supportRequest.created` 구조화 로그를 남긴다.
7. 성공 응답을 반환한다.

## 6. DB

연결된 DB 스키마:

- 생성: `SupportRequest`
- 조회: `User`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

`SupportRequest` 주요 column:

- `id`
- `userId`
- `userEmail`
- `userDisplayName`
- `userRole`
- `type`
- `description`
- `pageUrl`
- `userAgent`
- `requestId`
- `status`
- `createdAt`
- `updatedAt`

관계:

- `SupportRequest.userId -> User.id`

## 7. Error

| 상황 | error code | HTTP | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 인증 없음 또는 만료 | `Unauthorized` | 401 | `getApiErrorMessage`로 로그인 안내 표시 | filter/guard 기준 |
| 문의 유형 누락 | `SUPPORT_REQUEST_TYPE_REQUIRED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 허용하지 않는 문의 유형 | `SUPPORT_REQUEST_TYPE_INVALID` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 문의 내용이 비어 있음 | `SUPPORT_REQUEST_DESCRIPTION_REQUIRED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 문의 내용 1000자 초과 | `SUPPORT_REQUEST_DESCRIPTION_TOO_LONG` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 현재 페이지 주소 누락 | `SUPPORT_REQUEST_PAGE_URL_REQUIRED` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 현재 페이지 주소 2000자 초과 | `SUPPORT_REQUEST_PAGE_URL_TOO_LONG` | 400 | submit error 영역에 메시지 표시 | 별도 application log 없음 |
| 인증된 사용자 ID로 User row를 찾지 못함 | `SUPPORT_REQUEST_USER_NOT_FOUND` | 404 | submit error 영역에 메시지 표시 | exception filter 기준 |

## 8. Transaction

- 필요 여부: 없음
- 이유: 지원 요청 접수는 `SupportRequest` 단일 row 생성만 수행한다.
- transaction model: 없음
- rollback 범위: `SupportRequest` row 생성 실패 시 전체 요청 실패
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음
- idempotency: 없음. 사용자가 중복 제출하면 별도 row로 접수한다.
- outbox: 없음
- 재시도 정책: FE는 실패 메시지를 표시하고 사용자가 다시 보낼 수 있다.

## 9. Observability

- log event key: `supportRequest.created`
- request id: 사용
- audit log: 없음
- redaction: `description`, `userEmail`, `userDisplayName`, 전화번호 등 사용자가 입력할 수 있는 원문 logging 금지
- provider error context: 없음

## 10. FE/BE 처리 기준

FE:

- `SupportRequestHelpContent`는 React Hook Form과 Zod schema로 `type`, `description` form 값을 관리한다.
- 템플릿 기본 문구만 있는 상태에서는 `보내기`를 비활성화한다.
- 제출 시 `createSupportRequest` API client가 `/api/support-requests`로 JSON body를 전송한다.
- 성공 시 Backend response `message`를 성공 모달에 표시하고 2초 후 도움말 모달을 닫는다.
- 실패 시 `getApiErrorMessage`로 변환한 메시지를 submit error 영역에 표시한다.

BE:

- `SupportRequestController`는 인증 context, body, request id, user-agent를 application service로 전달한다.
- `SupportRequestApplicationService`는 type/description/pageUrl을 정규화하고 검증한다.
- `SupportRequestApplicationService`는 `CurrentUserContext.id`로 User snapshot을 다시 조회한다.
- `PrismaSupportRequestRepository`는 `SupportRequest` row를 생성한다.
- 지원 요청 본문과 사용자 email/displayName 원문은 structured log에 남기지 않는다.

검증:

- BE application service 검증 실패와 정상 저장 테스트
- BE controller `AuthGuard`, JSON body, request id 전달 테스트
- FE API client JSON body 생성 테스트
- `pnpm --dir BE typecheck`, `pnpm --dir FE/user-web typecheck`, 관련 lint/test
