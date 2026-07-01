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

## 6. 현재 구현 스냅샷

Snapshot date: 2026-07-01

User Web:

- 실제 API 연동 완료: Auth/User, Home, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote manual CRUD, MeetingNote AI/STT draft, MeetingNote deal link, Search, Trash, DataImport, Company/Contact/Product/Deal domain xlsx export.
- mock/placeholder 경계: generic Export route/API, Notification.
- BusinessCard OCR 화면은 `/business-cards`다. 목록은 등록일 최신순 고정, 상태 다중 필터와 `상태 초기화`를 제공하고, `명함스캔` 모달은 이미지 업로드 -> 진행 표시 -> 추출 결과 확인/수정 -> 저장 흐름을 사용한다.
- DataImport 화면은 `/import`와 `/import/:importUserLogId`다. 회사/담당자/제품 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, row 수정/검증, 확정 저장, 성공 내역 조회를 실제 API와 연결한다. 딜 불러오기는 아직 지원하지 않는다.

Admin Web:

- 실제 API 연동 완료: `GET /admin/api/me`.
- Backend 후속 작업: Admin pages and Admin dashboard/users/domain query/audit/sensitive raw APIs.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
