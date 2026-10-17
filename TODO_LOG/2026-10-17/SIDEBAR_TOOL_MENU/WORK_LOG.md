# Sidebar tool menu

## 상태

완료

## 작업 일자와 요청

- 2026-10-17
- 상단 홈·검색 아이콘 줄과 기존 사이드바 그룹 사이에 세로 기능 메뉴를 추가한다.
- 순서는 알림(Notifications) → 메모(Memos) → 할 일(Tasks) → 이메일(Emails) → 레포트(Reports)다.
- 각 메뉴를 기존 관리 대상 행과 동일한 아이콘·텍스트 형태로 표시한다.
- 기존 가로 줄의 알림 버튼은 새 세로 메뉴로 이동한다.

## 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/SIDEBAR_AND_VIEW_USER_FLOW.md`

## 예정 범위

- 별도 사이드바 기능 메뉴 컴포넌트를 작성한다.
- `AppShell`에서 홈·검색 아래, 그룹 스크롤 영역 위에 배치한다.
- 한국어·영어 메뉴 이름을 추가한다.
- 사이드바 사용자 흐름 문서에 상단 기능 메뉴를 기록한다.
- 기능 페이지·라우트·API는 현재 범위에 포함하지 않는다. 목적지가 없는 링크나 현재 페이지를 암시하는 선택 상태를 만들지 않는다.

## 진행 기록

- 시작 시 작업 트리는 깨끗했고 main은 origin/main보다 3개 커밋 앞서 있었다.
- 이전 가로 노트 아이콘 작업의 변경은 현재 작업 트리에 없음을 확인했다.
- 기존 Lucide 아이콘 Bell, StickyNote, ListTodo, Mail, ChartNoAxesCombined를 사용한다.
- 메뉴 행은 높이 32px, 아이콘 20px, 글자 14px로 기존 관리 대상 행과 맞춘다.
- 사용자 추가 요청에 따라 다섯 기능 메뉴의 기본 텍스트 색상을 `#111827`로 변경한다.
- 기능 메뉴를 별도 컴포넌트로 작성해 홈·검색 줄과 그룹 영역 사이에 배치했다.
- 기존 가로 알림 버튼을 제거하고 세로 메뉴의 첫 행으로 옮겼다.
- 한국어·영어 명칭 및 사이드바 사용자 흐름 문서를 반영했다.
- 실제 기능 목적지가 아직 없으므로 행은 버튼으로 표시한다. 기존 관리 대상 링크와 같은 행 모양을 사용하고 키보드 포커스 표시를 제공한다.

## 변경 파일

- `FE/user-web/src/components/navigation/sidebar-tools-nav.tsx`
- `FE/user-web/src/components/layout/app-shell.tsx`
- `FE/user-web/src/features/app-i18n/resources/ko-KR.ts`
- `FE/user-web/src/features/app-i18n/resources/en.ts`
- `TODO/SIDEBAR_AND_VIEW_USER_FLOW.md`
- 이 작업 로그

## 검증 결과

- `pnpm -C FE/user-web typecheck`: 통과.
- `pnpm -C FE/user-web lint`: 통과.
- `pnpm -C FE/user-web test`: 10개 파일, 33개 테스트 통과.
- `pnpm -C FE/user-web build`: 통과. 500 kB 이상 chunk 크기 경고는 유지된다.
- 최초 브라우저 확인 스크립트는 캡처 직전 존재하지 않는 h1을 클릭해 timeout으로 종료됐다. 검증 스크립트의 클릭 대상을 빈 본문 좌표로 바로잡은 뒤 한국어·영어 확인이 통과했다.
- Playwright + 로컬 Chrome + API mock: 다섯 메뉴 순서, 홈·검색만 남은 가로 줄, 두 영역 사이의 배치, 32px 행/20px 아이콘/14px 글자, hover 배경, 키보드 포커스와 기존 그룹 순서를 확인했다.
- 마지막 색상 변경 후 한국어·영어 메뉴 다섯 개 모두 기본/hover 상태의 텍스트가 `rgb(17, 24, 39)`(`#111827`)임을 브라우저에서 재확인했다.
- 마지막 색상 변경 후 production build를 다시 실행해 통과했다. 한국어 최종 캡처를 시각적으로 확인했다.
- 실제 DB 접근 없이 mock으로 확인했다. 전체 E2E suite를 실행한 결과는 아니다.
- 브라우저와 확인용 로컬 개발 서버를 종료했다.
- `git diff --check`: 통과.

## 검토 결과

- 요청한 메뉴 순서, 한·영 이름, 관리 대상과 같은 행 모양, 텍스트 색상을 반영했다.
- 사이드바 UI와 관련 문서만 변경했다. Backend, DB, API, 본문 기능 및 기존 그룹 기능은 변경하지 않았다.
- 커밋은 요청받지 않아 수행하지 않았다.

## 남은 범위·다음 작업

- 각 기능의 페이지와 클릭 동작 연결은 별도 후속 요청에서 다룬다.
- 대형 bundle 최적화는 별도 범위다.
- 이번 요청의 UI 변경과 검증은 완료했으며 요청 범위의 미완료 작업은 없다.
