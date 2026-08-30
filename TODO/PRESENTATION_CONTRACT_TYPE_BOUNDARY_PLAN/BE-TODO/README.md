# Backend TODO

상태: In Progress / G01-G02 Completed / G99 Next

## 1. 실행 순서

| 순서 | Goal | 파일 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `../COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md` | P3 | Completed |
| 2 | G02 | `../COMMON/G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md` | P3 | Completed |
| 3 | G99 | `../COMMON/G99-FINAL-REVIEW.goal.md` | P3 | Next |

## 2. 공통 지시

- `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`를 먼저 확인한다.
- Backend 코드 수정 시 한글 주석 필수 규칙을 적용한다.
- API request/response shape를 변경하지 않는다.
- 검증 결과는 `TODO_LOG`에 남긴다.
- 사용자가 요청하지 않으면 커밋하지 않는다.

## 3. 추가 재검토

2026-08-30 G02 추가 재검토에서 Backend 코드 기준 presentation repository port import, presentation 직접 repository token/interface 사용, response mapper repository record alias 패턴은 모두 0건이다. BE `typecheck`, `lint`, `test -- --runInBand`도 통과했으며, 다음 Backend 실행 대상은 `../COMMON/G99-FINAL-REVIEW.goal.md`이다.
