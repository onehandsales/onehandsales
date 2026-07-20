# G07 Deferred BE API Backlog Split

상태: Ready
우선순위: P1
담당 영역: Common, BE

## 1. 목표

UX/UI 공통 QA와 release QA에서 이번 범위 밖으로 남긴 BE/API 개선 후보를 별도 계획 후보로 분리한다.

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

G07은 아래 중 하나를 만든다.

1. 새 활성 TODO 계획 후보 README 초안
2. `TODO/README.md`의 다음 계획 후보 섹션
3. 이 계획의 `COMMON/QA-RESULTS.md`에 후보 분류 결과

계획 후보를 만들 때는 실제 구현 우선순위를 아래 기준으로 분리한다.

- release blocker: QA에서 실제 S0/S1/S2로 확인된 항목
- release follow-up: 출시 전 품질을 높이지만 현재 S0/S1/S2는 아닌 항목
- product feature: 품질 QA가 아니라 새 기능에 가까운 항목
- ops/security: 운영/보안 정책 확정이 필요한 항목

## 6. 완료 기준

- 모든 deferred 후보가 하나의 분류를 가진다.
- 이번 계획에서 구현하지 않는 이유가 명확하다.
- 새 API 계약이 필요한 후보는 `draft` 또는 `후보` 상태로만 남아 있다.
- 다음에 바로 만들 계획명이 있으면 `TODO/README.md`에 후보로 연결되어 있다.

