# Workflow

상태: Draft

## 1. 번호 폴더 착수 절차

각 번호 폴더는 아래 순서로 진행한다.

1. `COMMON/REFERENCES.md`의 참조 문서를 다시 읽는다.
2. `COMMON/SCOPE.md`에서 포함/제외 범위를 확정한다.
3. `FE-TODO/USER-WEB-TODO.md`에서 화면, route, client, 상태 처리를 확정한다.
4. `BE-TODO/API-TODO.md`에서 API 계약 초안을 작성한다.
5. `BE-TODO/DB-SCHEMA.md`에서 DB 변경 여부와 migration 필요성을 확정한다.
6. 구현 가능하면 별도 `/goal` 문서로 쪼갠다.
7. 구현 후 검증 결과와 남은 항목을 해당 번호 폴더에 다시 기록한다.

## 2. 구현 전 체크

| 체크 | 기준 |
|---|---|
| API 계약 | method/path/request/response/error/business logic/transaction/observability가 있어야 한다. |
| DB 계약 | model/relation/index/retention/rollback/migration 영향이 있어야 한다. |
| FE 계약 | route, 화면 상태, TanStack Query key, invalidation, empty/error/loading이 있어야 한다. |
| 보안 | user ownership, 민감정보, provider error redaction을 확인한다. |
| 검증 | BE test, FE type/lint/build/E2E 또는 수동 QA 범위를 적는다. |

## 3. `/goal` 전환 기준

번호 폴더는 바로 `/goal`이 아니다.

`/goal`로 전환하려면 다음이 필요하다.

- 포함 범위와 제외 범위가 명확하다.
- API/DB가 있으면 계약 상태가 최소 `confirmed`다.
- FE/BE 작업 순서가 독립적으로 실행 가능하다.
- 외부 provider가 있으면 port/interface, env, 실패 처리, smoke 기준이 있다.
- 완료 기준과 검증 명령이 있다.

## 4. 완료 후 처리

- 번호 폴더의 구현이 끝나도 이 상위 로드맵은 바로 `DONE`으로 옮기지 않는다.
- 완료된 번호 폴더는 해당 폴더 README에 완료 기록을 남긴다.
- 전체 01~12가 끝나거나 로드맵이 폐기될 때 상위 계획 이동을 판단한다.
