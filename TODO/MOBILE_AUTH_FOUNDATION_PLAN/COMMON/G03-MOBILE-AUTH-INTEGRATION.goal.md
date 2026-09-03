# /goal G03-MOBILE-AUTH-INTEGRATION

## 1. Goal

Backend 모바일 인증 API와 Mobile App 인증 흐름을 통합 검증하고 완료 기록을 남긴다.

## 2. 선행 조건

- `G01-BE-MOBILE-AUTH-API` 완료
- `G02-FE-MOBILE-AUTH-APP` 완료

## 3. 먼저 읽을 문서

- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/README.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/SCOPE.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/USER-FLOW.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/API-SPEC/MOBILE_AUTH_API.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/GOAL-SPECS/G03-MOBILE-AUTH-INTEGRATION.md`
- `TODO/MOBILE_AUTH_FOUNDATION_PLAN/COMMON/PLANNING-REVIEW.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

## 4. 작업 체크리스트

- [ ] Backend `/api/auth/mobile/exchange` 계약과 구현을 대조한다.
- [ ] Backend `/api/auth/mobile/refresh` 계약과 구현을 대조한다.
- [ ] Backend `/api/auth/mobile/logout` 계약과 구현을 대조한다.
- [ ] 기존 웹 `/api/auth/*` cookie 흐름이 유지되는지 확인한다.
- [ ] Mobile App API client가 `/api/auth/mobile/*`를 호출하는지 확인한다.
- [ ] Mobile App이 `/admin/api/*`를 호출하지 않는지 확인한다.
- [ ] 앱 시작 signedOut 흐름을 확인한다.
- [ ] 앱 시작 refresh 성공 흐름을 확인한다.
- [ ] refresh 성공 후 현재 native mobile device 정보가 HomeScreen에 표시되는지 확인한다.
- [ ] 앱 시작 refresh 실패 흐름을 확인한다.
- [ ] OAuth 성공 또는 mock token 기반 exchange 흐름을 확인한다.
- [ ] `/api/me` 성공 후 최소 HomeScreen 표시를 확인한다.
- [ ] logout 후 Backend session revoke와 local token 삭제를 확인한다.
- [ ] secure storage 외부에 `mobileRefreshToken` 원문이 없는지 확인한다.
- [ ] access token이 영구 저장소에 남지 않는지 확인한다.
- [ ] token 원문이 로그, analytics, crash report, error message에 남지 않는지 확인한다.
- [ ] BE 검증 명령을 재실행한다.
- [ ] Mobile App 검증 명령을 재실행한다.
- [ ] `TODO_LOG` 완료 기록을 작성한다.

## 5. Acceptance Criteria

- 모바일 앱이 Backend `AuthSession` 기반으로 로그인 상태를 만들고 복구한다.
- refresh token 원문은 secure storage에만 있다.
- access token은 메모리에만 있다.
- `/api/me` 호출은 OneHand app access token으로 수행된다.
- refresh 복구만으로 진입한 HomeScreen에서도 현재 native mobile device 정보가 표시된다.
- 로그아웃 후 같은 access token 또는 refresh token으로 보호 API를 사용할 수 없다.
- 기존 User Web/Admin Web 인증 API 회귀가 없다.
- 완료 로그에 검증 명령과 결과가 남아 있다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G03_MOBILE_AUTH_INTEGRATION/WORK_LOG.md
```
