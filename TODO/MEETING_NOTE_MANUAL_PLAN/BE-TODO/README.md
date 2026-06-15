# Meeting Note BE TODO

## 1. 목적

MeetingNote Backend 구현 작업 문서를 둔다.

## 2. 실행 문서

- `G01-BE-MEETING-NOTE-DOMAIN.goal.md`
- `DB-SCHEMA.md`

## 3. 구현 기준

- API 계약은 `../COMMON/API-SPEC/MEETING_NOTE_API.md`를 따른다.
- DB schema는 `DB-SCHEMA.md`를 따른다.
- 기존 Backend module 구조, DTO validation, repository port, application service, Prisma repository 패턴을 따른다.
- mutation transaction은 application layer에서 처리한다.
