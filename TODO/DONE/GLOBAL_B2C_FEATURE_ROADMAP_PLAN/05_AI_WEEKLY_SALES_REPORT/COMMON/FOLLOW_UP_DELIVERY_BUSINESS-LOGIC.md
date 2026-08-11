# 05-B Business Logic

상태: Implementation-ready draft

## 1. Use case 목록

| Use case | 책임 |
|---|---|
| `GetFollowUpDeliverySettings` | email connection, SMS sender, consent notice 상태 조회 |
| `StartEmailConnection` | Gmail/Microsoft OAuth 연결 시작 |
| `HandleEmailConnectionCallback` | OAuth callback 검증과 token 저장 |
| `DisconnectEmailConnection` | email provider 연결 해제 |
| `RequestSmsSenderNumberVerification` | SMS 발신번호 인증 코드 발송 |
| `VerifySmsSenderNumber` | SMS 인증 코드 검증 후 발신번호 활성화 |
| `AcknowledgeFollowUpConsentNotice` | 첫 발송 주의 안내 확인 |
| `CreateFollowUpDraft` | AI follow-up suggestion에서 email/SMS draft 생성 |
| `UpdateFollowUpMessageDraft` | compose 화면의 수신자/제목/본문 수정 저장 |
| `SendFollowUpMessage` | 즉시 발송 |
| `RetryFollowUpMessage` | 일시 실패 메시지 재시도 |
| `ListFollowUpMessages` | AI 리포트 또는 record timeline 발송 이력 조회 |

## 2. Provider 연결

Email:

1. 사용자는 `/app/settings`에서 Gmail 또는 Microsoft 365 연결을 시작한다.
2. OAuth state는 user/session에 묶고 재사용을 막는다.
3. callback에서 provider account email, scope, token을 확인한다.
4. access/refresh token은 암호화 저장한다.
5. 연결 만료 또는 권한 오류가 발생하면 `RECONNECT_REQUIRED`로 바꾼다.

SMS:

1. 사용자는 `/app/settings`에서 E.164 번호를 입력한다.
2. Backend는 provider로 인증 SMS를 보낸다.
3. 인증 code 원문은 저장하지 않고 hash만 저장한다.
4. 사용자가 code를 입력하면 hash를 검증한다.
5. 검증 성공 시 `VERIFIED` 발신번호가 된다.

## 3. Draft 생성

1. 사용자가 05-A report의 follow-up suggestion에서 `이메일 작성` 또는 `문자 작성`을 선택한다.
2. FE는 채널, 언어, 수신 담당자, source report/suggestion을 request로 보낸다.
3. Backend는 source report/suggestion ownership을 확인한다.
4. 수신 담당자가 해당 report의 회의록 또는 딜에 연결된 담당자인지 확인한다.
5. 채널별 provider 연결 상태를 확인한다.
6. AI provider에 선택 채널 초안만 요청한다.
7. transaction 안에서 `FollowUpMessage(status=DRAFT)`, `FollowUpMessageTarget`, `AiProviderCallLog`를 저장한다.
8. draft response를 compose 화면으로 반환한다.

## 4. Compose 수정

1. 사용자는 compose 화면에서 수신자, 제목, 본문을 확인한다.
2. email은 제목과 본문이 필수다.
3. SMS는 본문만 필수이며 1~2 segment 제한을 넘으면 validation error를 반환한다.
4. 수정 내용은 `FollowUpMessage`에 저장한다.
5. `SENT` 상태 메시지는 수정할 수 없다.

## 5. 발송

1. 사용자가 compose에서 `보내기`를 누른다.
2. Backend는 current user와 message ownership을 확인한다.
3. 첫 발송 주의 안내가 확인되어 있는지 확인한다.
4. channel별 sender 연결 상태를 확인한다.
5. message 상태를 `SENDING`으로 바꾸고 delivery attempt를 만든다.
6. 외부 provider 호출은 transaction 밖에서 수행한다.
7. provider 성공 시 message와 attempt를 `SENT`로 갱신한다.
8. provider 일시 실패 시 retryable attempt를 남기고 message를 `FAILED`로 둔다.
9. provider 인증 만료, invalid recipient, 정책 오류는 retryable=false로 둔다.

## 6. 재시도

- 자동 재시도는 provider timeout, 5xx, 일시 rate limit 같은 retryable error만 최대 2~3회 수행한다.
- 인증 만료, 잘못된 수신자, 잘못된 발신번호, 수신 거부/정책 오류는 자동 재시도하지 않는다.
- 사용자가 `재시도`를 누르면 connection/sender 상태를 다시 확인하고 새 attempt를 만든다.

## 7. 발송 이력

- 제목/본문 전체를 `FollowUpMessage`에 저장한다.
- 사용자는 개별 발송 이력을 삭제할 수 없다.
- 이력은 AI report와 관련 Deal/Contact timeline 양쪽에서 조회된다.
- timeline은 `FollowUpMessageTarget`의 다형 target으로 구성한다.

## 8. Observability

Structured log event:

- `followUp.emailConnection.connected`
- `followUp.emailConnection.reconnectRequired`
- `followUp.smsSender.verificationRequested`
- `followUp.smsSender.verified`
- `followUp.draft.created`
- `followUp.message.sent`
- `followUp.message.failed`
- `provider.gmail.followUpSend.failed`
- `provider.microsoft.followUpSend.failed`
- `provider.sms.followUpSend.failed`

Logging 금지:

- email/SMS 본문
- provider raw error
- OAuth token
- SMS 인증 code
- 수신자 email/phone 원문
- AI prompt/raw response

DB 저장 허용:

- `FollowUpMessage`에는 본문 전체 저장
- `FollowUpDeliveryAttempt`에는 provider message id, safe error, 비용 추적 저장
- provider raw response는 저장하지 않음

## 9. 테스트 기준

- Gmail/Microsoft connection ownership이 격리된다.
- SMS 발신번호는 인증 전 사용할 수 없다.
- 수신 담당자는 report의 회의록/딜 연결 담당자여야 한다.
- compose 확인 전 발송할 수 없다.
- 첫 발송 안내 미확인 시 발송할 수 없다.
- SENT 메시지는 수정할 수 없다.
- provider timeout은 retryable=true다.
- auth expired는 reconnect required와 retryable=false다.
- 발송 본문은 DB에는 저장되지만 structured log에는 남지 않는다.
- timeline 조회는 current user target만 반환한다.
