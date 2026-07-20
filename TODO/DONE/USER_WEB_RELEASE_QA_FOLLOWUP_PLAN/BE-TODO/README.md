# BE TODO

## 1. 목적

이 폴더는 `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN` 중 Backend와 DB 작업을 정리한다.

## 2. 이번 계획의 BE 기본 범위

- 다중 계정 ownership isolation QA
- Search, Trash, Export 데이터 격리 QA
- Admin API 일반 사용자 접근 차단 smoke
- Prisma validate/generate/migration status 점검
- seed 실행 정책 정리
- S0/S1/S2가 실제 BE bug로 확인된 경우 수정

## 3. 이번 계획의 BE 제외 범위

- Notification 구현
- ImportJob persistence 구현
- Admin 운영 API 구현
- 결제/구독 API 구현
- MeetingNote transcript/provider call log table 구현
- DealActivity 통합 table 구현
- 새로운 API response 확장 구현

## 4. 작업 문서

- `API-TODO.md`
- `DB-SCHEMA.md`

## 5. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`

