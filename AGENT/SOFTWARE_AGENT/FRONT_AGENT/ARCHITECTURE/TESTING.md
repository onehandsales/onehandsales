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

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
