# Bonsai FE 목 개발 계획

갱신: G21 고객/전체/열 프로젝트 생성과 고객·G17 초대 선택·G18 수락 목록을 같은 프로젝트 ID로 연결했다. R03 2흐름11원본 확인·11상태 비교, 타입/lint/unit67/build·개발/빌드 영향30개씩 검증. 초기 실패/수정은 별도 보존하며 원본·시각·환경 대기는 유지한다. G22부터 순차 진행한다. [G21 결과](RESULTS/G21_RESULT.md). 이전 수치는 당시 기록이다.

목표는 Bonsai 전체 기능·UX 재현이다. 먼저 실제 BE와 연결하지 않는 FE 목을 만들며, 공개 방문자의 탐색부터 인증, 내부 업무, 외부 고객의 응답까지 연결한다. 이후 검증된 UX/UI·공식 도움말·REST API 자료로 API/DB 계약을 별도로 설계한다.

## 현재 범위와 읽는 순서

**Gummble의 Bonsai 시안을 FRONT_AGENT에 따라 재현하는 프론트 UX/UI 전용 계획이다. 폰트·크기·색상·배치·플로우를 원본과 맞추고 인증을 포함한 실제 API는 전부 연결하지 않는다.** [재현 기준](COMMON/UXUI-REPLICATION.md)을 먼저 읽는다. Backend 설계·구현 Goal은 현재 계획에 없다. 추가 분석 R도 화면·상호작용 보완에 한정한다.

현재 로컬 분석 134개 플로우·754단계·642개 고유 Screen ID에 대해 공통·구현·검증 **85개 G Goal**을 배정했다. 추가 분석 **22개 R Goal**을 관련 구현 직전에 배치했다. 현재 107개 작업 단위는 시작 계획이며, 미수록 기능의 추가 구현 Goal에 따라 늘어난다.

1. [전체 사용자 흐름](COMMON/USER-FLOW.md)과 [로그인 전 화면 명세](COMMON/PUBLIC-WEB.md).
2. [Goal 실행 순서](COMMON/GOAL-WORK-ORDER.md)와 [착수 체크리스트](COMMON/START-CHECKLIST.md).
3. 해당 [G Goal 명세](COMMON/GOAL-SPECS/README.md)와 연결된 [R 분석 명세](COMMON/RESEARCH-GOALS/README.md).
4. [FE 작업 기준](FE-TODO/USER-WEB-TODO.md), [로컬 목 화면 상태](COMMON/MOCK-UI-STATE.md), [기획 검토](COMMON/PLANNING-REVIEW.md).

## 우선순위

| 단계 | 작업 | 현재 상태 |
| --- | --- | --- |
| G00~G01 | 출처·버전·범위 정리, 기존 FE 전면 교체, 독립 목 기반 | [G00 결과](RESULTS/G00_RESULT.md) · [G01 결과](RESULTS/G01_RESULT.md); 폰트/아이콘 동일성 대기 |
| R01 → G02~G09 | 공개 탐색·가격·블로그·템플릿·생성기·도움말·정책 | 소비 분석/목 구현·검토·최종 회귀 수행; 기존 G02~G04와 미수록/시각/환경 대기 유지 |
| R02 → G10~G14 | 가상 인증·복구·온보딩·앱 셸·공개 왕복 | 소비 분석/목 구현·두 차례 검토·최종 회귀 수행; 원본 미수록/환경 대기 |
| G15 | 회사 정보·주소·로고·공개 프로필 | 같은 회사 목 구현·두 차례 검토·최종 회귀 수행; 원본/시각/환경 대기 |
| G16 | 문서 브랜드 기본값·회사 로고 공유·Sample Invoice | [목 구현·검토·검증](RESULTS/G16_RESULT.md); 미수록 옵션/자산·시각·환경·후속 문서 연결 대기 |
| G17 | 멤버 초대·대기 초대 제거 | [목 구현·검토·검증](RESULTS/G17_RESULT.md); 미수록 역할/예외·시각·환경 대기 |
| G18 | 초대 수락·협업자 접근 | [목 구현·검토·현재 검증](RESULTS/G18_RESULT.md); 최소 화면의 후속 연결·자료/시각/환경 대기 |
| G19 | 고객 목록·생성·상세 | [목 구현·검토·현재 검증](RESULTS/G19_RESULT.md); G21 연결/자료·시각·환경 대기 |
| G20 | 고객 필드·이미지 | [목 구현·검토·현재 검증](RESULTS/G20_RESULT.md); 자료·시각·환경 대기 |
| G21 | 두 진입점 프로젝트 생성 | [목 구현·검토·현재 검증](RESULTS/G21_RESULT.md); 자료·시각·환경 대기 |
| G22~G82 + 관련 R | 고객·프로젝트·업무·설정 | 미착수 |
| 추가 구현 | 거래·견적·인력 배정·고객 포털 실제 사용 등 미수록 동작 | R 결과로 명세와 실행 위치 배정 대기 |
| G83~G84 | 업무 연결·역할·웹·회귀·전체 범위 감사 | 선행 구현과 추가 기능 완료 후 |

번호는 실행 순서가 보이도록 이전 대화의 공개 웹 G75~G82를 앞쪽으로 옮겼다. [순서표](COMMON/GOAL-WORK-ORDER.md)의 이전 번호 열로 대응한다. 이 계획의 G 번호를 현재 기준으로 사용한다.

## 범위 해석

- 일반 방문자용 공개 웹, 내부 앱, 외부 수신자용 공유 화면은 서로 다른 진입·권한을 가진다. 고객 포털은 Admin Web이 아니다.
- [134개 플로우 대응표](COMMON/FLOW-GOAL-MATRIX.md)는 기존 캡처의 담당 범위다. 전체 제품 기능이 모두 관찰됐다는 의미가 아니다.
- [추가 구현 대기표](COMMON/EXPANSION-BACKLOG.md)의 미배정 기능을 남긴 채 전체 복제를 완료 처리하지 않는다. R 완료는 조사 완료이며 FE 구현 완료와 다르다.
- 최초 계획 작성은 기존 R3 기록을 사용했다. 후속 G00/G01에서 MCP 3개 흐름18단계와 원본 PNG4개를 추가 확인했다. 전체 R·전체 이미지 재검토·실계정 재현 완료가 아니다.
- 신규 화면의 source/data interface는 FE 목 계약이다. 실제 HTTP·DB·권한·금융 정책의 확정 근거로 자동 전환하지 않는다.
- 과거 단계 기록: G01에서 FE/user-web을 전면 교체하고 이번 R01/G02에서 기본 `/`를 실제 랜딩 재현 화면으로 바꿨다. MCP22흐름111단계 순서를 재조회하고 G02 관련17상태를 비교했다. 해당 초기 실행은 환경·Backend·DB·Admin·외부 계정을 변경하지 않았다. 이후 G02 재점검 커밋은 `da60df02`이며 이번 G03에서는 커밋하지 않았다. G03은 이번 별도 요청으로 세 소개를 구현·검증했다. [G03 결과](RESULTS/G03_RESULT.md)의 미수록·시각·추가 환경 대기를 유지하며 이번 별도 요청으로 R01의 G04 소비 보완 후 가격·후기를 구현·검증했다. [G04 결과](RESULTS/G04_RESULT.md)의 영상·시각·추가 환경 대기와 G02/G03 미완료는 유지한다. G04 당시에는 커밋하지 않았다. 이후 사용자 커밋 요청으로 G03/G04가 포함된 HEAD `70ffefeb`에서 이번 연속 작업을 시작했다. G05 상태와 G06~G15 진행은 [연속 작업표](RESULTS/G05_G15_PROGRESS.md)에서 추적한다.

## 관련 기준

- [Bonsai 분석 시작점](../../bonsai_analysis/README.md) · [FE 보완 분석](../../bonsai_analysis/FE_REVIEW.md) · [기존 흐름 검토표](../../bonsai_analysis/FLOW_REVIEW_MATRIX.md).
- [제품 결정](../../AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md) · [UX 결정](../../AGENT/UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md).
- [FRONT_AGENT](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md) · [목 우선 개발](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/MOCK_FIRST_DEVELOPMENT.md).
- [문서화 작업 기록](COMMON/DOCUMENTATION-WORK-LOG.md).

### 2026-11-21 G06 추가 상태

[G06 결과](RESULTS/G06_RESULT.md): 공개 템플릿·관찰 상세·실파일15개·로컬 인계의 구현/두 차례 검토와 현재 검증을 수행했다. 전체 dev/build38개 및 마지막 G06 보정5개씩 통과. 미수록 본문·잔여 시각·추가 환경·가입 후 연결은 대기. [G05~G15 진행표](RESULTS/G05_G15_PROGRESS.md)에 따라 G07을 이어가며, 기존 G02~G05/R01 대기는 유지한다.

### 2026-11-21 G07 추가 상태

[G07 결과](RESULTS/G07_RESULT.md): 공개 생성기·계산·검증·행 편집·가입 snapshot과 두 차례 검토를 수행했다. unit18/전체 dev42/build42 통과. PDF·계정 청구서/고객은 생성하지 않았고 G10~G14 복귀 연결·잔여 시각·원본 미확인·추가 환경은 대기. G08을 순서대로 이어간다.

G08 연속 작업 결과: [도움말·문의 구현/두 차례 검토/현재 검증](RESULTS/G08_RESULT.md). unit18·관련 dev/build20+최종 대상5씩, 원본8상태 비교. 미수록/영상/시각/환경·앱 진입 후 연결은 대기. G09로 이어간다.

G09 [제휴·채용·정책 결과](RESULTS/G09_RESULT.md): 목 구현/두 차례 검토·unit18·전체 dev/build51+최종대상4씩, 원본11상태 비교. 버전/시각/원본 동작/환경 대기. 현재 R02 G10~G13 소비 분석→G10 연속 진행. 최신 단계는 [진행 기록](RESULTS/G05_G15_PROGRESS.md)을 따른다.

[G10 가입 결과](RESULTS/G10_RESULT.md): 별도 인증 레이아웃·가입/실패/소셜/메일 목과 선택 인계 귀속, unit24/전체 dev·build56+최종 대상5씩 통과. G13/G14 실제 연결·원본/시각/환경 대기는 유지하고 G11을 이어간다.

[G11 로그인/로그아웃](RESULTS/G11_RESULT.md): unit30/관련 dev·build26씩, 소셜/2FA 목·보호 복귀 검증. G13/G14·원본/환경 대기를 유지하고 G12로 이어간다.

[G12 비밀번호 재설정](RESULTS/G12_RESULT.md): unit34/관련 dev·build23씩·원본10쌍. 원본/환경·G14 종합 연결 대기, G13으로 이어간다.

[G13 사업 설정](RESULTS/G13_RESULT.md): unit38/관련 dev·build26씩+최종3씩·원본16쌍. 미수록/시각/환경·G14/G15 연결 대기를 유지하고 G14로 이어간다.

### G14 연결 갱신 (2026-11-21)

G14 앱 셸/404 및 공개 인증 왕복 unit38·관련 dev/build41씩·원본5쌍을 기록했다. G15로 이어가며 미수록/시각/환경 대기는 유지한다. [결과](RESULTS/G14_RESULT.md).
