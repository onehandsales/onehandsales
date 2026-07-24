# G08 Follow-up User Web

상태: Ready
완료일:

## 1. 목적

User Web에서 follow-up 설정, AI report compose 진입, email/SMS 수정/발송, 실패 재시도, timeline 이력을 구현한다.

## 2. 선행 조건

- G07 API가 구현되었거나 stable mock이 준비되어 있다.
- `FE-TODO/FOLLOW_UP_DELIVERY_USER-WEB-TODO.md`를 먼저 읽는다.
- `COMMON/FOLLOW_UP_DELIVERY_USER-FLOW.md`를 먼저 읽는다.
- UX/UI 기준은 `AGENT/UXUI_AGENT`를 따른다.

## 3. 포함 범위

- settings provider connection UI
- Gmail/Microsoft connect/disconnect flow
- SMS sender number request/verify/revoke flow
- AI report follow-up suggestion에서 compose 진입
- channel/language/recipient 선택
- subject/body edit
- 첫 발송 안내 dialog
- send/retry state
- AI report와 Deal/Contact timeline 발송 이력 표시
- mobile layout

## 4. 제외 범위

- Admin 비용 화면
- 예약 발송
- campaign/bulk 발송
- onehand.sales branding 삽입

## 5. UX 계약

- 설정 화면에서 Gmail/Microsoft 연결 상태와 재연결 필요 상태를 명확히 보여준다.
- SMS 발신번호는 E.164 입력, 인증 code 입력, 해제 상태를 지원한다.
- AI report 화면에서는 provider 미연결 시 설정 화면으로 이동할 수 있게 안내한다.
- compose 화면은 recipient, channel, language, subject/body를 한 화면에서 확인/수정할 수 있다.
- SMS는 segment count와 초과 error를 즉시 보여준다.
- 첫 발송 안내는 channel별 1회만 표시한다.
- 발송 중에는 중복 클릭을 막는다.
- 실패 시 safe error와 재시도 가능 여부를 보여준다.
- 발송 이력 목록은 page-number pagination을 따른다.
- 사용자 문구는 해요체를 쓴다.

## 6. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

필요 시:

```powershell
cd FE/user-web
pnpm run test:e2e:mobile
```

## 7. 완료 기준

- desktop/mobile에서 settings, compose, send success, send failure, retry, timeline 상태가 확인된다.
- 05-A 화면과 연결했을 때 기존 AI report 기능이 깨지지 않는다.
- User Web은 `/admin/api/*`를 호출하지 않는다.

## 8. 작업 로그 경로

- `TODO_LOG/<date>/G08_FOLLOW_UP_USER_WEB/WORK_LOG.md`
