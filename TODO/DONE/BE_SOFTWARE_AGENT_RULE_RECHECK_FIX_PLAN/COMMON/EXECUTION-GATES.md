# Execution Gates

상태: Ready

## 1. 결론

각 `/goal`은 아래 gate를 통과한 뒤에만 파일을 수정한다.

## 2. Gate 목록

| Gate | 닫히는 기준 |
| --- | --- |
| G1. Reference read | `COMMON/REFERENCES.md`의 필수 문서를 읽었다. |
| G2. Scope fixed | 현재 Goal의 포함 범위와 제외 범위를 확인했다. |
| G3. Worktree check | `git status --short`로 기존 사용자 변경을 확인했다. |
| G4. TODO_LOG start | 작업 시작 전 `TODO_LOG\<작업일>\BE_SOFTWARE_AGENT_RULE_RECHECK\<GOAL_ID>_<TASK_TITLE>\WORK_LOG.md`를 만들거나 갱신했다. |
| G5. API contract | API request/response/path/error/transaction/observability 변경이 있으면 API-SPEC과 FE client를 먼저 확인했다. |
| G6. Comment rule | Backend 코드 수정 시 한글 역할/기능/API/단계 주석을 반영할 위치를 확인했다. |
| G7. Validation plan | 실행할 typecheck, lint, test, static check를 Goal 문서 기준으로 확정했다. |
| G8. No unrelated edit | 현재 Goal과 무관한 파일을 수정하지 않는다. |
| G9. Progress docs update | Goal 완료 후 개별 Goal, 상위 README, 작업 순서표, 리스크 요약, TODO_LOG 상태를 함께 갱신한다. |

## 3. TODO_LOG 작성 형식

각 Goal은 아래 파일을 작성하거나 갱신한다.

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\BE_SOFTWARE_AGENT_RULE_RECHECK\<GOAL_ID>_<TASK_TITLE>\WORK_LOG.md
```

필수 항목:

- 작업 상태
- 수행 범위
- 제외 범위
- 읽은 Agent 문서
- 수정 파일
- 검증 명령
- 검증 결과
- 자체 검토 결과
- 남은 리스크
- 추가 TODO 필요 여부
- 관련 진행 문서 갱신 여부

## 4. 금지

- Goal 여러 개를 한 번에 묶지 않는다.
- 새로 발견한 대형 리팩터링을 현재 Goal에 끼워 넣지 않는다.
- 사용자 변경을 되돌리지 않는다.
- 실패한 검증을 기록 없이 넘기지 않는다.
- 사용자가 요청하지 않으면 커밋하지 않는다.
