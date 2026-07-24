# G06 Follow-up Settings Backend

상태: Ready
완료일:

## 1. 목적

Gmail/Microsoft 365 연결, 연결 해제, 국제 SMS 발신번호 등록/인증/해제, 첫 발송 안내 확인 API를 구현한다.

## 2. 선행 조건

- G05가 완료되어 DB/model/provider port가 준비되어 있다.
- `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`를 먼저 읽는다.
- `COMMON/FOLLOW_UP_DELIVERY_BUSINESS-LOGIC.md`를 먼저 읽는다.
- 실제 provider smoke에는 Gmail/Microsoft/SMS provider env가 필요하다. env가 없으면 test double로 자동 테스트를 닫는다.

## 3. 포함 범위

- `GET /api/follow-up-delivery/settings`
- `POST /api/follow-up-delivery/email-connections/:provider/connect`
- `GET /api/follow-up-delivery/email-connections/:provider/callback`
- `POST /api/follow-up-delivery/email-connections/:connectionId/disconnect`
- `POST /api/follow-up-delivery/sms-sender-numbers`
- `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/verify`
- `POST /api/follow-up-delivery/sms-sender-numbers/:senderNumberId/revoke`
- `POST /api/follow-up-delivery/consent-notices/:channel/acknowledge`
- Backend unit/controller/application test

## 4. 제외 범위

- AI follow-up draft 생성
- email/SMS 실제 follow-up 발송
- User Web 설정 화면

## 5. Business Logic

- settings response는 email/phone을 masking해서 반환한다.
- OAuth connect는 provider enum과 redirectUri를 검증한다.
- OAuth state 원문은 DB에 저장하지 않고 hash만 저장한다.
- OAuth callback은 Bearer header가 없어도 state로 user를 복원하고 만료/재사용을 막는다.
- callback token 교환과 provider profile 조회는 transaction 밖에서 수행한다.
- token 저장과 state `consumedAt` 기록은 transaction 안에서 수행한다.
- SMS 인증 요청은 provider 발송 성공 뒤 `PENDING_VERIFICATION` row를 저장한다.
- SMS 인증 code 원문은 저장하지 않는다.
- revoke는 기존 발송 이력을 삭제하지 않는다.
- 첫 발송 안내 확인은 user/channel별 upsert로 저장한다.

## 6. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- follow-up
pnpm run build
```

## 7. 완료 기준

- OAuth state, SMS verification, consent notice 테스트가 통과한다.
- User Web 설정 화면이 이 API만으로 연결 상태를 표현할 수 있다.
- token/code/raw provider body가 log/response/test snapshot에 노출되지 않는다.

## 8. 작업 로그 경로

- `TODO_LOG/<date>/G06_FOLLOW_UP_SETTINGS_BACKEND/WORK_LOG.md`
