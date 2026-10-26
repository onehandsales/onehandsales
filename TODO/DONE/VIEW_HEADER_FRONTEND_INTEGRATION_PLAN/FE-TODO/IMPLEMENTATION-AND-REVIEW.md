# Frontend 구현·검증·G99 검토

- 상태: 완료
- 일자: 2026-10-26
- 기준: [Front 체크리스트](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md), [소비 계약](../COMMON/API-SPEC/VIEW_HEADER_FRONTEND_CONSUMPTION.md), [작업 로그](../../../../TODO_LOG/2026-10-26/VIEW_HEADER_FRONTEND_INTEGRATION/WORK_LOG.md)

## 1. 구현 결과

crm-view feature가 기존 세 HTTP 계약을 apiClient로 호출한다. 사용자/Workspace/대상 종류/ID/선택 ID별 Query key와 AbortSignal을 사용하며 AppShell의 단일 모델을 Object/List의 데스크톱·모바일 공통 WorkspaceViewHeader가 공유한다.

대상 이름/아이콘은 ③ 응답으로 표시한다. 목록 요청은 오픈 시에만 헤더 응답의 대상 ID로 수행하며 View가 없으면 선택 query를 생략한다. 선택과 검색은 화면 상태이고 저장·순서 변경을 하지 않는다. 별표는 초기 응답 또는 기존 개인 즐겨찾기 조회 결과로 표시하며 미확인을 false로 확정하지 않는다.

List 경로와 Sidebar NavLink·최소 화면을 연결했다. 기존 Object 본문·검색/기록 추가·오른쪽 미리보기 도구를 보존하고 로컬 View 생성/별표 변경은 제거했다. 신규 UI/모델은 feature 공개 index, 공통 아이콘은 components/ui의 기존 구현을 사용한다.

## 2. 실제 검증

Node 24.21.0 / pnpm 8.14.1에서 실행했다. 실제 Backend/Provider는 브라우저 테스트에서 Mock으로 격리하고 테스트 Vite 서버 5175만 도구가 관리했다. 사용자 5173/5174/3000 서버·환경 파일·업무 DB를 변경하지 않았다.

| 검증 | 명령·근거 | 결과 |
| --- | --- | --- |
| 타입 | fnm exec --using=24.21.0 pnpm -C FE/user-web typecheck | 최종 통과 |
| 린트 | fnm exec --using=24.21.0 pnpm -C FE/user-web lint | 최종 통과 |
| 단위 전체 | fnm exec --using=24.21.0 pnpm -C FE/user-web test | 11 files / 41 tests 통과 |
| 빌드 | fnm exec --using=24.21.0 pnpm -C FE/user-web build | 통과, 기존 큰 chunk 경고 유지 |
| 기존 Sidebar·헤더 오른쪽 | 아래 첫 관련 E2E 실행의 기존 테스트 | 9건 통과 |
| 신규 헤더 통합·기존 앱 smoke | 아래 최종 E2E 실행 | 11건 전부 통과 |
| 정적 검토 | TypeScript AST·변경 범위·문서 검토 | TS/TSX 21개·함수 선언 111개 주석·새 feature 경계 통과 |
| 시각 검토 | desktop/mobile 캡처 직접 확인 | 한 줄 헤더·오른쪽 도구·360px 팝오버 확인 |
| 문서·계약·범위 | 완료 문서 4개·상대 참조 22개·타입 11개·한/영 헤더 키 52개·diff 공백 | 통과, Backend/Admin·환경·의존성 변경 없음 |

첫 관련 E2E 명령: fnm exec --using=24.21.0 pnpm -C FE/user-web test:e2e -- tests/e2e/view-header-integration.spec.ts tests/e2e/view-header-ux.spec.ts tests/e2e/sidebar-work-lists.spec.ts tests/e2e/sidebar-view-favorites.spec.ts.

최종 E2E 명령: fnm exec --using=24.21.0 pnpm -C FE/user-web test:e2e -- tests/e2e/view-header-integration.spec.ts tests/e2e/user-web-smoke.spec.ts.

고유 테스트 20건의 최종 판정을 확인했다. 신규 통합은 클릭 시 ③/오픈 전 목록 0회/종류별 API·응답 ID 사용·서버 순서/선택·재오픈·로컬 검색·로딩/실패/404/빈 목록·헤더/목록 응답 경합·키보드·반응형 공유 선택·읽기 별표·쓰기 없음 검증이다. QA 캡처는 /tmp/onehandsales-front-header.cggdsovf에 보관했다.

## 3. 초기 실패와 수정

- 최초 17건은 Chromium 실행 파일 부재로 브라우저 실행 전에 실패했다. Playwright install chromium으로 브라우저 캐시를 준비했다. package/lockfile·환경 파일은 변경하지 않았다.
- 브라우저 준비 후 19건 중 18건 통과, 1건은 직접 진입 시 StrictMode의 초기 취소/재요청을 무시한 헤더 횟수 고정 assertion 때문에 실패했다. 초기 헤더 완료 시점과 목록 재시도 뒤의 요청 수를 비교하도록 고쳤으며 Sidebar 클릭의 헤더 1회·오픈 전 목록 0회 검증은 그대로 유지했다.
- 최종 신규 통합 10건·기존 앱 smoke 1건은 전부 통과했다. 기존 Sidebar/오른쪽 도구 9건도 성공했다. 실패·skip을 통과로 집계하지 않았다.

## 4. 규칙별 최종 판정

| 항목 | 판정·근거 |
| --- | --- |
| 범위·feature ownership | 준수. crm-view 공개 index/모델·공통 UI, Admin·Backend 변경 없음 |
| 인증·API 계약 | 준수. apiClient 재사용·인증 header 브라우저 확인·기존 세 계약 변경 없음 |
| 상태·캐시 경계 | 준수. 사용자/Workspace/종류/대상/선택 Query key·AbortSignal·대상 전환 초기화 |
| 조회 시점·응답 조합 | 준수. ③ 응답의 이름/ID 사용, 드롭다운 오픈 시 목록 조회·선택 query 처리 |
| UI 의미·저장 | 준수. 서버 데이터와 정상 빈 상태, 읽기 별표·미확인 구분, 가짜 저장/자동 View 없음 |
| 기존 기능 | 준수. Object 본문·오른쪽 도구·Sidebar 표시/Workspace 전환·앱 smoke 보존 |
| 접근성·반응형 | 준수. 키보드 선택·Escape 복원·서버 순서·말줄임·360/390/1024/1440px·공유 선택 |
| 문구·로그 | 준수. 한국어/영어 리소스, 내부 용어/원문 오류 노출·새 console/개인정보 로그 없음 |
| 주석·검증 | 준수. 기능·중요 번호 주석과 정적/단위/브라우저/빌드 검증 |
| 작업 기록·후속 분리 | 준수. 시작부터 로그·소비 계약·실제 실패/수정·완료 보관 기록 |

필수 연결·검증의 미확인 항목은 없다. 타입별 본문·View 생성/저장·즐겨찾기 쓰기는 이번 요청의 후속 범위다. 실제 Supabase/실사용자 인증을 사용한 배포 smoke는 수행하지 않았으며, 기존 HTTP 계약 소비는 Mock 브라우저와 API 단위 검증으로 확인했다. 커밋은 요청 범위에 없어 수행하지 않는다.
