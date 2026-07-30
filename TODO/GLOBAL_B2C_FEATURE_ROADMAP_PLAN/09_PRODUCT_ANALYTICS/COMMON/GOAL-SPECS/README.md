# Goal Specs

상태: Completed

## 1. 목적

09를 `/goal` 단위로 작게 실행하기 위한 상세 명세 모음이다. 각 `/goal`은 이 폴더의 파일 하나만 구현 범위로 삼는다.

## 2. 실행 순서

```text
G01_DOCUMENT_CONTRACT_SYNC
-> G02_DB_SCHEMA_EVENT_FOUNDATION
-> G03_ANALYTICS_COLLECTOR_API
-> G04_SERVER_EVENT_LOGGING
-> G05_USER_WEB_CLIENT_EVENTS
-> G06_SNAPSHOT_RETENTION_BATCH
-> G07_AI_USAGE_AND_BILLING_RESERVED
-> G08_QA_DOCUMENT_CLOSEOUT
```

## 3. 파일

- `G01_DOCUMENT_CONTRACT_SYNC.md`
- `G02_DB_SCHEMA_EVENT_FOUNDATION.md`
- `G03_ANALYTICS_COLLECTOR_API.md`
- `G04_SERVER_EVENT_LOGGING.md`
- `G05_USER_WEB_CLIENT_EVENTS.md`
- `G06_SNAPSHOT_RETENTION_BATCH.md`
- `G07_AI_USAGE_AND_BILLING_RESERVED.md`
- `G08_QA_DOCUMENT_CLOSEOUT.md`

## 4. 공통 완료 조건

- [x] request 계약이 명시됐거나 영향 없음으로 기록됐다.
- [x] response 계약이 명시됐거나 영향 없음으로 기록됐다.
- [x] business logic이 goal 범위 안에서 명시됐다.
- [x] user flow가 goal 범위 안에서 명시됐다.
- [x] DB/Prisma 영향이 명시됐거나 변경 없음으로 기록됐다.
- [x] 코드 주석 기준이 명시됐다.
- [x] goal 범위 밖 기능을 구현하지 않았다.
- [x] `COMMON/DECISION-LOG.md`의 확정 결정과 충돌하지 않는다.
- [x] UX/UI 변경은 `AGENT/UXUI_AGENT` 기준을 따른다.
- [x] Software 변경은 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- [x] 신규/수정 코드에 한국어 주석 규칙이 적용됐다.
- [x] 실행한 검증 command와 결과를 기록했다.
- [x] 실행하지 못한 검증은 사유를 기록했다.

## 5. G08 Closeout

- 완료일: 2026-07-30
- G01~G08 상세 명세는 모두 Completed 상태다.
- G08에서 Backend/User Web 검증과 문서 closeout을 완료했고 실행하지 못한 검증은 없다.

## 6. 필수 계약 문서

모든 goal은 구현 전 `COMMON/IMPLEMENTATION-CONTRACT-RULES.md`를 읽고, 해당 goal 문서 안에서 아래 항목을 확인한다.

- Request
- Response
- Business Logic
- User Flow
- DB/Prisma
- 코드 주석 기준
- Goal 검토 체크리스트

추가로 모든 goal은 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`에서 실제 수정 대상 파일, 생성 대상 파일, 완료 산출물, 테스트 기준을 확인한 뒤 구현한다.
