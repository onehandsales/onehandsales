# PM_AGENT

## 1. 목적

`PM_AGENT`는 제품 방향과 MVP 범위를 책임지는 문서 영역이다.

이 폴더는 사용자의 문제, 제품 가치, 기능 우선순위, 데이터 개념, 문서 운영 규칙, 확정 결정을 관리한다. UX/UI와 Software 문서가 세부 실행 방향을 다루더라도, 제품 목표와 범위 판단은 PM 문서를 기준으로 한다.

## 2. 관리 범위

- 제품 정의
- 타겟 사용자
- 핵심 문제와 가치
- MVP 포함/제외 범위
- 도메인 개념 모델
- 기능 우선순위
- 결제/운영 전략
- 문서 작성 규칙
- 전체 결정 기록
- TODO 계획 문서 작성 방식

## 3. 폴더 구조

```text
PM_AGENT/
  README.md
  OPERATING_MODEL.md
  PLANNING/
  DECISIONS/
  CONVENTION/
```

## 4. 우선 확인 문서

1. `DECISIONS/000_확정_결정.md`
2. `PLANNING/PRD.md`
3. `PLANNING/MVP_SCOPE.md`
4. `PLANNING/IMPLEMENTATION_STATUS.md`
5. `PLANNING/DATA_MODEL.md`
6. `CONVENTION/DOCUMENTATION.md`
7. `CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
8. `OPERATING_MODEL.md`

## 5. 협업 원칙

- UX/UI 결정이 필요한 기능은 `UXUI_AGENT` 문서와 함께 갱신한다.
- API, DB, 테스트, 배포 결정이 필요한 기능은 `SOFTWARE_AGENT` 문서와 함께 갱신한다.
- 결정이 여러 역할에 걸치면 PM이 최종 결정 문서를 남긴다.
- 새 구현 계획은 `TODO/{PLAN_NAME}/`에 만들고, `/goal` 작업 단위로 나눈다.

## 6. 관련 문서

- `AGENT/README.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`


