# /goal G02 FE Settings Profile Devices

## /goal 입력문

```text
User Web의 사이드바 설정 탭에서 개인 정보 조회, 개인 정보 수정, 등록 기기 조회를 구현해줘.

반드시 먼저 읽을 문서:
- AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/WORK-SPLIT.md
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md
- TODO/AUTH_FE_INTEGRATION_PLAN/BE-TODO/G01-BE-USER-PROFILE-DEVICES.goal.md
- FE/README.md
- FE/user-web/README.md
- FE/user-web/src/app/router/router.tsx
- FE/user-web/src/components/layout/app-shell.tsx
- FE/user-web/src/features/auth/*
- FE/user-web/src/lib/api-client.ts
- FE/user-web/src/pages/settings/index.tsx

작업 범위:
- FE/user-web
- 필요 시 FE/user-web/README.md

작업 목표:
1. 설정 사이드바 탭 또는 기존 설정 페이지를 실제 사용자 정보 화면으로 연결한다.
2. `GET /api/users/me/profile`로 개인 정보를 조회한다.
3. `PATCH /api/users/me/profile`로 이름만 수정한다.
4. `GET /api/users/me/devices`로 등록 기기를 조회한다.
5. 등록 기기 목록에서 현재 기기를 표시한다.
6. provider 연결 정보를 개인 정보 영역에 표시한다.
7. 이메일은 수정하지 못하게 읽기 전용으로 표시한다.
8. role/status는 읽기 전용으로 표시한다.
9. 등록 기기 생성/수정/교체 UI는 만들지 않는다.
10. 계정 삭제 UI는 만들지 않는다.
11. user settings UI는 만들지 않는다.
12. 기존 인증/회원가입 흐름은 수정하지 않는다.

사용 API:

GET /api/users/me/profile
- 개인 정보 조회
- Authorization: Bearer <backend_app_access_token>

PATCH /api/users/me/profile
- 이름 수정
- Authorization: Bearer <backend_app_access_token>
- body: { "name": "홍길동" }

GET /api/users/me/devices
- 등록 기기 조회
- Authorization: Bearer <backend_app_access_token>

UI 요구:
- 설정 화면 첫 영역은 개인 정보다.
- 개인 정보에는 이름, 이메일, 권한, 계정 상태, 마지막 로그인, 가입일, 연결 provider를 보여준다.
- 이름은 inline edit 또는 작은 form으로 수정할 수 있다.
- 저장 성공 후 profile query를 갱신한다.
- 등록 기기 영역에는 slot, label, lastSeenAt, activeSessionCount, isCurrentDevice를 보여준다.
- slot 라벨은 모바일, 개인 노트북, 회사 노트북으로 표시한다.
- `isCurrentDevice`는 현재 기기 badge로 표시한다.
- 기기 액션 버튼은 표시하지 않는다.

구현 제한:
- BE 코드를 수정하지 않는다.
- auth exchange/refresh/logout 로직을 재구현하지 않는다.
- Supabase provider login UI를 이 goal에서 수정하지 않는다.
- Company/Contact/Product/Deal/Schedule 등 도메인 화면을 수정하지 않는다.
- 계정 삭제, 기기 해제, 기기명 수정, user settings 기능을 추가하지 않는다.

에러 처리:
- 401은 기존 api client의 refresh 흐름에 맡긴다.
- 403 `InactiveUser`는 로그아웃 또는 로그인 화면 이동으로 처리한다.
- profile 저장 validation 오류는 form 메시지로 표시한다.
- devices 조회 실패는 등록 기기 영역의 오류 상태로 표시한다.

검증:
- pnpm.cmd run typecheck
- pnpm.cmd run lint
- 가능한 경우 pnpm.cmd run build
- 기존 e2e가 설정 화면을 smoke한다면 API mock 또는 auth mode에 맞춰 깨지지 않게 조정한다.

완료 보고:
- 수정한 파일 요약
- 설정 화면에 연결한 API 목록
- 실행한 검증 명령과 결과
- 실제 Backend/인증 준비가 필요해 수동 검증으로 남긴 항목
```

## 체크리스트

- [ ] 설정 페이지가 개인 정보와 등록 기기 영역으로 구성된다.
- [ ] profile 조회 API helper가 있다.
- [ ] profile 수정 API helper가 있다.
- [ ] devices 조회 API helper가 있다.
- [ ] 이름 수정 form이 있다.
- [ ] 이메일은 읽기 전용이다.
- [ ] provider 연결 정보가 보인다.
- [ ] 등록 기기 목록이 보인다.
- [ ] 현재 기기 badge가 보인다.
- [ ] 계정 삭제 UI가 없다.
- [ ] user settings UI가 없다.
- [ ] 기기 수정/해제 UI가 없다.
- [ ] FE 검증 명령을 통과했다.

## 범위 밖

- Auth provider 로그인 버튼 구현
- OAuth callback 구현
- refresh token rotation 구현
- BE API 구현
- User/Auth DDL
- 영업 도메인 화면 복구
