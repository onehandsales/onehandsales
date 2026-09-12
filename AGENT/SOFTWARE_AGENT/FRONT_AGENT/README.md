# Front Agent

## 1. 목적

Frontend Agent는 User Web과 Admin Web의 구현 구조, route, feature boundary, 상태 관리, E2E, 배포 기준을 관리한다.

## 2. User Web 현재 활성 범위

- Auth/User
- Home(`/app`)
- More(`/app/more`)
- Account Settings Modal
- Help Error Report
- Help Support Request
- Public Contact Request
- Public Site

## 3. Admin Web 현재 활성 범위

- access token 입력
- `GET /admin/api/me` 권한 확인
- 최소 보호 화면

## 4. 비활성 범위

현재 활성 User Web CRM 화면이 아니다.

- 고정형 Contact/Product/Deal 화면
- 고정형 통합 검색
- xlsx export
- schedule/meeting-note/trash 자리만 남은 feature folder

## 5. 후속 CRM Core

후속 Frontend 설계는 `ARCHITECTURE/CRM_CORE_FRONTEND.md`를 따른다.

후보 feature:

- `kit`
- `workspace`
- `crm-object`
- `record`
- `record-relationship`

실제 구현 전에는 UXUI first use flow, record UX, API 계약이 먼저 필요하다.

## 6. 검증

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- 필요한 Playwright smoke

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md`
- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
