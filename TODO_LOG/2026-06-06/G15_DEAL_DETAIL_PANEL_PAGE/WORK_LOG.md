# G15 Deal 상세 패널과 상세 페이지 작업 로그

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 작업 상태

- 상태: 완료
- 작업 일자: 2026-06-06
- 관련 goal: `G15. Deal 상세 패널과 상세 페이지`
- 관련 문서:
  - `AGENT/README.md`
  - `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
  - `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
  - `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`

## 요청 내용

- G15 Deal 상세 패널과 상세 페이지 작업을 진행한다.
- 작업 전 `AGENT`와 `TODO/MVP-STARTER_PLAN` 정본 문서를 다시 확인한다.
- 구현 후 검토, 작업 로그 갱신, git commit까지 수행한다.

## 예정 범위

- 딜 목록 desktop 우측 상세 패널
- 모바일 딜 상세 페이지 기본 대응
- 딜 핵심 요약 우선 표시
- 활동 로그 timeline 조회와 추가
- 단계 변경 UI
- 다음 행동 완료/미루기 기본 동작
- Memo 기록, 일정/회의록 placeholder, 제품/연결 정보 섹션 표시

## 제외 범위

- 일정/회의록 완전 연결
- Admin Memo 원문 조회 flow
- G16 Home pipeline 통합

## 진행 기록

- 2026-06-06: 작업 로그 문서 생성
- 2026-06-06: G15 관련 AGENT/TODO 정본 문서 재확인
- 2026-06-06: Deal 상세 API, 활동 API, 단계/다음 행동 API 구현 상태 확인
- 2026-06-06: 활동 로그 생성 API에서 `typeId` 생략 시 시스템 기본 `기타 기록` 타입을 사용하도록 Backend 보강
- 2026-06-06: User Web Deal 상세 타입, API 함수, query key, 상세/활동 hook, mutation 확장
- 2026-06-06: `/deals` desktop 목록에 우측 상세 패널 연결
- 2026-06-06: `/deals/:dealId` 상세 페이지를 placeholder에서 실제 상세 화면으로 교체
- 2026-06-06: 핵심 요약, 단계 변경 UI, 다음 행동 완료/미루기, 활동 로그 timeline/추가, Memo 기록, 일정/회의록 summary, 제품/연결 정보 섹션 구현
- 2026-06-06: route-mock smoke 중 알림 중복 표시를 발견해 부모 알림이 있는 경우 패널 내부 중복 알림을 제거
- 2026-06-06: desktop 패널에서 미루기 form 3열 배치가 좁게 보이는 문제를 2열/하단 버튼 배치로 보정

## 적용 범위 또는 변경 파일

- `BE/src/modules/deal/application/ports/deal.repository.ts`
- `BE/src/modules/deal/application/use-cases/create-deal-activity.use-case.ts`
- `BE/src/modules/deal/infrastructure/persistence/prisma-deal.repository.ts`
- `BE/src/modules/deal/presentation/http/dto/deal-activity.dto.ts`
- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/features/deal/api/deal-api.ts`
- `FE/user-web/src/features/deal/api/deal-query-keys.ts`
- `FE/user-web/src/features/deal/components/deal-activity-section.tsx`
- `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
- `FE/user-web/src/features/deal/components/deal-detail-screen.tsx`
- `FE/user-web/src/features/deal/components/deal-list-screen.tsx`
- `FE/user-web/src/features/deal/hooks/use-deal-detail.ts`
- `FE/user-web/src/features/deal/hooks/use-deal-mutations.ts`
- `FE/user-web/src/features/deal/index.ts`
- `FE/user-web/src/features/deal/schemas/deal-schema.ts`
- `FE/user-web/src/features/deal/types/deal.ts`
- `FE/user-web/src/pages/deals/detail.tsx`
- `TODO_LOG/2026-06-06/G15_DEAL_DETAIL_PANEL_PAGE/WORK_LOG.md`

## 검증 결과

- 통과: `FE/user-web pnpm run typecheck`
- 통과: `FE/user-web pnpm run lint`
- 통과: `FE/user-web pnpm run build`
  - 참고: Vite 단일 chunk 500kB 초과 경고가 있으나 build 실패는 아님
- 통과: `BE pnpm run typecheck`
- 통과: `BE pnpm run lint`
- 통과: `BE pnpm run build`
- 통과: `BE pnpm test -- --runInBand`
  - Test Suites: 8 passed
  - Tests: 34 passed
- 통과: `git diff --check`
- 통과: G15 Playwright route-mock smoke
  - user-web: `http://127.0.0.1:5175`
  - `/deals` desktop 우측 상세 패널 렌더링 확인
  - 핵심 요약, 활동 로그, 제품/연결 정보, Memo 기록 섹션 확인
  - `PATCH /api/deals/:dealId/stage` 요청 body 확인
  - `POST /api/deals/:dealId/activities` 요청 body 확인
  - `POST /api/deals/:dealId/next-action/complete` 요청 body 확인
  - `POST /api/deals/:dealId/next-action/snooze` 요청 body 확인
  - `/deals/:dealId` 상세 페이지 이동 확인
- 통과: desktop/mobile screenshot smoke
  - `/tmp/g15-detail-desktop.png`
  - `/tmp/g15-detail-mobile.png`
  - 패널/페이지 텍스트, 버튼, 입력 겹침 없음 확인

## 검토 결과

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`의 G15 완료 기준 충족
- Desktop에서 딜 목록 우측 상세 패널이 보이고, 선택한 딜의 핵심 정보가 먼저 표시됨
- Mobile은 `/deals/:dealId` 상세 페이지에서 핵심 요약과 timeline을 먼저 확인 가능
- 상세 패널에서 단계 변경이 가능하고, 성공 후 query invalidate로 timeline 자동 로그를 다시 조회함
- 상세 패널에서 활동 로그를 추가할 수 있음
- 다음 행동 완료/미루기가 동작하고 관련 query가 갱신됨
- 일정/회의록은 G15 제외 범위에 맞춰 summary/placeholder 수준으로 표시함
- User Web feature 구조 준수
  - 페이지는 route param 전달만 담당
  - Deal API, hook, schema, type, component는 `features/deal` 내부에 배치
  - API 호출은 `src/lib/api-client.ts` 경유
  - 서버 상태는 TanStack Query 사용

## 남은 리스크 또는 보류 사항

- G15 범위는 완료.
- 실제 인증 세션과 실제 DB를 사용하는 브라우저 E2E는 아직 Auth goal 이후의 smoke 체계에서 보강 필요.
- Memo 신규 작성/수정은 G15 완료 기준에 포함되지 않아 추가하지 않았다.
- 일정/회의록 완전 연결은 G17-G20 이후 범위로 남긴다.
- Home pipeline 통합은 G16 범위로 남긴다.

## 다음 권장 작업

- G15 완료 후 `G16. Home pipeline 통합`

## 전체 작업 진행 현황

- 완료: G06 Company Backend vertical slice
- 완료: G07 Company User Web
- 완료: G08 Contact Backend vertical slice
- 완료: G09 Contact User Web
- 완료: G10 Product Backend vertical slice
- 완료: G11 Product User Web
- 완료: G12 Deal Backend vertical slice
- 완료: G13 Deal User Web 목록과 빠른 생성
- 완료: G14 Deal inline entity creation
- 완료: G15 Deal 상세 패널과 상세 페이지
- 진행 필요: G16 Home pipeline 통합
