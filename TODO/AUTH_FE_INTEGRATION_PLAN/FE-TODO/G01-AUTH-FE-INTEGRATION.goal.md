# /goal G01 Auth FE Integration

## /goal 입력문

```text
User Web과 Admin Web의 mock-only auth를 실제 Supabase Auth + Backend token exchange 방식으로 연결해줘.

반드시 먼저 읽을 문서:
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md
- FE/README.md
- FE/user-web/README.md
- FE/admin-web/README.md
- FE/user-web/src/features/auth/*
- FE/admin-web/src/features/auth/*
- FE/user-web/src/lib/api-client.ts
- FE/admin-web/src/lib/admin-api-client.ts

작업 범위:
- FE/user-web
- FE/admin-web
- FE 공통 문서가 필요하면 FE/README.md 또는 각 앱 README

작업 목표:
1. Supabase client 초기화에 필요한 env schema를 각 FE 앱 패턴에 맞게 추가한다.
2. User Web 로그인 화면에서 Backend `GET /api/auth/providers`를 읽고 enabled provider 로그인 버튼을 구성한다.
3. Admin Web 로그인 화면도 같은 provider 로그인 흐름을 사용하되, exchange 이후 `/admin/api/me`로 ADMIN 권한을 확인한다.
4. Supabase OAuth callback 처리 라우트를 추가하거나 기존 라우터 구조에 맞춰 구현한다.
5. Supabase session access token을 `POST /api/auth/exchange`에만 전달한다.
6. `POST /api/auth/exchange` 요청에는 `credentials: "include"`를 사용한다.
7. exchange 성공 후 Backend App access token만 memory에 저장한다.
8. Backend refresh token은 JavaScript에서 읽거나 저장하지 않는다.
9. API client가 401을 받으면 `POST /api/auth/refresh`를 `credentials: "include"`로 1회 호출하고, 성공 시 원 요청을 1회 재시도한다.
10. 동시에 여러 요청이 401을 받으면 refresh 요청은 하나만 실행되도록 shared promise 또는 queue로 처리한다.
11. logout은 `POST /api/auth/logout` 호출, memory token clear, Supabase signOut 순서로 처리한다. logout API가 401이어도 local state는 정리한다.
12. `DeviceSlotAlreadyRegistered` 응답은 교체 확인 UI를 보여주고, 사용자가 확인하면 `replaceExistingDevice: true`로 exchange를 재시도한다.
13. route guard는 User Web은 `/api/me`, Admin Web은 `/admin/api/me` 확인 결과를 기준으로 보호 라우트를 열어준다.
14. 기존 local mock auth는 필요하면 `VITE_AUTH_MODE=mock` 같은 명시적 모드로만 남기고, 기본 흐름은 실제 Supabase/Backend auth로 한다.

구현 제한:
- Supabase access token을 localStorage/sessionStorage에 저장하지 않는다.
- Backend App access token도 localStorage/sessionStorage에 저장하지 않는다.
- refresh token을 JS 상태로 저장하지 않는다.
- 일반 Backend API 인증에 Supabase access token을 사용하지 않는다.
- BE 코드는 수정하지 않는다.
- 영업 도메인 기능은 이번 goal에서 수정하지 않는다.

검증:
- pnpm typecheck
- pnpm lint
- 가능한 경우 각 FE 앱 build
- 기존 smoke/e2e가 auth mock에 고정되어 있으면 새 auth mode에 맞춰 테스트를 조정하거나, 실제 Supabase credential이 필요한 테스트는 수동 검증 항목으로 문서화한다.

완료 보고:
- 수정한 파일 요약
- 구현한 auth 흐름 요약
- 실행한 검증 명령과 결과
- 실제 Supabase credential/Backend DDL 준비가 필요해서 못 돌린 smoke가 있으면 명확히 기록
```

## 구현 상세 체크리스트

- [ ] User Web env에 API URL, Supabase URL, Supabase anon key, redirect URL, auth mode를 추가한다.
- [ ] Admin Web env에 API URL, Supabase URL, Supabase anon key, redirect URL, auth mode를 추가한다.
- [ ] Supabase client 생성 파일을 각 앱에 추가한다.
- [ ] provider login helper를 만든다.
- [ ] OAuth callback 처리 화면 또는 route를 만든다.
- [ ] stable device id 생성/조회 helper를 만든다.
- [ ] device slot 선택 또는 기본값 결정 UI를 만든다.
- [ ] token exchange API helper를 만든다.
- [ ] refresh API helper와 refresh queue를 만든다.
- [ ] logout API helper를 만든다.
- [ ] User Web AuthProvider를 Backend App token memory state 기준으로 교체한다.
- [ ] Admin Web AuthProvider를 Backend App token memory state와 ADMIN 권한 확인 기준으로 교체한다.
- [ ] User Web api client에 refresh-on-401을 연결한다.
- [ ] Admin Web api client에 refresh-on-401을 연결한다.
- [ ] User Web protected route가 `/api/me` 확인을 사용한다.
- [ ] Admin Web protected route가 `/admin/api/me` 확인을 사용한다.
- [ ] `DeviceSlotAlreadyRegistered` 확인 UI와 retry 흐름을 구현한다.
- [ ] logout 시 Backend logout, Supabase signOut, memory clear를 수행한다.
- [ ] README에 실제 auth env와 local mock mode 사용법을 기록한다.

## 수동 검증 시나리오

1. User Web에서 Google/Kakao/Naver provider 로그인 버튼을 누른다.
2. Supabase callback 후 Backend exchange가 호출된다.
3. exchange 응답의 App access token으로 `/api/me`가 성공한다.
4. 새로고침 후 memory token이 사라져도 `/api/auth/refresh`로 session이 복원된다.
5. logout 후 `/api/me`가 실패하고 로그인 화면으로 돌아간다.
6. 같은 slot에 다른 device id로 로그인하면 교체 확인 UI가 뜬다.
7. 교체 확인 시 기존 session이 revoke되고 새 device/session으로 로그인된다.
8. Admin Web에서 ADMIN 계정은 `/admin/api/me` 통과 후 dashboard에 들어간다.
9. 일반 USER 계정은 Admin Web에서 권한 없음 처리를 받는다.

## 참고 계약

- `TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md`
