# 업무 목록과 관리 항목 UX 통일 작업 로그

- 작업 일자: 2026-10-24
- 상태: 완료
- 계획: `TODO/DONE/SIDEBAR_WORK_LISTS_UX_PARITY_PLAN/`
- 시작 상태: 변경 없는 main, origin/main보다 커밋 3개 앞섬

## 1. 사용자 요청

업무 목록을 관리 항목의 현재 UX/UI와 거의 복사한 수준으로 맞춘다. 업무 목록에 추가했던 빈 목록·조회 실패 문구와 재시도 UI를 제거한다. 데이터가 없거나 최초 조회가 실패하면 목록 행 없이 기존 추가 버튼만 표시한다. 로딩 Skeleton과 행 디자인·hover도 관리 항목과 맞춘다.

List 화면으로의 이동·생성·View 연동은 이전에 합의한 후속 범위로 유지한다. Backend/API 계약·DB와 관리 항목 동작은 바꾸지 않는다.

## 2. 기준과 범위

- `AGENTS.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/` 규칙과 엔지니어링 리뷰 체크리스트
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- 기존 관리 항목 SidebarNav/AppShell 구현
- 업무 목록 최초 연동의 완료 API 계약과 작업 기록

변경 대상은 SidebarNav, AppShell의 업무 목록 전용 오류·재시도 전달, 사용하지 않는 번역 문구, 기존 업무 목록 E2E와 상태 문서다.

## 3. 진행

- 현재 관리 항목은 빈 배열에서 null을 반환하고 최초 조회 실패에 별도 문구나 재시도 UI를 표시하지 않음을 확인했다.
- 업무 목록도 같은 로딩 분기와 데이터 표시로 단순화하고 캐시 데이터가 있으면 조회 실패만으로 숨기지 않도록 한다.
- 사용자와 사전 의미 확인 후 구현 요청을 받아 추가 질문 없이 진행한다.
- 업무 목록 전용 오류·재시도 props와 AppShell handler, 사용하지 않는 한국어/영어 상태 문구를 제거했다.
- 관리 항목과 같은 조건 분기로 공통 Skeleton을 표시하고 빈 배열에는 null을 반환하도록 했다.
- 행에 관리 항목과 같은 hover/active 배경·텍스트·아이콘 색상을 적용했다.
- 기존 업무 목록 E2E의 안내/재시도 기대값을 새 UX로 갱신하고 관리 항목과 hover 색상을 비교했다.
- 코드·변경 범위와 검증 결과를 검토한 뒤 최신 상태 문서를 갱신하고 계획을 완료 보관했다.

## 4. 검증

Node 24/pnpm 8.14.1을 사용했다. User Web에서 `PATH=/opt/homebrew/opt/node@24/bin:$PATH`와 `corepack pnpm`으로 실행했다.

| 검증 | 결과 |
| --- | --- |
| typecheck | 통과 |
| lint | 경고 없이 통과 |
| test | 10개 파일·33개 테스트 통과 |
| Playwright 업무 목록 4건·기존 헤더 1건 | 5건 통과 |
| build | 통과. 기존 500 kB 초과 chunk 경고 유지 |
| git diff --check | 통과 |

Playwright: `corepack pnpm exec playwright test tests/e2e/sidebar-work-lists.spec.ts tests/e2e/view-header-ux.spec.ts --project=chromium --workers=1`.

빈 응답/최초 조회 실패 모두 목록 행과 안내·오류·재시도 없이 기존 추가 버튼을 표시함을 검증했다. API 응답 순서, 기본 아이콘, 30px 행·14px 글자, 관리 항목과 같은 hover 색상, 접힘과 Workspace 전환도 검증했다.

## 5. 검토·남은 범위

- 검토 결과: 통과. 사용자 요청과 현재 관리 항목의 UX/UI를 기준으로 변경했다.
- 알려진 기존 생성 모달 E2E 2건은 이번 변경 범위와 무관하여 변경/재실행하지 않았다.
- 실제 Backend 별도 smoke는 실행하지 않았다. 관련 브라우저 테스트는 API Mock을 사용한다.
- Backend/API/DB schema·Query·인증 client·관리 항목 기능·route는 변경하지 않았다.
- List 화면 이동·생성·View 연동은 후속 범위다. 커밋하지 않았다.
