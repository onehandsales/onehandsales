# 단일 영역 헤더 프론트 UX

- 작업 일자: 2026-10-23
- 상태: 완료
- 관련 요청: 기존 app-page-header 위치에 헤더 UX를 먼저 구현하고 높이를 38px로 변경
- 화면 기준: `TODO/VIEW_TWO_AREA_TEXT_UX.md`

## 1. 관련 기준과 범위

- 루트 `AGENTS.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT` User Web 구조·컨벤션
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`, UX 방향·Record 목록·상호작용·검토 기준
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- 기존 헤더 영역의 단일 행 UX와 화면 내 상태를 구현한다. 신규 API·DB·커밋은 포함하지 않는다.

## 2. 진행 기록

- 작업 전 Git 변경 상태가 깨끗한 것을 확인했다. 이전 중단 작업의 문서를 복원하지 않는다.
- 제공된 DOM은 공통 PageHeader의 홈 헤더이며 관리대상 목록은 AppShell에서 별도 헤더를 렌더링하는 것을 확인했다.
- 헤더 높이는 공통 CSS 변수로 관리하며 본문 높이 계산도 같은 변수를 사용한다. 변수 값을 38px로 변경한다.
- 홈에도 보기 도구를 표시할지 사용자에게 화면 범위 선호를 비동기로 질문했다.
- 별도 화면 범위 응답이 없는 동안 안내한 기본안대로 관리대상 목록에 보기 도구를 적용하고 홈에는 높이 변경만 적용했다.
- 목록 본문의 기존 도구 행을 제거하고 Portal로 제목과 동일한 데스크톱 헤더 행에 배치했다. 모바일 Outlet에는 별도 위치를 사용해 데스크톱 도구가 중복되지 않게 했다.
- 보기 검색·화면 내 새 표 보기 생성·보기별 별·필터/정렬 입력·표시 정보 선택 팝오버를 구현했다. 이 상태는 메모리에만 유지하며 본문 필터·정렬·열 숨김 실행이나 영구 저장을 추가하지 않았다.
- 기존 로드된 기록 검색·기록 추가 모달·더보기는 유지했다. 보기 설정을 맨 오른쪽에 두고 미정 추가 도구는 비활성 자리만 제공한다.
- 한국어·영어 리소스, 바깥 클릭·Escape 닫기·초점 복원과 좁은 데스크톱 아이콘 표현을 추가했다.
- 사용자가 View API 구현 의사가 없음을 재확인했다. View API 구현·연동·후속 구현 계획은 이번 작업에 포함하지 않는다.

## 3. 변경 파일

- `FE/user-web/src/styles/global.css`: 공통 헤더 높이 38px
- `FE/user-web/src/components/layout/app-shell.tsx`: 데스크톱 헤더 도구 위치와 모바일 context 분리
- `FE/user-web/src/components/layout/view-header-toolbar.tsx`: 화면 상태만 사용하는 헤더 UX
- `FE/user-web/src/pages/workspace-object-list/index.tsx`: 기존 도구 행을 공통 헤더로 이동
- `FE/user-web/src/features/app-i18n/resources/ko-KR.ts`, `en.ts`: 새 UI 문구
- `FE/user-web/tests/e2e/view-header-ux.spec.ts`: 높이·배치·핵심 조작과 API 쓰기 없음 검증
- 이 작업 로그

## 4. 검증 결과

- 최초 `pnpm` 실행: PowerShell 실행 정책으로 ps1 실행 실패. 정책을 변경하지 않고 `pnpm.cmd`를 사용했다.
- 최초 typecheck: 선택 View의 배열 접근이 undefined 가능하다는 TS18048 실패. 공유 초기 View fallback으로 보정했다.
- `pnpm.cmd -C FE/user-web typecheck`: 통과
- `pnpm.cmd -C FE/user-web lint`: 통과
- `pnpm.cmd -C FE/user-web build`: 통과. 번들 크기 경고가 있으나 빌드는 성공했다.
- `pnpm.cmd -C FE/user-web exec playwright test tests/e2e/view-header-ux.spec.ts --project=chromium --reporter=line`: 1개 통과
- 브라우저: 홈/목록 헤더 38px, 1440px·1024px 한 줄 배치, 보이는 도구 중복 없음, 새 보기·별·필터·정렬·표시 정보와 Escape 초점 복원을 확인했다.
- 해당 조작에서 View API 요청 0건, POST/PUT/PATCH/DELETE 요청 0건, pageerror 0건을 확인했다. 테스트 데이터는 브라우저 route mock이며 실제 서버·DB를 변경하지 않았다.
- 브라우저 캡처를 열어 헤더와 본문 사이에 별도 도구 행이 없고 버튼이 잘리지 않는 것을 확인했다.
- `git diff --check`: 통과

## 5. 검토와 다음 작업

- 자체 검토: 통과. 요청한 프론트 UX와 38px 헤더를 적용했다.
- 새 보기·별·필터·정렬·표시 정보 선택은 화면 미리보기다. 새로고침 시 초기화하며 실제 본문 조회·열 숨김·서버 저장을 의미하지 않는다.
- 홈은 기존 제목을 유지하고 높이만 변경했다. 관리대상 목록에서 보기 도구를 확인할 수 있다.
- View API·백엔드·DB 작업이나 커밋을 수행하지 않았다. 사용자 요청 범위의 남은 필수 작업은 없다.

## 6. 전체 진행 현황

- 지침·기존 구조 확인, 높이 변경, 단일 헤더 UX 구현 완료
- typecheck·lint·build·브라우저 검증과 자체 검토 완료
