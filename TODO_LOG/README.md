# TODO_LOG

## 1. 목적

`TODO_LOG`는 특정 `/goal` 또는 명시적인 작업 단위의 진행 상태와 완료 이력을 날짜별로 남기는 폴더다.

`TODO`가 앞으로 할 일을 정리한다면, `TODO_LOG`는 실제로 적용된 작업과 검증 결과를 추적한다.

## 2. 작성 조건

작업 단위가 시작되면 바로 기록을 시작한다.

1. 날짜 폴더 안에 작업 폴더를 만든다.
2. `WORK_LOG.md`를 만들고 상태를 `진행 중`으로 기록한다.
3. 구현과 검증 중 중요한 변경, 실패, 보류 사항을 갱신한다.
4. 작업 완료 시 상태, 검증 결과, 검토 결과, 다음 작업을 최종 갱신한다.

## 3. 폴더 구조

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

## 4. 로그 문서 필수 항목

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

## 5. 금지

- 작업 단위가 시작됐는데 TODO_LOG 생성을 생략하지 않는다.
- 실패한 작업을 통과한 작업처럼 기록하지 않는다.
- 비밀값, access token, service role key, 개인정보 원문을 기록하지 않는다.
- 다음 작업으로 넘어가면서 완료된 작업과 남은 작업 안내를 생략하지 않는다.

## 6. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
