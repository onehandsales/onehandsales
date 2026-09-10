# API Spec

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

상태: Confirmed
최종 업데이트: 2026-07-22

## 문서

- `GOOGLE_CALENDAR_INTEGRATION_API.md`

## 적용 원칙

- Backend 구현 전 이 spec을 먼저 읽는다.
- 이 spec과 `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md`가 충돌하면 이 spec을 우선하고 나머지 문서를 함께 수정한다.
- Google provider raw response, token, authorization code는 response/log/test snapshot에 남기지 않는다.
