# Issue Log

상태: Done / Archived
검토일: 2026-08-11
완료 보관일: 2026-08-12

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

처리 상태:

- 2026-08-11 구현 및 검증 완료
- Admin Operation application 전용 enum-like const object와 union type을 `admin-operation.types.ts`에 정의 완료
- Admin Operation application/port의 `@prisma/client` enum/type import 제거 완료
- application service spec의 Prisma enum fixture 직접 의존 제거 완료
- Backend `typecheck`, `lint`, 전체 Jest 96개 suite / 518개 test 통과

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

처리 결과:

- 2026-08-11 구현 및 검증 완료
- notification reminder 쓰기 계약을 shared narrow port/adapter로 분리해 Deal/Schedule/Google Calendar repository 구현체의 `PrismaNotificationRepository` 직접 import를 제거했다.
- deal activity 쓰기와 일부 딜 참조/부수 쓰기 계약을 shared narrow port/adapter로 분리해 Schedule/MeetingNote/Follow-up repository 구현체의 Deal activity helper/repository 구현체 직접 import를 제거했다.
- 목표 후보 외 추가로 확인된 `prisma-google-calendar-connection.repository.ts`의 notification repository 구현체 직접 import도 함께 제거했다.
- Backend `typecheck`, `lint`, G04 관련 spec 12개 suite / 74개 test, 전체 Jest 98개 suite / 524개 test 통과

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

처리 상태:

- 2026-08-11 구현 및 검증 완료
- 우선 대상 controller 5개의 class 역할 주석, route decorator 직전 `// API : ...`, controller numbered step comment 보강 완료
- G02-G04에서 수정한 Backend class/interface/function/method 범위의 `// 역할 :`, `// 기능 :` 누락 보강 완료
- 우선 대상 controller와 G02-G04 변경 Backend source 66개 파일 기준 AST 주석 감사 결과 누락 0개
- Backend `typecheck`, `lint`, 전체 Jest 98개 suite / 524개 test 통과

### M02. Frontend feature deep import

근거:

- User Web feature 내부에서 다른 feature의 `components/hooks/api/schemas/types/utils`를 직접 import한 후보가 다수 있다.
- 예: `deal-create-dialog.tsx`, `use-trash-mutations.ts`, `meeting-note-*`, `follow-up-delivery-*`

문제:

- feature public API 경계가 약해진다.
- 내부 파일 이동이나 refactor blast radius가 커진다.

처리 goal:

- `G06-FE-FEATURE-PUBLIC-API-BOUNDARY`

처리 상태:

- 2026-08-11 구현 및 검증 완료
- User Web의 company/contact/deal/meeting-note/product/schedule/trash/auth/notification/public-site public export를 필요한 범위로 보강했다.
- User Web feature 내부의 cross-feature `components/hooks/api/schemas/types/utils` deep import를 public `@/features/<feature>` import로 정리했다.
- 반복 참조되는 query key와 딜 선택/상태/후속 액션 API는 top-level public sub-entry로 분리해 넓은 barrel 순환 위험을 낮췄다.
- page/layout 외부 consumer의 feature 내부 경로 import도 public index import로 정리했다.
- cross-feature deep import, 외부 feature deep import, 자기 feature public index import 순환 위험 후보, public index runtime broad import 순환 후보 감사 결과 모두 0건이다.
- `FE/user-web`와 `FE/admin-web`의 `typecheck`, `lint`가 통과했다.

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

처리 상태:

- 2026-08-11 구현 및 검증 완료
- User Web G06/G07 수정 파일과 `route-elements.tsx`, `app-shell.tsx`의 React component/function/hook/event handler `// 기능 : ...` 주석 보강 완료
- Admin Web auth 우선 범위의 주석 규칙 재검증 완료
- 64개 대상 파일 기준 AST 주석 감사 결과 누락 0건
- `FE/user-web`와 `FE/admin-web`의 `typecheck`, `lint`가 통과했다.
- `console.*` client logging 추가 없음

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

## 5. 2026-08-12 재검토 후속 보완 기록

### F01. G05 application orchestration numbered step comment 후속 보완

상태: 후속 보완 기록

- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`의 `getUserTrashSummary`
- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`의 `listUserTrashRecords`
- `BE/src/modules/admin-operation/application/services/admin-trash-application.service.ts`의 `listRecoveryRequests`

위 3개 public application orchestration method는 `// 기능 : ...`은 있으나 numbered step comment가 없다. G05 완료 로그에 후속 보완으로 기록했다.

### F02. G06 feature public API boundary 재검토

상태: 추가 코드 보완 없음

- `FE/user-web/src` 335개 TS/TSX 파일과 `FE/admin-web/src` 93개 TS/TSX 파일 기준 교차 feature deep import, 외부 feature deep import, 자기 feature public index import, public index runtime cycle 모두 0건이다.
- G06 완료 로그에 재검토 통과 결과를 기록했다.

### F03. G07 Frontend event handler 주석 후속 보완

상태: 후속 보완 기록

- `FE/user-web/src/features/follow-up-delivery/components/follow-up-compose-dialog.tsx`의 `requestSend`는 `onClick`에 연결된 named event handler이고 `// 기능 : ...` 주석이 없다.
- FE 전체 source-wide 주석 규칙 엄격 적용 시 User Web 996건, Admin Web 67건의 범위 리스크가 있다. 이는 기존 G07 완료 기준의 대상 파일 범위를 넘는 후속 후보로 별도 관리한다.
- G07 완료 로그에 후속 보완으로 기록했다.
