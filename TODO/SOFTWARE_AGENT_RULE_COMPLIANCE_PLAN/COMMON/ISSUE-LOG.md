# Issue Log

상태: Draft
검토일: 2026-08-11

## 1. Critical

### C01. Admin Web mock 로그인 우회

근거:

- `FE/admin-web/src/features/auth/auth-provider.tsx`
  - `adminMockAccessToken`
  - `userMockAccessToken`
  - `fallbackRole`
  - API 검증 실패 후 role fallback 세팅
- `FE/admin-web/src/pages/login/index.tsx`
  - `관리자로 계속`
  - `일반 사용자로 계속`

문제:

- Admin Web 보호 route가 실제 `/admin/api/me` 검증 없이 role을 가질 수 있다.
- 서버 API가 최종 방어하더라도 운영 콘솔 UI 접근 신뢰성이 깨진다.
- 현재 BE의 초기 관리자 승격 기준은 `INITIAL_ADMIN_EMAILS` 환경 변수 allowlist이며, Admin Web은 이 서버 기준을 우회하면 안 된다.

처리 goal:

- `G01-ADMIN-WEB-AUTH-MOCK-REMOVAL`

처리 상태:

- 2026-08-11 구현 및 검증 완료
- Admin Web production source에서 mock token, fallback role, `loginAsAdmin`, `loginAsUser` 제거 완료
- `/admin/api/me` 서버 검증 결과의 `ADMIN` role만 Admin Web 접근 기준으로 사용

## 2. High

### H01. Backend application -> presentation 의존

근거:

- `BE/src/modules/account-request/application/services/account-request-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-user-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-system-operation-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-audit-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-provider-failure-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-account-request-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-analytics-application.service.ts`
- `BE/src/modules/admin-operation/application/services/admin-domain-record-application.service.ts`

문제:

- Clean Architecture 의존 방향이 역전된다.
- application 계층이 HTTP response mapper와 presentation response type에 묶인다.

처리 goal:

- `G02-BE-APPLICATION-PRESENTATION-BOUNDARY`

처리 상태:

- 2026-08-11 구현 및 검증 완료
- Backend application service 9곳의 `presentation/http/*response.mapper` 의존 제거 완료
- HTTP response mapper 호출은 Account Request와 Admin Operation controller로 이동 완료
- application source의 presentation 의존 검색 결과 없음
- Backend `typecheck`, `lint`, 전체 Jest 96개 suite / 518개 test 통과

### H02. Backend application/port의 Prisma type 침투

근거:

- `BE/src/modules/admin-operation/application/ports/*.repository.ts`
- `BE/src/modules/admin-operation/application/services/*application.service.ts`

문제:

- SOFTWARE_AGENT 규칙은 Prisma를 infrastructure-only로 제한한다.
- application 계약이 Prisma enum 이름과 DB provider 구현에 결합된다.

처리 goal:

- `G03-BE-ADMIN-PRISMA-TYPE-BOUNDARY`

### H03. Backend module 간 repository 경계 위반 후보

근거:

- `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.ts`
  - `notification` repository port와 구현체 직접 import
- `BE/src/modules/schedule/infrastructure/persistence/prisma-schedule.repository.ts`
  - `notification` repository port와 구현체 직접 import
  - `deal` activity helper/repository 구현체 직접 import
- `BE/src/modules/schedule/infrastructure/persistence/prisma-google-calendar-sync.repository.ts`
  - `notification` repository port와 구현체 직접 import
- `BE/src/modules/meeting-note/infrastructure/persistence/prisma-meeting-note.repository.ts`
  - `deal` activity helper/repository 구현체 직접 import
- `BE/src/modules/follow-up/infrastructure/persistence/prisma-follow-up-message.repository.ts`
  - `deal` activity helper 직접 import

문제:

- 같은 transaction에서 연계 작업을 묶으려는 의도는 있지만, 다른 module repository import 금지 규칙과 충돌한다.
- 향후 모듈 분리, 테스트 대체, transaction boundary 추적이 어려워진다.

처리 goal:

- `G04-BE-CROSS-MODULE-REPOSITORY-BOUNDARY`

## 3. Medium

### M01. Backend 주석 누락

근거:

- `BE/src/modules/notification/presentation/http/notification.controller.ts`
- `BE/src/modules/follow-up/presentation/http/follow-up-message.controller.ts`
- `BE/src/modules/follow-up/presentation/http/follow-up-delivery-settings.controller.ts`
- `BE/src/modules/schedule/presentation/http/google-calendar.controller.ts`
- `BE/src/modules/sales-report/presentation/http/ai-weekly-sales-report.controller.ts`
- 일부 DTO, module class, provider port, private helper

문제:

- `// 역할 :`, `// API :`, `// 기능 :`, numbered step comment 규칙이 전역적으로 완결되지 않았다.

처리 goal:

- `G05-BE-COMMENT-COVERAGE`

### M02. Frontend feature deep import

근거:

- User Web feature 내부에서 다른 feature의 `components/hooks/api/schemas/types/utils`를 직접 import한 후보가 다수 있다.
- 예: `deal-create-dialog.tsx`, `use-trash-mutations.ts`, `meeting-note-*`, `follow-up-delivery-*`

문제:

- feature public API 경계가 약해진다.
- 내부 파일 이동이나 refactor blast radius가 커진다.

처리 goal:

- `G06-FE-FEATURE-PUBLIC-API-BOUNDARY`

### M03. Frontend 주석 누락

근거:

- `FE/user-web/src/app/router/route-elements.tsx`
- `FE/user-web/src/components/layout/app-shell.tsx`
- 주요 list/detail/create screen 내부 helper와 event handler
- `FE/admin-web/src/features/auth/*`

문제:

- `// 기능 :` 규칙이 컴포넌트, hook, handler, API client 함수 전체에 일관되게 적용되지 않았다.

처리 goal:

- `G07-FE-COMMENT-COVERAGE`

## 4. 현재 통과한 정적 검증

2026-08-11 수동 실행 결과:

- `BE`: `pnpm.cmd run typecheck`, `pnpm.cmd run lint` 통과
- `FE/user-web`: `pnpm.cmd run typecheck`, `pnpm.cmd run lint` 통과
- `FE/admin-web`: `pnpm.cmd run typecheck`, `pnpm.cmd run lint` 통과

추가로 확인한 항목:

- `console.log` 직접 사용 발견 없음
- 실제 `any` 타입 사용 발견 없음
- `window.confirm` 발견 없음
- User Web에서 `/admin/api/*` 직접 호출 발견 없음
- Admin Web fetch는 `src/lib/admin-api-client.ts` 안에만 있음
- source filename kebab-case 위반 발견 없음
