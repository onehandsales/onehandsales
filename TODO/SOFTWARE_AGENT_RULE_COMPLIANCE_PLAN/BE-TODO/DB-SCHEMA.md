# DB Schema

상태: Draft

## 1. 현재 DB 변경 계획

없음.

이번 계획은 Prisma schema, migration, DB relation을 변경하지 않는다.

## 2. 금지

- 기존 migration 수정 금지
- 신규 migration 작성 금지
- Prisma schema field rename 금지
- FK/index 변경 금지

## 3. 예외

G04에서 transaction boundary 정리 중 DB model 변경이 꼭 필요하다고 판단되면 작업을 중단하고 별도 계획 또는 goal로 분리한다.

그 경우 다음 문서를 먼저 보완한다.

- `COMMON/API-SPEC`
- `BE-TODO/DB-SCHEMA.md`
- `COMMON/GOAL-SPECS/G04-BE-CROSS-MODULE-REPOSITORY-BOUNDARY.goal.md`

