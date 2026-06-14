# 시간/타임존 저장 기준 결정

## 1. 결정

시간과 timezone이 관련된 DB/API/Frontend 구현은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

핵심 기준:

- `createdAt`, `updatedAt` 같은 시스템 시각은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`은 사용자가 선택한 현지 날짜/시간과 IANA timezone을 해석해 UTC instant로 저장한다.
- 사용자가 입력한 현지 시간 의미를 복원해야 하는 업무 테이블은 같은 row에 `timeZone` 컬럼을 저장한다.
- 사용자 화면 표시는 Frontend에서 일정/사용자/조직 timezone 기준으로 변환한다.
- 날짜만 필요한 값은 Prisma `DateTime @db.Date`를 사용한다.

## 2. 이유

일정 도메인은 사용자 현지 시간과 DB 저장 시각이 섞이기 쉽다.

이 프로젝트는 한국뿐 아니라 미국, 싱가폴 등 여러 timezone의 사용자를 지원할 수 있어야 한다.

이 결정의 핵심은 다음 혼선을 줄이는 것이다.

- 미국 DST 때문에 같은 현지 오전 9시 일정의 UTC offset이 계절마다 달라지는 문제
- 일정 월간/주간 조회 범위가 사용자 timezone 날짜 경계와 어긋나는 문제
- Admin Web, User Web, export 결과가 서로 다른 기준으로 표시되는 문제
- 일정 생성/수정에서 `23:15` 같은 24시간제 입력값의 원래 현지 timezone을 잃어버리는 문제

따라서 DB는 UTC instant를 저장하고, 사용자 입력의 현지 의미가 필요한 테이블에는 IANA `timeZone`을 함께 저장한다.

## 3. 적용 범위

- Prisma schema와 migration 설계
- Backend DTO, application service, repository mapping
- API 계약 문서의 request/response 시간 필드
- User Web 일정/딜/메모/목록 표시
- Admin Web 운영 조회/감사 로그 표시
- Export 파일의 시간 표시 기준

## 4. 구현 규칙

- API 계약 문서에는 시간 필드마다 `UTC instant`, `local date-time + timeZone`, `날짜 전용` 중 하나를 명시한다.
- Backend 응답의 instant는 ISO 8601 UTC string을 기본으로 한다.
- 일정 생성/수정 API는 사용자의 입력 local date-time과 IANA `timeZone`을 명시적으로 해석한다.
- Frontend는 UTC ISO string을 그대로 출력하지 않고 일정/사용자/조직 timezone으로 변환한다.
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD`로 다룬다.
- 기존 적용 migration은 직접 수정하지 않는다. 기존 `TIMESTAMP(3)` 컬럼을 바꿔야 하면 별도 migration 계획을 먼저 만든다.
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 `timeZone` 컬럼을 함께 둔다.
- `timeZone`은 `Asia/Seoul`, `America/Los_Angeles`, `Asia/Singapore` 같은 IANA timezone ID만 허용한다.

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
