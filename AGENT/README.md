# AGENT

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 제품 방향, UX/UI 방향, 소프트웨어 구현 방향을 정하는 정본 문서 공간이다.

`AGENT`는 한 사람이 혼자 쓰는 문서함이 아니라, PM, UX/UI 리드, Software 리드가 함께 모여 기획과 방향성을 맞추는 회의실로 본다. 각 역할은 자기 관점의 정본 문서를 관리하되, 서로의 결정이 충돌하지 않도록 연결한다.

## 2. 역할별 폴더

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
```

## 3. 역할 정의

### PM_AGENT

제품의 문제 정의, MVP 범위, 도메인 개념, 우선순위, 문서 운영 규칙, 결정 기록을 관리한다.

주요 질문:

- 누구의 어떤 문제를 해결하는가?
- MVP에 포함할 것과 제외할 것은 무엇인가?
- 어떤 순서로 만들 것인가?
- 결정이 바뀌었을 때 어디에 기록할 것인가?

### UXUI_AGENT

사용자 흐름, 화면 구조, 정보 우선순위, UI 톤, 접근성, 모바일/데스크톱 사용성을 관리한다.

주요 질문:

- 사용자가 어떤 흐름으로 문제를 해결하는가?
- 첫 화면에서 무엇이 가장 먼저 보여야 하는가?
- 화면별 정보 우선순위는 무엇인가?
- 사용자가 빠르게 입력하고 다시 찾을 수 있는가?

### SOFTWARE_AGENT

아키텍처, API, DB, 코드 컨벤션, 테스트, 배포, 보안 구현 기준을 관리한다.

주요 질문:

- 어떤 구조로 구현해야 변경에 견디는가?
- User API와 Admin API는 어떻게 분리되는가?
- 데이터 소유권과 민감정보는 어떻게 보호되는가?
- 어떤 테스트로 회귀를 막을 것인가?

## 4. 정본 문서 우선순위

새 작업을 시작할 때는 아래 순서로 확인한다.

1. `PM_AGENT/DECISIONS/000_확정_결정.md`
2. `PM_AGENT/PLANNING/PRD.md`
3. `PM_AGENT/PLANNING/MVP_SCOPE.md`
4. `PM_AGENT/PLANNING/DATA_MODEL.md`
5. `UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
6. `UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
7. `SOFTWARE_AGENT/ARCHITECTURE/OVERVIEW.md`
8. `SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
9. `SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
10. `SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
11. `SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
12. `SOFTWARE_AGENT/CONVENTION/BACKEND.md`
13. `SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
14. `SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`
15. `SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
16. `PM_AGENT/CONVENTION/DOCUMENTATION.md`

## 5. 충돌 처리

문서가 충돌하면 다음 기준을 따른다.

- 제품 범위와 우선순위는 `PM_AGENT` 결정이 우선한다.
- 화면 흐름과 UI 정보 우선순위는 `UXUI_AGENT` 결정이 우선한다.
- 구현 구조, API, DB, 테스트, 배포는 `SOFTWARE_AGENT` 결정이 우선한다.
- 역할 간 충돌이 생기면 `PM_AGENT/DECISIONS`에 최종 결정을 남기고 관련 문서를 함께 갱신한다.

archive 또는 legacy 문서가 `AGENT` 문서와 충돌하면 `AGENT` 문서를 우선한다.

## 6. 관련 작업 문서

실제 구현 실행 계획은 `TODO` 아래 계획 폴더에서 관리한다.

예:

- `TODO/MVP-STARTER_PLAN`

TODO 문서 작성 방식은 `PM_AGENT/CONVENTION/DOCUMENTATION.md`를 따른다.


