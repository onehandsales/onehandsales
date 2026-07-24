# G07 Follow-up Draft Send Backend

상태: Ready
완료일:

## 1. 목적

AI follow-up suggestion에서 email/SMS draft를 만들고, 사용자가 수정한 내용을 즉시 발송하고, 실패 재시도와 이력 조회를 구현한다.

## 2. 선행 조건

- G06이 완료되어 발송자 준비 상태를 조회할 수 있다.
- `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`를 먼저 읽는다.
- `COMMON/FOLLOW_UP_DELIVERY_BUSINESS-LOGIC.md`를 먼저 읽는다.
- `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`의 suggestion 계약을 확인한다.

## 3. 포함 범위

- `POST /api/follow-up-messages/drafts`
- `PATCH /api/follow-up-messages/:messageId`
- `GET /api/follow-up-messages/:messageId`
- `POST /api/follow-up-messages/:messageId/send`
- `POST /api/follow-up-messages/:messageId/retry`
- `GET /api/follow-up-messages`
- AI draft 생성 provider 호출
- email/SMS provider 발송 호출
- delivery attempt와 timeline target 저장
- safe failure와 제한적 auto retry hook

## 4. 제외 범위

- provider connection 설정 API
- User Web compose 화면
- 예약 발송
- 여러 채널 동시 발송
- campaign/bulk 발송

## 5. Business Logic

- draft 생성은 `FOLLOW_UP` suggestion만 허용한다.
- 수신자는 meeting note 참석자와 linked deal contacts 기반 후보 안에서만 허용한다.
- channel은 `EMAIL` 또는 `SMS` 하나만 선택한다.
- draft 언어는 compose의 `languageTag`를 따른다.
- SMS body는 1~2 segment 제한을 검증한다.
- 사용자가 subject/body/recipient를 확인하고 수정한 뒤에만 send 가능하다.
- 첫 발송 안내 미확인 시 send를 막는다.
- email은 연결된 사용자 본인 provider account만 사용한다.
- SMS는 인증된 사용자 발신번호만 사용한다.
- provider 발송 호출은 transaction 밖에서 수행한다.
- 성공/실패 결과는 message와 delivery attempt에 저장한다.
- 발송 본문 전체는 `FollowUpMessage`에 영구 저장한다.
- structured log에는 subject/body와 provider raw response를 남기지 않는다.

## 6. Error/Observability

- `FollowUpConsentNoticeRequired`
- `FollowUpEmailReconnectRequired`
- `FollowUpSmsSenderNotVerified`
- `FollowUpInvalidRecipient`
- `FollowUpMessageAlreadySent`
- `FollowUpSmsBodyTooLong`
- `followUp.draft.created`
- `followUp.message.sent`
- `followUp.message.failed`
- `followUp.message.retryRequested`

## 7. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- follow-up
pnpm run build
```

## 8. 완료 기준

- draft, send success, send failure, retry, list/detail 테스트가 통과한다.
- send/retry 중복 요청이 중복 발송으로 이어지지 않는다.
- 발송 이력이 AI report와 Deal/Contact/MeetingNote/Schedule target으로 조회 가능하다.

## 9. 작업 로그 경로

- `TODO_LOG/<date>/G07_FOLLOW_UP_DRAFT_SEND_BACKEND/WORK_LOG.md`
