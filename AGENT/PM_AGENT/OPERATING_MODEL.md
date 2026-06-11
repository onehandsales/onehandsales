# 에이전트 운영 모델

## 1. 목적

이 문서는 `PM_AGENT`, `UXUI_AGENT`, `SOFTWARE_AGENT`가 어떤 방식으로 협업하는지 정의한다.

`AGENT` 폴더는 역할별 문서를 따로 보관하기 위한 구조가 아니라, 제품 방향을 정하고 실행 기준을 맞추기 위한 협업 공간이다.

## 2. 역할별 책임

| 역할 | 책임 | 주요 산출물 |
|---|---|---|
| PM_AGENT | 문제 정의, MVP 범위, 우선순위, 정책 결정 | PRD, MVP 범위, 데이터 개념, 결정 기록 |
| UXUI_AGENT | 사용자 흐름, 화면 구조, 정보 우선순위, UI 톤 | 유저 플로우, 화면 목록, UX/UI 방향, UX 결정 |
| SOFTWARE_AGENT | 아키텍처, API, DB, 코드 규칙, 테스트, 배포 | 아키텍처 문서, 컨벤션, 기술 결정 |

## 3. 작업 흐름

새 기능 또는 계획은 다음 순서로 정리한다.

1. PM이 사용자 문제와 포함/제외 범위를 정리한다.
2. UX/UI가 사용자 흐름과 화면 우선순위를 정리한다.
3. Software가 API, DB, 아키텍처, 테스트 기준을 정리한다.
4. TODO 계획 폴더에 `/goal` 단위 작업 순서를 만든다.
5. 구현 중 결정이 바뀌면 관련 AGENT 문서를 먼저 갱신한다.

## 4. 충돌 해결

충돌 유형별 우선 문서:

- 제품 범위 충돌: `PM_AGENT`
- 화면 흐름 충돌: `UXUI_AGENT`
- 구현 구조 충돌: `SOFTWARE_AGENT`
- 역할 간 결정 충돌: `PM_AGENT/DECISIONS`에 최종 기록

충돌이 해결되면 한 문서만 고치지 않고, 영향을 받는 다른 역할 문서도 함께 갱신한다.

## 5. TODO 계획 문서 원칙

TODO 계획 문서는 큰 작업을 한 번에 실행하지 않기 위한 안전장치다.

규칙:

- `TODO` 아래에 계획 단위 폴더를 만든다.
- 계획 폴더 안에 `GOAL-WORK-ORDER.md`를 둔다.
- 한 번의 `/goal`에는 하나의 작업 단위만 넣는다.
- 작업 단위마다 포함 범위, 제외 범위, 완료 기준을 적는다.
- FE와 BE 작업은 같은 계획 폴더 안에서 `FE-TODO`, `BE-TODO`로 나눈다.

## 6. 문서 품질 기준

좋은 문서는 다음 조건을 만족한다.

- 한국어로 작성되어 있다.
- 기획자 관점에서 이유와 배경이 설명되어 있다.
- 포함 범위와 제외 범위가 분리되어 있다.
- 구현자가 임의 해석하지 않아도 된다.
- 관련 UX/UI와 Software 문서가 연결되어 있다.

## 7. 관련 문서

- `AGENT/README.md`
- `AGENT/AGENT_USAGE_RULES.md`
- `AGENT/PM_AGENT/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/DECISIONS/README.md`


