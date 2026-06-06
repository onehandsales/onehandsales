# Goal 작업 로그와 TODO_LOG 기록 결정

## 1. 결정

앞으로 특정 `/goal` 또는 명시적인 작업 단위를 진행할 때 AI 작업자는 `TODO_LOG`에 작업 로그를 남긴다.

작업 로그는 작업 완료 후에만 만드는 문서가 아니다. 작업을 시작할 때 생성하고, 구현과 검증이 진행될 때마다 현재 상태를 갱신하며, 작업이 끝나면 완료 결과와 다음 작업을 기록한다.

작업 완료 후에는 사용자에게 다음 작업을 안내하기 전에 완료된 작업의 검증 결과와 남은 리스크를 로그에 반영한다.

## 2. 이유

작업 로그를 시작부터 남기지 않으면 다음 문제가 생긴다.

- 실제로 무엇이 적용됐는지 추적하기 어렵다.
- 검증 명령, 실패했던 명령, 남은 리스크가 대화 안에만 남고 문서화되지 않는다.
- 나중에 같은 작업을 이어받는 사람이 현재 상태와 다음 진입점을 다시 조사해야 한다.
- 완료 기준을 만족하지 못한 작업이 완료된 것처럼 축적될 수 있다.
- 긴 작업 중간에 대화가 끊기거나 context가 압축되면 작업 범위와 진행 상태가 불명확해진다.

따라서 작업 단위마다 `TODO_LOG`에 날짜별 작업 폴더를 만들고, `WORK_LOG.md`를 현재 작업의 진행판으로 사용한다.

## 3. 적용 범위

이 규칙은 다음에 적용한다.

- `/goal`로 실행한 작업
- 사용자가 명시한 하나의 구현 작업
- 문서 계획 작성 작업
- Backend, User Web, Admin Web, DB, API, 테스트, 배포 준비 작업

단순 질문 답변, 코드 설명, 상태 확인만 수행한 경우에는 적용하지 않는다.

## 4. 생성 시점과 갱신 규칙

작업 로그는 다음 시점에 갱신한다.

1. 작업 시작 시
   - 날짜 폴더와 작업 폴더를 만든다.
   - `WORK_LOG.md`에 상태를 `진행 중`으로 기록한다.
   - 관련 AGENT/TODO 문서와 예정 범위를 적는다.
2. 구현 중 범위가 확정되거나 중요한 결정이 생길 때
   - 적용 범위, 변경 파일, 결정 이유를 보강한다.
   - 실패한 검증이나 보류한 항목이 있으면 숨기지 않고 적는다.
3. 작업 완료 시
   - 상태를 `완료` 또는 `조건부 완료`로 바꾼다.
   - 검증 명령과 결과를 기록한다.
   - 검토 결과, 남은 리스크, 다음 권장 작업을 기록한다.
   - 전체 작업 중 완료된 작업과 남은 작업을 요약한다.

## 5. 검토 규칙

검토는 작업 성격에 맞게 수행한다.

공통 검토 항목:

- 사용자가 요청한 범위와 실제 변경 범위가 일치하는가?
- 관련 AGENT/TODO 정본 규칙을 지켰는가?
- 완료 기준을 만족했는가?
- 실행한 검증 명령과 결과가 명확한가?
- 실패하거나 보류한 항목이 있다면 이유와 다음 조치가 기록됐는가?
- 관련 없는 파일 변경이 섞이지 않았는가?

Backend 검토 항목:

- Prisma, NestJS, Clean Architecture, User/Admin API 분리 규칙을 지켰는가?
- domain/application/infrastructure/presentation 경계를 어기지 않았는가?
- DB migration, seed, typecheck, lint, build, test 등 필요한 검증을 수행했는가?

Frontend 검토 항목:

- User Web/Admin Web 분리와 API client 경계를 지켰는가?
- 화면 상태, loading/error/empty/success, 모바일/데스크톱 기준을 확인했는가?
- typecheck, lint, build, E2E 등 필요한 검증을 수행했는가?

## 6. TODO_LOG 작성 규칙

`TODO_LOG`는 구현 후 작업 이력을 남기는 폴더다.

위치:

```text
TODO_LOG/
  YYYY-MM-DD/
    <GOAL_OR_TASK_KEY>_<TASK_TITLE>/
      WORK_LOG.md
```

예:

```text
TODO_LOG/2026-06-06/G10_PRODUCT_BACKEND_VERTICAL_SLICE/WORK_LOG.md
```

날짜 폴더는 작업 완료일의 로컬 날짜를 `YYYY-MM-DD` 형식으로 쓴다.

각 로그 문서에는 다음을 포함한다.

- 작업명
- 작업 일자
- 관련 계획과 goal
- 관련 AGENT/TODO 문서
- 예정 범위
- 진행 기록
- 적용 범위 또는 변경 파일
- 검증 결과
- 검토 결과
- 남은 리스크 또는 보류 사항
- 다음 권장 작업
- 전체 작업 진행 현황

## 7. 금지

- 작업 단위가 시작됐는데 TODO_LOG 생성을 생략하지 않는다.
- 실패한 작업을 통과한 작업처럼 기록하지 않는다.
- TODO_LOG에 비밀값, access token, service role key, 개인정보 원문을 기록하지 않는다.
- 적용 범위와 검증 결과를 생략하지 않는다.
- 다음 작업으로 넘어가면서 완료된 작업, 남은 작업, 다음 권장 작업 안내를 생략하지 않는다.

## 8. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `TODO/README.md`
