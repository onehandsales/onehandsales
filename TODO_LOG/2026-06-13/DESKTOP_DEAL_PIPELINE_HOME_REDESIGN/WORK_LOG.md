# Desktop Deal Pipeline Home — pen 기준 재구성

## 작업명

pen 파일 기준 Desktop Deal Pipeline Home 테이블 레이아웃 구현 + DealStage 6단계 확장 + Sidebar/TopBar pen 반영

## 작업 일자

2026-06-13

## 관련 계획과 goal

- `UX Design/PEN_UI_01_FRONTEND_PLAN.md`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`
- pen 화면: `[home] Desktop – Deal Pipeline Home` (node: spyD9), Sidebar (node: NB6r5), TopBar (node: R5ECb)

## 진행 기록

### 1차 — Desktop Deal Pipeline Home 재구성

- pen의 Desktop Deal Pipeline Home이 리스트 카드가 아닌 테이블 행 + 우측 상세 패널 구조임을 확인.
- `DealListRow`를 pen 기준 6컬럼(딜이름/회사담당자/단계/금액/다음행동/마감일) 테이블 행으로 전면 재구성.
- `DealPipelineHomeRedesignScreen`의 Desktop 섹션을 Stage Tabs + 테이블 헤더 + 스크롤 가능한 행 목록 + 380px 우측 패널 구조로 교체.
- Stage Tabs를 pen 기준 border-bottom 하이라이트 + 단계별 건수 뱃지 형태로 구현.
- `AppShell`을 `DesktopAppShell`과 통합 — 기존 구 shell의 `Outlet`을 새 shell 구조에서 직접 렌더링.
- 홈 경로(`/`)에서만 main 영역을 full-height flex로 전환해 테이블이 남은 높이를 채우도록 처리.

### 2차 — DealStage 6단계 확장 (FE 전체)

- `IN_DISCUSSION` 제거, `NEEDS_ANALYSIS` / `PROPOSAL` / `NEGOTIATION` 추가 → 총 6단계.
- `DealStage` 타입 유니온 4→6개, `DealStageSummary` `Partial<Record<DealStage, number>>`로 변경.
- zod enum, getStageLabel, getStageClass, stage-badge, select option, stageTabs 배열 전체 교체.
- `emptyStageSummary` → `{}`, `getStageCount`를 `Object.values(summary).reduce`로 교체.
- `applyOptimisticStageSummary` 내 `?? 0` 가드 추가.
- import-export schema enumValues 6단계 반영.
- WON → "성사", LOST → "실패" (기존 수주/실주 변경).

### 3차 — Sidebar & TopBar pen 기준 반영

- `sidebar-nav.tsx`: 3그룹 구조(주요 메뉴/업무/관리) + 그룹 레이블 11px bold uppercase.
  - 활성: `#BFDBFE` 텍스트 + `#1D4ED822` bg + `#4880EE30` 보더, 아이콘 `#93C5FD`.
  - 비활성: `#A1A1AA` 텍스트, 아이콘 `#71717A`.
  - "담당자" 항목 `IdCard` 아이콘.
- `app-shell.tsx` TopBar pen 스펙 반영:
  - 타이틀 18px `#111827` bold, 서브타이틀 11px `#6B7280` normal.
  - `GlobalSearch`(320px)를 타이틀 바로 우측으로 이동, flex spacer로 오른쪽 끝 버튼 그룹 분리.
  - `새 딜` 버튼: h-9, `#1D4ED8` bg, 13px semibold.
  - `내보내기` 버튼: h-9, white bg + `#E5E7EB` border + `Download` 아이콘.
  - Bell: 박스 없이 bare 아이콘 20px `#6B7280`.
  - Avatar: 32px 원형 `#4880EE`.

## 적용 범위 또는 변경 파일

### 1차 커밋 — DealStage 6단계 확장

- `FE/user-web/src/features/deal/types/deal.ts`
- `FE/user-web/src/features/deal/schemas/deal-schema.ts`
- `FE/user-web/src/features/deal/utils/deal-display.ts`
- `FE/user-web/src/features/deal-redesign/components/stage-badge.tsx`
- `FE/user-web/src/features/deal/components/deal-create-dialog.tsx`
- `FE/user-web/src/features/deal/components/deal-detail-panel.tsx`
- `FE/user-web/src/features/deal/components/deal-list-screen.tsx`
- `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`
- `FE/user-web/src/features/deal-redesign/screens/mobile-deal-detail-page.tsx`
- `FE/user-web/src/features/import-export/schemas/import-export-schema.ts`

### 2차 커밋 — Desktop Deal Pipeline Home 재설계

- `FE/user-web/src/features/deal-redesign/screens/deal-pipeline-home.tsx`
- `FE/user-web/src/features/deal-redesign/components/deal-list-row.tsx`

### 3차 커밋 — Sidebar & TopBar pen 반영

- `FE/user-web/src/components/layout/app-shell.tsx`
- `FE/user-web/src/components/navigation/sidebar-nav.tsx`
- `FE/user-web/src/components/shell/desktop-app-shell.tsx`
- `UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md`

## 검증 결과

- `pnpm --dir FE/user-web run typecheck`: 통과 (모든 커밋 후)
- 린트 / 빌드: 별도 실행 예정

## 남은 리스크 또는 보류 사항

- 백엔드 DealStage enum은 아직 4단계(FE만 6단계로 확장된 상태). BE enum 변경 별도 필요.
- 테이블 위 컨트롤바 FilterChip(정렬/금액/마감일)은 미구현.
- 브라우저 실제 세션 smoke 확인 미실시.

## 다음 권장 작업

- BE DealStage enum 6단계 확장 (Prisma schema + migration)
- 테이블 컨트롤바 FilterChip 구현
- 실제 BE 세션으로 딜 목록/상세/단계변경 smoke 확인

## 전체 작업 진행 현황

- 상태: 완료
- 커밋: 3개 분리 커밋 후 push 완료 (`fe/contact` → `origin`)
