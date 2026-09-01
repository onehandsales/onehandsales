# Public Contact Request API

기준일: 2026-09-01

## 1. 상태

- API 이름: 공개 문의 접수 API
- API 생명주기: CreatePublicContactRequest
- 계약 상태: implemented
- 범위: 로그인 전 공개 사이트 `/contact` 문의 접수
- 소비자: User Web
- 제외: Admin Web 문의 목록/상세/처리 UI, 외부 알림 provider 연동

## 2. 목적

로그인하지 않은 사용자가 공개 문의 페이지에서 입력한 도입/상담 요청을 Backend API로 접수한다. 기존 `SupportRequest`는 로그인 후 도움말 모달 전용 API이므로 이 API와 테이블을 분리한다.

## 3. API

Method:

- `POST`

Path:

- `/api/public/contact-requests`

인증:

- 없음

권한:

- 로그인 전 공개 페이지에서 호출할 수 있다.
- request body에 `userId`를 받지 않는다.
- Backend는 `email`을 정규화한 뒤 `User`를 조회해서 제출 시점 회원 여부만 boolean snapshot으로 저장한다.
- 회원 여부 snapshot은 응답으로 반환하지 않는다.

Content-Type:

- `application/json`

Request 이름:

- `CreatePublicContactRequestRequest`

Request body:

| field | type | required | nullable | empty string | validation | 설명 |
| --- | --- | --- | --- | --- | --- | --- |
| `email` | string | yes | no | no | trim 후 이메일 형식, 254자 이하 | 사용자가 입력한 업무 이메일 |
| `companySize` | string | yes | no | no | `1-9`, `10-49`, `50-199`, `200+` 중 하나 | 사용 인원 규모 |
| `firstName` | string | yes | no | no | trim 후 100자 이하 | 이름 |
| `lastName` | string | yes | no | no | trim 후 100자 이하 | 성 |
| `company` | string | yes | no | no | trim 후 160자 이하 | 회사명 |
| `title` | string | yes | no | no | trim 후 120자 이하 | 직함 |
| `region` | string | yes | no | no | `KR`, `US`, `CA` 중 하나 | 국가 또는 지역 |
| `phone` | string | yes | no | no | trim 후 40자 이하 | 연락 가능한 전화번호 |
| `plan` | string | yes | no | no | trim 후 2000자 이하 | OneHand 사용 계획 |
| `source` | string | yes | no | no | 허용된 유입 경로 중 하나 | OneHand를 알게 된 경로 |
| `marketingAgreement` | boolean | yes | no | n/a | boolean | 제품 소식/온보딩 안내 수신 동의 |
| `pageUrl` | string | no | no | yes | trim 후 2000자 이하 | 제출 시점 공개 페이지 URL |
| `locale` | string | no | no | yes | `ko`, `en-US`, `en-CA` 중 하나 | 제출 시점 공개 사이트 언어 |

`source` 허용값:

- `linkedin`
- `peer`
- `search`
- `newsletter`
- `event`
- `webinar`
- `podcast`
- `friend`
- `naver`
- `other`

Header:

| field | required | 설명 |
| --- | --- | --- |
| `user-agent` | no | Backend가 접수 row에 선택 저장 |
| `x-request-id` | no | 없으면 Backend request id middleware가 생성 |

Response 이름:

- `CreatePublicContactRequestResponse`

Response:

- Status: `201 Created`
- Body: 있음

Response fields:

| field | type | nullable | 설명 |
| --- | --- | --- | --- |
| `id` | string | no | 생성된 공개 문의 ID |
| `message` | string | no | 사용자 성공 안내 문구 |

예시:

```json
{
  "id": "73a9ed9f-1d8f-45df-8d40-f02b0cdb894f",
  "message": "문의가 접수되었습니다."
}
```

## 4. Frontend 흐름

1. 사용자가 공개 사이트 `/contact` 단계형 form을 입력한다.
2. 마지막 단계에서 `plan`, `source`가 비어 있지 않을 때 제출 버튼을 활성화한다.
3. 제출 시 form 값을 trim 가능한 형태로 API client에 전달한다.
4. API client는 `/api/public/contact-requests`에 JSON body를 전송하고 `skipAuthRefresh: true`를 사용한다.
5. 성공하면 현재 완료 화면으로 전환한다.
6. 실패하면 입력값을 유지하고 submit error 영역에 안전한 오류 메시지를 표시한다.

## 5. Backend 처리

1. 인증 없이 JSON body를 받는다.
2. DTO와 application service에서 입력 타입, 필수값, 길이, enum 값을 검증한다.
3. `email`을 trim, lower-case 처리해서 `normalizedEmail`을 만든다.
4. `User.email = normalizedEmail`, `deletedAt = null` 조건으로 기존 회원 여부를 조회한다.
5. `PublicContactRequest` row를 생성한다.
6. `publicContactRequest.created` structured log를 남기되 이메일, 이름, 회사명, 전화번호, plan 원문은 logging하지 않는다.
7. 성공 응답을 반환한다.

## 6. DB

연결 DB 스키마:

- 생성: `PublicContactRequest`
- 조회: `User`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

`public_contact_requests` 주요 column:

- `id`
- `email`
- `normalizedEmail`
- `companySize`
- `firstName`
- `lastName`
- `companyName`
- `jobTitle`
- `region`
- `phone`
- `plan`
- `source`
- `marketingAgreement`
- `wasExistingUserAtSubmission`
- `pageUrl`
- `locale`
- `userAgent`
- `requestId`
- `status`
- `createdAt`
- `updatedAt`

관계:

- 없음. 이 테이블은 어떤 FK도 사용하지 않는다.

## 7. Error

| 상황 | error code | HTTP | FE 처리 | log level |
| --- | --- | --- | --- | --- |
| 입력값 검증 실패 | `PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED` | 400 | submit error 영역에 message 표시 | 별도 application log 없음 |

## 8. Transaction

- 필요 여부: 없음
- 이유: `User`는 회원 여부 snapshot 확인용으로만 조회하고, 실제 변경 model은 `PublicContactRequest` 단일 row 생성이다.
- transaction model: 없음
- rollback 범위: `PublicContactRequest` row 생성 실패 시 전체 요청 실패
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음
- idempotency: 없음. 같은 이메일로 여러 번 제출하면 별도 row로 접수한다.
- outbox: 없음

## 9. Observability

- log event key: `publicContactRequest.created`
- request id: 사용
- audit log: 없음
- redaction: `email`, `normalizedEmail`, `firstName`, `lastName`, `companyName`, `jobTitle`, `phone`, `plan` 원문 logging 금지
- provider error context: 없음
