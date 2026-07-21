# G01 DB Persistence Foundation

상태: Confirmed

## 1. 목적

확정 전 import 작업을 DB에 저장할 수 있도록 Prisma schema, migration, repository 기반을 만든다.

## 2. 선행 조건

- `BE/prisma/schema.prisma`가 현재 DB schema source of truth다.
- 기존 `ImportUserLog`, `ImportUserLogRow`는 성공 이력으로 유지한다.
- migration 대상 DB가 로컬 dev/test인지 확인한다. 공유/운영성 DB에는 무단 migrate를 실행하지 않는다.

## 3. 포함 범위

- Prisma enum 추가
  - `ImportJobStatus`
  - `ImportJobRowStatus`
  - `ImportJobMappingSource`
  - `ImportUploadedFileStatus`
  - `ImportJobErrorType`
  - `ImportJobErrorSeverity`
- Prisma model 추가
  - `ImportJob`
  - `ImportJobRow`
  - `ImportJobError`
  - `ImportUploadedFile`
- `User`, `ImportTemplate` relation 추가
- migration 생성
- migration SQL의 `COMMENT ON TABLE`, `COMMENT ON COLUMN` 추가
- DB repository interface와 Prisma adapter 기반 추가
- repository 단위 테스트 또는 integration test 기반 추가

## 4. 제외 범위

- User Web 화면 구현
- API controller 전체 교체
- AI mapping provider 변경
- Admin 운영 화면/API
- 전역 ErrorLog 설계
- Payment, Notification, Product analytics
- 공유/운영성 DB migration 실행

## 5. 구현 기준

DB schema:

- `BE-TODO/DB-SCHEMA.md`를 그대로 Prisma schema와 migration 기준으로 사용한다.
- 원본 파일 binary는 DB에 저장하지 않는다.
- `ImportJob.sourceColumnsJson`에는 원본 파일 header 순서를 snapshot으로 저장한다.
- JSON field에는 raw row를 저장할 수 있지만 structured log와 API response에는 원문을 노출하지 않는다.
- `userId` ownership field는 모든 신규 table에 둔다.
- `expiresAt`은 UTC instant이고 기본 정책은 생성 후 7일이다.
- `ImportJobRow.rowNumber`는 원본 파일 실제 row 번호를 사용한다. header row는 1, 첫 data row는 2이다.

Repository:

- repository interface는 application layer가 참조할 수 있는 위치에 둔다.
- Prisma repository adapter는 infrastructure layer에 둔다.
- Prisma client 직접 접근은 controller에 두지 않는다.
- ownership 조회 method는 `importJobId + userId` 기준을 기본으로 한다.

## 6. 연결 문서

- `BE-TODO/DB-SCHEMA.md`
- `BE-TODO/API-TODO.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DATA_IMPORT_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 7. 검증 명령

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run test -- data-import
```

`pnpm run prisma:migrate`는 DB target이 로컬 dev/test로 확인된 경우에만 실행한다.

## 8. 완료 기준

- Prisma schema에 신규 enum/model/relation이 반영되어 있다.
- migration에 신규 table, index, FK, check constraint, comment가 포함되어 있다.
- `pnpm run prisma:validate`가 통과한다.
- `pnpm run prisma:generate`가 통과한다.
- 신규 repository adapter가 user ownership 기준 조회를 제공한다.
- 적용 대상 DB가 불명확하면 migrate는 실행하지 않고 그 사유를 작업 결과에 남긴다.
