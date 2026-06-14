# Schedule BE TODO

## 1. 목적

Backend Schedule 도메인 구현 작업 문서를 둔다.

## 2. 문서

- `DB-SCHEMA.md`: Schedule DB 스키마 구현 기준
- `G01-BE-SCHEDULE-DOMAIN.goal.md`: Backend `/goal` 실행 문서

## 3. 구현 기준

- `COMMON/API-SPEC/SCHEDULE_API.md` 계약을 따른다.
- transaction 경계는 application layer에 둔다.
- Prisma는 infrastructure repository에서만 사용한다.
- 모든 API는 현재 사용자 `userId` ownership 기준으로 처리한다.
