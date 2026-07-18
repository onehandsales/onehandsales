# Admin Web TODO

이번 `USER_WEB_UXUI_COMMON_QA_PLAN`에서 Admin Web은 작업 대상이 아니다.

## 판단

- Admin Web은 현재 `GET /admin/api/me`와 보호 route smoke 중심이다.
- 운영 화면은 route에서 root redirect 상태다.
- Admin 운영 UX/UI QA는 Admin API와 운영 화면 구현 계획이 생긴 뒤 별도 계획으로 다룬다.
- Admin 운영 화면이 후속으로 구현될 때도 `Notion + Attio` reference 중 workspace/page/table/detail 패턴은 참고하되, User Web의 개인 영업 record UX를 그대로 복제하지 않고 운영 콘솔 기준으로 별도 계획을 만든다.

## 이번 계획에서 하지 않는 것

- Admin dashboard 구현
- Admin users/domain/audit/sensitive raw 화면 구현
- Admin Web E2E 갱신
- Admin 운영 UX/UI QA

## 예외

User Web UX/UI 작업 중 공통 CSS나 shared config가 Admin Web build를 깨뜨릴 가능성이 있으면 `FE/admin-web`의 `typecheck`, `lint`, `build`를 선택적으로 실행한다.
