# FE-TODO

이 폴더는 `USER_WEB_UXUI_COMMON_QA_PLAN`의 Frontend 작업을 관리한다.

주 작업 대상은 `FE/user-web`이다.

## 문서

- `USER-WEB-TODO.md`: User Web 작업 목록
- `ADMIN-WEB-TODO.md`: Admin Web 범위 판단

## 원칙

- User Web은 `/api/*`만 호출한다.
- `/admin/api/*` 호출은 금지한다.
- 서버 상태는 TanStack Query로 유지한다.
- form은 React Hook Form과 Zod 기준을 유지한다.
- 새 기능보다 layout, 상태, 문구, 접근성, 입력 UX 정리를 우선한다.
- 모든 화면 작업은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`를 기준으로 한다.
- row/card/list/detail/create flow는 고정 sales record와 linked record 맥락을 약화하지 않는다.
