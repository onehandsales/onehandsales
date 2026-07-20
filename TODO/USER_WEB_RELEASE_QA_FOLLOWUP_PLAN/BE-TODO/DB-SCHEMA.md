# DB Schema TODO

## 1. 이번 계획의 DB 변경 상태

기본 상태: Prisma schema 변경 없음.

G05는 운영 전 정합성 QA이며, schema나 migration을 새로 추가하는 작업이 아니다. DB 변경이 필요한 S0/S1/S2가 발견되면 G06에서 별도 API/DB 계약을 먼저 작성한 뒤 수정한다.

## 2. G05 확인 범위

- `BE/.env` 존재 여부
- DB 대상 분류: 로컬 dev DB, 공유 QA DB, 운영성 DB
- Docker dev Postgres 실행 가능 여부
- Prisma schema validation
- Prisma client generate
- migration status
- seed 실행 정책
- Prisma generate DLL lock 재현 여부

## 3. 금지

- 적용된 migration 파일 수정
- 공유/운영성 DB에 무단 `prisma:migrate`
- 공유/운영성 DB에 무단 seed
- 실제 DB URL 또는 비밀값 문서 기록
- schema 변경 없이 코드만으로 데이터 격리 문제를 우회 처리

## 4. 이번 계획 밖 DB 후보

- persistent ImportJob table
- Notification table
- DealActivity 통합 영업 활동 table
- MeetingNote transcript/raw text/provider call log table
- Admin 감사/조회 도메인 table
- 유료 영구 삭제 복구 예약 column/table

위 후보는 G07에서 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`으로 분리했다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`

## 6. G05 확인 결과

- 상태: Done, `RQA-005`는 Blocked
- 실행일: 2026-07-20
- Prisma schema 변경: 없음
- migration 파일 변경: 없음
- DB 대상: active `BE/.env` key 기준 DB URL 없음. Prisma CLI는 cloud Supabase pooler 성격의 datasource를 해석했으므로 로컬 dev DB로 분류할 수 없음.
- `prisma:validate`: 통과
- `prisma:generate`: Windows Prisma query engine DLL rename `EPERM`으로 Blocked
- `prisma migrate status`: cloud datasource 기준 17개 migration 미적용 보고로 Blocked
- `prisma:seed`: 로컬 dev/test DB가 증명되지 않아 실행 금지
