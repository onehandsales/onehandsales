# G17 — 멤버 초대·대기 초대 제거 실행 결과

실행일: **2026-11-21 KST**. 시작 HEAD **f12f0b97**, 작업 트리 clean. 기존 5173 서버 PID59363 보존. R02의 G17 소비 보완 → 구현 → 1차 검토·수정·검증 → 2차 재검토를 마쳤다. **관찰 범위 목 구현·동작 검증·시각 비교 수행**, 미수록 역할/초대 예외·잔여 시각 차이·추가 환경 검증은 대기다. 커밋·push·배포·G18 착수 없음.

## 1. 범위·선행과 적용 규칙

- 적용 AGENTS: 상위/FE에는 없고 BE 지침은 범위 밖. AGENT 공통, PM036, UX025, FRONT_AGENT README와 아키텍처·상태·목·컴포넌트·웹 접근성·한글 주석·테스트·엔지니어링 검토를 적용했다. **DECISIONS/006과 사용자 지시 우선**으로 과거 실제 로그인/API·DB 절차를 적용하지 않았다. 과거 PM 문서의 TODO 접근 금지는 이번 명시적 TODO 작업에 적용하지 않는다. 참조된 `AGENT_USAGE_RULES.md`는 없는 상태다.
- G01 가상 runtime·Dialog·query 경계, G14 앱 셸/보호 경로/계정 메뉴, G15·G16 SettingsNavigation을 재사용했다. G15 회사·로고·국가/통화·공개 주소와 G16 브랜드 저장 코드는 변경하지 않았다.
- 기존 원본 폰트/아이콘·모바일·환경·자료 대기는 G17의 관찰된 팀 화면을 막지 않는다. 선행 Goal 전체 완료를 가정하거나 기존 대기를 완료로 바꾸지 않았다.
- G13 `Company.invites`는 초대 **제안**이며 G17 목록과 별도다. 자동 발송/수락/역할 변경이나 제안의 자동 목록 편입은 없다.
- Backend·API 계약·HTTP adapter·DB·메일·실인증·외부 서비스를 구현/실행하지 않았다. 네트워크 요청 차단으로 미호출을 가장하지 않는다.

## 2. 원본과 보완 분석

[R02 G17 소비 분석](R02_RESULT.md#g17-소비-보완-분석--2026-11-21-kst)에 App/Flow/Screen ID·관찰·목 가정·미확인을 기록했다.

- 이번 신규 MCP: `gummble_get_flow_screens_batch` 2flows/9screens, `gummble_get_app(bonsai-web)` 앱 조회. **Bonsai Web / c1026782-09a7-45fb-b2d0-7cc1909bf1f4 / Latest·2146**. 기존 기록 재사용과 구분한다. Flow 응답에 별도 제품 버전은 없으며 촬영일/제품 빌드는 미확인이다.
- `bonsai_analysis/flows/Inviting a member/ANALYSIS.md` + PNG01~05, `bonsai_analysis/flows/Settings/Removing a user/ANALYSIS.md` + PNG01~04를 확인했다. **원본9개 개별 직접 열람**; MCP 메타데이터만 보고 이미지 확인으로 계산하지 않았다.
- 초대 플로우 `646bd9c2-add0-414c-8b98-89489f2c43b5`: 대시보드 진입 맥락, 빈/이메일/Collaborator+프로젝트 모달, 신규 Pending 결과.
- 제거 플로우 `c615a678-2203-45d5-bcc0-235f6b325516`: 5행, 마지막 대기 초대 메뉴, Confirm Removal, 해당 행만 제거된 4행.
- 초대 시안의 Jane Partner/All Projects와 제거 시안의 Jane Collaborator/프로젝트 없음은 서로 다른 비교 fixture다. 역할 변경이 있었다는 서사를 추가하지 않았다. 같은 이름 Jon Smith 두 행은 다른 ID·이메일·가입 상태다.
- Role 전체 목록/Projects 필수 개수/모바일/오류/취소/재발송 결과/실제 권한은 미수록. 현재 사이트 디자인이나 공식 서버 정책을 과거 시안에 섞지 않았다. 이번 공식 웹/실계정 조회는 없다.

## 3. 구현·경로·책임

| 경로/구성 | 역할과 이번 결과 |
| --- | --- |
| `/app/settings/team` | 실제 보호 경로의 팀 표, 로딩/빈 상태/오류/재시도/권한 상태 |
| `/app/settings/team?invite=1` | Invite Member 모달. 이메일·Role·프로젝트 chip/복수 선택·개별/전체 해제·명시적 초대 |
| `/app/pending/team` | 기존 후속 주소는 Team으로 replace redirect. 기존 다른 후속 경로는 유지 |
| Sidebar Invite Team | 실제 Team+초대 모달로 이동 |
| Settings Team / 계정 메뉴 Team | 실제 Team 목록으로 이동 |
| `features/team/model` | 초대/가입 상태 구분, 로컬 입력/오류 타입. 서버 DTO/DB 계약이 아님 |
| `features/team/data` | workspace별 단일 메모리 원본, 고정 fixture/프로젝트, scope/generation/취소/중복/정확한 제거 검사 |
| `hooks/use-team` | 목록 조회·실패/재시도·구독 갱신. 다른 문맥의 응답은 반영하지 않음 |
| `hooks/use-team-action` | 모달 제출 잠금·취소·오류/재시도. 재시도 시 오류 영역을 유지해 버튼 이동 방지 |
| `components` | 팀 표·행 메뉴·초대/제거 Dialog·프로젝트 선택·검증 도구 |
| `pages/team-settings` | route와 feature 조합. G15/G16 공통 SettingsNavigation·G01 Dialog 재사용 |
| `app/providers` | 기존 공급자에 TeamStore만 추가, 외부 서비스 fallback 없음 |

신규 함수/컴포넌트/hook에 한글 `// 기능 : ...` 주석을 작성했다. 새 의존성·과도한 범용 저장소·업무 프로젝트 CRUD는 추가하지 않았다. 검색 UI는 원본에 없어 검색 무결과 검증은 N/A다.

## 4. 목 정책·ID·수명

- 저장 원본은 **workspace ID**로 분리한다. 고정 row ID는 `<workspace>:member-owner`, `invite-jane`, `invite-jon`, `member-jon`, `invite-smith`; 새 초대는 `<workspace>:invite-new-N`. 삭제된 새 ID를 재사용하지 않는다. 이메일은 trim+lowercase 비교, 이름/화면 index로 삭제하지 않는다.
- 프로젝트는 `<workspace>:team-project-1/2/3`와 Consulting Project / Design Project with Doe Studio / Rebranding Project의 최소 fixture다. G21~24 프로젝트 구현이나 실제 배정 완료를 뜻하지 않는다.
- 초대 시안 기본2행과 제거 시안5행을 개발용 Team comparison fixture에서 **명시적으로 교체**한다. 교체는 그 workspace 목록만 초기화하고 진행 요청을 무효화한다. source 구성 차이를 사용자 조작 결과로 만들지 않는다.
- Owner는 현재 G01 Alex 검증 구성을 유지하고 seed 이메일은 `example.test`다. 원본 Joe/Jane/Jon 계정의 실제 데이터를 가져오지 않았다. Joined 날짜는 고정 `Feb 1/8, 2024` 문자열이며 실행일/실제 수락일이 아니다. 새 초대에는 Joined 날짜가 없다.
- Collaborator/Partner만 선택. Collaborator의 프로젝트0개 이상, Partner All Projects, owner만 초대/제거하고 member 조회 전용은 **목 가정**이다. 원본에서 전체 역할/필수 개수/권한을 확인한 것으로 쓰지 않는다. Partner 전환은 과거 Collaborator 초안을 보존하되 저장에는 All Projects만 반영한다.
- 정상120ms 조회/300ms 변경, slow1500ms, 일회 읽기/초대/제거 실패·empty·denied·expired는 검증 도구에서 선택한다. 오류 문구/만료/권한 UI는 원본 미수록 목 상태다. empty는 조회만 빈 목록으로 표현하는 검증 상태로 변경 버튼을 제한하며 Normal로 복구한다.
- 같은 workspace의 기존 가입 멤버/대기 또는 만료 초대 이메일은 중복 초대하지 않는다. 만료는 별도 표시 시나리오이며 제거 후 명시적 새 초대가 필요하다. 실제 만료 시간·토큰 무효화는 구현하지 않았다.
- 제거는 scope + workspace + ID + 이메일 + revision + pending 상태를 저장 직전에 재검사한다. 이미 삭제/변경/가입된 대상·다른 workspace를 거부한다. 동일 이름·다른 이메일·다른 workspace·가입 완료 행은 보존한다.

| 행동 | 초안/저장/이력 정책 |
| --- | --- |
| 진입/재진입 | 같은 workspace의 저장 목록 조회. 모달 초안은 매번 빈 값 |
| 입력/선택 | 모달 메모리만 변경; 이메일을 URL/storage/log에 기록하지 않음 |
| 실패/재시도 | 이메일·역할·프로젝트와 대상 확인 유지. 다시 제출하면 현재 제출 snapshot만 실행 |
| 초대 성공 | Pending 행 생성·동일 목록 재조회·원본 `Invite sent.` 표시. 실제 메일 발송 의미 없음 |
| 제거 성공 | 해당 초대만 목록에서 제거·원본 `Team member removed.` 표시. 실제 접근 권한 회수 의미 없음 |
| 닫기/Escape/배경/이탈 | 진행 Abort, 초안 폐기. 초대 닫기는 현재 query만 replace, 이전 이력 보존 |
| 뒤로/앞으로 | 실제 Router history 사용. query가 다시 열리면 새 빈 초안이며 저장 목록은 유지 |
| workspace/계정/logout | 문맥 revision으로 요청 무효화·초안 폐기. 같은 탭의 저장 목록은 유지 |
| 같은 탭 재로그인 | 해당 workspace 저장 목록만 복구. 이전 초안/열린 제거 확인은 복구하지 않음 |
| reload/new tab/Reset | 기존 G01 메모리 정책대로 새 seed/session. query 문자열은 인증 후 빈 모달 진입 의도만 유지 |

Resend Invite 및 Joined 멤버/Owner 제거는 **원본 결과 미수록 안내**에서 팀을 그대로 유지한다. 재발송 성공이나 가입 완료 멤버 삭제를 만들어내지 않는다. R02 후속 조사에서 재발송·가입 완료 제거의 구현 배정을 보완하고, 수락·잘못된 계정·철회/만료 링크 접근은 G18 소비로 남긴다. Owner 변경·실세션 차단·좌석 과금은 별도 후속이며 이번 대기 초대 제거와 다르다.

## 5. 1차 검토·수정

검토와 테스트 실행 결과를 구분한다.

1. **행 식별/동시성 검토:** ID+workspace+이메일+revision으로 정확한 대상만 제거, 저장 직전 중복 재검사, abort와 scope/generation 검사. 동명2행/다른 workspace/같은 대상 중복 제거를 단위 및 실제 브라우저로 검증했다.
2. **재시도 더블클릭 결함:** 실패 후 재시도 시작에서 오류 문구를 즉시 지우면 모달 footer가 위로 움직였다. 두 번째 클릭이 모달 바깥을 눌러 취소되어 Pending 행이 생성되지 않는 실제 브라우저 결함이었다. 다음 결과까지 오류 영역을 유지해 CTA 위치를 고정했다. 같은 double-click 실패→재시도 회귀가 통과했다.
3. **검증 도구 권한 검토:** empty 여부로 owner를 추정하던 조합을 별도 owner flag로 분리했다. Member+empty에서 fixture 교체를 막고 저장소 권한 검사도 유지했다. 실제 버튼 disabled 회귀를 추가했다.
4. **시각 검토:** 모달546px 높이→530px, 입력 간격/글자/placeholder·chip·전체 해제 X·CTA색, 표 헤더/행 간격과133px 초대 버튼을 원본 비교로 보정했다. 개발 도구는 첫 viewport 아래로 옮겼다. source 다른 이메일 때문에 생긴 줄바꿈과 기존 앱 셸의 차이는 따로 남긴다.
5. **검사 선택자:** Role은 정확한 combobox accessible name으로, 성공 안내는 여러 status 중 실제 메시지로 좁혔다. 테스트 오류와 위 제품 결함을 같은 원인으로 기록하지 않는다.

### 2차 재검토와 최종 보정

- 코드·실제 사용자 흐름·회귀 결과를 다시 대조했다. 초대와 Joined의 분리, workspace/ID/이메일/revision으로 제거 대상 확인, 실패 후 입력 보존·취소·늦은 응답 차단, G13 제안과의 분리를 유지했다. G15/G16 저장 로직과 공통 Dialog는 변경하지 않았다.
- 원본과 최종 캡처를 다시 보고 사각32px 아바타, 역할 배지 높이·색상, 표의 이름/프로젝트 굵기와 회색 본문, Role placeholder, 메뉴 위치·160×100 크기, 제거 버튼의 붉은색을 보정했다. 초대/제거 fixture의 색상 차이는 해당 fixture에만 적용했다.
- 전체 개발/빌드103개씩 통과 후 이 마지막 G17 시각 보정을 적용했다. 최종 lint/build와 G17 대상 개발/빌드7개씩을 재실행했고, 뒤로 복귀 시 실제 스크롤 복원 assertion도 포함했다. 마지막 CSS 변경 후 전체103개를 다시 실행했다고 합쳐 쓰지 않는다.
- 캡처 스크립트에서 URL 변경 직후 아직 로그인 화면/모달 이전 표를 찍는 준비 대기 누락을 발견했다. 제품 결함과 구분한다. 목적지 `.setup-dashboard`와 실제 본문, 열린 dialog/menu·성공 결과, 두 animation frame을 기다리도록 `/tmp` 스크립트를 수정하고 12개 캡처를 다시 생성했다. 잘못된 초기 캡처는 `captures-before-ready-check/`에 보존했고 최종 비교에는 쓰지 않았다.
- 최종 제거 메뉴/확인, 초대 빈 값/입력/선택, 두 fixture의 표, 좁은 화면 및 대시보드 진입 맥락을 직접 다시 확인했다. 이번 관찰 범위에서 재현한 동작 결함은 해결됐으며, 아래 미수록/시각/환경 항목은 완료로 올리지 않았다.
- 문서 마무리: G17/R02 명세·결과·실행 순서표·PLAN-INDEX·현재 상태와 영향받은 G01/G13~G16 결과를 동기화했다. JSON 파싱, 신규/변경 링크52개 경로, 신규 named function의 한글 책임 주석, `git diff --check`를 확인했다. 새 `_evidence` 및 삭제된 결과 evidence 복원은 없고 HEAD는 시작과 같은 `f12f0b97`이다. 상세 점검은 `/tmp/onehandsales-g17/final-document-check.json`에 임시 보관했다.

## 6. 실행 검증

Node24.18.0 / pnpm8.14.1. `FE/user-web`에서 `eval "$(fnm env --shell zsh)" && fnm use 24.18.0` 후 실행했다. 실제 package 요구는 Node>=24<25, pnpm8.14.1이다.

| 실행 | 실제 결과 |
| --- | --- |
| 첫 typecheck 명령 | cwd를 루트로 잘못 지정해 Missing script. 코드 검사 실행 전 설정 실패, `/tmp/onehandsales-g17/typecheck-first.log` 보존 |
| FE cwd typecheck / lint | 통과 |
| 단위 테스트 | **13 files / 52개 통과**, 기존47+팀5. fake timers이며 브라우저/실서버 검증과 별개 |
| build | 통과. 기존 Browserslist/큰 chunk 경고 유지, 의존성 변경 없음 |
| G17 첫 개발 대상 | **3 실패(시간초과 포함) / 1 실행 중단 / 3 미실행**. Role label 선택자 시간초과·복수 status 선택자 오류를 확인하고 해당 runner를 중단했다. JSON의 skipped4는 중단1+미실행3이며 성공으로 계산하지 않음 |
| G17 개발 대상2 | **6 통과/1 실패**. 실패 후 재시도 더블클릭의 실제 모달 취소 결함 |
| G17 개발 대상3 | 수정 후 **7/7 통과**, 42.0초. 이전 실패를 최초 통과로 바꾸지 않음 |
| 전체 개발 | **103/103 통과**, 557.947초. G01~G16 기존96개와 G17 신규7개 |
| 전체 빌드 | **103/103 통과**, 371.057초. production preview에서 실제 navigation 검증 |
| 마지막 G17 시각 보정 후 | lint/build 통과. G17 개발 **7/7**, 48.347초 / 빌드 **7/7**, 34.997초. 위 전체 실행과 별도 기록 |
| 기존5173 캡처 세션 | Chromium148.0.7778.96, 원본 대응9개+좁은 폭3개. 총요청1778, API/외부·실패·console/page 오류0. 종료 Reset→guest/normal |

실제 실행 명령(로그/JSON/trace 모두 `/tmp/onehandsales-g17` 임시 경로):

```sh
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run test
corepack pnpm run build
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g17/dev-target-run3.json corepack pnpm exec playwright test tests/e2e/team-settings.spec.ts --workers=1 --reporter=line,json --output=/tmp/onehandsales-g17/playwright-run3
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g17/development-all.json corepack pnpm exec playwright test --workers=1 --reporter=line,json --output=/tmp/onehandsales-g17/development-all-artifacts
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g17/production-all.json corepack pnpm exec playwright test -c playwright.preview.config.ts --workers=1 --reporter=line,json --output=/tmp/onehandsales-g17/production-all-artifacts
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g17/development-final-target.json corepack pnpm exec playwright test tests/e2e/team-settings.spec.ts --workers=1 --reporter=line,json --output=/tmp/onehandsales-g17/development-final-artifacts
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/onehandsales-g17/production-final-target.json corepack pnpm exec playwright test -c playwright.preview.config.ts tests/e2e/team-settings.spec.ts --workers=1 --reporter=line,json --output=/tmp/onehandsales-g17/production-final-artifacts
node /tmp/onehandsales-g17/capture.mjs
/tmp/onehand-visual-venv/bin/python /tmp/onehandsales-g17/compare.py
/tmp/onehand-visual-venv/bin/python /tmp/onehandsales-g17/review-sheets.py
python3 /tmp/onehandsales-g17/summarize.py
```

최초/중간 실패는 `dev-target-first.json/.log`, `dev-target-run2.json/.log`, 수정 후 결과는 `dev-target-run3.json/.log`에 보존했다. 타입/lint/unit/build는 `typecheck-final.log`, `lint-final.log`, `unit-final.log`, `build-final.log`와 최종 시각 보정의 `lint-visual-final.log`, `build-visual-final.log`를 참조한다. 최종 build는 `tsc -b`도 포함한다. 개발 E2E5175/빌드4175 임시 서버는 검사 종료 후 해제하고 기존5173을 유지했다.

**네트워크/console 관찰:** 요청 가로채기 없이 각 실행의 첨부 기록을 합산했다. 수치는 여러 테스트와 새로고침을 합친 요청 이벤트이며 고유 URL 수가 아니다. 개발의 로컬 모듈·이미지·HMR 연결과 인증/업무/외부 서비스 요청을 구분했다.

| 관찰 실행 | HTTP 요청 이벤트 | 로컬 WebSocket | 실제 API/외부 요청 | 실패 요청 | console/page 오류 |
| --- | ---: | ---: | ---: | ---: | ---: |
| G17 첫 대상 | 7096 | 4 | 0 | 0 | 0 |
| 대상2 | 12424 | 7 | 0 | 0 | 0 |
| 대상3 | 14193 | 8 | 0 | 0 | 0 |
| 전체 개발103 | 370535 | 207 | 0 | 0 | 0 |
| 전체 빌드103 | 5830 | 0 | 0 | 0 | 0 |
| 최종 대상 개발7 | 15968 | 9 | 0 | 0 | 0 |
| 최종 대상 빌드7 | 107 | 0 | 0 | 0 | 0 |
| 기존5173 최종 캡처 | 1778 | 별도 집계 없음 | 0 | 0 | 0 |

집계 근거는 `verification-summary.json`, 최종 캡처는 `capture-report.json`이다. 실패 요청도 관찰 대상으로 포함했으며 차단으로 숨긴 요청은 없다. 위 결과는 실행한 시나리오의 범위이며 실제 서비스 연동 검증을 뜻하지 않는다.

브라우저 G17은 실제 보호 URL/로그인/사이드바·메뉴·Settings 링크/클릭·더블클릭/입력/뒤로·앞으로·새로고침·새 탭/취소·실패·재시도/동명이인 제거/권한·expired/키보드·포커스·Escape/320·390·768·1440폭/24px CSS확대/긴 이메일·한글 오류입력·합성 composition을 검증한다. Store 단위검사는 저장·제거 도중 workspace/로그아웃 경합을 직접 주입한다. 브라우저에서는 네이티브 모달 때문에 배경 세션 도구가 비활성이며 실제 닫기/이탈 취소 후 전환과 저장값 격리를 확인했다. 이를 브라우저에서 비활성 배경을 실제 조작한 검증으로 쓰지 않는다.

## 7. 시각 비교·임시 보관 경로

원본2880×1800을1440×900으로 정규화하고 Chromium1440×900/DPR1/스크롤0/대응 입력·선택·목록 상태로 비교했다. source 실제 CSS viewport/DPR·정확한 폰트는 여전히 미확인이다. 기존 로컬 Gellix와 Lucide를 재사용한 근사이며 원본 값으로 단정하지 않는다.

- 메타데이터: `/tmp/onehandsales-g17/mcp-sources.json`.
- 원본 경로·SHA256·비교 대응표: `/tmp/onehandsales-g17/comparison-manifest.json`.
- 실제 캡처: `/tmp/onehandsales-g17/captures/invite-01~05-*.png`, `remove-01~04-*.png`, `narrow-320/390/768.png`.
- 원본/구현 나란히 비교: `/tmp/onehandsales-g17/comparisons/`의 같은 이름9쌍. `review-invite-dialogs.png`, `review-tables.png`, `review-remove.png`는 영역별 비교 시트다.
- 측정 조건/DOM 치수·폰트·색: `/tmp/onehandsales-g17/capture-report.json`. 초기 보정 전 자료는 `captures-before-final/`, `capture-report-before-final.json`; 표 보정 전/목적지 준비 대기 수정 전 자료도 `captures-pre-table-review/`, `captures-before-ready-check/`에 별도 보존했다.
- 초대 모달 실제 x490/y60/460×530. 제거 모달 x520/y60/400×313, 메뉴 x1234/y603.5/160×100. 표 본문 x260~1380, 행55px, 초대 CTA133×40. 원본을 정규화해 측정한 근사치와 실제 브라우저 CSS 측정값을 구분한다.
- Invite01은 진입 맥락만 비교하며 G72 프로젝트/재무 대시보드는 구현 대상이 아니다. **G17 본체8상태 비교 수행 + 대시보드 맥락1쌍**이며 전체 대시보드 재현 완료가 아니다.

남은 시각 차이: 가상 이름/이메일·이니셜로 인한 폭/줄바꿈, 원본 내부 폰트 파일/아이콘 정밀 일치, 공통 앱 셸의 계정/상단 도구·도움말 버튼 차이, source 제거와 초대 배경의 서로 다른 표시 조건. 빈 초대 캡처에 없는 X도 다른 상태와 일관된 닫기를 위해 유지했고, 제목 초기 포커스·입력/키보드의 강한 focus ring은 접근성 목 가정이다. 원본 모바일/hover/전체 선택 옵션은 확인하지 못했다. 비교 수행을 픽셀 완전 일치로 보고하지 않는다.

사용자 지시에 따라 **`_evidence`를 만들지 않았고 삭제된 `RESULTS/evidence`를 복원하지 않았다.** `/tmp` 자료는 영구 증거가 아니며 시스템 정리 시 삭제될 수 있다. 저장소에는 구현·테스트·결과/상태 문서만 남긴다.

## 8. 남은 범위·5173 확인 순서

- R02: 원본 전체 역할/옵션/권한표, 프로젝트 필수 조건, 실제 중복/만료 UI, 재발송 결과·가입 완료 멤버/Owner 제거 미수록. 기존 G10~G16·R01/R02의 다른 자료/시각/환경 대기 유지.
- G18: 초대 수락·다른 계정·철회/만료 링크 진입·협업자 접근. 이번에 시작하지 않았다.
- 서버 후속: 메일 수신/재발송, 토큰 폐기, 역할/프로젝트 권한 발효, 실세션 차단, 좌석/구독/과금, 영속성. API/DB 계약을 작성하지 않았다.
- 환경: 실제 macOS 한글 IME·스크린리더/보조기술·Firefox/WebKit·실기기를 실행하지 않았다. 자동 Chromium의 합성 composition/CSS 확대/좁은 viewport와 구분하며 해당 환경에서 후속 검증이 필요하다.

기존 **http://127.0.0.1:5173/** 에서:

1. `/app/settings/team` → `Continue as Alex` → Settings의 Team 표. Sidebar Invite Team 또는 Invite Member로 초대를 연다.
2. `new@example.test`, Collaborator, Design Project with Doe Studio → Invite Collaborator → 같은 목록의 Invite Pending/1 Project와 안내 확인.
3. Team preview controls의 Next invite fails에서 실패→입력 유지→더블클릭 재시도, 중복 이메일/기존 `owner@example.test` 거부 확인.
4. 비교 fixture를 Removing으로 명시 교체 → Jon Smith 두 행 확인. `jon@example.test` 메뉴 Remove → 취소/다시 열기/Remove Member → `jon2@example.test` 가입 행이 남는지 확인.
5. Next removal fails에서 실패·재시도, Slow에서 처리 중 Escape/뒤로 이탈을 확인한다. 메뉴 화살표/Home/End/Escape·프로젝트 chip 해제·모달 Tab을 확인한다.
6. Preview controls의 workspace/Session 변경·로그아웃·같은 계정 복귀로 목록 격리를 확인한다. 새로고침/새 탭은 다시 가상 로그인이 필요하다.
7. 검증 종료 시 Team scenario Normal, 별도 검증 탭에서 Reset preview로 초기화한다. 사용자 기존 탭/입력을 강제로 초기화하지 않는다.
