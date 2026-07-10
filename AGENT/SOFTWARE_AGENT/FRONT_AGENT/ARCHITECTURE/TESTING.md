# Front Testing Architecture

## 1. 목적

MVP Frontend 테스트 자동화는 User Web 핵심 업무 흐름을 우선한다. Admin Web은 관리자 페이지 본 구현 전까지 권한 확인 smoke 범위로만 유지한다.

- `FE/user-web`
- `FE/admin-web`

Playwright는 두 앱의 E2E 도구다. 저장소 루트에 workspace나 공용 테스트 패키지를 만들지 않으므로 각 Frontend 앱이 자기 테스트 의존성과 설정을 소유한다.

## 2. User Web E2E Scope

User Web E2E는 개인 영업자의 핵심 workflow를 우선한다.

우선순위:

- login and protected routing
- company CRUD
- contact CRUD
- product CRUD
- deal create/update/stage change
- deal following action and memo log
- schedule CRUD and entity connection
- meeting note save and deal connection
- company/contact/product/deal domain xlsx download smoke
- trash/restore smoke flow

후속 자동화 범위:

- business card OCR upload flow with mocked AI/OCR result
- Excel/CSV import flow with mocked AI column mapping
- generic ExportJob flow is not part of the current product direction

Auth E2E 기준:

- 개발용 mock login 버튼은 제거되었으므로 E2E는 현재 로그인 UI의 Kakao/Google provider 버튼 노출과 보호 라우트 redirect를 기준으로 한다.
- 자동 E2E는 Google provider 버튼이 현재 로그인 페이지를 유지한 채 OAuth authorize URL을 popup으로 여는지 확인한다.
- 실제 Google OAuth credential 검증은 자동 E2E 기본 범위가 아니라 별도 수동/provider smoke 범위다.
- Kakao OAuth는 Kakao Developers `account_email` 동의항목 설정 전까지 실패를 제품 기능 회귀로 보지 않고 provider 설정 이슈로 기록한다.
- 로그아웃 smoke는 선호 locale의 login URL 이동과 보호 라우트 재접근 차단을 확인한다. 예: `/ko/login`, `/en-us/login`.

## 3. Admin Web E2E Scope

Admin Web E2E는 현재 login, role guard, `/admin/api/me` 기반 보호 라우트 검증만 우선한다. 운영 안전성과 전체 데이터 조회 흐름은 관리자 페이지 본 구현 후 추가한다.

현재 우선순위:

- admin login and role guard

후속 우선순위:

- user list and user detail
- global company/contact/product/deal lists
- per-user company/contact/product/deal view
- sensitive field masking by default
- raw sensitive data view requires reason
- audit log record appears after audited action
- manual payment status management when the payment admin feature is added

## 4. External Services

Frontend E2E는 기본적으로 유료 또는 불안정한 외부 서비스를 직접 호출하지 않는다.

Mock 또는 stub 대상:

- OpenAI
- OCR provider
- Google Calendar
- email/browser push

## 5. CI Direction

CI가 도입되면 다음 위치에서 테스트를 실행한다.

- User Web Playwright: `FE/user-web`
- Admin Web Playwright: `FE/admin-web`

CI timing:

- Pull request: User Web smoke E2E and Admin auth smoke E2E
- After merge to `main`: User Web full E2E
- Before deployment: User Web full E2E
- Admin full E2E is added after Admin pages and Backend operation query APIs are implemented.

## 5A. 2026-07-10 검증 상태

2026-07-10 기준 Frontend 검증 상태는 다음이다.

- FE/user-web `typecheck`, `lint`, `build`, `test:e2e` 통과.
- FE/user-web E2E는 핵심 업무 smoke 1건 통과.
- URL locale smoke 통과: `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca`.
- 핵심 업무 happy path 수동 QA 통과: 로그인, 회사, 담당자, 제품, 딜, 일정, 회의록, 명함 OCR, Import, Search, Trash, Domain XLSX Export, 설정/더보기.
- FE/admin-web 선택 점검 `typecheck`, `lint`, `build` 통과.
- Admin 운영 화면 E2E는 관리자 페이지 본 구현 전까지 release gate로 보지 않는다.

남은 출시 전 Front QA는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge 브라우저 QA다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
