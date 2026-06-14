# User Timezone Foundation Common

## 1. 목적

이 폴더는 User timezone 기반 작업에서 BE와 FE가 공유해야 하는 계약을 둔다.

## 2. 문서

- `WORK-SPLIT.md`: BE/FE 책임 경계
- `API-SPEC/USER_TIMEZONE_API.md`: User timezone API와 DB 계약

## 3. 공통 원칙

- 글로벌 timezone 정책은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.
- `User.timeZone`은 사용자 기본 표시/입력 timezone이다.
- `timeZone` 값은 IANA timezone ID만 허용한다.
- 기본값은 `Asia/Seoul`이다.
- Schedule 도메인은 이 계획에서 구현하지 않는다.

## 4. 관련 문서

- `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/README.md`
- `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md`
- `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/WORK-SPLIT.md`
