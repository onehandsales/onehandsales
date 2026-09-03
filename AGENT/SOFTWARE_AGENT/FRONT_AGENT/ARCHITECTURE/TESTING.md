# Front Testing Architecture

## 1. 목적

MVP Frontend 테스트 자동화는 User Web 핵심 업무 흐름을 우선한다. Admin Web은 11 Admin Operation 기준 현재 운영 route smoke를 별도 Playwright 파일로 유지한다.

- `FE/user-web`
- `FE/admin-web`

React Native/Expo Mobile App 테스트 기준은 `FRONT_AGENT`가 아니라 `AGENT/SOFTWARE_AGENT/MOBILE_AGENT`가 소유한다. FE 전체 출시 QA에서 Mobile App 인증 foundation을 확인해야 하면 `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`와 `MOBILE_AGENT` 테스트 문서를 함께 본다.

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

- 개발용 mock login 버튼은 제거되었으므로 E2E는 현재 로그인 UI의 Google/LINE/Apple provider 버튼 노출과 보호 라우트 redirect를 기준으로 한다.
- 자동 E2E는 provider 버튼이 현재 로그인 페이지를 유지한 채 OAuth authorize URL을 popup으로 여는지 확인한다.
- 실제 Google/LINE/Apple OAuth credential 검증은 자동 E2E 기본 범위가 아니라 별도 수동/provider smoke 범위다.
- Kakao OAuth는 로그인 기능에서 제거되어 E2E/provider QA 대상이 아니다.
- Provider QA는 Google, LINE, Apple 순서의 버튼 노출, popup/redirect fallback, Backend exchange 성공/실패, provider email 없음 차단, verified email linking 수동 smoke 또는 환경 미구성 N/A 기록을 포함한다.
- 로그아웃 smoke는 선호 locale의 login URL 이동과 보호 라우트 재접근 차단을 확인한다. 예: `/ko/login`, `/en-us/login`.

## 3. Admin Web E2E Scope

Admin Web은 현재 `typecheck`, `lint`, `build`와 현재 route smoke E2E를 검증 후보로 둔다. `FE/admin-web/tests/e2e/admin-web-smoke.spec.ts`는 현재 Admin router 기준으로 non-admin 차단, 사용자 overview, 도메인 탭 reason modal, provider failure, analytics, account request, Trash recovery request, system gate를 확인한다.

G05 문서 closeout의 필수 gate는 `typecheck`, `lint`, Admin Web `/api/*` 정적 검색, `git diff --check`다. Playwright E2E는 현재 route 상태와 충돌하지 않는 smoke test로 유지한다.

현재 우선순위:

- admin login and role guard
- current active Admin route smoke
- sensitive field masking by default
- raw sensitive data view requires reason
- audit log record appears after audited action
- provider failure, analytics, account request, Trash recovery request, system gate smoke

후속 우선순위:

- global company/contact/product/deal lists
- Billing Admin and customer tenant admin route smoke
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
- Admin Web Playwright: `FE/admin-web`. 현재 11 Admin route smoke 파일을 유지한다.

CI timing:

- Pull request: User Web smoke E2E. Admin Web은 route 변경 또는 Admin 운영 화면 변경이 있을 때 current route smoke E2E를 실행한다.
- After merge to `main`: User Web full E2E
- Before deployment: User Web full E2E
- Admin full E2E is expanded after Billing Admin, customer tenant admin, or direct mutation flows are implemented.

## 5A. 검증 상태 기록

2026-07-10 기준 Frontend 검증 상태는 다음이다.

- FE/user-web `typecheck`, `lint`, `build`, `test:e2e` 통과.
- FE/user-web E2E는 핵심 업무 smoke 1건 통과.
- 현재 노출 언어 URL locale smoke 대상: `ko`, `en-us`, `en-ca`. `ja`, `en-gb`, `en-sg`, `en-au`는 추후 확장 후보로만 보류한다.
- 핵심 업무 happy path 수동 QA 통과: 로그인, 회사, 담당자, 제품, 딜, 일정, 회의록, 명함 OCR, Import, Search, Trash, Domain XLSX Export, 설정/더보기.
- FE/admin-web `typecheck`, `lint`, `build` 선택 점검 통과. 이후 2026-08-09 G05 closeout에서 현재 Admin route smoke E2E도 통과 상태로 기록됨.

2026-08-09 G05 closeout 기준 FE/admin-web 검증 상태는 다음이다.

- FE/admin-web `typecheck`, `lint`, `test:e2e` 통과.
- FE/admin-web E2E는 현재 11 Admin route smoke 기준으로 유지한다.

2026-08-11 기준 Global B2C 01~11 Frontend foundation은 완료 archive다. 남은 출시 전 Web Front QA는 기존 기능 유지보수, UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge 브라우저 QA, 결제창 없는 100명 베타 준비다. 2026-09-03 기준 Mobile App 인증 foundation QA는 `MOBILE_AGENT`와 공통 QA 체크리스트를 따른다.

Paddle checkout, Billing Admin, B2B tenant/team admin route smoke는 `TODO/PADDLE_PLAN` 또는 B2B 계획이 confirmed 된 이후에 추가한다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
