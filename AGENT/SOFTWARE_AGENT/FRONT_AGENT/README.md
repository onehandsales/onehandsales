# FRONT_AGENT

## 1. 목적

`FRONT_AGENT`는 User Web과 Admin Web의 Frontend 구현 방향과 엔지니어링 기준을 책임지는 문서 영역이다.

User Web, Admin Web, 화면 상태 관리, API client 경계, 폼 검증, E2E, frontend 배포 기준은 이 폴더를 기준으로 판단한다.

## 2. 관리 범위

- User Web 아키텍처
- Admin Web 아키텍처
- Frontend 코드 컨벤션
- Frontend 주석/로깅 규칙
- User Web과 Admin Web의 API client 분리
- TanStack Query, React Hook Form, Zod 기준
- Playwright E2E 기준
- Vercel 배포 기준
- Frontend 기술 결정 기록

## 3. 폴더 구조

```text
FRONT_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
  CONVENTION/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `ARCHITECTURE/FRONTEND_USER_WEB.md`
2. `ARCHITECTURE/ADMIN_WEB.md`
3. `ARCHITECTURE/TESTING.md`
4. `ARCHITECTURE/DEPLOYMENT.md`
5. `CONVENTION/FRONTEND_USER_WEB.md`
6. `CONVENTION/ADMIN_WEB.md`
7. `CONVENTION/COMMENT_AND_LOGGING.md`
8. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 작업 원칙

- PM의 MVP 범위와 UXUI_AGENT의 화면 흐름을 먼저 확인한다.
- User Web과 Admin Web은 별도 앱으로 유지한다.
- User Web은 `/api/*`만 호출한다.
- Admin Web은 `/admin/api/*`만 호출한다.
- 서버 상태는 TanStack Query로 관리한다.
- 폼 검증은 React Hook Form과 Zod를 기준으로 한다.
- 실제 Backend 미구현 영역은 mock/placeholder 경계를 문서와 코드에서 명확히 둔다.
- 2026-07-18 PM 전략 기준으로, 지금은 새 기능 화면을 늘리기보다 User Web의 UX/UI 공통 QA와 모바일 브라우저 QA를 먼저 진행한다.

## 6. 현재 구현 스냅샷

Snapshot date: 2026-07-10

User Web:

- 실제 API 연동 완료: URL locale Public/Auth site, Auth/User, Home(`/app`), Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote manual CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal domain xlsx export.
- mock/placeholder 경계: generic Export route/API, Notification.
- Auth/User: 개발용 mock login은 제거되었고, Supabase OAuth provider login과 Backend token exchange가 정본이다. Public/auth canonical URL은 `/{locale}` 계열을 사용하고 기존 `/login` 등은 선호 locale URL로 redirect한다. 로그인/회원가입 provider 버튼은 가능한 경우 browser popup으로 OAuth를 시작하고, popup이 차단되면 기존 full-page redirect로 fallback한다. 현재 활성 provider는 Google만이며, Apple login은 iOS 대응 시, LINE login은 일본/대만 확장 시 별도 구현한다.
- Auth device/session: 현재 User Web은 `mobile`/`personal_laptop` slot만 보내며 같은 slot의 다른 기기 로그인은 기존 active device/session을 교체한다.
- BusinessCard OCR 화면은 `/app/business-cards`다. 목록은 등록일 최신순 고정, 상태 다중 필터와 `상태 초기화`를 제공하고, `명함스캔` 모달은 이미지 업로드 -> 진행 표시 -> 추출 결과 확인/수정 -> 저장 흐름을 사용한다.
- DataImport 화면은 `/app/import`와 `/app/import/:importUserLogId`다. 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 누락 셀 단위 validation 메시지, 확정 저장, 성공 내역 조회를 실제 API와 연결한다. 딜 import 회사/담당자/제품 보정 배열은 현재 FE API와 BE controller/application/repository confirm 경로에 연결되어 있다.
- 생성 route 기준: 회사/담당자/제품/딜은 목록 맥락의 `/app/<domain>/new`와 page-mode 확장 route `/app/<domain>/new/full`을 함께 가진다. 회의록은 `/app/meeting-notes/new`가 `?create=1`로 redirect하고 `/app/meeting-notes/new/full`이 page-mode 작성 route다.
- 2026-07-10 기준 User Web `typecheck`, `lint`, `build`, `test:e2e`, URL locale smoke, 핵심 업무 happy path 수동 QA가 통과했다.

Admin Web:

- 실제 API 연동 완료: `GET /admin/api/me`.
- 코드에 존재하지만 미노출: `src/features/admin-query`의 dashboard/users/domain/audit/sensitive raw 화면, hook, type, API client 함수.
- Backend 후속 작업: Admin pages and Admin dashboard/users/domain query/audit/sensitive raw APIs. 현재 운영 route는 `/`로 redirect하고 메뉴에서 숨긴다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
