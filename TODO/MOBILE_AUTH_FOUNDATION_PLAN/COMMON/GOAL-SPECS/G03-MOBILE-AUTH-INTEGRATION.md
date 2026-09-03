# G03-MOBILE-AUTH-INTEGRATION

## 1. 목적

Backend 모바일 인증 API와 Mobile App 인증 흐름을 통합 검증하고 완료 기록을 남긴다.

## 2. 검증 범위

- Backend `/api/auth/mobile/exchange`
- Backend `/api/auth/mobile/refresh`
- Backend `/api/auth/mobile/logout`
- Mobile App 앱 시작 세션 복구
- Mobile App 로그인/회원가입 provider 진입
- Mobile App `/api/me` 호출
- Mobile App 최소 `HomeScreen`
- refresh 복구 후 HomeScreen 기기 정보 표시
- Mobile App logout
- token 저장 위치와 로그 노출 금지

## 3. 검증 기준

- cookie 기반 웹 refresh API와 모바일 body refresh API가 섞이지 않는다.
- 모바일 refresh token 원문은 secure storage 외부에 없다.
- access token은 memory-only다.
- `/api/me` 호출은 Backend app access token으로 수행된다.
- refresh 복구 후에도 현재 native mobile device 정보가 표시된다.
- `/admin/api/*` 호출이 없다.
- OAuth provider raw error와 token 원문이 화면/로그/문서에 남지 않는다.

## 4. 완료 기준

- G01과 G02 체크리스트가 완료되어 있다.
- BE/FE 검증 명령 결과가 기록되어 있다.
- 통합 smoke 결과가 `TODO_LOG/YYYY-MM-DD/G03_MOBILE_AUTH_INTEGRATION/WORK_LOG.md`에 기록되어 있다.
- 남은 이슈가 있으면 후속 계획 또는 이슈 로그로 분리되어 있다.
