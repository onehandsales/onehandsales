# Object/List 공통 View 헤더 Frontend 연결

- 일자: 2026-10-26
- 상태: Frontend 연결·검증·G99 규칙 검토·완료 보관 완료
- 관련 계획: [VIEW_HEADER_FRONTEND_INTEGRATION_PLAN](../../../TODO/DONE/VIEW_HEADER_FRONTEND_INTEGRATION_PLAN/README.md)
- 기준: [Front Agent](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [주석 규칙](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md), [UX 기준](../../../AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md)

## 요청과 범위

사용자는 Front Agent 규칙을 준수해 기존 화면의 헤더 조회·드롭다운 연결을 진행하고 재사용 가능한 공통 컴포넌트를 만들도록 요청했다. 관리항목·업무목록 클릭 시 ③ 헤더, 드롭다운 오픈 시 ①/② 목록을 조회한다. 대상 이름/아이콘·현재 View·즐겨찾기 상태를 표시하고 보기 전환은 화면 선택 상태로 관리한다.

원본 API·DB·환경 파일·사용자 서버·Admin Web·커밋은 변경하지 않는다. View 생성/저장·즐겨찾기 클릭/쓰기·타입별 본문은 후속 범위다. 기존 Object 본문과 오른쪽 도구를 보존한다.

## 시작 확인

- git status가 비어 있는 상태에서 시작했다.
- 현재 공통 shell은 Object 이름을 사이드바 응답으로 표시하며, ViewHeaderToolbar는 로컬 미리보기 View·별표·오른쪽 도구를 함께 처리한다.
- 업무목록은 현재 사이드바의 표시 행이며 이동 경로가 없다. 공통 헤더가 표시되는 List 경로와 최소 화면 연결이 필요하다.
- 신규 crm-view feature에서 API·타입·Query key/hook·공통 헤더를 관리하고 서버 상태는 TanStack Query로 격리한다.
- 기존 개인 즐겨찾기 조회의 공개 hook을 재사용해 View 전환 후 별표 상태를 표시한다.

## 검증과 진행 기록

규칙·계약 확인 → 실행 계획 → API/Query → 공통 헤더·경로 연결 → 단위/브라우저·정적 검증 → 규칙 검토·완료 기록. 실행한 명령과 실패·미확인은 진행하면서 기록한다.

- 세 API adapter·사용자/대상/선택 Query key·단일 헤더 모델과 공통 WorkspaceViewHeader를 구현했다. AppShell의 두 반응형 헤더가 같은 모델과 선택 상태를 사용한다.
- List 경로·사이드바 링크·최소 화면을 연결하고 기존 Object 본문을 유지했다. 기존 Toolbar의 로컬 View 생성·별표는 제거하고 오른쪽 도구만 보존했다.
- 초기 typecheck·lint 통과, 단위 11 files/41 tests 통과.
- 최초 관련 Playwright 17건은 Chromium 실행 파일 부재로 브라우저 실행 전에 실패했다. 성공으로 집계하지 않았다. 저장소 의존성·환경을 바꾸지 않고 Playwright의 Chromium 캐시를 준비한 뒤 다시 검증한다.
- Playwright install chromium으로 필요한 브라우저 캐시를 설치했다. 재실행한 19건 중 18건이 통과했고, 1건은 개발 StrictMode의 초기 취소/재요청을 무시한 테스트의 헤더 횟수 고정값 때문에 실패했다. 실제 목록 재시도 뒤 목록이 정상 표시되는 것은 확인했다.
- 해당 테스트는 초기 헤더 완료 시점의 요청 수를 기준으로 재시도가 헤더를 추가 호출하지 않는지 검증하도록 수정했다. Sidebar 클릭 시 최초 헤더 1회·드롭다운 이전 목록 0회 검증은 별도 테스트에서 유지한다. 브라우저 신규 통합·기존 앱 smoke를 다시 실행 중이다.
- build 통과. 기존 큰 chunk 경고는 유지한다. 데스크톱/모바일 캡처에서 한 줄 헤더·오른쪽 도구·360px 팝오버 범위를 직접 확인했다.
- 수정 후 신규 통합 10건과 기존 앱 smoke 1건을 다시 실행해 11건 전부 통과했다. 기존 Sidebar/오른쪽 도구 9건과 합쳐 고유 E2E 20건의 최종 판정을 확인했다. 필수 검증에 남은 실패·skip은 없다.
- 최종 typecheck·lint 통과. 기능 코드의 검증 후에는 설명 주석만 보강했다. TypeScript AST 검토에서 변경 TS/TSX 21개·함수 선언 111개의 기능 주석과 crm-view의 공개 feature 경계·직접 fetch/console 부재를 확인했다.
- QA 캡처: /tmp/onehandsales-front-header.cggdsovf의 object-header.png, mobile-header.png, header-ux.png.
- 완료 보관 후 문서 4개·상대 참조 22개·View 타입 11개·한/영 헤더 리소스 52개 키의 일치와 전체 변경 파일의 공백·범위를 확인했다. git diff --check 통과. Backend/Admin·환경·package/lockfile 변경은 없다.

## 완료와 후속 범위

사이드바 관리항목/업무목록 → ③ 헤더 → 드롭다운 ①/② → 현재 보기·읽기 전용 별표 표시를 연결했다. API 응답의 대상 이름/ID를 사용하고 View 없음/오류/검색 결과 없음·응답 경합을 구분한다. 초기 선택은 헤더 응답을 사용하며 저장·최근 선택 정책을 추가하지 않았다.

계획과 검증·규칙 검토를 완료 보관한다. Backend·DB·환경 파일·사용자 서버·Admin Web·package/lockfile·커밋은 변경하지 않았다. 본문 타입별 렌더링·View 저장/생성·즐겨찾기 쓰기는 후속 요청 범위다.

## 추가 요청: Git 커밋

- 사용자가 완성된 프론트 연결 형태를 확인하고 Git 커밋을 명시적으로 요청했다. 앞선 구현 단계의 커밋 제외 범위는 이번 요청으로 변경됐다.
- 현재 변경 상태와 작업 범위를 확인했다. 공통 헤더 연결·테스트·완료 문서·목차·로그 31개 파일을 커밋 대상으로 정했다.
- 앞서 통과한 typecheck·lint·build, 단위 41건과 고유 브라우저 20건의 검증 결과를 확인했다. 새 기능 변경이 없어 실행 테스트를 반복하지 않았다.
- 커밋 전 전체 변경 파일의 공백·범위, 완료 문서 4개·상대 참조 22개를 다시 확인했고 git diff --check가 통과했다. Backend/Admin·환경·package/lockfile 변경은 없다.
