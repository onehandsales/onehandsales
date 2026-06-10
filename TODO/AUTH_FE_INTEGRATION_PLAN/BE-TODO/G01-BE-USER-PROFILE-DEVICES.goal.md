# /goal G01 BE User Profile Devices

## /goal 입력문

```text
Backend에서 로그인 이후 설정 탭에 필요한 User API와 User/Auth DDL 기준을 정리하고 검증해줘.

반드시 먼저 읽을 문서:
- TODO/SOFTWARE_AGENT_REFERENCE.md
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/WORK-SPLIT.md
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md
- BE/ARCHITECTURE.md
- BE/prisma/schema.prisma
- BE/src/modules/auth/**
- BE/src/modules/user/**

작업 범위:
- BE/prisma/schema.prisma
- BE/prisma/seed.ts
- BE/src/modules/user
- BE/src/modules/auth 중 User 응답 shape에 필요한 부분
- BE 문서
- TODO/AUTH_FE_INTEGRATION_PLAN/COMMON/AUTH-FE-CONTRACT.md

작업 목표:
1. User/Auth DB 기준은 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`만 남긴다.
2. `UserSetting` 모델과 settings API가 없음을 확인한다.
3. `User.permanentDeleteAt`이 없음을 확인한다.
4. `DELETE /api/users/me` 계정 삭제 API가 없음을 확인한다.
5. `GET /api/users/me/profile`을 제공한다.
6. `PATCH /api/users/me/profile`을 제공한다.
7. `GET /api/users/me/devices`를 제공한다.
8. 개인 정보 수정은 현재 `name`만 허용한다.
9. 등록 기기 조회는 ACTIVE 기기만 반환한다.
10. 등록 기기 생성/갱신/교체는 `POST /api/auth/exchange`에 그대로 둔다.
11. 기존 인증/회원가입 흐름은 수정하지 않는다.
12. FE 계약 문서가 실제 BE 응답 shape와 맞는지 갱신한다.

API 계약:

GET /api/users/me/profile
- AuthGuard 필요
- 현재 사용자 개인 정보와 연결 provider 목록 반환
- 응답 필드: id, email, name, role, status, lastLoginAt, createdAt, updatedAt, oauthAccounts

PATCH /api/users/me/profile
- AuthGuard 필요
- body: { "name": string | null }
- name은 최대 80자
- 빈 문자열은 null로 정규화
- 응답은 profile 조회와 동일

GET /api/users/me/devices
- AuthGuard 필요
- 현재 사용자의 ACTIVE AuthDevice 목록 반환
- 각 기기는 id, slot, label, status, lastSeenAt, createdAt, updatedAt, activeSessionCount, isCurrentDevice를 포함

구현 제한:
- FE 코드를 수정하지 않는다.
- Supabase OAuth provider 설정을 수정하지 않는다.
- `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`의 인증 흐름을 재설계하지 않는다.
- 기기명 수정 API를 추가하지 않는다.
- 기기 해제 API를 추가하지 않는다.
- 계정 삭제 API를 추가하지 않는다.
- user settings API를 추가하지 않는다.

검증:
- pnpm.cmd run prisma:validate
- pnpm.cmd run prisma:generate
- pnpm.cmd run typecheck
- pnpm.cmd run lint
- pnpm.cmd run test
- pnpm.cmd run build
- rg로 UserSetting/settings/permanentDeleteAt/DELETE /api/users/me 참조가 남지 않았는지 확인

완료 보고:
- 유지된 API와 제거된 API 요약
- 변경된 schema 요약
- 실행한 검증 명령과 결과
- FE가 사용해야 할 최종 API 목록
```

## 체크리스트

- [ ] schema에서 `UserSetting`이 없다.
- [ ] schema에서 `User.permanentDeleteAt`이 없다.
- [ ] User module에서 settings use case/controller/dto가 없다.
- [ ] User module에서 account delete use case/controller가 없다.
- [ ] profile 조회 API가 있다.
- [ ] profile 수정 API가 있다.
- [ ] devices 조회 API가 있다.
- [ ] Auth token response에 `settings`가 없다.
- [ ] contract 문서가 최신 응답 shape와 맞다.
- [ ] Backend 검증 명령을 통과했다.

## 범위 밖

- FE 설정 화면 구현
- FE auth client 구현
- 계정 삭제 정책
- 기기명 수정/기기 해제
- 영업 도메인 API
