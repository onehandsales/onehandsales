# Global B2C Feature Roadmap Plan

상태: Draft Roadmap
작성일: 2026-07-20
성격: 기능 선구현 로드맵 슬롯

## 0. 완료 현황

- [x] 01 `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [ ] 02 `02_NOTIFICATION_REMINDER`
- [ ] 03 `03_WEEKLY_SCHEDULE_REPORT`
- [ ] 04 `04_GOOGLE_CALENDAR_INTEGRATION`
- [ ] 05 `05_AI_WEEKLY_SALES_REPORT`
- [ ] 06 `06_DEAL_ACTIVITY_TIMELINE`
- [ ] 07 `07_MEETING_NOTE_AI_PROVIDER_LOG`
- [ ] 08 `08_GLOBAL_DATA_I18N`
- [ ] 09 `09_PRODUCT_ANALYTICS`
- [ ] 10 `10_MOBILE_PWA_FIELD_USE`
- [ ] 11 `11_ADMIN_OPERATION`
- [ ] 12 `12_BILLING_SUBSCRIPTION_TAX`

## 1. 목적

이 계획은 `한손에 영업 / onehand.sales`가 Global B2C 첫 판매 기준과 Series A급 제품 기능까지 가기 위해 앞으로 만들어야 할 기능을 01~12 순서로 미리 정리한다.

이 문서는 바로 구현하는 `/goal` 문서가 아니다. 각 번호 폴더는 착수 전 검토 슬롯이며, 실제 작업은 해당 번호 폴더 안의 문서를 보강하고 검수한 뒤 별도 `/goal`로 전환한다.

## 2. 사용자 결정

- 기능을 먼저 만든다.
- UX/UI 전체 polish는 기능이 어느 정도 갖춰진 뒤 한 번에 잡는다.
- Admin 운영과 구독/결제/세금은 마지막 묶음으로 둔다.
- 01 작업을 시작할 때는 01 폴더 안에 추가 문서를 작성하고 검수/검토한 뒤 진행한다.
- 01이 끝난 뒤 02로 넘어가는 순차 흐름을 기본으로 한다.
- 12개 슬롯의 추천 의사결정은 `COMMON/DECISION-LOG.md`를 기본값으로 삼는다.
- 각 슬롯은 Notion식 작업공간 UX, Attio식 CRM record 관계, 사용 편의성 기준을 유지한다.

## 3. 12개 기능 슬롯

| 순서 | 폴더 | 기능 묶음 | 현재 성격 |
|---:|---|---|---|
| 01 | `01_IMPORT_JOB_PERSISTENCE` | ImportJob 영속화 | Done: Global B2C 전 데이터 신뢰 기반 완료 |
| 02 | `02_NOTIFICATION_REMINDER` | 알림/리마인더 | 리텐션 기본 루프 |
| 03 | `03_WEEKLY_SCHEDULE_REPORT` | 주간 일정 보고서 | 일정/딜/회의록 연결 보고 |
| 04 | `04_GOOGLE_CALENDAR_INTEGRATION` | Google Calendar 연동 | 외부 일정 연결 |
| 05 | `05_AI_WEEKLY_SALES_REPORT` | AI 주간 영업 리포트 | AI 영업 판단 기능 |
| 06 | `06_DEAL_ACTIVITY_TIMELINE` | DealActivity 타임라인 | 딜 활동 통합 |
| 07 | `07_MEETING_NOTE_AI_PROVIDER_LOG` | 회의록 AI/provider log 고도화 | AI 운영 신뢰 |
| 08 | `08_GLOBAL_DATA_I18N` | 다국가 데이터 모델과 `/app` 다국어 | Global B2C 제품화 |
| 09 | `09_PRODUCT_ANALYTICS` | 제품 분석 | 판매 후 판단 기반 |
| 10 | `10_MOBILE_PWA_FIELD_USE` | 모바일/PWA/현장 사용성 | Series A급 현장성 |
| 11 | `11_ADMIN_OPERATION` | Admin 운영 | 마지막 운영 묶음 |
| 12 | `12_BILLING_SUBSCRIPTION_TAX` | 결제/구독/세금 | 마지막 판매 묶음 |

## 4. 문서 구성

- `COMMON/ROADMAP-OVERVIEW.md`: 01~12 전체 흐름과 단계 기준
- `COMMON/WORKFLOW.md`: 각 번호 폴더를 `/goal`로 전환하기 전 절차
- `COMMON/REFERENCE-MAP.md`: 전체 참조 문서와 번호별 연결 문서
- `COMMON/COVERAGE-MATRIX.md`: 앞으로 만들 모든 기능 후보를 01~12 슬롯에 배정한 표
- `COMMON/DECISION-LOG.md`: 이 로드맵에서 확정한 결정 기록
- `01_*` ~ `12_*`: 각 기능 슬롯별 착수 전 검토 문서

각 번호 폴더는 다음 구조를 가진다.

```text
<NN_FEATURE>/
  README.md
  COMMON/
    SCOPE.md
    REFERENCES.md
  FE-TODO/
    USER-WEB-TODO.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
```

## 5. 착수 규칙

1. 번호 폴더는 현재 `draft slot` 상태다.
2. 구현 전에 `COMMON/DECISION-LOG.md`에서 해당 슬롯의 추천 결정을 확인한다.
3. `COMMON/COVERAGE-MATRIX.md`에서 해당 번호에 배정된 하위 기능을 모두 확인한다.
4. 해당 번호 폴더의 `COMMON/SCOPE.md`를 보강한다.
5. API/DB가 있으면 `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`를 `draft`에서 `confirmed` 수준으로 올린다.
6. FE 작업이 있으면 `FE-TODO/USER-WEB-TODO.md`에 화면, route, 상태, client, 검증 기준을 적는다.
7. 검수/검토가 끝나면 별도 `/goal` 문서로 쪼개 실행한다.
8. UX/UI 전체 polish는 01~10의 주요 기능 흐름이 나온 뒤 별도 계획으로 잡는다.

## 6. 먼저 읽을 문서

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
