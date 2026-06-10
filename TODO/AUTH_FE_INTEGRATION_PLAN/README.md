# Auth FE Integration Plan

## 목적

현재 Backend에만 구현되어 있는 Supabase Auth token exchange 기반 로그인/회원가입 방식을 Frontend가 구현할 수 있도록 실행 문서를 분리한다.

이 계획은 Auth/User 연동만 다룬다. Company, Contact, Product, Deal, Schedule 같은 영업 도메인 화면과 API 연동은 범위 밖이다.

## 현재 Backend 기준

- Backend 회원가입은 별도 `/signup` API가 아니라 `POST /api/auth/exchange`에서 자동 처리된다.
- Frontend는 Supabase Auth로 provider 로그인을 끝낸 뒤 Supabase access token을 Backend로 교환한다.
- Backend는 자체 App access token을 응답하고, refresh token은 httpOnly cookie로 설정한다.
- 이후 Frontend의 Backend API 요청은 `Authorization: Bearer <app_access_token>`을 사용한다.

## 문서 구조

```text
TODO/AUTH_FE_INTEGRATION_PLAN/
  README.md
  COMMON/
    README.md
    AUTH-FE-CONTRACT.md
  FE-TODO/
    README.md
    G01-AUTH-FE-INTEGRATION.goal.md
  BE-TODO/
    README.md
```

## 실행 순서

1. `COMMON/AUTH-FE-CONTRACT.md`를 먼저 읽고 FE/BE 인증 계약을 고정한다.
2. `FE-TODO/G01-AUTH-FE-INTEGRATION.goal.md`를 `/goal` 입력으로 실행한다.
3. 구현 중 Backend 계약이 맞지 않으면 FE에서 임의 보정하지 말고 이 계획 문서에 불일치 항목을 기록한다.

## 완료 기준

- User Web과 Admin Web이 Supabase 로그인 후 Backend token exchange를 수행한다.
- Backend App access token은 memory에만 저장된다.
- refresh token은 JavaScript에서 읽지 않고 httpOnly cookie로만 운용된다.
- 401 발생 시 `/api/auth/refresh`로 access token을 갱신하고 원 요청을 1회 재시도한다.
- `DeviceSlotAlreadyRegistered`는 기기 교체 확인 UI를 거쳐 재시도한다.
- `/api/me`와 `/admin/api/me` 기준으로 route guard가 동작한다.
