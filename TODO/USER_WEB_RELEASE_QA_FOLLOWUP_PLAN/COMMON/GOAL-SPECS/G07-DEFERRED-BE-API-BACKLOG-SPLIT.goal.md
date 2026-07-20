# G07 Deferred BE API Backlog Split

상태: Done
우선순위: P1
담당 영역: Common, BE

## 1. 목표

UX/UI 공통 QA와 release QA에서 이번 범위 밖으로 남긴 BE/API 개선 후보를 별도 계획 후보로 분리한다.

## 1A. 확정 결정

- G07은 구현 goal이 아니다.
- 새 DB migration, API 구현, FE 기능 구현을 하지 않는다.
- 산출물로 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 새 계획 후보 초안을 만든다.
- 후보 우선순위 분류는 `release blocker`, `release follow-up`, `product feature`, `ops/security`, `defer` 5개로 고정한다.
- 새 API 계약은 `draft` 또는 `후보` 상태로만 남긴다. G07에서 `confirmed`로 확정하지 않는다.

## 2. 먼저 읽을 문서

- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/API-SPEC/README.md`
- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`

## 3. 포함 범위

아래 후보를 각각 제품 가치, API 영향, DB 영향, FE 영향, 우선순위로 분류한다.

- Deal list `products` summary
- Contact list `dealCount`
- Company/Contact/Product latest memo/activity/next action summary
- MeetingNote next/latest summary
- BusinessCard provider failure code/message contract
- ImportJob persistence/resume API
- Trash private memo backend response restriction
- Page size 15 contract 정리
- Schedule week report
- Notification
- MeetingNote transcript/provider call log table
- Trash 7일 이후 복구 정책
- Admin 운영 UX/API

## 4. 제외 범위

- 위 후보의 실제 구현
- 새 DB migration 추가
- API 계약을 `confirmed`로 확정
- Notification, ImportJob persistence, Admin API 착수

## 5. 산출물

G07은 아래 산출물을 만든다.

1. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/README.md`
2. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
3. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/API-SPEC/README.md`
4. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/BE-TODO/API-TODO.md`
5. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/BE-TODO/DB-SCHEMA.md`
6. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/FE-TODO/USER-WEB-TODO.md`
7. `TODO/README.md`의 다음 계획 후보 연결
8. 이 계획의 `COMMON/QA-RESULTS.md`에 후보 분류 결과

계획 후보를 만들 때는 실제 구현 우선순위를 아래 기준으로 분리한다.

- release blocker: QA에서 실제 S0/S1/S2로 확인된 항목
- release follow-up: 출시 전 품질을 높이지만 현재 S0/S1/S2는 아닌 항목
- product feature: 품질 QA가 아니라 새 기능에 가까운 항목
- ops/security: 운영/보안 정책 확정이 필요한 항목
- defer: 당장 계획화하지 않고 근거만 남길 항목

## 5A. 후보 matrix 필수 필드

`COMMON/CANDIDATE-MATRIX.md`에는 후보마다 아래 필드를 둔다.

| 필드 | 설명 |
|---|---|
| ID | `NBA-001` 형식 |
| 후보명 | 구현 후보 이름 |
| 출처 | UX/UI QA, G02~G06, AGENT 문서, 사용자 요청 중 하나 |
| 분류 | 5개 분류 중 하나 |
| 사용자-facing 여부 | Yes/No |
| 제품 가치 | 왜 필요한지 |
| API 영향 | 없음 / 새 endpoint / response field 추가 / status contract |
| DB 영향 | 없음 / column / table / migration / seed |
| FE 영향 | 없음 / client type / 화면 / QA only |
| 보안/운영 리스크 | 개인정보, 감사, provider, 복구, 권한 영향 |
| 권장 다음 goal | 다음 계획에서 실행할 goal 후보 |
| 구현 금지 사유 | 왜 이번 계획에서 구현하지 않는지 |

## 5B. 기본 후보 분류 초안

G07 시작 시 아래 분류를 초안으로 사용하고, G02~G06 결과에 따라 조정한다.

| 후보 | 기본 분류 | 비고 |
|---|---|---|
| Deal list `products` summary | release follow-up | 목록 정보 밀도 개선 후보 |
| Contact list `dealCount` | release follow-up | 목록 판단 정보 개선 후보 |
| Company/Contact/Product latest memo/activity/next action summary | product feature | 새 summary 계약 필요 |
| MeetingNote next/latest summary | product feature | 새 summary 계약 필요 |
| BusinessCard provider failure code/message contract | release follow-up | provider failure UX 안정화 |
| ImportJob persistence/resume API | product feature | 새 persistence/API 필요 |
| Trash private memo backend response restriction | ops/security | 개인정보/비밀 메모 응답 정책 |
| Page size 15 contract 정리 | release follow-up | FE/BE/test 계약 동시 변경 필요 |
| Schedule week report | product feature | 새 화면/API 후보 |
| Notification | product feature | 새 도메인 후보 |
| MeetingNote transcript/provider call log table | ops/security | 원문/외부 provider 감사 정책 필요 |
| Trash 7일 이후 복구 정책 | ops/security | 운영/복구 정책 필요 |
| Admin 운영 UX/API | ops/security | 운영 권한과 감사 정책 필요 |

## 5C. 실행 절차

1. G06이 완료됐고 Open S0/S1/S2가 없는지 확인한다.
2. 기존 UX/UI QA의 deferred BE/API 문서를 다시 읽는다.
3. G02~G06 `ISSUE-LOG.md`, `QA-RESULTS.md`에서 새로 deferred된 항목을 수집한다.
4. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`이 없으면 새로 만든다. 이미 있으면 중복 생성하지 않고 갱신한다.
5. 모든 후보를 `COMMON/CANDIDATE-MATRIX.md`에 `NBA-001`부터 번호로 적는다.
6. API 계약이 필요한 후보는 `COMMON/API-SPEC/README.md`에 `draft` 또는 `후보` 상태로만 적는다.
7. DB 변경이 필요한 후보는 `BE-TODO/DB-SCHEMA.md`에 migration 필요 가능성만 적는다.
8. User Web 영향이 있는 후보는 `FE-TODO/USER-WEB-TODO.md`에 화면/client 영향만 적는다.
9. `TODO/README.md`에 다음 계획 후보로 연결한다.
10. 현재 계획의 `COMMON/QA-RESULTS.md`에 G07 결과와 생성 파일 목록을 기록한다.

## 6. 완료 기준

- 모든 deferred 후보가 하나의 분류를 가진다.
- 이번 계획에서 구현하지 않는 이유가 명확하다.
- 새 API 계약이 필요한 후보는 `draft` 또는 `후보` 상태로만 남아 있다.
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 초안이 생성 또는 갱신되어 있다.
- `TODO/README.md`에 다음 계획 후보가 연결되어 있다.
- G07 diff에 FE/BE 기능 구현 파일, Prisma migration, route/controller/service 구현이 포함되어 있지 않다.
