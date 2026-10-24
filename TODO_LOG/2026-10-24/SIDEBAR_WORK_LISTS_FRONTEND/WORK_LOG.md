# 사이드바 업무 목록 Frontend 연동 작업 로그

- 작업 일자: 2026-10-24
- 상태: 요청 범위 완료 / 기존 생성 모달 E2E 2건 불일치 기록
- 관련 계획: `TODO/DONE/SIDEBAR_WORK_LISTS_FRONTEND_PLAN/`
- 시작 Git 상태: 변경 없는 main, origin/main보다 Backend 커밋 1개 앞섬

## 1. 사용자 요청과 범위

완료된 업무 목록 조회 API를 User Web 사이드바의 업무 목록에 연결한다. 기존 관리 항목과 같은 조회·행 디자인·로딩 구조로 List 이름과 아이콘을 표시한다. List 클릭 후 화면 이동, 생성·수정·삭제와 View 연동은 후속 범위다.

## 2. 적용 기준

- `AGENTS.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/` 전체 16개 문서
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `TODO/SIDEBAR_AND_VIEW_USER_FLOW.md`
- `TODO/DONE/LIST_DEFINITION_SIDEBAR_LISTS_PLAN/COMMON/API-SPEC/SIDEBAR_LIST_DEFINITION_API.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 3. 진행 기록

- Front Agent 규칙 전체와 현재 AppShell·SidebarNav·관리 항목 Query·공통 아이콘·E2E Mock을 확인했다.
- API와 Query Key는 단수형 feature crm-list 내부에 둔다. 사용자/Workspace별 캐시를 분리한다.
- 공통 apiClient의 인증·갱신을 재사용하고 서버 응답 순서를 보존한다.
- 기존 Backend 계약은 변경하지 않고 Frontend 사용 범위와 상태 처리를 새 계획에 기록한다.
- crm-list feature와 AppShell/SidebarNav 연결, 공통 Skeleton 재사용, 한국어·영어 상태 문구를 추가했다.
- 새 Playwright 4개 시나리오와 /lists API Mock 분기를 추가했다. 관리 항목·Workspace 생성·헤더 기존 smoke도 함께 실행한다.
- 첫 lint에서 재시도 콜백의 의존성 경고 1건을 발견해 안정적인 refetch 참조로 수정했고 재검증에서 경고 없이 통과했다.
- 첫 Playwright 실행은 Chromium headless 실행 파일 부재로 7건 모두 시작 전에 실패했다. 프로젝트 의존성 변경 없이 Playwright 관리 캐시에 chromium headless shell/ffmpeg를 설치하고 재실행한다.
- 작업 도중 기존 날짜의 다른 TODO_LOG 파일 12개가 삭제된 상태를 확인했다. 이번 작업이 만든 삭제가 아니므로 복원하거나 수정하지 않고 보존한다.
- Playwright 재실행에서 신규 업무 목록 4개와 기존 헤더 1개가 통과했다. 함께 실행한 기존 생성 모달 2개는 현재 화면과 테스트의 불일치로 실패해 HEAD와 비교하고 기록했다.
- 코드/화면/계약·범위 검토를 완료하고 관련 상태 문서를 갱신해 계획을 완료 보관했다.

## 4. 적용 범위

- `FE/user-web/src/features/crm-list/`: 응답 타입/API/Query Key/Hook/export
- AppShell 조회와 SidebarNav 업무 목록 표시
- 한국어·영어 상태 문구
- 공통 E2E Mock과 표시·로딩·빈 목록·오류 복구·Workspace 전환 검증
- 관련 상태 문서와 완료 기록

## 5. 검증

Node 24.10.0/pnpm 8.14.1을 사용했다. 명령은 User Web에서 `PATH=/opt/homebrew/opt/node@24/bin:$PATH`와 `corepack pnpm`으로 실행했다.

| 검증 | 결과 |
| --- | --- |
| typecheck | 통과 |
| lint 최초 | 오류 0, 새 useCallback 의존성 경고 1건 |
| lint 수정 후 | 경고 없이 통과 |
| test | 10개 파일·33개 테스트 통과 |
| build | 통과. 기존 500 kB 초과 chunk 경고 유지 |
| Playwright 최초 7건 | 브라우저 실행 파일 부재로 테스트 시작 전 모두 실패 |
| playwright install chromium --only-shell | 로컬 Playwright 캐시에 headless shell/ffmpeg 설치. 의존성 파일 변경 없음 |
| Playwright 재실행 7건 | 업무 목록 신규 4건 + 기존 헤더 1건 통과, 기존 생성 모달 2건 실패 |
| git diff --check | 통과 |

Playwright 명령: `corepack pnpm exec playwright test tests/e2e/sidebar-work-lists.spec.ts tests/e2e/create-object-definition-modal.spec.ts tests/e2e/view-header-ux.spec.ts tests/e2e/create-workspace-modal.spec.ts --project=chromium --workers=1`.

실패한 관리 항목 생성 테스트는 현재 아이콘/설명 단계 대신 과거 속성 입력 단계를 기대한다. Workspace 생성 테스트는 제목이 현재 `#4880EE`인데 `#9CA3AF`를 기대한다. 해당 모달·테스트 파일 4개는 이번에 변경하지 않았고 `git show HEAD`로 같은 구현을 확인했다. 전체 E2E 통과로 기록하지 않는다. 해당 파일을 변경하거나 제품 UX를 과거 테스트에 맞추지 않았다.

헤더 E2E의 `test-results/view-header-ux-keeps-the-3-a3d5c-rols-without-network-writes-chromium/header-ux.png`를 확인해 업무 목록과 관리 항목의 표시를 검토했다. 실제 Backend 별도 smoke는 실행하지 않았다.

## 6. 검토·후속 범위

- 요청 범위인 조회·표시·캐시 분리·상태 처리는 완료했다. Front Agent feature/API/인증/주석/테스트 기준을 대조했다.
- 기존 생성 모달 E2E 2건 정비는 후속 범위로 남긴다. 빌드 경고는 기존 상태다.
- List 클릭 후 화면 이동·CRUD·View 연동은 합의대로 이번에 추가하지 않았다.
- Backend 코드·DB schema·migration·Admin Web·인증 client·route·의존성 파일은 변경하지 않았다. 최초 구현 완료 당시에는 커밋하지 않았다.
- 별도 사용자 변경인 기존 TODO_LOG 삭제 12건을 그대로 보존했다.

## 7. 사용자 요청 커밋

- 사용자가 Git 커밋을 명시적으로 요청했다.
- 구현 이후 코드 변경이 없음을 확인하고 기존 typecheck/lint/단위 테스트 33개/build 및 Playwright 결과를 커밋 검증 근거로 사용한다. 기존 생성 모달 E2E 2건 실패 기록도 유지한다.
- 이번 Frontend 연동 코드·테스트·계약 참조·관련 상태 문서·작업 로그 19개 파일만 커밋한다.
- 별도 TODO_LOG 삭제 12건은 stage하지 않는다.
- 커밋 제목: `feat(user-web): 사이드바 업무 목록 API 연동`
- 원격 push는 요청 범위가 아니다.
