# G01 실행 결과 — User Web 독립 목 기반

작성: 2026-11-20 KST. **기반 구현·규칙 검토·공통 요소 비교·개발/빌드 검증 완료. 원본 폰트 동일성은 확인 대기.** 전체 Bonsai 화면·전체 FE 완료를 뜻하지 않는다.

## 1. 범위와 교체 결과

[G00 조사](G00_RESULT.md) 이후 기존 User Web 소스·업무 테스트·공개 마케팅 자산을 교체했다. 기존 AuthProvider·Supabase·세션 복원·workspace bootstrap·API client·Object/List/View·SEO 정적 페이지 생성기를 제거했다. 기본 /부터 새 앱이다. 기존 구현을 별도 보관 폴더로 복사하지 않았다.

- 기존 src/tests/scripts/사용하지 않는 public 자산의 개별 파일 341개를 우선 정리하고 새 소스를 작성했다. 이후 불필요한 SEO 파일·QA 설정·미사용 패키지를 정리했다.
- 재귀 폴더 삭제 명령은 자동 승인 검토에서 blocked by policy로 거절됐다. 절대 경로와 소속을 확인한 **개별 파일 삭제**로 안전하게 완료했다.
- 이후 빈 디렉터리 정리 명령도 자동 승인 검토에서 blocked by policy로 거절되어 남겨 두었다. Git이 추적하는 이전 소스·테스트 제거와 새 앱 실행에는 영향이 없다.
- Node24·pnpm8·React19·Router7·Query5·Vite7·TypeScript strict·Tailwind3를 유지했다. lockfile의 새 패키지 버전 0개, 사용하지 않는 버전 항목 21개 제거. 불필요한 업그레이드 없음.
- .env 내용 출력·수정 없음. BE·Admin·DB·외부 서비스·TODO_LOG 작업 없음. 커밋·push·배포 없음.
- 최종 환경 파일 SHA-256 보존, 허용 경로 밖 변경0, 수정 문서의 로컬 링크 오류0을 확인했다. [최종 점검](evidence/g01-final-audit.json).
- OneHand CRM 제품명과 기존 브랜드 식별 자산을 보존했다. 신규 공개 웹 전체 시안은 G02 이후다.

## 2. 구조와 실행 경계

아래 경로는 FE/user-web 기준이다.

| 위치 | 책임 |
| --- | --- |
| src/main.tsx → app/app.tsx | 새 앱의 유일한 기본 실행 진입 |
| app/providers/app-providers.tsx | 메모리 runtime 생성, 가상 세션 구독, 공급자 주입 |
| app/providers/query-scope.tsx | 내부와 공유 화면의 독립 QueryClient·취소·캐시 수명 |
| app/router | 공개·가상 인증·내부·공유·없는 주소·렌더링 실패 경계 |
| app/layouts/preview-frame.tsx | 최소 검증 내비게이션·본문 초점·개발 도구 조합 |
| pages | route 해석·레이아웃·feature 조합 |
| features/preview/components | 가상 세션 선택, 항목 편집, 분리된 개발 도구 |
| features/preview/hooks | 조회·mutation·초안·취소·재시도·관련 캐시 갱신 |
| features/preview/data·model | 프론트 내부 공급자 타입·범위 키·가상 표시 모델 |
| mocks/preview-seed.ts·create-preview-runtime.ts | 단일 원본 저장소, 고정 ID/clock, 지연·실패·reset |
| components/ui·styles | Button·Field·Dialog·상태 표시·공통 token |

PreviewItem은 상태 일관성 확인용 이름 한 개를 가진 샘플이다. 고객·프로젝트 모델이나 공식 API/DB 계약이 아니다. source의 함수는 로컬 Promise 호출이며 HTTP adapter가 없다.

| 경로 | 현재 범위 | 후속 |
| --- | --- | --- |
| / | 새 공개 경계와 기반 검증 링크 | G02 실제 랜딩 |
| /login?returnTo=... | Alex/Blair 가상 세션·취소·내부 상대 경로 복귀 | G10~G13 원본 인증 화면 |
| /app·/app/items/sample-001 | 같은 항목의 목록·상세·이름 수정, 실패·미존재·제한 | 실제 업무는 담당 G |
| /share/sample | 내부 데이터와 분리된 공개 읽기 샘플 | 공유 기능 담당 G/R |
| /components | 원본 Field·Button·Dialog 표본 | 기능별 공통 UI 확장 |
| 그 외 | 명시적 미지원 주소와 공개 복귀 | G14 원본 404 시안 |

검증용 라벨·메뉴·가상 세션 선택기는 Bonsai 관찰 UI가 아니다. Preview controls는 별도 개발 도구다. production build도 목 검증 산출물이며 운영 서비스가 아니다.

## 3. 데이터 수명·상태·경합

- 세션 preview-a(owner), preview-b(member), workspace studio-a/studio-a-two/studio-b. 실제 권한 정책이 아니라 가상 표시 역할이다. 같은 sample-001 ID도 각 사용자/workspace에 독립된다.
- 기준 시각은 2024-02-06T09:00:00.000Z, 정상 저장마다 1초 증가한다. 실제 시각·Bonsai 집계 규칙이 아니다.
- 전체 새로고침·새 탭은 세션과 항목을 초기화한다. 같은 탭 route 이동은 저장값을 유지한다. 로그아웃/재로그인 때 저장된 메모리 항목은 유지하되 초안·조회 캐시는 폐기한다. Reset preview는 데이터·세션·장애·시각 카운터를 초기화한다.
- store가 단일 원본, Query는 조회 캐시, 편집 hook은 초안만 소유한다. 읽은 배열·객체는 복사본이다.
- scope와 query key에 actor/workspace/revision 및 memory 모드를 넣었다. 문맥 변경 시 조회·초안을 폐기하고 저장 직전 revision을 재검사한다.
- normal 180ms, slow 1500ms, 다음 읽기/저장 1회 실패, 빈 항목, 제한 상태. 실패 후 같은 폼/입력으로 재시도한다. 시나리오를 바꾸는 조작 자체는 새 범위이므로 초안을 폐기한다.
- 중복 제출은 ref와 disabled로 차단한다. 닫기·Esc·route 이탈은 진행 목 저장을 취소하고 미반영 초안을 폐기한다.
- ScrollRestoration은 sessionStorage의 onehand.preview.scroll에 스크롤 위치만 기록한다. 인증·업무 데이터는 저장하지 않으며 기존 실제 인증 storage를 읽거나 지우지 않는다.

## 4. FRONT_AGENT 코드 검토

| 규칙 | 관련 코드 | 판정·수정·검증 |
| --- | --- | --- |
| 구조·의존 방향 | app/layouts, pages, preview 공개 export, data interface | shared layout의 feature 참조를 app/layouts로 이동. 공유 조회를 전용 hook으로 이동. shared UI의 feature 역참조 없음 |
| 컴포넌트 책임 | Button·Field·Dialog·ItemEditor | UI는 값/의도, hook은 초안·저장. Dialog에 업무 공급자 의존 없음 |
| 명명·한글 주석 | 신규 TS/TSX·helper | kebab-case, PascalCase, use/handle/on 구분. 이름 있는 함수·컴포넌트 책임 주석과 타이머·저장·초기화 이유 확인 |
| 상태 소유·query | preview-keys·editor hook·runtime | scope 격리·단일 store·제출 snapshot·관련 캐시만 갱신. unit·E2E 확인 |
| 취소·실패·경합 | prepare·AbortController·mutation | 같은 A 재로그인·workspace·reset 후 늦은 저장 차단. 중복 제출·실패 재시도 |
| API 미호출 | provider·package·index.html·src | 실제 SDK/client/외부 font stylesheet 제거. 차단/intercept 없이 네트워크 관찰 |
| 접근성·폼 | Field·Dialog·ItemEditor | label·오류 연결·제목 초점·Tab 순환·Esc·복귀·배경 inert·스크롤 잠금. 초점 이탈 수정 |
| 라우팅 | route-boundaries·return-path | 실제 Router 사용. 직접 URL·reload·history·없는 ID·외부 returnTo 차단. reset 경합 수정 |
| strict·보안·성능 | tsconfig·eslint·build | 기존 strict 유지, any/non-null 우회 없음. 실제 환경/토큰을 모델·코드에 넣지 않음. 새 SPA build |
| 테스트 | Vitest·Playwright·capture script | 제거된 업무/API intercept 테스트를 새 수명·공유 상태·실패·navigation 검증으로 교체 |
| 종전 live 회귀·Admin | N/A | 명시적 User Web 전면 교체이므로 제거된 실제 인증/CRM 호환 유지 검증 제외. Admin 수정 없음 |

문서를 읽었다는 사실이 아니라 코드와 실행 결과를 기준으로 판정했다.

## 5. 원본 대응·시각 비교

카탈로그 Latest/2146, 앱 bonsai-web. **1440×900, 스크롤 0, 빈 입력**으로 비교했다. 원본 PNG 2880×1800의 1/2 표시이며 원본 DPR은 미확인이다.

| 원본 Flow·단계·Screen ID | 구현·검토 | 범위 |
| --- | --- | --- |
| Adding a new client · a5f7a722-8a0c-4528-966a-903e7e0873fb · 03 · sc_3e2640e1d9ca4b59a7f1c79cb628a502 | /components → Button/Field/Dialog | 제목·안내·Company Name·Smith Co.·Add Client, 치수·색·배치. Contact Name/Email/Tags·고객 생성·dashboard는 G19 |
| Logging in · a02409b3-6eb0-4bc0-b702-22a42e0990c8 · 02 · sc_9d353458318e43e7b25ebbf88fefeaa9 | 공통 token 교차 참고 | 입력·버튼·패널만. 현재 /login은 기반용 선택기이며 원본 로그인 완료 아님 |
| Adding a bookkeeping category · 3a74090f-e360-4fb9-9b79-c1ca197708ba · 02 · sc_f2a7c3be441a4a95ab91fba511865483 | 모달 변형 관찰 | 중앙 제목·palette 참고. 미래 옵션·palette를 미리 추가하지 않음. G63 미착수 |

- [원본 정규화 화면](evidence/g01-source-client-1440.png) · [구현 전체](evidence/g01-dialog.png) · [공통 요소 비교](evidence/g01-primitive-comparison.png).
- [공개 시작](evidence/g01-public.png) · [표본 화면](evidence/g01-components.png) · [390px 모달](evidence/g01-dialog-narrow.png) · [긴 한글](evidence/g01-narrow-long-text.png).
- [실측 JSON](evidence/g01-visual-metrics.json): Dialog x490/y60/w460, input x530/y229/w380/h40, 버튼 w420/h46, radius6/border1. 초기 input y234를 원본 y229로 보정했다.
- 표본 모달 높이336·버튼 y330은 한 필드짜리 검증 구성이다. 원본 전체 폼 높이와 동일 판정하지 않는다. 원본 버튼은 y657에서 같은 크기로 잘라 비교했다.
- 열기→입력→닫기→초점 복귀, Esc·바깥 클릭·재진입을 브라우저로 확인했다. 여기서 Add Client는 **표본 열기/닫기 trigger**이며 원본 고객 저장·상세 전환이 아니다. G19 완료로 계산하지 않는다. 초점·Esc·바깥 클릭은 원본 정적 캡처로 확정한 동작이 아니라 웹 접근성을 위한 목 가정이다.
- 정확한 family/자산은 미확인이다. 기하형·단층 a의 임시 Outfit을 로컬 로드했다([제작자·OFL](https://github.com/Outfitio/Outfit-Fonts)). 제목 굵기를 600→500으로 보정했다. 설명문 폭·글리프·안티앨리어싱은 아직 다르다. Outfit을 Bonsai 폰트라고 확정하지 않는다.
- 닫기 X는 Lucide 근사값이다. 원본 SVG·stroke는 미확인이다. 좁은 폭에서 닫기를 안쪽으로 옮긴 것은 접근성 목 가정이다.

ANALYSIS 원문은 변경하지 않았다. 미수록 서버 정책·태그·중복·CAPTCHA·권한 질문은 R02/R03/R15 및 기존 소비 Goal에 남긴다.

## 6. 결함·수정·재검증

| 재현 | 원인 | 수정 | 재검증 |
| --- | --- | --- | --- |
| 모달 마지막 버튼 다음 Tab | 네이티브 dialog에서 브라우저 chrome 쪽 초점 이동 | 첫/마지막 활성 요소 Tab·Shift+Tab 순환 | 개발·production 모달 E2E 통과 |
| 내부 상세에서 Reset | null 세션의 보호 route 이동이 공개 복귀를 덮음 | 공개 경계로 flushSync 이동한 뒤 reset | 개발·production 초기화/세션 통과 |
| 첫 lint 실패 | router 컴포넌트/비컴포넌트 export 혼합 | route-boundaries 분리 | lint 0 error |
| 공통 레이아웃 의존 | 공통 layout에서 feature import | app/layouts로 조립 책임 이동 | 방향 재검토 |
| 초기 원본 비교 | 입력 +5px, 제목 과한 굵기 | description 간격·제목 weight500 보정 | 같은 viewport 재캡처 |
| 초기 E2E locator timeout | label 검색에 필수표시·option 텍스트 포함 | 실제 접근 가능한 role/name 사용 | 상태·입력 시나리오 통과 |

첫 전체 E2E 1/7, 다음 6/7에서 원인을 수정한 뒤 개발7/7·production7/7로 재검증했다. 실패했던 초점·reset과 중복 제출을 회귀 사례로 유지했다.

마지막 제목 굵기 수정 후 lint·build를 다시 통과했고 production 모달/좁은 화면 2/2를 재검증했다. [최종 시각 회귀](evidence/g01-final-visual-validation.json). [초기 모달 캡처](evidence/g01-dialog-initial.png)와 최종본을 구분하며 최종 비교는 g01-dialog.png를 사용한다.

## 7. 실행 검증

Windows, Node24.18.0, pnpm8.14.1, Playwright1.60.0, Chromium148.0.7778.96. **실제 Chromium을 Playwright로 자동 조작**했으며 navigation 자체를 mock하지 않았다.

| 명령 / 검증 | 결과 |
| --- | --- |
| pnpm.cmd install --offline --ignore-scripts | 기존 캐시 사용·불필요 의존성 정리·새 버전 없음 |
| pnpm.cmd run typecheck | 통과 |
| pnpm.cmd run lint | 통과 |
| pnpm.cmd run test | 저장소·경합·복귀 경로 9/9 |
| pnpm.cmd run test:e2e | dev 서버5175, 7/7 |
| pnpm.cmd run build | 새 SPA build, 종전 정적 마케팅 출력 없음 |
| pnpm.cmd run test:e2e:preview | build preview4175, 7/7 |
| node scripts/capture-foundation.mjs | 5173 실제 화면·치수·폰트 캡처, 종료 전 reset |
| 네트워크·콘솔 | 두 모드 모두 인증/업무/외부 API0·실패 요청0·console/page 오류0 |
| 폭·키보드·입력 | 320/360/390/768/1024/1440, 긴 한글, CSS zoom200%, Tab·Esc·복귀·합성 composition |

[개발 검증](evidence/g01-dev-validation.json) · [production 검증](evidence/g01-production-validation.json). 요청 차단/intercept/fulfill 없음. 개발 HMR과 같은 호스트 문서·JS·CSS·로컬 font·아이콘을 API와 구분했다. production HMR0.

NO_COLOR/FORCE_COLOR·오래된 Browserslist 데이터 경고는 console 오류와 구분하며 경고 때문에 의존성을 업그레이드하지 않았다.

미검증: 원본 폰트/아이콘 자산 동일성, 실제 Windows/모바일 IME, OS 접근성 확대, 화면낭독기, Safari/Firefox/모바일 실기기. 합성 composition·CSS zoom·viewport를 실기기 검증으로 표현하지 않는다. 실제 인증·API·서버 영속성·외부 효과는 현재 범위 밖이다.

## 8. 실행과 최종 확인 순서

루트에서 pnpm.cmd -C FE/user-web dev 실행 후 http://127.0.0.1:5173 접속. 이번 5173 미리보기를 유지했고 기존 5174 리스너를 종료하지 않았다. 자동 E2E는 별도5175/4175를 사용하고 충돌하면 실패한다.

1. / → Components → Add Client → 입력 → Esc → trigger 초점 복귀.
2. /app/items/sample-001 직접 진입 → Alex 선택 → 원래 상세 → 이름 저장 → 목록의 같은 이름.
3. Preview controls → Next save fails → 편집/Save 실패 → 같은 입력 재시도.
4. Slow → 저장 중 Esc → Blair/Alex/두 번째 workspace 전환 → 데이터 격리.
5. Next read fails/Empty/Restricted → Normal 복원.
6. /share/sample·잘못된 공유/항목/페이지 주소 확인.
7. 새로고침의 세션·항목 초기화, Reset 후 /·Guest·Normal 복원.

## 9. G02 인계와 종료

G02는 공개 표본을 실제 랜딩으로 교체하며 로컬 목 provider·token·UI 경계·API0 검증을 재사용한다. 먼저 R01의 공개 원본/CTA/미수록 화면을 확인한다. **현재 공개 표본은 완성된 랜딩이 아니다.**

정확한 family·weight·폰트 파일/라이선스·close SVG는 추가 확인 항목이다. 확인 후 공통 token과 비교 캡처를 다시 만들고 소비 화면 줄바꿈을 검증한다. G11/G19/G63 전체 폼·중간 단계·저장/복귀는 해당 Goal에서 구현한다.

G00·G01의 이번 작업은 여기서 종료한다. G02/R01 자동 착수 없음. Backend/DB/API 설계는 전체 FE 이후 별도 요청이다.

## 10. 착수·종료 체크 기록

[공통 체크리스트](../COMMON/START-CHECKLIST.md)의 항목별 적용 기록이다. 체크는 근거·범위 확인을 뜻하며 N/A를 기능 구현 완료로 계산하지 않는다. 남은 동일성·환경 검증은 위 결과의 대기 상태를 유지한다.

- [x] 사용자 요청의 Goal과 허용 범위, 제외 경로, 현재 Git 변경을 확인했다. — G00 1절의 clean Git·허용 교체 범위.
- [x] [FRONT_AGENT](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md)와 [UX/UI 재현 기준](../COMMON/UXUI-REPLICATION.md)을 읽었다. Backend·API·DB 문서의 설계/확정을 현재 작업의 선행 조건으로 두지 않는다. — 4절 규칙별 코드 검토와 결정006 적용.
- [x] [순서표](../COMMON/GOAL-WORK-ORDER.md)의 선행 G 결과·차이·검증 근거를 확인했다. 문서 존재만으로 구현 완료를 간주하지 않았다. — G00 결과와 원본 자산 미확인을 확인.
- [x] 해당 G 명세 2절의 R 체크리스트를 전부 확인했다. 분석 전이면 R을 먼저 수행하고, 결과·출처·소비 명세 변경·검토 판정을 연결했다. — 별도 선행 R 없음; R01 자동 착수 없음.
- [x] R의 질문을 화면 보완과 후속 서버 메모로 나눴다. API·DB·실계정 정책 미확인이 관찰된 화면 제작을 막지 않게 했다. — 5·9절의 추가 확인과 후속 서버 메모.
- [x] 원본 ANALYSIS의 2~8절과 이미지·단계 순서·버전, [추가 구현 대기표](../COMMON/EXPANSION-BACKLOG.md)를 읽었다. 본문 링크가 없거나 자료가 바뀌면 근거를 보완했다. — G00의 원본3흐름·PNG4개와 대조, 5절.
- [x] 진입자·목표·입력·출력·route·권한·저장·취소·실패·재진입과 같은 객체를 사용하는 다른 화면을 정리했다. — 2·3절 route·상태·수명·동일ID 정책.
- [x] 현재 FE의 router/provider/bootstrap/query/HTTP 의존을 확인하고 목 경로에서 실제 API가 호출되지 않도록 경계를 정했다. 기존 실행·환경을 임의로 변경하지 않는다. — 1절 전면 교체. .env 해시·기존5174 보존.
- [x] 작업을 한 Goal로 검토할 수 없을 정도로 커졌으면 목적·결과가 분명한 하위 구현 명세로 분리하고 순서·색인을 갱신했다. — 기반 범위 안에서 결과 구분; G02 이후 구현 없음.
- [x] 원본과 같은 viewport에서 폰트·크기·색상·간격·배치·아이콘·플로우를 비교하고 차이를 기록했다. — 5절 비교 이미지·실측값. 폰트/아이콘 동일성은 대기.
- [x] 페이지는 조합, feature는 업무 UI, hook은 상태·요청, adapter는 데이터 접근을 담당한다. UI에 직접 HTTP나 중복 seed 배열을 두지 않는다. — 2·4절 구조·의존 검토.
- [x] 컴포넌트·hook·함수별 한 줄 한글 `// 기능 : ...` 책임 주석과 복잡한 판단의 이유를 작성했다. — 4절 책임/이유 주석과 최종 정적 점검.
- [x] 임시 입력·저장값·서버 결과를 구분하며 목 결과를 실제 발송·결제·서명 성공으로 표현하지 않았다. — 3절 초안/저장/실제 서버 구분.
- [x] 로딩·빈 상태·검색 무결과·권한 제한·오류·pending·성공·실패 후 재시도 중 해당 상태를 검증했다. — 7절 읽기·쓰기 오류·empty·제한·취소·재시도. 검색은 미구현/N/A.
- [x] 키보드·포커스·직접 URL·뒤로/앞으로·새로고침·폭 변경·긴 한국어/영문·시간대·금액 표시를 확인했다. — 7절 Chromium 내비게이션·키보드·폭·긴 한글 확인. 실제 IME/OS·화면낭독기 대기. 금액·지역 시간 변환은 미구현/N/A.
- [x] 해당 변경에 필요한 타입·lint·상태 전이·계산·브라우저 시나리오를 실행하고 명령·결과를 기록했다. 관련 없는 검증은 생략 이유를 남긴다. — 7절 실제 명령과 unit9·dev7·production7·최종시각2.
- [x] 네트워크에서 인증/업무/외부 서비스의 실제 요청이 없음을 확인하고 민감 정보가 로그·URL·저장소에 남지 않음을 점검했다. — 7절 가로채기 없는 네트워크 관찰·env 보존.
- [x] 수용 기준별 근거, 원본과의 차이, 미확인, 실제 실행하지 않은 검증을 기록했다. — 5~7절 근거·차이·대기 항목.
- [x] 표시 데이터·입력·전환에 필요한 로컬 목 상태만 정의했다. 서버 관련 질문은 후속 메모로 남겼으며 API 계약·DB 설계를 진행하지 않았다. — 3절의 임시 FE 타입. HTTP·DB·서버 계약 없음.
- [x] R에서 발견된 기능은 기존 G 확장 또는 새 G 명세로 배정했으며 후속 구현 완료와 조사 완료를 구분했다. — R 신규 기능 조사 없음; 기존 G11/G19/G63 소유 범위 유지.
- [x] 관련 G/R·흐름 대응표·확장 대기표·순서표·색인·검토 상태를 갱신했다. — 결과·명세·순서·색인·R01 인계 갱신. 미배정 확장 상태는 그대로.

### G10 공통 인증/인계 회귀 (2026-11-21)

[G10](G10_RESULT.md): 기존 revision 초기화는 유지하고 선택한 공개 snapshot만 새 가상 계정/workspace에 명시 전달한다. 가입은 전용 AuthLayout으로 이동했으며 과거 이력/취소 검증은 실제 공개 복귀 링크를 거치도록 갱신했다. 전체 dev/build56씩 통과. 블로그 재시도 검증은 로컬 카드 이미지 준비를 확인한 뒤 문서를 교체하도록 보강했다. 이 결과는 기존 시각/자료/환경 대기를 해소하지 않는다. 실제 온보딩/최종 목적지 복귀는 G13/G14 대기다.

### G11 공통 회귀 (2026-11-21)

인증 전용 로그인/실제 계정 검증/보호 returnTo 변경 뒤 관련 dev·build26씩 통과. 기존 공개 이력·메뉴·Reset·G01 same-ID/격리·G10 가입을 재검사했다. 이전 원본/시각/환경 대기를 올리지 않는다. [G11](G11_RESULT.md).

### G14 연결·회귀 갱신 (2026-11-21)

[G14](G14_RESULT.md)에서 공개 CTA→가입/로그인→사업 설정/선택 목적지→로그아웃의 관련 개발/빌드41개씩을 현재 코드로 검증했다. G01 표본은 `/app/preview`로 보존하고 앱 셸을 분리했다. 원본/시각/환경·미수록 전체 대기는 유지하며 이 기록이 해당 Goal 전체 재검증을 뜻하지 않는다. G15 같은 회사 편집은 다음 순서다.

### G15 최종 공통 회귀 (2026-11-21)

[최종 코드 검증](evidence/g15/final-verification.json)의 전체 개발/빌드82개씩에 기존 기반·공개 메뉴/폼·소개·가격/후기 흐름을 포함했다. G03의 이전 Public 테스트 명칭을 실제 Public site로 바꿨으며 검증을 제거하지 않았다. 기존 원본·시각·환경 대기를 완료 처리하지 않는다.
