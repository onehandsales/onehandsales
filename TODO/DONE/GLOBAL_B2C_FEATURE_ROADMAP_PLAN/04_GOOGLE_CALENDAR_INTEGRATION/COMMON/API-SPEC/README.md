# API Spec

상태: Confirmed
최종 업데이트: 2026-07-22

## 문서

- `GOOGLE_CALENDAR_INTEGRATION_API.md`

## 적용 원칙

- Backend 구현 전 이 spec을 먼저 읽는다.
- 이 spec과 `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md`가 충돌하면 이 spec을 우선하고 나머지 문서를 함께 수정한다.
- Google provider raw response, token, authorization code는 response/log/test snapshot에 남기지 않는다.
- 기존 Schedule API와 Trash API 변경은 breaking change로 취급하고 FE 타입과 테스트를 함께 갱신한다.
