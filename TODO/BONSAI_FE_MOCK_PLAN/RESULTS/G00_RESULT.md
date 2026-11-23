# G00 실행 결과 — 교체 범위와 공통 UI 근거

> 1~6절은 2026-11-20 최초 조사 당시 기록으로 보존한다. 현재 재검토와 후속 상태는 [7절](#g00-recheck)을 적용한다. 과거의 FE 전면 교체 계획·MCP 조회·PNG 4개·테스트 수치·증거 링크는 이번 수행 결과가 아니다.

작성: 2026-11-20 KST. G00 조사 완료. G01 구현 검증은 [G01 결과](G01_RESULT.md)에 별도로 기록한다.

## 1. 착수와 허용 범위

- 시작 Git 작업 트리는 깨끗했다. 기준 커밋 `468db5d6`.
- 최신 사용자 요청은 `FE/user-web` 전면 교체다. 과거의 실제 로그인 보존·부분 수정 지침 대신 기본 진입부터 독립 목으로 교체한다. 기존 소스는 Git 이력으로만 보존한다.
- `.env`는 내용을 출력하지 않고 해시로 보존 여부를 점검한다. BE·Admin·DB·외부 계정·TODO_LOG는 이번 작업 대상이 아니다. 커밋·push·배포 없음.
- Node `24.18.0`, pnpm `8.14.1`. 기존 `::1:5174` PID 6400 리스너는 종료하지 않는다. 새 검증 서버는 비어 있는 별도 포트를 사용한다.
- AGENT/README, PM 036, UX 025, FRONT_AGENT README·구조·컨벤션·목·상태·접근성·주석·테스트·리뷰 체크리스트·결정 006 및 계획 공통 문서를 읽었다. AGENT/README의 `AGENT_USAGE_RULES.md` 링크는 실제 파일이 없으며 AGENT 내 검색에서도 찾지 못했다. 최신 사용자 지시와 존재하는 규칙으로 진행한다.

## 2. 실제 기존 실행 의존과 처리

| 대상 | 확인한 의존 | G01 처리와 이유 |
| --- | --- | --- |
| `src/main.tsx` → App → AppProviders | 모든 공개/내부 화면을 실제 AuthProvider가 감쌈 | 새 앱 조립으로 재작성 |
| `features/auth` | 저장된 토큰 복원, getMe, 공급자 조회, Supabase OAuth·refresh·logout | 제거. 어떤 실제 인증도 현재 허용하지 않음 |
| router·AppWorkspaceRedirect·AppShell | Workspace/Object/List/View 라우팅·초기 조회·프로필·즐겨찾기 API 결합 | 제거. 공개/인증/내부/공유 최소 경계 신설 |
| `lib/api-client`, env 연결, 업무 feature | fetch·token·업무 API 호출 | 제거. FE 전용 로컬 자료형·저장소만 구성 |
| global.css·공통 UI | 파랑 `#4880EE`, 38px 버튼, 기존 sidebar 치수 | Bonsai 캡처 근거의 token·Button·Field·Dialog로 재작성 |
| src 테스트·tests/e2e | 제거할 업무·실제 인증 구조에 맞춘 API intercept 테스트 | 제거 이유를 기록하고 새 상태 격리·경합·navigation·API 무호출 검증으로 교체 |
| scripts·public-site 자산·SEO 생성 | 기존 locale 마케팅 페이지를 build 후 다시 생성 | 제거. 새 SPA만 build하고 미래 공개 페이지는 G02 이후 구현 |
| package·lock·Vite/TS/lint/test | Node24·React19·Vite7·TS strict | 버전 업그레이드 없이 유지·정리. 미사용 SDK/업무 패키지 제거 |
| 환경 파일·브랜드 식별 | `.env`, OneHand CRM 제품명 | 보존. 실제 환경을 읽어 live로 전환하는 코드 없음 |

삭제 전 `FE/user-web` 절대 경로와 각 대상의 소속을 확인했다. 초기 inventory(디렉터리 포함)는 src 430, tests 28, scripts 4, public 46개다. 생성물·캐시와 이전 앱 소스를 혼동하지 않는다.

## 3. 원본·범위 확인

로컬 ANALYSIS 134개·상세 단계 754개·고유 Screen ID 642개를 다시 집계했다. 계획 색인의 ID·순서·담당 단계 범위와 대조해 불일치 0건을 확인했다. 이 집계는 전체 화면 시각 재검토나 전체 R 조사 완료가 아니다.

Gummble MCP로 `bonsai-web`, 앱 `c1026782-09a7-45fb-b2d0-7cc1909bf1f4`, `Latest / 2146`을 다시 확인했다. [MCP 기록](evidence/g00-source-manifest.json)은 3개 흐름 18단계 순서다. 카탈로그 버전은 제품 빌드가 아니며 캡처일·DPR·브라우저 배율은 미확인이다.

| 흐름 | Flow ID | 직접 본 PNG와 공통 UI 관찰 | 본래 담당 |
| --- | --- | --- | --- |
| Logging in | `a02409b3-6eb0-4bc0-b702-22a42e0990c8` | 02 `sc_9d353458318e43e7b25ebbf88fefeaa9`: 입력·Log in 버튼·인증 패널 | G11 |
| Adding a new client | `a5f7a722-8a0c-4528-966a-903e7e0873fb` | 02 `sc_40ff225f161846249b5cf8c2c55423b6`: 메뉴·아이콘; 03 `sc_3e2640e1d9ca4b59a7f1c79cb628a502`: Field·Dialog·닫기·Add Client 버튼 | G19 |
| Adding a bookkeeping category | `3a74090f-e360-4fb9-9b79-c1ca197708ba` | 02 `sc_f2a7c3be441a4a95ab91fba511865483`: 좁은 모달·중앙 제목·입력·Save Category 버튼 | G63 |

ANALYSIS의 관찰과 미수록 상태를 확인한 뒤 위 원본 PNG 4개를 이번 작업에서 직접 보았다. 원본 PNG 2880×1800, MCP 표기 1440×900. 비교는 1440×900 CSS viewport에서 원본을 1/2로 표시하며 이것을 원본 DPR 확정으로 쓰지 않는다. G01은 공통 요소의 재사용·검증이며 이 세 업무 플로우의 소유·완료를 가져오지 않는다.

## 4. G01 공통 시각값과 한계

| 항목 | 비교용 값 | 근거/확정 수준 |
| --- | --- | --- |
| 패널 배경 | `#fcfcfc` | client PNG 평면 픽셀 직접 추출 |
| 강조 버튼 | 상단 약 `#1b9f00`, 하단 약 `#1b9801` | client PNG 픽셀 추출. 원본 CSS gradient 여부는 추정 |
| 본문 | 약 `#091713` | 원본 텍스트 내부 픽셀·시각 추정 |
| 입력 | 높이 40, radius 6, 테두리 1, 글자 16 | client 03 좌표를 비교 배율 1/2로 환산한 CSS 후보 |
| 버튼 | 높이 46, radius 6, 글자 16/600 | client 03·login 02 비교 후보 |
| Dialog | 폭 460, 상단 60, 내부 여백 40, 제목 22/500 | client 03 비교 후보. G01 비교에서 최초 굵기600을500으로 보정. 전체 내용 높이는 자식 책임 |
| 라벨·본문 | 14/600·14/400, 행간 약 20~22 | 원본 시각 추정. computed style 미확인 |
| 폰트 | 정확한 family·font 파일 미확인 | 캡처만으로 단정 불가. 로컬 Outfit 임시 대체와 한글 OS fallback을 사용하고 동일성 미확인을 남김 |
| 키보드·실패·모바일 | 접근성 규칙을 따른 목 가정 | 정적 캡처에 없는 초점·Esc·재시도·경합을 Bonsai에서 실행한 사실로 쓰지 않음 |

현재 공식 로그인 HTML의 웹 조회를 시도했고 로컬 HTML/CSS 수집은 403이었다. 현재 공개 사이트 CSS의 Geist는 확인했지만 해당 Gummble 내부 앱과 같은 폰트라는 근거가 없어 섞지 않는다. 공식 도움말·API 규칙과 실제 계정 동작은 이번 G00에서 새로 검증하지 않았다.

## 5. G01 수용 기준과 후속

기본 `/`부터 새 독립 앱, 공개/가상 인증/내부/공유 경계, 메모리 세션·workspace, 고정 seed·clock, reset·오류·지연 시나리오, 동일 ID 목록/상세/수정, 공통 UI의 접근성과 실제 브라우저 비교를 검증한다. HTTP adapter나 미래 DB 타입은 만들지 않는다.

G02 이후의 실제 랜딩·로그인·대시보드·고객·프로젝트 구현은 시작하지 않는다. G01의 최소 화면은 기반 검증용이며 원본 전체 화면 완료로 보고하지 않는다. 정확한 font 자산·아이콘 원형·미수록 모바일 상태는 각 소비 Goal에서 추가 확인한다.

## 6. 착수·종료 체크 기록

[공통 체크리스트](../COMMON/START-CHECKLIST.md)의 항목별 적용 기록이다. 체크는 근거·범위 확인을 뜻하며 N/A를 기능 구현 완료로 계산하지 않는다. 남은 동일성·환경 검증은 위 결과의 대기 상태를 유지한다.

- [x] 사용자 요청의 Goal과 허용 범위, 제외 경로, 현재 Git 변경을 확인했다. — 1절의 사용자 범위·clean Git 확인.
- [x] [FRONT_AGENT](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md)와 [UX/UI 재현 기준](../COMMON/UXUI-REPLICATION.md)을 읽었다. Backend·API·DB 문서의 설계/확정을 현재 작업의 선행 조건으로 두지 않는다. — 1절의 읽은 규칙과 결정006.
- [x] [순서표](../COMMON/GOAL-WORK-ORDER.md)의 선행 G 결과·차이·검증 근거를 확인했다. 문서 존재만으로 구현 완료를 간주하지 않았다. — 선행 G 없음; G01에는 본 결과를 전달.
- [x] 해당 G 명세 2절의 R 체크리스트를 전부 확인했다. 분석 전이면 R을 먼저 수행하고, 결과·출처·소비 명세 변경·검토 판정을 연결했다. — 선행 R 없음; R 완료로 표시하지 않음.
- [x] R의 질문을 화면 보완과 후속 서버 메모로 나눴다. API·DB·실계정 정책 미확인이 관찰된 화면 제작을 막지 않게 했다. — 3~5절의 원본 미확인과 후속 질문.
- [x] 원본 ANALYSIS의 2~8절과 이미지·단계 순서·버전, [추가 구현 대기표](../COMMON/EXPANSION-BACKLOG.md)를 읽었다. 본문 링크가 없거나 자료가 바뀌면 근거를 보완했다. — 3절의 관련 분석·PNG4개·MCP18단계. 전체 이미지 재검토는 아님.
- [x] 진입자·목표·입력·출력·route·권한·저장·취소·실패·재진입과 같은 객체를 사용하는 다른 화면을 정리했다. — 2절 교체 범위·5절 G01 수용 기준.
- [x] 현재 FE의 router/provider/bootstrap/query/HTTP 의존을 확인하고 목 경로에서 실제 API가 호출되지 않도록 경계를 정했다. 기존 실행·환경을 임의로 변경하지 않는다. — 2절의 기존 실행 의존 조사. 수정은 후속 G01.
- [x] 작업을 한 Goal로 검토할 수 없을 정도로 커졌으면 목적·결과가 분명한 하위 구현 명세로 분리하고 순서·색인을 갱신했다. — 사용자가 G00/G01 연속 작업을 명시; 결과는 두 파일로 분리.
- [x] 원본과 같은 viewport에서 폰트·크기·색상·간격·배치·아이콘·플로우를 비교하고 차이를 기록했다. — 4절 공통 요소 후보·1440×900 비교 기준. 실제 구현 비교는 G01.
- [x] 페이지는 조합, feature는 업무 UI, hook은 상태·요청, adapter는 데이터 접근을 담당한다. UI에 직접 HTTP나 중복 seed 배열을 두지 않는다. — N/A: G00은 조사. 책임 분리 구현은 G01.
- [x] 컴포넌트·hook·함수별 한 줄 한글 `// 기능 : ...` 책임 주석과 복잡한 판단의 이유를 작성했다. — N/A: G00은 조사. 코드 주석 검토는 G01.
- [x] 임시 입력·저장값·서버 결과를 구분하며 목 결과를 실제 발송·결제·서명 성공으로 표현하지 않았다. — 관찰·현재 문서·설계 후보·미확인을 분리.
- [x] 로딩·빈 상태·검색 무결과·권한 제한·오류·pending·성공·실패 후 재시도 중 해당 상태를 검증했다. — N/A: G00은 조사. 상태 실행은 G01.
- [x] 키보드·포커스·직접 URL·뒤로/앞으로·새로고침·폭 변경·긴 한국어/영문·시간대·금액 표시를 확인했다. — N/A: G00은 조사. 브라우저·접근성 실행은 G01.
- [x] 해당 변경에 필요한 타입·lint·상태 전이·계산·브라우저 시나리오를 실행하고 명령·결과를 기록했다. 관련 없는 검증은 생략 이유를 남긴다. — 흐름 ID·순서·단계 배정 점검. 코드 실행 검증은 G01.
- [x] 네트워크에서 인증/업무/외부 서비스의 실제 요청이 없음을 확인하고 민감 정보가 로그·URL·저장소에 남지 않음을 점검했다. — N/A: G00은 기존 의존 조사. API0 실행 증거는 G01.
- [x] 수용 기준별 근거, 원본과의 차이, 미확인, 실제 실행하지 않은 검증을 기록했다. — 3~5절의 근거·차이·미확인·G01 인계.
- [x] 표시 데이터·입력·전환에 필요한 로컬 목 상태만 정의했다. 서버 관련 질문은 후속 메모로 남겼으며 API 계약·DB 설계를 진행하지 않았다. — DB/API 계약 작성 없음.
- [x] R에서 발견된 기능은 기존 G 확장 또는 새 G 명세로 배정했으며 후속 구현 완료와 조사 완료를 구분했다. — R 분석 착수 없음. 기존 소비 Goal·미배정 확장 목록을 유지.
- [x] 관련 G/R·흐름 대응표·확장 대기표·순서표·색인·검토 상태를 갱신했다. — G00 명세·순서·색인·결과 연결.

<a id="g00-recheck"></a>
## 7. G00 기존 조사 재검토 — 2026-11-23 KST

**판정: R4 근거·색인·배정 재검토 완료 / 촬영 조건·요소 분석·시각 동일성 후속 대기.** 시작 HEAD는 `7a9e05ed1de48daf632c4eb55da3e844f974e4c0` (`ㅁㄴㅇ`, 2026-11-23 20:46:58 +09:00), `main`은 origin보다 1개 앞서고 작업 트리는 clean이었다. 이 커밋은 G01 증거 10개를 삭제했으며 직전 FE 보완 `0311b939`를 되돌리지 않았다. 이번에는 기존 계획 문서·PLAN-INDEX만 수정했다.

### 7.1 확인 범위와 검증 구분

| 구분 | 실제 수행 | 판정·한계 |
| --- | --- | --- |
| 전체 자동 무결성 | 원본 색인·134개 ANALYSIS의 ID/단계표/상세 순서·754개 PNG 존재/이름/크기/SHA-256·642개 Screen ID/참조 | 색인과 일치. 134개 분석의 R4 전후 해시도 `ee179b9d` 이력 및 현재 파일과 일치 |
| 전체 계획 연결 | 85개 G·22개 R·107개 순서, 134개 대응 행·754단계 단일 배정, 의존성·R 질문/소비/확장, R4 455개 원문/해시/역링크·공통 12개 기준 | 배정 누락·중복·범위/순서·해시 불일치 없음. G14의 G01~G13, G83의 G00~G82 범위 표기를 개별 링크와 구분 |
| 공유 화면 | 57개 Screen ID·148회 등장·72개 관련 G, 단계별 소유와 역방향 연결 | 소유와 재사용/회귀 책임 일치. 계약 생성 G40 01~12/G41 13~19 유지 |
| 직접 문서 확인 | 적용 규칙, 원본 STANDARD/REVIEW의 기준·한계, G00/G01 명세·결과, 공통 실행/상태/흐름/대응 정책, R 질문·소비·확장, 관련 G/R의 연결 항목 | 134개 ANALYSIS·전체 결과의 모든 본문을 새로 정독한 것은 아님. 자동 읽기/필드 대조와 직접 내용 확인을 구분 |
| 직접 원본 확인 | 아래 4개 흐름 PNG 6개, 관련 ANALYSIS의 단계/업무 규칙/미확인·R4 메모 | 전체 754장 시각 전수 확인 아님. 새 화면 캡처·픽셀 비교·요소 계수 미실행 |
| 현재 FE | 진입·조립·router/provider·가상 인증/workspace·목 저장소·공통 Dialog·네트워크 접근 구조 읽기 | 앱 동작·네트워크 0건·회귀 통과를 새로 검증한 것은 아님 |

채택 자료는 저장된 `bonsai-web / Latest / 2146`이며 134개 ANALYSIS의 앱·카탈로그 버전 행도 이 기록과 일치한다. 버전 레이블은 카탈로그 식별자이며 제품 빌드·촬영일이 아니다. 이번 MCP·공식 사이트·실계정 재조회는 **없음**. 원본 색인 SHA-256(LF)은 `827ba007ab3a8ef243e3f95140abdc2bec77897e2727aa9daf501a9d024aa12e`; 원본 분석 기준은 `6fdc6d00`이다. 기존 단계의 URL 일치는 문서 문자열 대조이며 원격 URL 가용성 검사가 아니다. 모든 원본 `element_census_complete=false`, `reproduction_spec_certified=false`를 유지했다.

### 7.2 직접 본 원본과 판단

각 PNG의 실제 파일 크기는 2880×1800이다. 원본을 직접 열어 보았으며 CSS viewport·DPR·브라우저 배율은 측정하지 않았다. 아래 파일 경로는 기존 원본이며 신규 산출물이 아니다.

| 원본 Flow ID·단계 | Screen ID·원본 경로 | 직접 관찰과 소유/한계 |
| --- | --- | --- |
| F083 `a02409b3-6eb0-4bc0-b702-22a42e0990c8` · 01 | [`sc_07904520440b4dc7ad7d6d31bf3a03e9`](<../../../bonsai_analysis/flows/Logging in/screens/01_sc_07904520440b4dc7ad7d6d31bf3a03e9.png>) | 공개 랜딩 최상단·이메일/CTA. 소유 G11, G02/R01의 추가 참조이며 소유 이전 아님. |
| F083 `a02409b3-6eb0-4bc0-b702-22a42e0990c8` · 02 | [`sc_9d353458318e43e7b25ebbf88fefeaa9`](<../../../bonsai_analysis/flows/Logging in/screens/02_sc_9d353458318e43e7b25ebbf88fefeaa9.png>) | 로그인 패널·빈 Email/Password·captcha·Google/Apple. G11/R02; 실제 인증·삭제 성공의 근거 아님. |
| F003 `a5f7a722-8a0c-4528-966a-903e7e0873fb` · 03 | [`sc_3e2640e1d9ca4b59a7f1c79cb628a502`](<../../../bonsai_analysis/flows/Adding a new client/screens/03_sc_3e2640e1d9ca4b59a7f1c79cb628a502.png>) | New Client의 선택 Company와 필수 Contact Name/Email·바깥 X. G19/R03, G01 공통 변형 참조. |
| F009 `3a74090f-e360-4fb9-9b79-c1ca197708ba` · 02 | [`sc_f2a7c3be441a4a95ab91fba511865483`](<../../../bonsai_analysis/flows/Bookkeeping/Adding a bookkeeping category/screens/02_sc_f2a7c3be441a4a95ab91fba511865483.png>) | 중앙 제목/입력·두 색상 격자·Save Category, 바깥 X 미노출. G63/R15; 모든 모달을 동일 변형으로 합치지 않음. |
| F129 `d348e200-5e48-4825-a646-69a6741e85d8` · 06 | [`sc_dcb91b20475d4ba791eedac5320b320b`](<../../../bonsai_analysis/flows/Tasks/Adding a task (template)/screens/06_sc_dcb91b20475d4ba791eedac5320b320b.png>) | 새 작업 No due date·To Do와 생성 토스트. G31/R06; 기존 Initial Chat의 상태 변화와 분리. |
| F129 `d348e200-5e48-4825-a646-69a6741e85d8` · 07 | [`sc_3eef549a1670486daf06221156e198bc`](<../../../bonsai_analysis/flows/Tasks/Adding a task (template)/screens/07_sc_3eef549a1670486daf06221156e198bc.png>) | 같은 제목/프로젝트 카드에 Feb 09 표시. 기한 설정 조작 미수록; 템플릿 자동 복사로 확정하지 않음. |

관찰은 위 PNG에 보이는 구성/값이다. 측정은 파일 해시·PNG 크기·단계/개수에 한정한다. 1~6절의 치수 후보·폰트 대체는 과거 추정이며 확정 CSS가 아니다. focus/Escape·초안/실패/재시도·세션 수명은 기존 로컬 목 가정이고 원본 관찰과 분리한다. 촬영 조건·정확한 폰트/자산·누락된 중간 조작·서버 정책은 미확인이다.

### 7.3 유지·보완·대기와 현재 FE

| 판정 | 확인 내용·처리 | 담당 |
| --- | --- | --- |
| 유지 | 134흐름 배정·계약 단계 분할·455메모 원문/해시/소유·공유 화면·G/R 순서. 같은 Screen ID/동명 객체/인접 캡처를 같은 세션·자동 저장/성공으로 확정하지 않는 기존 경계 유지 | G00, 해당 G/R |
| 문서 보완 | G00 상단 조사 완료와 R4 대기 이력을 분리하고 현재 결과 연결. 엄격 동일 재현을 G01에만 한정한 현재 안내 보완. 삭제된 G01 증거의 이용 불가 표시 | G00 |
| 문서 보완 | 초기 G01 전면 교체 계획은 당시 이력으로 명시. R 구현 소비와 G83/G84의 최종 검증 책임 구분. R04/R19/R22 구현 미배정 유지 | G00, 해당 R |
| 후속 구현 보완 필요 | 이미 기록된 공통/소비 화면의 시각 차이는 해소 후 재검증 필요. 이번 읽기 조사에서 새 G01 코드 결함이나 재교체 필요는 확인하지 못함 | G01·각 기능 G/R |
| 분석 대기 | 정확한 내부 폰트·아이콘·촬영 조건·요소별 명세, 미관찰 상태/저장/전환, R별 미수록 기능 | G01·소비 G/R; 최종 확인 G83/G84 |

현재 FE 경로는 `FE/user-web` 기준이다.

| 코드 위치 | 최초 조사 이후 현재 읽기 확인 |
| --- | --- |
| `src/main.tsx`, `src/app/app.tsx`, `src/app/providers/app-providers.tsx` | 실제 AuthProvider/업무 bootstrap 대신 preview runtime과 고객·팀·프로젝트·작업·템플릿·인증·회사·공개·청구서 목 provider 조립. 프로젝트/작업은 같은 고객·팀/프로젝트 저장소에 연결 |
| `src/app/router/router.tsx`, `route-boundaries.tsx` | 공개·가상 인증·온보딩·초대·보호 앱·공유 경계. returnTo와 협업자 접근 제한은 현재 로컬 정책; 외부 서비스 권한 검증 아님 |
| `src/mocks/create-preview-runtime.ts`, `src/app/providers/query-scope.tsx` | 메모리 session/workspace/revision/resetGeneration, seed/reset·지연/장애·취소 범위. Query 캐시 취소/제거와 공유 범위 분리 |
| `src/features/mock-auth/data/create-auth-store.ts` | 메모리 계정·가상 가입/인증/로그인/초대·취소/늦은 결과 경계. 실제 OAuth·메일·서버 저장 아님 |
| `src/features/public-web/components/public-provider.tsx` | pathname별 이메일 초안과 이력별 인계 snapshot, reset/revision 수명. G02/G10/G11 연결 시 실제 소비 경로 재검증 필요 |
| `src/components/ui/dialog.tsx`, `src/lib/lock-page-scroll.ts` | `0311b939`의 시작/종료 포인터 경계와 중첩 잠금 소유 보완이 현재 코드에 존재. 새 브라우저 회귀는 미실행 |
| 공개 목적지·자산, package/Vite/HTML | src 실행 코드 검색에서 fetch/XHR/axios/Supabase/WebSocket/EventSource/sendBeacon·env 접근·외부 location 이동 호출 미발견. 공개 URL은 로컬 목적지 변환/안내, JSON의 원본 URL과 로컬 image 경로를 구분. CSS font/image는 로컬 또는 data URL. 정적 조사로 런타임 무호출을 인증하지 않음 |

Node 요구는 `>=24 <25`, pnpm은 `8.14.1`; package의 typecheck/lint/test/build/e2e 명령 존재를 확인했으나 실행하지 않았다. 리스너/프로세스 cwd 확인에서 이 저장소 FE 미리보기는 확인되지 않았다. 발견된 8081은 다른 저장소 프로세스였으며 건드리지 않았다. 서버를 시작/종료하거나 환경을 변경하지 않았다.

### 7.4 검사 명령·문서 정합성·현재 없는 과거 자료

- `git status --short --branch`, `git log -1 --format=fuller`, `git show --stat HEAD`, `git diff --check`: 시작 상태/최근 변경과 문서 수정 범위·공백 검사. `rg --files`, `rg -n`, `sed`/파일 읽기로 규칙·계획·코드 위치를 확인했다.
- `python3 - <<'PY' … PY`를 메모리에서 실행: `json.loads`, `Path.read_bytes`, SHA-256, PNG IHDR, 정규식/집합/Counter로 색인·분석·원본·단계 단일 배정·역링크·선행 순서·Markdown 경로/anchor를 대조했다. 이전 분석은 `git show ee179b9d:<분석 경로>`의 표준출력으로 해시 비교했다. 별도 스크립트/검증 JSON/로그를 저장하지 않았다.
- 전체 계획 Markdown 170개의 로컬 문서·anchor 링크를 검사했다. 현재 문서/원본의 경로·anchor 오류와 **현재 없는 과거 evidence 링크 221회**를 분리했다. 이 221회에는 기존 G00 링크와 현재 커밋이 삭제한 G01 링크가 포함된다. 과거 결과를 보존하므로 없는 파일을 복원하거나 링크를 새 검증으로 사용하지 않는다. 현재 G00/G01 안내와 색인에 이용 불가를 명시했다. PLAN-INDEX에서도 과거 증거 경로 13회(G01 2회, G05~G15 11회)가 현재 없으며 당시 기록으로만 보존한다.
- JSON 파싱·MD/JSON의 Flow ID/범위/담당/순서·455개 메모 ID/해시/역링크·공통 12개 담당/수용 기준을 검사했다. G83/G84의 전체 R 참조는 구현 consumers와 다른 역할이며, 공유 화면 등장 순서는 집합으로 대조했다. 범위 표기와 개별 링크 표기를 구분해 오탐을 제외했다.
- 기존 G00 최초 체크·G01 테스트 수치·R 상태·개별 메모 판정은 보존했다. 현재 G00 확인 항목만 별도 [x]로 기록하고 시각/환경·미수록 R은 [ ]를 유지했다. 최종 검사 수치는 아래 종료 확인에 기록한다.

### 7.5 적용 규칙·현재 체크와 후속

AGENT/README, PM 036·UX 025, FRONT_AGENT 문서 지도 중 User Web 구조/컨벤션·컴포넌트·상태·목·접근성·주석·테스트·ENGINEERING_REVIEW_CHECKLIST와 결정 006을 이번 조사 범위에 적용했다. 적용 범위의 AGENTS.md는 없었다. `AGENT_USAGE_RULES.md` 링크는 여전히 파일 부재이며 새로 만들지 않았다. Backend/API/DB 설계 선행 조건과 별도 TODO_LOG/증거 생성은 최신 사용자 범위에 적용하지 않았다.

| 공통 착수/리뷰 항목 | 이번 판정 |
| --- | --- |
| 범위·Git·적용 규칙·선행·현재 자료 | [x] 읽기/문서 한정 및 최초/현재 이력 구분 |
| 원본/계획 연결·상태/ID 소유·미확인/목 경계 | [x] 위 자동 검사와 선택 직접 확인 범위에서 대조 |
| 구조·상태·데이터·네트워크 접근 | [x] 위 코드 위치의 읽기 조사 완료. 구현 동작 인증은 아님 |
| 신규 코드 책임 분리·한글 기능 주석·회귀 테스트 | N/A — 코드 변경 없음. 기존 FE 전체 주석/구조 일괄 정비 안 함 |
| 시각·동작·접근성·오류/재시도·브라우저·네트워크 실행 | N/A — 이번 G00 실행 금지 범위. 과거 검증을 현재 통과로 재사용하지 않음 |
| 결과·상태·링크·변경 범위 정합성 | [x] 기존 결과와 관련 명세/공통/색인에 현재 판정을 분리 |
| 미확인·미배정 후속 | [ ] 아래 담당과 잔여 작업 유지 |

- [ ] G01 및 소비 G/R: 정확한 내부 폰트/자산·촬영 조건·요소별 명세와 기존 시각 차이 해소. 실제 OS IME·기기·보조기술·추가 브라우저·배율 검증도 유지한다.
- [ ] R01~R22: 질문/소비/확장 연결은 확인했지만 상세 R 전체는 미완료다. 특히 R04 거래/견적/예측, R19 인력/업무량/휴가, R22 연동/키/AI의 구현 G를 해당 R에서 배정하고 G83 전에 구현·검증한다. 다른 R의 기존 잔여도 유지한다.
- [ ] G02/R01: G00의 색인·배정 문제로 착수를 막을 항목은 발견되지 않았다. 실제 G01 공통 소비와 공개 메뉴·CTA·G10/G11 입력 인계/복귀, 버전별 자산·시각 조건을 해당 범위에서 확인해야 한다. G01 전체 완료나 R01 전체 완료를 전제하지 않는다. 이번에 착수하지 않았다.
- [ ] G83/G84: 개별 잔여와 추가 구현 배정/검증 결과를 마지막에 다시 확인한다. 서버 정책·실계정 미확인은 별도 후속 메모이며 무관한 기능 전체를 차단하지 않는다.

이번 작업의 evidence·임시 파일·별도 결과 생성, 원본/분석 정본·FE/BE·환경·DB 수정, 앱/실제 인증/업무/외부 서비스 실행, 커밋·push·배포는 모두 없음.

### 7.6 1차 종료 확인 (아래 추가 점검 이전 기록)

- 원본/해시/단계 배정·R4/G/R 연결 검사: 오류 0. FLOW-GOAL-MATRIX 134행, G 85개, R 22개, 실행 순서 107개가 색인과 일치한다.
- 계획 Markdown 170개·로컬 링크 6,136회·유효 파일의 anchor 1,493회 검사: 과거 evidence 부재 221회 외 경로 오류 0, anchor 오류 0. PLAN-INDEX의 경로 참조 377회 검사: 과거 증거 부재 13회 외 경로/anchor 오류 0. 새로 끊어진 링크는 없다.
- 기존 455개 메모·134개 flow 기록·실행 순서·R 상태·G01 이후 상태 및 G00/G01 과거 verification 값은 변경 전과 같다. G00/G01 결과의 기존 본문도 보존했다.
- 기존 계획 파일 27개만 수정했다. 신규 파일 0, 허용 범위 밖 변경 0, `git diff --check` 통과, HEAD 유지. `git diff 0311b939 HEAD -- FE`에도 변경이 없어 공통 보완 커밋 유지 확인. 앱 테스트는 미실행이다.

주요 갱신은 G00/G01/G83 명세와 G00/G01 기존 결과, R04/R19/R22의 배정 책임, README/현재 상태·순서·착수·흐름/원본 대응·엄격 동일성·확장·검토/문서화 기록 및 PLAN-INDEX다. G00의 조사 완료와 후속 시각·환경·상세 R 대기를 분리했으며 G02/G32를 시작하지 않았다.

<a id="g00-followup"></a>
### 7.7 후속 누락 점검 — 2026-11-23 KST

사용자의 추가 점검 요청으로 위 1차 결과와 검사 범위를 다시 확인했다. 시작 시에는 같은 HEAD의 계획 파일 27개가 수정된 상태였으며 기존 작업을 이어서 보완했다. 다음은 새로 확인한 문서 누락이며, 원본 단계나 FE 코드 결함으로 확대하지 않는다.

| 추가 발견 | 보완 | 현재 판정 |
| --- | --- | --- |
| PUBLIC-WEB의 첫 안내가 과거 작은 시각 차이 허용을 현재 작업으로 표시 | 과거 기록을 명시하고 현재 엄격 동일성 기준·G00 한계를 직접 연결 | 문서 보완 완료 |
| G00 인계가 주로 공통/결과에 있고 G02/R01 및 G84의 개별 수용 기준에는 직접 반영되지 않음 | G02/R01에 참고 원본·G01 소비·G10/G11 인계/복귀 범위 명시. G83/G84에는 현재 엄격 동일성·미배정 확장·과거 증거 한계를 직접 연결 | 문서 보완 완료; 해당 Goal 실행 체크는 대기 |
| R의 flows를 소비 구현 전체로 읽을 여지 | 22개 R 명세 3절과 대조하여 초기 참고 목록임을 확인. 색인 필드 의미와 아래 13개 차이를 명시 | 정의 보완 완료; 단계/담당 배정은 유지 |

**R의 초기 참고 목록과 소비 범위 차이:** 숫자는 PLAN-INDEX의 `flows[].number`이며 원본 F번호가 아니다. 초기 목록은 22개 모두 각 R의 3절과 일치했다. 소비 범위는 `consumers → goals[].flow_scope`와 R4 항목을 함께 확인한다. 아래 차이를 배정 누락으로 세거나 초기 목록을 임의로 확장하지 않았다.

| R | 초기 목록 밖의 소비 흐름 | 소비 밖의 추가 참고 흐름 |
| --- | --- | --- |
| R01 | 88 Perks | 없음 |
| R03 | 107 Projects/Creating a project (Projects) | 없음 |
| R05 | 12 Bookkeeping/Bookkeeping overview; 41 Dashboard; 105 Projects/Adding a tag | 109 Projects/Switching to list view |
| R06 | 54 Dashboard/Marking a task as complete | 없음 |
| R08 | 73 Invoices/Adding a new invoice/Editing invoice header | 없음 |
| R11 | 33 Creating a proposal/Creating a new automation | 없음 |
| R13 | 73 Invoices/Adding a new invoice/Editing invoice header | 없음 |
| R14 | 없음 | 75 Invoices/Adding a new invoice/Preview invoice |
| R17 | 없음 | 66 Help Center/Help article detail |
| R18 | 없음 | 118 Settings/Disabling public profile; 119 Settings/Editing branding settings |
| R20 | 23 Clients/Uploading a client image; 104 Project detail/Updating project status | 없음 |
| R21 | 없음 | 113 Searching Bonsai |
| R22 | 없음 | 116 Settings; 122 Settings/Importing a CSV |

추가 자동 검사는 메모리의 Python으로 수행했다. 전체 Flow ID/번호·G/R·R4 ID 및 JSON 중복 키, 의존 순서·첫 소비 시점, G의 flows/flow_scope 소유 일치, 흐름별 인증 플래그, R4의 담당 G에서 유도한 R 소비를 검사했다. FLOW-BEHAVIOR-REVIEW의 **754행을 같은 단계의 원본 제목·상태·담당에 대조**했고 SOURCE-ANALYSIS-IMPACT의 **455행 원문·담당·상태**, G/R별 연결 건수·12개 공통 기준의 문구/수용 기준을 대조했다. 불일치 0건이다. 링크 정규식이 놓친 inline 링크, reference/HTML 링크, 중복 명시적 anchor도 없었다.

[ENGINEERING_REVIEW_CHECKLIST](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md)의 범위·출처·목 상태·검증/인계를 다시 적용했다. app-providers/create-preview-runtime의 조립·session/workspace/revision/reset과 목 수명 설명도 읽기 전용으로 재대조했다. **이번 추가 점검에서 새로 직접 본 PNG는 0개**이며 7.2의 6개는 앞선 확인 이력이다. 전체 이미지 시각 검토·앱/브라우저·네트워크 실행은 계속 미실행이다.

현재 없는 과거 evidence 참조는 복원/사용하지 않았다. 원본/분석 정본·FE/BE·환경·DB·기존 evidence는 변경하지 않고 커밋·push·배포·다음 Goal 실행도 하지 않았다. G01의 새 재구현 필요를 확정할 근거는 발견하지 못했으며 시각/환경 대기는 유지한다. G02는 실제 소비 공통과 R01/인증 인계 확인을 거쳐 진행할 수 있고 이번 문서 보완을 구현 완료로 해석하지 않는다.

추가 점검 종료: 원본/단계/담당/해시·R4 행·JSON 중복/연결 오류 0. 계획 Markdown 170개·로컬 링크 6,151회·유효 파일 anchor 1,507회와 색인 경로 참조 380회를 검사했다. 기존에 없는 과거 증거 참조(Markdown 221회·JSON 13회)를 제외한 경로/anchor 오류 0이며 새 누락은 없다. 기존 455메모·134flow·순서·G01 이후 상태·R 상태·G00/G01 과거 verification 및 결과 본문을 보존했다. 변경은 기존 계획 문서 총31개(1차27개에서4개 추가), 신규 파일0·허용 범위 밖 변경0이며 `git diff --check` 통과, HEAD 유지다.
