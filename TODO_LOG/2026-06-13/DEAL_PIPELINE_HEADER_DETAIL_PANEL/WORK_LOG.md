# Deal Pipeline Header And Detail Panel Work Log

## 작업명

딜 파이프라인 본문 중복 검색/내보내기 제거 및 상세 패널 지연 렌더링

## 작업 일자

- 2026-06-13

## 관련 계획과 goal

- `TODO/DEAL_DOMAIN_PLAN/FE-TODO/G02-FE-DEAL-PAGES.goal.md`
- `TODO_LOG/2026-06-13/DESKTOP_DEAL_PIPELINE_HOME_REDESIGN/WORK_LOG.md`

## 예정 범위

- 헤더 아래 본문 컨트롤바에서 중복 검색창과 내보내기 버튼을 제거한다.
- 딜 상세 패널은 목록 로드 시 자동 생성하지 않고, 사용자가 딜 행을 클릭한 뒤에만 렌더링한다.

## 진행 기록

- 2026-06-13: 작업 시작. `deal-pipeline-home-screen.tsx` 구조 확인.
- 2026-06-13: 데스크톱 본문 컨트롤바의 중복 검색창과 내보내기 버튼 제거.
- 2026-06-13: 목록 로드 시 첫 딜 자동 선택 로직 제거.
- 2026-06-13: 우측 상세 패널과 로딩 스켈레톤을 클릭 이후에만 렌더링되도록 변경.
- 2026-06-13: pen 파일 재확인. `[home] Desktop – Deal Pipeline Home`의 `Deal List Column(e8YpyU)`에서 `Deal Controls Bar(v1Gkpn)`와 `Deal List Surface(OD1p5)`가 형제 구조임을 확인하고, 정렬/건수 표시를 리스트 네모 밖으로 이동.
- 2026-06-15: 딜 홈의 검색/정렬 영역을 공용 `FilterChip` 기반으로 재정리하고, 상단 검색 입력을 데스크톱과 모바일 모두에 맞춰 통일.

## 적용 범위 또는 변경 파일

- `FE/user-web/src/features/deal/components/deal-pipeline-home-screen.tsx`
  - 본문 컨트롤바는 정렬과 건수 표시만 남김.
  - 정렬과 건수 표시를 테이블 네모 내부가 아닌 `Deal List Surface` 위의 별도 영역으로 이동.
  - `DealDetailPanel`은 `selectedDealId`가 있을 때만 렌더링.
  - 새 딜 생성 완료 시에도 상세 패널을 자동 선택하지 않음.
  - 사용자가 클릭한 선택 딜이 현재 목록에서 사라질 때만 선택 해제.
  - 검색 + 정렬 row를 데스크톱과 모바일 모두에서 `FilterChip` 기반 chip group으로 변경.
- `TODO_LOG/2026-06-13/DEAL_PIPELINE_HEADER_DETAIL_PANEL/WORK_LOG.md`

## 검증 결과

- `pnpm --dir FE/user-web exec eslint src/features/deal/components/deal-pipeline-home-screen.tsx`: 통과
- `git diff --check`: 통과
- `pnpm --dir FE/user-web typecheck`: 실패
  - 현재 Node는 `v20.20.2`이며 프로젝트 요구 엔진은 `>=24 <25`.
  - 이번 변경 파일 오류는 없음.
  - 남은 오류는 기존 범위로 보이는 `src/features/product/components/product-edit-form.tsx` resolver 타입 불일치.
- `pnpm --dir FE/user-web typecheck`: 2026-06-15 재검증 통과.
- `pnpm --dir FE/user-web lint`: 통과. `src/components/ui/toast.tsx`의 react-refresh 경고 1건은 기존 상태로 남아 있음.

## 검토 결과

- 데스크톱 딜 목록 하단/본문 영역에서 검색과 내보내기 중복 UI가 제거됐다.
- pen 기준처럼 정렬/건수 컨트롤은 테이블 박스의 border 밖, 같은 리스트 컬럼의 상단 별도 줄에 렌더링된다.
- 우측 상세 패널은 사용자가 딜 행을 클릭해 `selectedDealId`가 설정된 후에만 DOM에 생성된다.
- 빈 선택 상태에서는 우측 빈 안내 패널도 렌더링하지 않아 목록 영역이 가로 공간을 더 사용한다.

## 남은 리스크 또는 보류 사항

- 헤더의 딜 내보내기 버튼은 기존처럼 `AppShell`에 존재하지만 현재 딜 목록 필터 export 액션과 직접 연결되어 있지는 않다. 이번 작업은 본문 중복 제거 범위로 제한했다.
- 전체 typecheck는 product edit form의 기존 타입 오류 때문에 완료되지 않았다.

## 다음 권장 작업

- 헤더 내보내기 버튼을 딜 현재 필터 기준 export에 연결할지 별도 정책 결정.
- `product-edit-form.tsx` resolver 타입 오류 정리 후 전체 typecheck 재실행.

## 전체 작업 진행 현황

- 상태: 조건부 완료
