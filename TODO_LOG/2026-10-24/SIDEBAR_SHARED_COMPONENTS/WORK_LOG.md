# 업무 목록·관리 항목 공통 컴포넌트 작업 로그

- 일자: 2026-10-24
- 상태: 완료
- 시작 상태: main, origin/main보다 커밋 3개 앞섬. 직전 UX 통일 작업의 미커밋 변경과 문서를 보존한다.

## 1. 요청과 기준

사용자가 화면 스타일뿐 아니라 실제 표시 코드도 공통으로 사용하도록 요청했다. 현재 관리 항목의 섹션·행·선택/hover 스타일을 기준으로 공통 컴포넌트를 만들고 두 영역이 같은 목록·행·로딩·빈 목록 분기를 사용한다.

각 데이터는 id/label/icon/to 형태로 변환한다. 관리 항목 singularName과 업무 목록 name을 label로 전달한다. 관리 항목의 기존 이동 경로는 유지하고 아직 화면이 없는 List에는 경로를 만들지 않는 것으로 사용자와 합의했다.

기준: AGENTS.md, Front Agent 규칙과 리뷰 체크리스트, 직전 SIDEBAR_WORK_LISTS_UX_PARITY 계획과 작업 로그. API/Query/인증/Backend/DB 변경과 커밋은 포함하지 않는다.

## 2. 적용 범위

- `components/navigation/sidebar-section.tsx`: 공통 SidebarSection과 SidebarDataSection
- `components/navigation/sidebar-data-list.tsx`: 공통 데이터 타입, 목록·행·아이콘/이름 내용·스타일·Skeleton
- `components/navigation/sidebar-nav.tsx`: 도메인 데이터를 공통 형식으로 변환해 같은 SidebarDataSection 호출
- 기존 업무 목록 E2E: 공통 목록 구조에 맞춘 선택자와 관리 항목 링크·선택 표시 검증

별도의 SidebarCrmLists/SidebarCrmObjectList/SidebarCrmObjectItem 렌더링을 제거했다. 두 영역은 SidebarDataSection → SidebarDataList → SidebarDataRow → SidebarDataRowContent를 함께 사용한다. 공통 행 안에서 전달된 to의 유무로 NavLink/일반 행을 구분하며 스타일과 내용 JSX는 동일한 함수에서 제공한다.

## 3. 검증

Node 24.10.0/pnpm 8.14.1, User Web에서 기존 Node 24 PATH와 corepack pnpm으로 실행했다.

| 검증 | 결과 |
| --- | --- |
| typecheck | 통과 |
| lint | 경고 없이 통과 |
| test | 10개 파일·33개 테스트 통과 |
| 업무 목록·기존 헤더 Playwright | 5개 테스트 통과 |
| build | 통과. 기존 500 kB 초과 chunk 경고 유지 |
| git diff --check | 통과 |

Playwright 명령: `corepack pnpm exec playwright test tests/e2e/sidebar-work-lists.spec.ts tests/e2e/view-header-ux.spec.ts --project=chromium --workers=1`.

정상 표시·서버 순서·아이콘·hover 색상·접힘·로딩·빈 목록·최초 조회 실패·Workspace 전환을 확인했다. 관리 항목 링크를 실제 클릭해 기존 경로 이동과 aria-current/선택 배경·아이콘 색상을 검증했다.

## 4. 완료 검토

- 검토 결과: 통과. UI 렌더링은 같은 공통 컴포넌트이며 SidebarNav에는 데이터 변환과 공통 섹션 호출만 남았다.
- 기존 관리 항목의 UI와 링크·선택 동작을 기준으로 공통화했다. List의 미구현 이동 경로·생성 기능은 추가하지 않았다.
- API/Query/인증/Backend/DB와 직전 작업의 다른 변경은 수정하거나 되돌리지 않았다. 직전 미커밋 UX 수정도 포함된 현재 상태로 검증했다.
- 알려진 기존 생성 모달 테스트 2건은 이번에 재실행하지 않았다. 실제 Backend 별도 smoke는 하지 않았다.
- 커밋하지 않았다.
