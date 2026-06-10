# Auth FE Integration Plan

## 목적

현재 Backend Auth/User 계약을 기준으로 FE와 BE가 겹치지 않게 작업할 수 있는 `/goal` 실행 문서를 둔다.

이 계획은 두 범위를 분리한다.

- 인증/회원가입 연동: Supabase Auth + Backend token exchange
- 로그인 이후 설정 탭: 개인 정보 조회/수정, 등록 기기 조회

Company, Contact, Product, Deal, Schedule 같은 영업 도메인은 범위 밖이다.

## 필수 선행 정본

이 계획의 모든 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

특히 API 계약과 goal 문서에는 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, 에러 응답, FE/BE 처리 기준을 상세하게 적는다.

## 문서 구조

```text
TODO/AUTH_FE_INTEGRATION_PLAN/
  README.md
  COMMON/
    README.md
    AUTH-FE-CONTRACT.md
    WORK-SPLIT.md
    API-SPEC/
      AUTH_USER_API_DETAIL.md
  FE-TODO/
    README.md
    G01-AUTH-FE-INTEGRATION.goal.md
    G02-FE-SETTINGS-PROFILE-DEVICES.goal.md
  BE-TODO/
    README.md
    G01-BE-USER-PROFILE-DEVICES.goal.md
```

## 실행 순서

1. `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`로 Software Agent 전체 정본 선행 참조 규칙을 확인한다.
2. `COMMON/WORK-SPLIT.md`로 FE/BE 책임 경계를 확인한다.
3. `COMMON/AUTH-FE-CONTRACT.md`로 Auth/FE 처리 계약을 확인한다.
4. `COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`로 요청값, 응답값, 내부 비즈니스 로직, DB 연결, 에러, FE/BE 처리 기준을 확인한다.
5. BE는 `BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md`를 실행한다.
6. FE는 인증 연동이 필요하면 `FE-TODO/G01-AUTH-FE-INTEGRATION.goal.md`를 실행한다.
7. FE는 설정 탭 구현이 필요하면 `FE-TODO/G02-FE-SETTINGS-PROFILE-DEVICES.goal.md`를 실행한다.

## 현재 범위

BE가 책임지는 API:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`

FE가 책임지는 화면:

- 설정 탭 개인 정보 조회
- 설정 탭 이름 수정
- 설정 탭 등록 기기 조회

현재 만들지 않는 기능:

- `GET/PATCH /api/users/me/settings`
- `DELETE /api/users/me`
- 기기 이름 수정
- 기기 해제
- 계정 영구 삭제
- 휴지통

## 완료 기준

- FE와 BE가 서로의 작업 영역을 침범하지 않는다.
- `COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`에 모든 API의 요청값, 응답값, 내부 비즈니스 로직이 적혀 있다.
- Backend 계약 문서와 실제 API shape가 일치한다.
- User Web 설정 탭은 개인 정보와 등록 기기 조회만 제공한다.
- 계정 삭제, user settings, 기기 수정 UI는 노출하지 않는다.
