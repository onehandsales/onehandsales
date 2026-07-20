# FE TODO

## 1. 목적

이 폴더는 `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` 중 `FE/user-web` 작업을 정리한다.

## 2. 대상 앱

- `FE/user-web`

Admin Web은 이번 계획의 운영 화면 QA 대상이 아니다. 일반 사용자 앱이 `/admin/api/*`를 호출하지 않는지 확인하는 보안 smoke만 포함한다.

## 3. 작업 문서

- `USER-WEB-TODO.md`: User Web release QA 작업
- `ADMIN-WEB-TODO.md`: Admin Web 제외 범위와 최소 확인 기준

## 4. 공통 FE 기준

- 서버 상태는 TanStack Query로 관리한다.
- API 호출은 `src/lib/api-client.ts`를 통한다.
- form validation은 React Hook Form + Zod를 따른다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- 모바일 record list는 table을 억지로 노출하지 않고 card/list로 확인한다.
- 기본 `pnpm run test:e2e`는 기존 smoke gate로 유지하고, release QA 전용 Playwright 설정은 별도 config/script로 분리한다.

