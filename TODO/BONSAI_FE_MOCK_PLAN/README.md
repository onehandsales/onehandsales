# Bonsai FE 목 개발 계획

작성: 2026-11-20 KST · 상태: **R01 정적 분석·배정 / G02 재보완·2차 검토·dev/build 검증 완료, 잔여 시각·원본 동작·추가 환경 대기**. G00/G01 기록은 유지한다.

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
| R01 → G02~G09 | 랜딩·공개 탐색·가격·블로그·템플릿·생성기·도움말·정책 | [R01 분석·후속 배정](RESULTS/R01_RESULT.md), [G02 재점검·검증·잔여 차이](RESULTS/G02_RECHECK_RESULT.md); G03~G09 미착수 |
| R02 → G10~G14 | 가입·로그인·재설정·온보딩·앱 진입 및 공개 CTA 왕복 | 미착수 |
| G15~G82 + 관련 R | 운영 회사·팀·고객·프로젝트·작업·시간·문서·폼·예약·청구·장부·설정 | 미착수 |
| 추가 구현 | 거래·견적·인력 배정·고객 포털 실제 사용 등 미수록 동작 | R 결과로 명세와 실행 위치 배정 대기 |
| G83~G84 | 업무 연결·역할·웹·회귀·전체 범위 감사 | 선행 구현과 추가 기능 완료 후 |

번호는 실행 순서가 보이도록 이전 대화의 공개 웹 G75~G82를 앞쪽으로 옮겼다. [순서표](COMMON/GOAL-WORK-ORDER.md)의 이전 번호 열로 대응한다. 이 계획의 G 번호를 현재 기준으로 사용한다.

## 범위 해석

- 일반 방문자용 공개 웹, 내부 앱, 외부 수신자용 공유 화면은 서로 다른 진입·권한을 가진다. 고객 포털은 Admin Web이 아니다.
- [134개 플로우 대응표](COMMON/FLOW-GOAL-MATRIX.md)는 기존 캡처의 담당 범위다. 전체 제품 기능이 모두 관찰됐다는 의미가 아니다.
- [추가 구현 대기표](COMMON/EXPANSION-BACKLOG.md)의 미배정 기능을 남긴 채 전체 복제를 완료 처리하지 않는다. R 완료는 조사 완료이며 FE 구현 완료와 다르다.
- 최초 계획 작성은 기존 R3 기록을 사용했다. 후속 G00/G01에서 MCP 3개 흐름18단계와 원본 PNG4개를 추가 확인했다. 전체 R·전체 이미지 재검토·실계정 재현 완료가 아니다.
- 신규 화면의 source/data interface는 FE 목 계약이다. 실제 HTTP·DB·권한·금융 정책의 확정 근거로 자동 전환하지 않는다.
- G01에서 FE/user-web을 전면 교체하고 이번 R01/G02에서 기본 `/`를 실제 랜딩 재현 화면으로 바꿨다. MCP22흐름111단계 순서를 재조회하고 G02 관련17상태를 비교했다. 환경·Backend·DB·Admin·외부 계정·커밋 변경은 없다. G03 이후는 별도 요청 때 시작한다.

## 관련 기준

- [Bonsai 분석 시작점](../../bonsai_analysis/README.md) · [FE 보완 분석](../../bonsai_analysis/FE_REVIEW.md) · [기존 흐름 검토표](../../bonsai_analysis/FLOW_REVIEW_MATRIX.md).
- [제품 결정](../../AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md) · [UX 결정](../../AGENT/UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md).
- [FRONT_AGENT](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md) · [목 우선 개발](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/MOCK_FIRST_DEVELOPMENT.md).
- [문서화 작업 기록](COMMON/DOCUMENTATION-WORK-LOG.md).
