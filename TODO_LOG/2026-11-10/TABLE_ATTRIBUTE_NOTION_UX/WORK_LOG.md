# TABLE 속성 생성 UX 정리

- 상태: 완료 (헤더 버튼 기본 색상 변경 및 커밋 준비 포함)
- 작업일: 2026-11-10
- 요청: 앞서 제안한 이름 입력 + 2열 유형 팝오버 흐름을 적용하고 placeholder를 `컬럼명을 작성해주세요.`로 사용한다.
- 기준: `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`, UXUI planning/checklist, FRONT_AGENT architecture/convention, PM Decision 022, `TODO/TABLE_ATTRIBUTE_CREATE_PLAN`.
- 시작 상태: main / b7c5a28e, 사용자 변경 없음.

## 적용 범위

- 헤더는 유형 아이콘과 테두리 없는 이름 입력으로 구성한다. 상시 저장/취소 버튼을 제거한다.
- 17종을 검색 가능한 2열 팝오버에 표시한다. Portal과 화면 경계 보정으로 표 스크롤에 잘리지 않게 한다.
- 이름 입력 후 유형 선택 시 저장. 유형 먼저 선택 시 이름 입력 후 Enter/바깥 클릭으로 저장. 바깥 클릭 시 빈 이름은 취소하고, 이름이 있는 미완성 초안은 유지하면서 팝오버만 닫는다. Esc는 초안을 취소한다.
- 입력 영역과 팝오버 사이 이동은 저장하지 않는다. IME, 중복 제출 방지, creationId 재시도, 저장 후 조회 복구, scope 전환 보호를 유지한다.
- BE/API/DB 계약은 유지한다. 사용자 지정 한국어 문구는 정확히 사용한다.

## 진행 및 검증

- 관련 지침, 기존 구현·테스트·API 계약 확인 완료.
- 이름 입력/Portal 팝오버 구현, 한국어·영어 문구, 기존 생성 E2E의 새 상호작용 반영 및 문서 동기화.
- Node 24.18.0에서 `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`(18 files / 99 tests), `pnpm.cmd build` 통과. 최종 위치/포커스 보정 뒤 typecheck와 변경 파일 ESLint, build를 다시 통과했다.
- 실행 중인 5173 User Web을 재사용하며 webServer 설정 없이 API mock Playwright를 실행했다. 초기 24개 중 23개 통과, 1개는 최초 Portal 위치가 화면 좌상단에 머물러 바깥 클릭을 가린 문제로 실패했다.
- 부모 헤더 ref 연결 이후 위치를 측정하도록 수정하고 헤더와 팝오버 위치 검증을 추가했다. 수정 후 생성 시나리오 11개 전부 통과. 기존 본문 회귀 13개도 통과했다. 최종 합계 24개 사례 통과.
- 검증 명령: `pnpm.cmd exec playwright test --config node_modules/.cache/codex-table-attribute-ux/playwright.config.mjs tests/e2e/create-table-attribute.spec.ts tests/e2e/view-main-data-integration.spec.ts`. 수정 후 생성 파일만 별도 출력 경로로 재실행했다.
- 한국어 desktop 및 390px 영문 mobile 캡처를 확인했다. 2열/17종, 표 밖 Portal, 이름 헤더 연결 위치, 검색, 입력 영역 간 이동, 한글 IME, Esc, 초안 유지, 재시도 ID, 응답 유실, 조회 실패 복구, 화면 전환 보호를 검증했다.
- 캡처: `TEMP/table-attribute-ux-20261110/desktop.png`, `mobile.png`. 빌드 로그: 같은 폴더의 `build.log`.
- 서버/Docker 재시작, 실제 DB 쓰기, 커밋은 수행하지 않았다. `git diff --check` 통과.

## 검토 결과와 범위

- FE의 입력·팝오버·번역·E2E와 관련 문서만 변경했다. Backend 요청/응답, 타입 모델, 멱등성 계약은 유지했다.
- `컬럼명을 작성해주세요.`는 사용자 지정 문구 그대로 반영했다. 접근성 이름과 placeholder를 분리했다.
- 기존 Browserslist 데이터 갱신 안내와 500kB 초과 청크 경고가 남는다. 실제 PostgreSQL/운영 환경 검증을 의미하지 않는다.
- 요청 범위의 구현·문서·검증은 완료했다. 후속 UX 변경 시 `inline-attribute-column.tsx`와 `attribute-type-popover.tsx`에서 이어간다.

## 생성 컬럼 너비 후속 조정

- 요청: 생성 중인 컬럼의 좌우 공간이 생성 후보다 크게 보이는 원인 확인과 정리.
- 원인: 저장 너비가 없는 새 컬럼은 150px, 임시 컬럼은 280px 고정이었다. 글자 시작 위치도 각각 36px/44px로 달랐다.
- 변경: 임시 컬럼과 기본 컬럼이 같은 150px 상수를 사용한다. 28px 유형 버튼의 클릭 영역을 유지하면서 아이콘 시작 12px, 텍스트 시작 36px, 오른쪽 여백 12px로 맞춘다. 긴 안내 문구는 title로도 제공한다.
- 이전 작업 변경을 보존한다. 팝오버 너비와 기존 컬럼의 저장/드래그 너비는 유지한다.
- 검증: User Web typecheck, 변경 컴포넌트 ESLint, `git diff --check` 통과. 기존 API mock Playwright 중 desktop 생성/새로고침과 390px mobile 사례 2개 통과. 새 테스트는 추가하지 않았다.
- 화면 확인: `TEMP/table-attribute-width-20261110/` 아래 desktop/mobile 캡처에서 좁아진 임시 열과 기존 2열 유형 팝오버를 확인했다. 이번 후속에서는 전체 단위 테스트/전체 E2E/build를 반복하지 않았다.

## + 영역 전환 UX 후속 조정

- 요청: 150px 이름 입력 너비와 현재 좌우 간격을 유지하면서 +가 있던 자리 자체를 입력 상태로 전환한다.
- 변경: 생성 초안 때문에 grid 열/본문 빈 셀을 추가하지 않는다. 기존 마지막 추가 영역에서 버튼과 이름 입력을 교체하고 입력 오른쪽 구분선을 제거했다. 생성 중 별도 +는 표시하지 않으며 취소 시 원래 위치에 복원, 저장 후 실제 새 컬럼 다음에 표시한다. Object의 마지막 추가 영역은 최소 150px를 확보해 입력 전환 시 표 너비가 바뀌지 않으며 List의 기존 44px 최소 폭은 유지한다.
- 입력·팝오버 너비와 내부 간격, 저장/재시도/IME 동작 및 BE 계약은 유지한다. 이전 사용자 요청으로 만든 미커밋 변경도 보존한다.
- 검증: User Web typecheck, 변경 컴포넌트·기존 E2E 파일 ESLint, `git diff --check` 통과. 기존 실행 중인 User Web에서 API mock Playwright 24개 통과(속성 생성 11개 + 공통 본문 회귀 13개). 기존 사례에 150px 폭, + 위치에서 입력 전환, 작성 중 별도 + 없음, 헤더/본문 셀 수 유지, 저장 후 + 복원 검증을 보강했다. 새 테스트 파일은 추가하지 않았다.
- 화면 확인: `TEMP/table-attribute-inplace-20261110/` 아래 desktop/mobile 캡처에서 작성 중 추가 버튼·임시 구분선 제거와 2열 팝오버를 확인했다. 실제 DB 검증이나 배포를 의미하지 않으며 이번 후속에서는 전체 unit/build를 반복하지 않았다.

## 빈 이름 자동 취소 및 글꼴 후속 조정

- 요청: 이름 없이 바깥을 클릭하면 입력창·팝오버를 닫고 원래 +로 복원한다. `IMAGE_SAMPLE/image4.png`의 글꼴·크기·색상에 맞춘다.
- 변경: 공백뿐인 이름도 빈 이름으로 처리하며 유형만 선택한 경우에도 취소한다. 팝오버 내부 이동, 이름이 있는 초안 및 기존 저장·재시도 흐름은 유지한다. 바깥 클릭 시 클릭 대상의 포커스를 보존하고 Esc는 +로 포커스를 복원한다.
- typography: 앱의 Inter/Pretendard 기본 font-sans를 두 영역에 명시한다. 첨부 화면과 기존 스타일을 대조해 이름/유형 14px, 검색 13px, 제목 12px, 본문 #37352F·placeholder #A3A3A0·제목 #8E8D87·아이콘 #9CA3AF를 사용한다. 150px 입력 폭과 팝오버 폭·간격은 유지한다.
- 검증: User Web typecheck, 변경 TSX/E2E 파일 ESLint, `git diff --check` 통과. 실행 중인 User Web을 사용한 API mock Playwright 생성 시나리오 12개 통과. 신규 사례에서 빈 이름/유형 선택 후 공백 이름/입력 후 삭제, 팝오버 내부 검색 유지, 바깥 클릭 대상 포커스, + 위치 복원 및 POST 0건을 확인했다. 기존 저장·IME·Esc·실패 재시도·모바일 사례도 통과했다.
- 화면 확인: `TEMP/table-attribute-dismiss-20261110/` 아래 `empty-name-editor.png`, `empty-name-restored.png`, 모바일 캡처를 확인했다. 첨부 화면의 글꼴 계열·크기·색상과 일치하는 기존 값을 유지하고 두 영역에 font-sans를 명시했다. 이번 후속에서는 실제 DB 쓰기, 전체 unit/build, 서버 재시작을 수행하지 않았다.

## 입력 헤더 아래 가로 구분선 복원

- 요청: + 클릭 후 입력창 아래 가로 구분선이 사라지는 현상 확인.
- 원인: 헤더 행의 하단 inset shadow 위에 입력 루트의 bg-white가 칠해져 150px 입력 영역에서 선이 가려졌다. 기존 캡처와 현재 스타일에서 확인했다.
- 변경: 입력 루트의 배경을 투명하게 바꿔 흰색 헤더 배경과 가로 구분선이 그대로 보이게 한다. 입력 폭·간격·팝오버·저장/취소 동작은 유지한다.
- 검증: 변경 컴포넌트 ESLint 및 `git diff --check` 통과. 기존 API mock Playwright 중 빈 이름 취소/복원, 영문 모바일 시나리오 2개 통과. `TEMP/table-attribute-divider-20261110/`의 캡처에서 선이 이어지는 것을 확인했다. 동일 좌표 y=73의 x=850/900/940 픽셀이 수정 전 (250,250,250)에서 수정 후 (233,232,229)로 바뀌어 옆 헤더 x=950의 선 색상과 일치한다(팝오버 그림자가 합성된 값). 새로운 테스트는 작성하지 않았고 스타일 한 줄 변경이므로 전체 typecheck/unit/build/E2E는 반복하지 않았다.

## 생성 입력 영역 220px 확대

- 요청: + 클릭 후 표시되는 전체 이름 입력 영역을 220px로 확대한다.
- 변경: 생성 입력 전용 220px 상수를 분리해 추가 영역과 입력에 적용한다. 기존 컬럼의 기본 150px 및 저장/드래그 너비는 유지한다. 아이콘·좌우 여백은 그대로여서 실제 텍스트 입력 폭은 172px가 된다. 팝오버·취소·구분선 동작은 유지한다.
- 검증: 변경 파일 ESLint 및 기존 API mock Playwright 중 desktop 생성, 빈 이름 취소, 영문 모바일 3개 통과. 후속 검색 버튼 변경을 포함한 12개 사례도 통과했으며 최종 desktop/mobile에서 220px 입력 영역을 확인했다.

## 유형 팝오버 제목 및 검색 버튼

- 요청: 팝오버 제목을 `정보 유형 선택`에서 `유형 선택`으로 바꾸고 제목 바로 오른쪽에 돋보기 버튼을 배치한다. 검색창은 버튼을 눌렀을 때 표시한다.
- 변경: 검색창은 기본 숨김, 버튼 클릭 시 표시 및 입력 포커스 이동, 다시 클릭하면 검색어 초기화 및 숨김. 키보드로 유형을 열 때 검색창이 숨겨져 있으면 첫 유형에 포커스한다. Portal 내부 조작·빈 이름 자동 취소·저장 흐름은 유지한다. 한국어/영어 제목은 `유형 선택`/`Choose type`으로 제공한다.
- 검증: User Web typecheck, 변경 TSX/번역/E2E 파일 ESLint, `git diff --check` 통과. API mock Playwright 생성 시나리오 12개 통과. 기존 사례에 기본 검색 숨김, 돋보기 열기/포커스, 검색어 초기화 후 17종 복원, 검색 영역 내부 클릭 보호 및 키보드 첫 유형 이동을 반영했다. 실제 DB나 서버 설정을 변경하지 않았다.
- 화면 확인: `TEMP/table-attribute-search-toggle-20261110/`의 `empty-name-editor.png`, `type-search-open.png`, 영문 모바일 검색 열림 캡처를 확인했다. 220px 입력 영역의 전체 안내 문구, 헤더 가로 구분선, 제목 바로 오른쪽 돋보기, 접힘/펼침 2열 목록 및 모바일 화면 범위를 확인했다.

## 돋보기 오른쪽 검색창 배치

- 요청: 검색창을 제목 아래 행 대신 돋보기 오른쪽 같은 줄에 표시한다.
- 변경: 제목·돋보기·검색 입력을 하나의 flex 행에 배치하고 중복 검색 아이콘을 제거한다. 남은 가로 공간을 검색 입력에 할당하며 제목과 아이콘은 줄바꿈/축소하지 않는다. 입력 높이는 돋보기 버튼과 같은 20px로 맞춰 펼칠 때 목록이 아래로 밀리지 않게 한다. 기존 열기/닫기·검색어 초기화·포커스·생성 동작은 유지한다.
- 검증: 변경 TSX/E2E 파일 ESLint와 `git diff --check` 통과. 기존 API mock Playwright 3개(빈 이름 취소·검색 토글, 키보드 검색 생성, 영문 모바일) 통과. 기존 검색 helper에 입력이 버튼 오른쪽이며 세로 중앙이 일치하는 배치 검증을 추가했다. `TEMP/table-attribute-inline-search-20261110/`의 desktop/mobile 검색 열림 캡처에서 같은 줄 배치와 화면 내 표시를 확인했다. 새 테스트 파일이나 전체 unit/build 검증은 추가하지 않았다.

## 유형 검색 안내 문구 및 헤더 텍스트 통일

- 요청: 유형 검색 placeholder를 `찾는 유형을 검색하세요.`로 변경한다. 상단 헤더 텍스트는 사용자가 명시한 왼쪽 사이드바의 `전체 영업 파이프라인` 항목 스타일을 따른다.
- 기준: `components/navigation/sidebar-data-list.tsx`의 기본 항목은 앱 공통 font-sans(Inter/Pretendard 및 시스템 fallback), 14px, font-medium(500), #4B5563이며 hover는 #111827이다. 보기 선택 팝오버 항목의 12px 스타일과 구분했다.
- 변경: placeholder 전용 번역 키를 추가해 검색 버튼과 접근성 이름은 유지한다. WorkspaceViewHeader의 대상 제목·현재 보기 이름 및 ViewHeaderToolbar의 버튼 텍스트/건수를 사이드바 기준으로 통일했다. 활성 도구는 배경·아이콘으로 구분하고 비활성 도구는 opacity를 사용한다. 헤더 38px와 기존 반응형 표시·팝오버·즐겨찾기 기능은 유지한다.
- 검증: User Web typecheck, 변경 TSX/번역 파일 ESLint, `git diff --check` 통과. 기존 API mock Playwright 3개(빈 이름 취소·유형 검색, 영문 모바일, 38px 헤더/필터·정렬·보기 설정/1440·1024px 배치) 통과. 스타일·문구 변경에 대한 신규 테스트는 작성하지 않았다.
- 화면 확인: `TEMP/table-header-typography-20261110/`의 한국어 desktop 및 영문 mobile 검색 열림 캡처에서 새 placeholder, 사이드바와 같은 헤더 글자 스타일, 기존 한 줄 검색 배치를 확인했다. 서버 재시작·실제 DB 쓰기·커밋은 수행하지 않았다.

## 헤더 대상 아이콘 20px 고정

- 요청: 상단 제목 앞 관리항목/업무목록 아이콘을 항상 20×20px로 표시한다.
- 변경: WorkspaceViewHeader의 대상 IconValueGlyph 크기를 16px에서 명시적 20px로 지정하고 shrink-0를 유지한다. desktop/mobile 공통 적용이다.
- 검증: 변경 컴포넌트 ESLint 및 기존 API mock Playwright desktop 헤더/영문 모바일 2개 통과. 후속 16px 아이콘 통일을 포함해 desktop/mobile 최종 캡처를 확인했다.

## 헤더 나머지 아이콘 16px 통일

- 요청: 제목 앞 대상 아이콘은 20×20px를 유지하고 헤더의 나머지 아이콘은 16×16px로 맞춘다.
- 변경: 현재 보기 아이콘·펼침 화살표·즐겨찾기·검색·필터·정렬·기록 추가·보기 설정·추가 도구 및 접힌 사이드바 열기 아이콘에 고정 16px와 shrink-0를 적용한다. 공통 ViewGlyph는 헤더에서만 크기를 지정해 선택 메뉴 내부 아이콘 크기를 보존한다.
- 검증: User Web typecheck, 변경 컴포넌트 ESLint, `git diff --check` 통과. 기존 API mock Playwright desktop 38px 헤더/팝오버 및 영문 모바일 2개 통과. `TEMP/header-icons20-16-20261110/`의 desktop/mobile 캡처에서 크기와 배치를 확인했다. 신규 테스트를 작성하지 않았으며 서버·실제 DB·커밋은 변경하지 않았다.

## 헤더 버튼 기본 색상 및 커밋

- 요청: 보기 선택·즐겨찾기·검색·필터·정렬·보기 설정 버튼의 기본 텍스트/아이콘 색상을 #9CA3AF로 통일하고 hover 색상은 유지한다. 앞서 요청한 Git 커밋에 이번 수정을 포함한다.
- 변경: 지정 버튼의 기본 색상만 변경했다. 기존 hover 배경 #E4E2DC와 텍스트 #111827, 보기 아이콘/화살표의 hover 색상을 유지하며 선택된 즐겨찾기·활성 도구의 상태 표현도 유지한다. 대상 제목/대상 아이콘/파란 기록 추가 버튼 및 비활성 추가 도구는 기존 스타일을 유지한다.
- 검증 및 커밋 준비: 변경 파일 ESLint 및 `git diff --check` 통과. 기존 API mock Playwright 2개(38px 헤더·팝오버·반응형, 즐겨찾기 키보드 조작·모바일 상태 공유) 통과. 최신 타입 검사도 직전 아이콘 변경에서 통과했으며 이번 추가 변경은 CSS 클래스와 문서뿐이다. 사용자가 요청한 커밋 범위는 이번 UX·헤더 변경의 코드/번역/기존 E2E/문서/작업 로그 14개 파일이며 다른 변경은 없음을 확인했다.
