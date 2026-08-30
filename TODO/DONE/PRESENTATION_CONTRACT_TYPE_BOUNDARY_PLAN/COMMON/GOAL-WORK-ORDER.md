# Goal Work Order

상태: Done / Archived

## 1. 실행 원칙

- 한 번의 `/goal`에서는 하나의 goal 파일만 실행한다.
- 이 계획은 Backend 계층 경계 정리 계획이며 API 계약 의미를 바꾸지 않는다.
- 작업 시작 전 `git status --short`, `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`, 관련 Backend Agent 문서를 확인한다.
- 각 goal은 `TODO_LOG\<YYYY-MM-DD>\PRESENTATION_CONTRACT_TYPE_BOUNDARY\<GOAL_ID>_<TASK_TITLE>\WORK_LOG.md`를 작성하거나 갱신한다.
- 코드 변경 시 `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd test -- --runInBand`를 실행한다.

## 2. 실행 순서

| 순서 | Goal | 파일 | 성격 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md` | DTO validation 타입/값 경계 정리 | Completed |
| 2 | G02 | `COMMON/G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md` | mapper read model 타입 경계 정리 | Completed |
| 3 | G99 | `COMMON/G99-FINAL-REVIEW.goal.md` | 최종 검토 | Completed |

## 3. 실행 프롬프트

완료 보관된 계획이므로 추가 실행 프롬프트는 없다.

## 4. 완료 판정

- presentation의 `application/ports/*repository*` import가 제거되었거나 남은 항목의 예외 사유가 문서화되어 있다.
- repository token/interface가 presentation에 직접 들어오지 않는다.
- API request/response shape가 변경되지 않았다.
- Backend typecheck/lint/test가 통과했다.
- TODO_LOG에 변경 파일, 검증 결과, 남은 리스크가 기록되어 있다.

## 5. 추가 재검토

2026-08-30 G02 추가 재검토에서 presentation repository port import, 직접 repository token/interface 사용, response mapper repository record alias 패턴은 모두 0건이다. BE `typecheck`, `lint`, `test -- --runInBand`가 통과했으며, 이 결과를 G99 최종 검토의 선행 상태로 기록했다.

## 6. 최종 검토 결과

2026-08-30 G99 최종 검토에서 G01/G02 완료 로그 존재, presentation repository port import 0건, 직접 repository token/interface 사용 0건, API request/response shape 보존, BE `typecheck`, `lint`, `test -- --runInBand` 통과를 확인했다. 계획 전체를 `TODO\DONE\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`에 보관했다.
