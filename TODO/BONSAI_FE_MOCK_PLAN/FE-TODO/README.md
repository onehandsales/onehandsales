# FE 작업 시작점

> 현재 상태 — 2026-11-23 KST G00: **R4 근거·색인·배정 재검토 완료 / 촬영 조건·요소 분석·시각 동일성 후속 대기**. [확인 범위·정합성·잔여 담당](../RESULTS/G00_RESULT.md#g00-recheck). 현재 [원본 동일 재현 기준](../COMMON/UXUI-REPLICATION.md#current-identity)을 적용하며 아래의 작은 시각 차이 허용은 과거 정책이다. G01의 동작 보완 이력과 시각/환경 대기를 유지한다. 이번 G00은 문서만 보완했으며 evidence·임시 산출물·새 결과 문서를 만들지 않았다. 다음 Goal은 자동 시작하지 않는다.

> 이전 G01 재검토 기록 — 2026-11-23 KST G01 재검토: **G01 공통 모달 2종 결함 보완·목 동작 검증 수행 / 엄격한 시각 동일성 대기**. 이번 G01·직접 연결 검증에서는 작은 폰트·크기·픽셀 차이를 허용하지 않는다. 과거 구현/체크는 당시 이력이며 다른 G/R의 전체 완료로 승격하지 않는다. [결과·체크·미완·직접 확인](../RESULTS/G01_RECHECK_RESULT.md). G32 이후 미착수, 실제 API/BE/DB 작업·push·배포 없음.

> 과거 계획 반영 기록 (이번 G01 수용 기준 아님) — 2026-11-23 KST: **R4 분석의 계획 반영**. [보완 대응표](../COMMON/SOURCE-ANALYSIS-IMPACT.md)를 먼저 읽는다. G01~G31의 기존 구현·검증 이력은 유지하며 R4 현재 구현 대조는 미실행이다. [현재 흐름 기준](../COMMON/FLOW-BEHAVIOR-REVIEW.md#policy)에 따라 행동·상태·저장·전환을 우선 대조한다. 폰트·크기·픽셀의 작은 차이는 허용한다. G32 이후 구현은 미착수이며 이 문서 변경만으로 재개하지 않는다. [이번 문서 검토](../RESULTS/SOURCE_ANALYSIS_PLAN_REVIEW.md).

대상은 `FE/user-web`의 Bonsai 공개 웹·인증·업무 앱·외부 수신자 화면이다. 실제 코드 변경은 후속 Goal 실행에서 진행한다. 기존 Admin Web은 별도 제품 운영 도구이며 고객 포털로 바꾸지 않는다. User Web과 Admin Web 코드를 공유하지 않는다.

- [웹 구현 기준](USER-WEB-TODO.md)
- [사용자 흐름](../COMMON/USER-FLOW.md)
- [로그인 전 공개 웹](../COMMON/PUBLIC-WEB.md)
- [Goal 순서](../COMMON/GOAL-WORK-ORDER.md)
- [추가 분석](../COMMON/RESEARCH-GOALS/README.md)

G01~G31은 관찰 범위 목 구현 이력이 있고 G32 이후는 미착수다. 기존 코드를 유지하면서 R4 분석에 따른 대조·보완 범위를 먼저 정한다. 아래 날짜별 기록은 당시 결과이며 현재 전체 상태를 덮어쓰지 않는다.

## G02 재점검 상태 — 2026-11-20

[이번 결과](../RESULTS/G02_RECHECK_RESULT.md): 모바일 메뉴/초점·중복 제출·시각 치수 보완 및2차 검토. typecheck/lint/build, unit9/9, dev/build Chromium E2E 각15/15 통과.17상태 비교 수행, 잔여 시각 차이·원본 동작·추가 환경 검증 대기. G02 전체 완료는 보류하고 G03은 시작하지 않았다.
