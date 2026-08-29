# Backend TODO

상태: Ready / G01 Next

## 1. 실행 순서

| 순서 | Goal | 파일 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | G01 | `../COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md` | P3 | Next |
| 2 | G02 | `../COMMON/G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md` | P3 | Ready after G01 |
| 3 | G99 | `../COMMON/G99-FINAL-REVIEW.goal.md` | P3 | Ready after G01-G02 |

## 2. 공통 지시

- `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`를 먼저 확인한다.
- Backend 코드 수정 시 한글 주석 필수 규칙을 적용한다.
- API request/response shape를 변경하지 않는다.
- 검증 결과는 `TODO_LOG`에 남긴다.
- 사용자가 요청하지 않으면 커밋하지 않는다.
