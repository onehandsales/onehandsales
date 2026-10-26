# View 즐겨찾기 추가·삭제 Frontend 연결

- 일자: 2026-10-26
- 상태: 구현·검증·G99 규칙 검토 완료, 사용자 요청으로 커밋 대상 확정
- 계획: [완료 계획](../../../TODO/DONE/VIEW_FAVORITE_FRONTEND_INTEGRATION_PLAN/README.md)
- 기준: [Front Agent](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [검토 체크리스트](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)

## 요청·시작 확인

사용자가 구현된 View 즐겨찾기 POST/DELETE를 프론트 별표 클릭에 연결하도록 요청했다. Front Agent 규칙을 준수하고 현재 공통 View 헤더·사이드바 구조를 재사용한다. 시작 작업 트리는 깨끗하다. Backend API/스키마·환경 파일·사용자 서버 프로세스·Admin Web·커밋은 변경하지 않는다.

규칙과 기존 API 계약·선택/캐시 구조 확인 → 범위·사용 흐름 계획 → 구현 → 단위/브라우저·정적/빌드 검증 → Front 규칙 재검토·문서 기록 순서로 진행한다. 실행 결과·실패와 수정 사항은 이 로그에 누적한다.

## 범위·상태 처리 결정

Front CONVENTION/ARCHITECTURE/DECISIONS·검토 체크리스트와 Notion/Attio UX 기준, 기존 단일 헤더 모델·Query key·apiClient·개인 사이드바·Playwright mock을 확인했다. 기존 Backend 계약을 단일 정본으로 연결한 소비 계약을 코드 전에 confirmed로 작성했다.

낙관적 변경 없이 성공 응답을 반영한다. 요청 시작 시 이전 GET을 취소하고 응답은 요청 당시 사용자/Workspace/View에만 적용한다. 성공/실패 후 헤더·개인 목록을 재조회하며 선택은 유지한다. 비초기 View도 실제 응답의 확인 상태를 쓰고 이후 최신 GET을 우선한다. 전송 중에는 공통 모델에서 중복 쓰기를 막는다. 오류는 scope를 제한해 현지화 안내하고 raw 오류/토큰은 출력하지 않는다. 빈/미확인 상태에서는 쓰기를 막는다.

## 구현·검증 진행

- view-favorite의 순수 응답 타입·POST/DELETE client와 공개 진입점, crm-view mutation hook·헤더 모델·공통 버튼, AppShell의 개인 목록 갱신 시각 연결을 구현했다. 사이드바 PK를 임의 생성하지 않고 서버 목록을 재조회한다.
- 한국어/영어의 기존 등록·해제 번역 키가 뒤쪽에 이미 있어 최초 typecheck에서 중복 키 오류가 발생했다. 중복 추가를 제거하고 기존 키를 재사용했다. 이후 typecheck/lint 통과.
- 단위 테스트 13 files/57 tests 통과. 새 client 계약 4건·실제 React/QueryClient의 범위/캐시/중복/실패/최신 조회 검사 12건을 추가했다. 접근 오류 안내를 닫아도 같은 부재 대상의 쓰기를 다시 열지 않도록 처리했다.
- 관련 Playwright 32건 실행 중이다. 초기 Object/List 등록·해제, 비초기 선택, 200 재요청, 중복 차단, 500/404, 불확실한 실패 후 재조회, 늦은 대상 전환은 중간 결과에서 통과했다. 완료 결과는 종료 후 기록한다.
- 최종 캐시 검토에서 UUID 대소문자가 다른 경로와 서버 canonical Workspace ID 사이의 키 불일치 가능성을 확인했다. Query key와 응답 scope에서 ID 표기를 통일해 같은 개인 목록이 반드시 갱신되도록 보완하고 검증할 예정이다. API/DB 계약은 변경하지 않는다.

- 1차 Playwright 32건 중 30건 통과/2건 실패였다. Workspace 전환 검사는 계정 메뉴의 정확한 접근성 이름을 잘못 기대한 테스트 문제였고, 401 검사는 기존 공통 mock이 credentials 요청에 CORS `*`를 반환해 실제 브라우저에서 refresh 응답이 거부되는 문제였다. 선택자를 실제 이름으로 고치고 mock 응답/preflight가 요청 origin을 반환하도록 수정했다. 인증·제품 공통 client를 수정하지 않았다. 실패 두 건은 재실행해 모두 통과했다.
- UUID 캐시·응답 scope 정규화를 구현하고 실제 React/QueryClient 단위 사례를 추가했다. 전체 단위 검사는 13 files/58 tests 통과했다. 수정 전 build도 통과했고 최종 코드 기준 typecheck/lint/build와 브라우저 전체 관련 검사를 다시 진행한다.
- 모바일 360px와 데스크톱 화면의 별표·선택·헤더 배치를 스크린샷으로 확인했다. 화면과 직접 연결되는 추가 회귀로 인증된 핵심 진입 smoke를 포함하고 오류 안내의 viewport 경계도 검사한다.

## 최종 결과·검토

- Node 24.21.0 typecheck/lint/build 통과, 단위 13 files/58 tests 통과(신규 17건). 최종 Chromium E2E는 관련 6개 파일의 33건을 모두 통과했다(신규 쓰기 13건·기존 회귀 20건). 실패·skip 없음.
- 브라우저는 mock API로 등록/해제·현재/비초기 View·201/200·중복/실패/404/401 refresh·불확실한 결과 재조회·늦은 대상/Workspace 응답·서버 순서·키보드·360/390/1024/1440px를 확인했다. 사용자 DB에 쓰지 않았다. 사용자 Front/Admin/Backend health 모두 200이고 프로세스를 변경하지 않았다.
- 보고서·스크린샷: `/tmp/onehandsales-favorite-front.ulxslb4o/`의 `playwright-results.json`, `playwright-final.log`, `final-results/`, `vitest-final.log`, `typecheck.log`, `lint.log`, `build-final.log`. 초기 실패 결과는 `initial-playwright-results.json`에 보존했다. 실제 수치와 수정 이력은 이 로그에 남긴다.
- G99에서 feature 공개 진입점·공통 인증 client·응답/오류 계약·캐시 격리·선택 유지·서버 순서·주석/번호·no any/직접 console 금지·민감 정보 비노출·현지화·접근성·반응형을 검토했다. 기록된 두 테스트 설정 문제와 번역 키 중복을 수정했고 추가 결함을 발견하지 않았다.
- 소비 계약 implemented·기능 README·Front Agent 활성 범위·TODO 인덱스를 현재 동작에 맞추고 DONE 보관했다. Backend/DB·환경 파일·Admin Web·사용자 서버·커밋 변경 없음. 남은 범위는 즐겨찾기 행 클릭 이동/정렬·View 생성/저장·타입별 본문이며 이번 요청 범위는 완료했다.

## 사용자 요청에 따른 커밋

사용자가 프론트 연결 작업의 Git 커밋을 명시적으로 요청했다. 작업 트리와 검증 산출물을 다시 확인했으며, 직전 검증 뒤 제품 코드 변경 없이 동일한 즐겨찾기 연결·테스트·문서만 남아 있다. 단위 58건·Chromium E2E 33건·typecheck/lint/build 통과 결과를 유지한다. 커밋 상태를 문서에 반영하고 변경 범위·공백 검사를 거쳐 관련 파일만 커밋한다. Backend·환경 파일·업무 DB·사용자 서버는 변경하지 않는다.
