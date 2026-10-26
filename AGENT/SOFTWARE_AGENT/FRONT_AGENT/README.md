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
- CRM Core 공통 View 헤더·보기 선택

2026-10-26 User Web의 crm-view feature에 Object/List 공통 헤더의 서버 조회·보기 목록·선택 표시를 연결했다. AppShell이 헤더 모델을 한 번 만들고 두 반응형 헤더가 동일 선택 상태를 공유한다. 업무목록 경로와 Sidebar 링크를 추가했으며, 기존 Object 본문과 오른쪽 도구는 유지한다. [소비 계약·구현·검증](../../../TODO/DONE/VIEW_HEADER_FRONTEND_INTEGRATION_PLAN/README.md)을 따른다. View 생성/설정 저장·즐겨찾기 쓰기·타입별 본문은 후속 범위다.

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
