# G07 01 Import Expansion Defer Closeout

상태: Decided
목표: 01에서 제외된 import scale/source/Admin 확장 후보가 01 미완성이 아니라 post-12 재검토 seed임을 문서로 닫는다.

## 1. 결정

01 `IMPORT_JOB_PERSISTENCE`는 회사, 담당자, 제품, 딜 import의 persistence/resume, terminal cleanup, 원본 file binary 즉시 삭제, `ImportUserLogRow` 30일 cleanup, 10MB/5,000 data row 제한까지 구현해 완료로 유지한다.

아래 항목은 12 전 구현 또는 계약화 대상이 아니다.

- 대용량 import background worker
- 일정/회의록 import
- ImportJob Admin 전용 화면/API
- ImportJob scale 운영 queue/retry/cleanup 확장

## 2. 근거

- 01 README와 최종 서비스 형태 문서는 위 항목을 01 최종형 밖의 별도 TODO 또는 post-12 후속 범위로 분리한다.
- 현재 Global B2C pre-12 목표는 기존 완료 슬롯의 의미를 깨지 않고, 12 착수 전에 후속 후보를 분류하는 것이다.
- 대용량 worker와 Admin 운영 화면/API는 product scale, ops, Trust/policy 성격이 강하다.
- 일정/회의록 import는 현재 ImportJob 대상인 회사, 담당자, 제품, 딜과 source mapping, 중복 처리, ownership, redaction 기준이 다르다.

## 3. 금지

- 12 전 `BE/src`에 import worker, schedule import, meeting-note import, ImportJob Admin API를 추가하지 않는다.
- 12 전 `FE/user-web`에 대용량 import progress, 일정/회의록 import source UI, Admin-only import cleanup 화면을 추가하지 않는다.
- post-12 재검토 전 Prisma schema에 import queue/source/Admin 운영 table을 추가하지 않는다.

## 4. post-12 재검토 질문

- 현재 10MB/5,000 data row 제한이 실제 사용자의 import 실패 또는 이탈을 만들었는가?
- 일정/회의록 import가 Google Calendar read-only import와 MeetingNote AI 흐름보다 먼저 필요한가?
- ImportJob Admin 화면/API가 11 Admin Operation의 일반 운영 화면과 별도 domain으로 필요할 만큼 운영 빈도가 있는가?
- 대용량 import worker가 필요하다면 ExportJob/file retention/Admin queue 정책과 같은 운영 체계로 묶어야 하는가?

## 5. 완료 기준

- `COMMON/CANDIDATE-MATRIX.md`에 import scale/source/Admin 확장 후보가 존재한다.
- `README.md`, `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`, `FE-TODO/USER-WEB-TODO.md`에 12 전 구현 금지와 post-12 seed 판단이 남는다.
- 01 완료 상태는 재오픈하지 않는다.
