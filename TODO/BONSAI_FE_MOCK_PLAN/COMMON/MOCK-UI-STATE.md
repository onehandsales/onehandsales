# 로컬 목 화면 상태

> 현재 G08 — 2026-11-24 KST: **부분 완료**. 원본8단계·연결2PNG를 확인하고 검색/기사/문의 복귀를 보완했다. 단위/DOM179/179·타입/lint·메모리build 통과. 시각 동일성·실제 브라우저/네트워크는 대기다. 과거 이력·다른 G/R 상태를 보존한다. [범위·체크·잔여](../RESULTS/G08_RESULT.md#g08-r4-recheck).


> 이전 G07 — 2026-11-24 KST: **부분 완료**. 생성기5단계·연결11PNG를 확인하고 초안/가입 복귀를 보완했다. 단위/DOM166/166·타입/lint·메모리 build 통과. 시각 동일성·실제 브라우저/네트워크는 대기다. 과거 이력·다른 G/R 상태를 보존한다. [범위·체크·잔여](../RESULTS/G07_RESULT.md#g07-r4-recheck).

> 이전 G06 — 2026-11-24 KST: **G06 R4 주요 구성 대조·검색/상세 복귀/파일·가입 인계 보완·단위/DOM 검증 수행 / 엄격한 시각 동일성·실제 브라우저·미수록 원본 대기**. 원본3흐름21PNG·R4 10항목·공통12기준을 대조했다. 보완 후 DOM12/전체155(이전11/154 이력 보존)·타입/lint·메모리build와 로컬15파일 HTTP/구조 검증 통과. 실제 브라우저 요청/console·파일 수신·픽셀 동일성은 미검증이다. 과거 이력/대기 보존; 다음 Goal 자동 착수 없음. 후속 사용자 요청에 따라 추가 검토 후 로컬 커밋 대상으로 준비했다. [상세 결과](../RESULTS/G06_RESULT.md#g06-r4-recheck).

> 이전 G05 — 2026-11-24 KST: **G05 R4 주요 구성 대조·검색/기사 복귀/가입 인계 보완·단위/DOM 검증 수행 / 엄격한 시각 동일성·실제 브라우저·미수록 원본 대기**. 원본3흐름11PNG·R4 9항목·공통12기준을 대조했다. 신규 DOM13/전체143·타입/lint·메모리build 통과. 브라우저 요청/console·픽셀 동일성은 미검증이며 G00~G04/R01의 기존 대기를 유지한다. G06/G32 신규 착수·새 evidence/tmp/결과 문서·커밋 없음. [상세 결과](../RESULTS/G05_RESULT.md#g05-r4-recheck).

> 이전 G04 — 2026-11-24 KST: **G04 R4 주요 구성 대조·URL 복귀/보조 문구 보완·단위/DOM·Chrome 연결 검증 수행 / 엄격한 시각 동일성·미수록 원본·추가 환경 대기**. [범위·검증·잔여](../RESULTS/G04_RESULT.md#g04-r4-recheck). 원본7단계·R4 6항목, 단위/DOM130개·타입/lint·메모리build와 실제 Chrome 해당 연결을 검증했다. 원본 동일성·R01 전체·G01~G03 전체 대기는 유지한다. G79는 인계만 확인했고 업무 미착수다. evidence/임시 파일·새 결과 문서·커밋·다음 Goal 착수 없음.

> 이전 상태 — 2026-11-23 KST G00: **R4 근거·색인·배정 재검토 완료 / 촬영 조건·요소 분석·시각 동일성 후속 대기**. [확인 범위·정합성·잔여 담당](../RESULTS/G00_RESULT.md#g00-recheck). 현재 [원본 동일 재현 기준](UXUI-REPLICATION.md#current-identity)을 적용하며 아래의 작은 시각 차이 허용은 과거 정책이다. G01의 동작 보완 이력과 시각/환경 대기를 유지한다. 이번 G00은 문서만 보완했으며 evidence·임시 산출물·새 결과 문서를 만들지 않았다. 다음 Goal은 자동 시작하지 않는다.

> 이전 G01 재검토 기록 — 2026-11-23 KST G01 재검토: **G01 공통 모달 2종 결함 보완·목 동작 검증 수행 / 엄격한 시각 동일성 대기**. 이번 G01·직접 연결 검증에서는 작은 폰트·크기·픽셀 차이를 허용하지 않는다. 과거 구현/체크는 당시 이력이며 다른 G/R의 전체 완료로 승격하지 않는다. [결과·체크·미완·직접 확인](../RESULTS/G01_RECHECK_RESULT.md). G32 이후 미착수, 실제 API/BE/DB 작업·push·배포 없음.

> 과거 계획 반영 기록 (이번 G01 수용 기준 아님) — 2026-11-23 KST: **R4 분석의 계획 반영**. [보완 대응표](SOURCE-ANALYSIS-IMPACT.md)를 먼저 읽는다. G01~G31의 기존 구현·검증 이력은 유지하며 R4 현재 구현 대조는 미실행이다. [현재 흐름 기준](FLOW-BEHAVIOR-REVIEW.md#policy)에 따라 행동·상태·저장·전환을 우선 대조한다. 폰트·크기·픽셀의 작은 차이는 허용한다. G32 이후 구현은 미착수이며 이 문서 변경만으로 재개하지 않는다. [이번 문서 검토](../RESULTS/SOURCE_ANALYSIS_PLAN_REVIEW.md).

현재는 화면의 표시 데이터·입력·전환을 위한 프론트 내부 타입과 저장소만 작성한다. API 명세나 서버 DTO, DB 스키마를 설계하지 않는다. [현재 범위](UXUI-REPLICATION.md)를 우선한다.

- 페이지/feature UI는 표시와 사용자 의도, hook은 화면 상태, 목 adapter/store는 가상 데이터의 변경을 담당한다.
- 같은 항목의 목록·상세·편집은 같은 로컬 ID와 데이터를 사용한다. 토스트만 띄우고 화면이 바뀌지 않는 처리는 완료가 아니다.
- 로그인·가입·로그아웃·역할 전환도 가상 세션으로 표현한다. 기존 실제 인증 provider·workspace 초기화가 목 경로에서 호출되지 않도록 조립한다.
- 폼 초안·저장 표현·취소·빈 데이터·오류·재시도·새로고침 동작을 시안에 맞춰 구현한다. 서버가 확인되지 않은 상태는 임시 목 시나리오라고 기록한다.
- 목 데이터는 가상 seed를 사용하고 초기화·수명·고정 시각을 정한다. 실제 계정 데이터나 토큰을 가져오지 않는다.
- 화면 비교에 필요한 계산·정렬·검색·필터는 로컬에서 처리한다. API 호출로 대체하지 않는다.
- 현재 구현을 위해 미래 HTTP endpoint·범용 서버 repository·DB 제약을 미리 만들지 않는다.

화면 제작 중 떠오른 서버 질문은 간단한 후속 메모로 남긴다. API/DB 계약의 완료를 프론트 Goal 체크 조건에 넣지 않는다.

## G01 구현한 현재 정책

[G01 결과](../RESULTS/G01_RESULT.md) 기준으로 기본 앱 전체가 메모리 목이다. 새로고침·새 탭은 세션/데이터 초기화, 같은 탭 재로그인은 저장값 유지·초안/캐시 폐기다. Reset은 세션·seed·clock·장애를 초기화한다. 가상 actor/workspace/revision으로 늦은 조회·저장을 격리한다.

정상180ms·slow1500ms·다음 읽기/저장 1회 실패·빈 상태·제한을 개발 도구에서 선택한다. source는 FE 내부 함수이며 HTTP 경로가 없다. ScrollRestoration의 sessionStorage는 스크롤 전용이다. 후속 업무의 저장 수명은 이 정책을 출발점으로 사용하되 원본과 다른 경우 근거·영향을 명시한다.

## G02 공개 입력·메뉴 정책

[G02 결과](../RESULTS/G02_RESULT.md): 이메일·CTA source/returnTo는 PublicProvider 메모리다. 뒤로 복귀는 유지, 취소·가상 사용자/workspace/시나리오 revision·Reset·새로고침·새 탭에서는 폐기한다. 이메일을 URL/storage/log에 넣지 않는다. 메뉴/후기/홍보 선택은 화면 수명이며 재진입 초기값이다. 실제 가입/발송은 없다. G02 당시 가입/로그인은 후속 인계 표시였다. 현재는 G10/G11 가상 인증과 G13/G14 연결을 사용한다. Reset은 `/components`로 돌아가며 `/`의 공개 랜딩에 개발 도구를 표시하지 않는다.

G02 재점검: 모바일 탐색 닫기·desktop/mobile 분기 전환은 하위 메뉴도 초기화한다. 숨겨지는 트리거 초점은 현재 보이는 탐색 트리거로 복구한다. 이메일 연속 제출은 인계를 한 번만 기록하여 뒤로 한 번으로 복귀한다. [현재 검증](../RESULTS/G02_RECHECK_RESULT.md).

## G03 공개 소개·이력 정책

[G03 결과](../RESULTS/G03_RESULT.md): 공개 이메일은 pathname별 메모리 초안이다. 가입 source/email/returnTo는 이력별 snapshot으로 보관하고 browser history에는 opaque ID만 넣는다. 이메일은 URL/storage/log에 넣지 않는다. back/forward는 해당 인계를 표시하며 취소는 출발 페이지의 초안과 그 페이지의 인계들을 폐기한다. 다른 페이지 초안은 유지한다. scope revision/Reset/reload/new tab은 모든 공개 메모리를 폐기한다.

FAQ는 초기 모두 닫힘·단일 열림·재진입 초기화의 명시적 목 가정이다. 관련 글은 `contentPage` query로 목록1/미확인2페이지를 구분하고 실제 이력·스크롤 복원을 사용한다. demo는 외부 요청 없는 Dialog 인계이며 예약 완료 상태가 아니다. 소개 안 업무 이미지는 정적이다. 정적인 본문에 비동기 실패/로딩을 추가하지 않는다. Go to dashboard는 명시적으로 생성·선택한 가상 세션을 반영하며 스크롤로 세션을 바꾸지 않는다.

## G04 가격·후기와 선택 인계

[G04 결과](../RESULTS/G04_RESULT.md): 가격 주기는 URL `billing=monthly/yearly`가 소유하고 기본/잘못된 값은 Yearly다. 실제 history·새로고침으로 유지하며 다음 선택/CTA가 직전 값을 읽지 않도록 Router에 동기 반영한다. 선택 순간의 planId·주기·가격 근거 버전·표시 금액 의미·계산 소계를 기존 이력별 메모리 snapshot으로 복사한다. 과거 이력의 선택은 다른 플랜 제출로 덮이지 않는다.

인계의 `sourcePath`는 초안을 식별하는 pathname이고 `returnTo`는 query 포함 복귀 주소다. 명시적 취소는 해당 pathname의 초안/인계를 폐기하고 가격 주기 query는 유지한다. G03의 다른 페이지 이메일·snapshot 격리와 revision/reset/reload/new tab 초기화는 그대로다. history에는 opaque ID만 저장한다. 익명은 G10, 명시적으로 선택한 가상 세션은 G79 로컬 인계이며 구독·역할·권한을 바꾸지 않는다.

후기 영상은 파일 미확보로 미제공 Dialog이며 재생 성공·진행률이 없다. 닫기/Escape/초점 복귀를 제공하고 이탈·재진입은 닫힘 상태다. 외부 리뷰/작성자 주소는 로컬 안내에 문자열로만 표시한다. 정적 소개·후기에 가짜 실패/재시도 상태나 외부 요청을 추가하지 않는다.

## G01~G15 감사 후 보완 정책 (2026-11-21)

[G01~G15 재점검 결과](../RESULTS/G01_G15_RECHECK_RESULT.md)의 로컬 목 정책이다. Bonsai 서버의 실제 정책을 새로 확인한 기록이 아니다.

- G02 `SignupLink`: 같은 링크의 일반 클릭·더블클릭·Enter는 화면 이탈 전 한 번만 인계/이동한다. 수정 키·중간 버튼은 브라우저의 링크 동작을 유지한다. 새 탭은 독립 메모리이므로 원래 탭의 인계를 가져오지 않는다. 뒤로 돌아와 새로 클릭하는 것은 새 의도다.
- G08 도움말: 목차는 현재 이력을 replace하면서 진입 출처를 유지한다. 관련 기사에는 부모 기사의 pathname/query/hash와 부모의 복귀 state를 전달한다. 관련 기사→부모 기사→검색/Support로 순차 복귀할 수 있다. 검색 조건은 URL, 진입 출처는 해당 history entry의 state다. 직접 주소를 여는 새 문서는 출처가 없어 `/help`가 기본 복귀다. 같은 문서의 새로고침은 브라우저가 보존한 history state를 유지할 수 있으며 검색 query는 URL에 남는다.
- G15 주소: AddressEditor의 열린 상태는 부모의 저장 잠금과 같은 수명이다. 주소 취소는 하위 초안만 폐기하고, 전체 Discard/재조회/이탈은 하위 편집기와 잠금을 함께 해제한다. Save Address는 부모 초안 반영, Save Changes만 회사 저장이다.
- G15 국가·통화: 바깥 Country를 바꾸면 열린 주소 편집기의 국가도 최신 값으로 바뀐다. 그때 입력 중인 주소와 통화는 유지한다. 이후 주소 편집기에서 다시 고른 국가는 Save Address에서 반영한다. 주소 취소는 그 하위 변경을 폐기하되 이미 바깥에서 변경한 국가는 유지한다. 국가 변경만으로 통화를 환산하거나 기본 통화로 바꾸지 않는다.
- G15 공개 주소: 편집 `draft.slug`와 저장된 `savedSlug`를 구분한다. View Profile은 마지막 조회/저장 성공의 공개 주소를 연다. 저장 실패·취소에서는 주소가 바뀌지 않는다. 공개 비활성도 저장 후 공개 화면에서 반영하며 공유 미리보기 접근과 분리한다. View Profile로 페이지를 떠나면 미저장 초안은 기존 이탈 정책대로 폐기한다.

### G13 Pause·재진입과 새로운 이동 의도

1. 보호 URL→가입→온보딩의 `returnTo`는 온보딩 URL이 소유한다. 허용한 `/app` 경로의 query/hash도 보존한다. 사업 초안과 복귀 목적지를 같은 저장 객체로 합치지 않는다.
2. Pause→랜딩은 같은 탭의 actor/workspace 초안을 유지한다. 브라우저 뒤로/앞으로는 이전 온보딩 URL과 `returnTo`를 복원하고 완료 시 그 목적지로 이동한다.
3. Pause 뒤 **Go to dashboard**를 새로 누르는 것은 `/app`을 선택한 새로운 이동 의도다. 같은 사업 초안으로 온보딩을 재진입하되 완료 목적지는 `/app`이다. 다른 보호 URL을 명시적으로 선택할 때도 그 URL이 새 목적지다. 이전 목적지로 강제 이동하지 않는다.
4. 로그아웃·workspace/인증 revision 변경은 미완료 초안을 폐기한다. 새로고침·새 탭·Reset은 메모리 세션/계정/회사를 초기화한다. URL 문자열이나 브라우저 이력만으로 이전 개인 초안을 복구하지 않는다. 같은 탭의 일반 로그아웃 후 재로그인은 이미 저장된 회사만 유지한다.
5. 이 정책은 기존 G13의 ‘Pause 후 뒤로 재진입’과 G14의 명시적 앱 링크 의미를 일관되게 설명하기 위한 목 선택이다. 기존 동작을 바꾸지 않고 query/hash가 있는 보호 URL에 대해 두 복귀 경로의 회귀 테스트를 추가했다. 미관찰 Bonsai 복구 정책은 R02에 남긴다.

## G16 문서 브랜드 기본값 (2026-11-21)

[G16 결과](../RESULTS/G16_RESULT.md)의 목 정책이다. 같은 Company의 branding/brandingRevision과 G15 settingsRevision을 나눈다. 초안 헤더/로고는 미리보기만 변경하고 Save 성공으로 기본값과 명시적 로고 변경만 확정한다. G15 전체 저장은 명시한 회사 필드만 기록해 오래된 branding을 덮지 않는다. 주소·국가·통화·공개 여부·slug·인증 revision은 브랜드 저장으로 변경하지 않는다.

- 실패/Cancel save는 초안 보존, Discard/페이지 이탈은 초안 폐기. 새 선택·파일 읽기 시작은 이전 저장 취소. 중복/경합은 request ref·scope·revision으로 검사한다.
- 같은 탭의 로그아웃/재로그인은 저장된 회사를 유지하되 진행 요청/초안은 폐기한다. workspace별로 분리하며 새로고침·새 탭·Reset은 기존 seed 정책을 따른다.
- 미관찰 Desk/Custom Header·폰트/색·다른 크기/White Label 선택은 안내 Dialog 후 값을 유지한다. 실제 플랜·권한 정책이 아니다.
- 로고는 로컬 PNG/JPEG/WebP 2MB 이하 목 제한. 읽기/검증/취소/제거/재시도·object URL 해제를 재사용하며 실제 업로드는 없다.
- 새 문서 기본값은 저장된 회사값을 독립 복사하는 최소 fixture로만 검증했다. 미저장 초안·기존 문서 자동 수정·G07 자동 연결은 없다. 후속 문서 소비 화면은 대기다.

## G17 멤버 초대·대기 제거 (2026-11-21)

[G17 결과](../RESULTS/G17_RESULT.md): 팀 목록은 workspace별 메모리, 초안은 모달 수명, 목록 조회는 hook, 변경 잠금/Abort는 action hook, 정확한 ID·이메일·revision과 scope/generation 검사는 store가 소유한다. 같은 탭 재로그인은 저장 목록만 유지하고 reload/new tab/Reset은 seed 초기화한다. G13의 Company.invites는 제안 그대로이며 G17 Pending으로 자동 변환하지 않는다. 초대 성공은 Pending만 생성하고 실제 메일/Joined/역할·구독을 바꾸지 않는다. owner 변경 허용/member 조회 전용·프로젝트 선택/중복/만료·실패 UI는 명시적 목 정책이다. 실패 재시도 중 오류 영역을 유지해 버튼 이동에 따른 의도하지 않은 모달 취소를 막는다.

## G18 연결 갱신 (2026-11-22)

수락 성공 직전에 Pending ID/revision/대상/만료를 재검사하고 AuthStore/TeamStore를 동기 반영한다. 초대 membership은 workspace별로 분리하며 기존 소유 작업공간의 역할·사업 설정 상태를 보존한다. 새로고침/새 탭/Reset은 seed, 같은 탭 로그아웃 후 저장은 유지하고 입력은 폐기한다. 필터/row menu·Settings의 미수록 본문은 후속 근거 대기다. [G18 결과](../RESULTS/G18_RESULT.md)·[R02 분석](../RESULTS/R02_RESULT.md). 미관찰 동작은 명시한 목 정책이며 서버/API/DB 확정이 아니다.

## 2026-11-22 G28 상태 정의·완료 연결

`/app/tasks` 및 프로젝트 Tasks의 같은 작업 ID → 상태 선택 → Settings → workspace 표시명/색/순서 변경. Done ID는 완료 의미를 유지하고 과거 활동명은 저장 당시 snapshot이다. Dashboard 작업 체크는 같은 TaskStore를 변경하며 완료 행/하위/댓글/기록 시간은 유지한다. 취소→To Do, owner 정의 편집, Enter/blur/색 즉시 저장·Done 마지막 고정은 목 정책이다. 추가/삭제와 실제 공유·권한은 미확인이다. 실패는 입력 유지, 닫기/이탈은 미저장·pending 폐기, 성공은 같은 탭에 유지, reload/Reset은 seed 초기화. [G28 결과](../RESULTS/G28_RESULT.md).

## 2026-11-22 G29 보관·삭제 연결

전체/프로젝트 카드 또는 같은 ID 패널 → Archive(목 즉시 요청) / Delete→Confirm Deletion→확정. 실패는 동일 대상 재시도, X/outside/Escape/pending 취소·이탈은 원본 유지, 성공 후 활성 소비/요약에서 제외하고 패널은 원래 이력으로 닫는다. 이후 앞으로/기록 링크는 unavailable, hard reload/Reset은 seed 초기화다. 보관은 내부원본 유지/완료와 별개, 삭제는 부모 원본만 제거하며 시간·금액은 보존한다. owner-only와 연관자료/수명은 목 정책이고 실제 cascade/복원/청구는 미확인이다. [G29 결과](../RESULTS/G29_RESULT.md).

## 흐름 재검토의 적용 — 2026-11-23 KST

[현재 흐름 수용 기준](FLOW-BEHAVIOR-REVIEW.md#policy)을 적용한다. 기존 로컬 저장 수명·장애 주입·권한·복귀 정책은 명시한 목 선택이며 원본에서 확인된 서버 동작으로 승격하지 않는다. 실제 코드 대조는 아직 수행하지 않았다. 원본에 남은 오류·로딩·초안·차단 상태를 성공 토스트 하나로 대체하지 않고, 빈 구간의 자동 발송·결제·예약·고객 생성은 별도 근거가 있어야 한다.

## G01 재검토 — 2026-11-23 KST

[x] 단일 저장소·같은 ID·세션/workspace 격리·제출 초안·지연 취소·실패 재시도·reset을 현재 코드/회귀로 확인했다. [x] 중첩 모달 이탈 스크롤 잠금 및 양방향 경계 드래그의 초안 보존을 보완했다. 원본에 없는 취소/실패 정책은 목 가정이다. [결과 4·6·8절](../RESULTS/G01_RECHECK_RESULT.md).

## G02 혼합 입력 초점 정책 — 2026-11-23 KST

[현재 보완](../RESULTS/G02_RECHECK_RESULT.md#g02-r4-recheck): hover로 연 공개 메뉴에 키보드 초점이 들어오면 포인터 이탈/다른 트리거 hover가 그 초점을 제거하지 않는다. Templates 내부 초점도 우발적 hover에서 선택/추천 링크를 유지한다. 명시 클릭·방향키·Escape·외부닫기·폭 전환은 유지한다. 원본 미관찰의 목 접근성 정책이다. pathname별 이메일·이력별 intent·선택한 값 인계·출발 경로 취소·다른 초안 보존·revision/새 문서 초기화는 변경하지 않았다. DOM 검증과 실제 브라우저 미검증을 구분한다.

## G03 현재 적용 — 2026-11-23~24 KST

[이번 범위·규칙·검증·잔여](../RESULTS/G03_RESULT.md#g03-r4-recheck).

G03 URL(contentPage/query/hash), FAQ 로컬 상태, PublicProvider의 pathname 초안/history intent, G06 template snapshot의 소유를 유지했다. 이전 intent 취소는 해당 출발 경로만 정리하며 다른 소개 초안을 보존한다. query/hash·취소 왕복은 실제 router/history를 쓰는 jsdom 회귀다. demo/FAQ/pagination 비동기 저장·늦은 응답은 N/A(동기 로컬 UI); 실제 네트워크 관찰은 대기다.

## G04 적용 결과 — 2026-11-24 KST

[이번 범위·검증·잔여](../RESULTS/G04_RESULT.md#g04-r4-recheck). billing은 URL, 선택은 이력별 메모리 snapshot, 영상 열림은 컴포넌트 local이다. returnTo에는 pathname+search+hash를 보관하고 sourcePath는 pathname을 유지한다. 새로고침/새 탭은 인계 초기화·URL주기 유지. 사용자 전환/Reset 폐기는 DOM·Chrome에서 회귀했다. 정적 가격/후기에 가짜 저장 오류/로딩은 N/A다.

## G05 소비·재검토 기록 — 2026-11-24 KST

검색은 URL category/q/page와 location.key+revision 초안을 분리한다. 이력 이동 시 미확정 초안/조합을 폐기한다. 조합 중 분류는 확정 q, 일반 초안 중 페이지 클릭은 새 검색 첫 페이지, clear는 q/page/조합 폐기다. 잘못된 분류/page·범위 밖 page는 표시값으로 replace 정규화한다. 이 정책과 기존200ms/6개/제목·요약 검색은 목 가정이다.

공개 기사 출발은 URL/key/Router history index/메모리 UUID+revision을 담은 PublicOrigin이다. 가입 snapshot이 returnTo/returnOrigin을 복사하고 Cancel은 출발 기사 상태를 복원한다. Back은 중간 가입 이력을 건너뛰어 출발 위치로 POP한다. 새 공급자/Reset/범위 변경의 이전 origin은 /blog 기본 복귀다. 실제 새 탭/reload/스크롤은 대기. [수명·회귀](../RESULTS/G05_RESULT.md#g05-r4-recheck).

## G06 적용 결과 — 2026-11-24 KST

- [x] URL은 확정 필터, 초안은 location.key/목 revision, 선택/이메일은 공개 메모리 snapshot으로 분리했다. 검색/조합/오류/재시도/empty/무결과/slow/Reset·A/B 선택·취소 격리를 DOM 검증했다. 페이지24·200ms·80/1500ms·단일업종은 목 가정이다. [이번 결과](../RESULTS/G06_RESULT.md#g06-r4-recheck).
- [ ] 실제 브라우저/네트워크·원본 시각 동일성·미수록 원본은 해당 G06/R01/연결 G 대기다. 공통 양식과 다른 Goal 전체를 일괄 완료 처리하지 않는다.

<a id="g07-update"></a>
## G07 적용·연결 검토 — 2026-11-24 KST

- [x] 최신 편집 초안과 제출 snapshot을 분리하고 선택 취소만 삭제한다. 일반 가입 취소도 청구서 snapshot을 보존한다. 실패 재시도·중복·slow/이탈·scope/Reset·합성 IME DOM을 확인했다. [상세 판정·근거](../RESULTS/G07_RESULT.md#g07-r4-recheck).
- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G07 결과8절에 기록했다.

<a id="g08-update"></a>
## G08 적용·연결 검토 — 2026-11-24 KST

- [x] 검색 q/lang은 URL, 초안은 controlled input, 조회는 조건별 Query/abort, 평가는 canonical 기사ID별 도움말 방문 메모리다. 영어 복귀·목차·FAQ/관련기사에서 query/hash/state를 보존한다. 피드백 실패 보존/재시도·마지막선택·취소/이탈·Reset, 안내 모달의 history 종료를 DOM 검증했다. [상세 판정·근거](../RESULTS/G08_RESULT.md#g08-r4-recheck).

- [ ] 엄격한 시각 동일성·실제 브라우저/네트워크·미수록 원본은 대기다. 관련 G/R 전체 완료가 아니며 잔여 담당은 G08 결과7절에 기록했다.
