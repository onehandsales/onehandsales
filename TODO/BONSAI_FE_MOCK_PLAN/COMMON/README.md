# 공통 문서

> 현재 상태 — 2026-11-23 KST G00: **R4 근거·색인·배정 재검토 완료 / 촬영 조건·요소 분석·시각 동일성 후속 대기**. [확인 범위·정합성·잔여 담당](../RESULTS/G00_RESULT.md#g00-recheck). 현재 [원본 동일 재현 기준](UXUI-REPLICATION.md#current-identity)을 적용하며 아래의 작은 시각 차이 허용은 과거 정책이다. G01의 동작 보완 이력과 시각/환경 대기를 유지한다. 이번 G00은 문서만 보완했으며 evidence·임시 산출물·새 결과 문서를 만들지 않았다. 다음 Goal은 자동 시작하지 않는다.

> 이전 G01 재검토 기록 — 2026-11-23 KST G01 재검토: **G01 공통 모달 2종 결함 보완·목 동작 검증 수행 / 엄격한 시각 동일성 대기**. 이번 G01·직접 연결 검증에서는 작은 폰트·크기·픽셀 차이를 허용하지 않는다. 과거 구현/체크는 당시 이력이며 다른 G/R의 전체 완료로 승격하지 않는다. [결과·체크·미완·직접 확인](../RESULTS/G01_RECHECK_RESULT.md). G32 이후 미착수, 실제 API/BE/DB 작업·push·배포 없음.

> 과거 계획 반영 기록 (이번 G01 수용 기준 아님) — 2026-11-23 KST: **R4 분석의 계획 반영**. [보완 대응표](SOURCE-ANALYSIS-IMPACT.md)를 먼저 읽는다. G01~G31의 기존 구현·검증 이력은 유지하며 R4 현재 구현 대조는 미실행이다. [현재 흐름 기준](FLOW-BEHAVIOR-REVIEW.md#policy)에 따라 행동·상태·저장·전환을 우선 대조한다. 폰트·크기·픽셀의 작은 차이는 허용한다. G32 이후 구현은 미착수이며 이 문서 변경만으로 재개하지 않는다. [이번 문서 검토](../RESULTS/SOURCE_ANALYSIS_PLAN_REVIEW.md).

이전 동작·검증 기록: [G01~G15 감사 후 재점검](../RESULTS/G01_G15_RECHECK_RESULT.md). 기존 원본/시각/환경 대기는 유지한다.

현재 범위는 [UX/UI 재현 기준](UXUI-REPLICATION.md)을 따른다. 화면과 로컬 목만 구현하며 API/Backend/DB 작업은 포함하지 않는다.

- [사용자 흐름](USER-FLOW.md): 행위자·시작·정상 종료·복귀와 객체 연결.
- [로그인 전 웹](PUBLIC-WEB.md): 공개 화면 범위와 CTA 인계.
- [실행 순서](GOAL-WORK-ORDER.md): G/R을 함께 읽는 순서와 의존성.
- [착수 체크](START-CHECKLIST.md): 해당 기능의 추가 분석을 잊지 않기 위한 필수 절차.
- [G 명세](GOAL-SPECS/README.md) · [R 명세](RESEARCH-GOALS/README.md).
- [플로우 대응표](FLOW-GOAL-MATRIX.md) · [추가 구현 대기표](EXPANSION-BACKLOG.md).
- [로컬 목 화면 상태](MOCK-UI-STATE.md) · [기획 검토](PLANNING-REVIEW.md) · [문서화 기록](DOCUMENTATION-WORK-LOG.md).
- [기계용 색인](PLAN-INDEX.json): 번호·출처·단계 소유·선행 조건·R 소비 관계. 원본 분석 자체를 대체하지 않는다.

상태는 문서 작성, 조사, FE 코드 반영, 목 검증, 실제 연동 검증을 따로 기록한다. R 결과나 기능 범위를 변경하면 명세·순서표·대응표·색인을 함께 갱신한다.

G00 추가 점검에서 색인 필드의 의미를 명시했다. `research[].flows`는 R 명세 3절의 초기 참고 목록이고, 소비 구현 범위는 `consumers → goals[].flow_scope`를 따른다. 계획 흐름 번호와 원본 F번호는 Flow ID로 연결한다. [추가 검사·문서 보완](../RESULTS/G00_RESULT.md#g00-followup).
