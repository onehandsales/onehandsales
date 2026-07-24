# Global B2C Feature Roadmap Plan

상태: Draft Roadmap
작성일: 2026-07-20
성격: 기능 선구현 로드맵 슬롯 + Global B2C first-sale gate 추적

## 0. 완료 현황

- [x] 01 `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] 02 `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] 03 `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22)
- [x] 04 `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23)
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

이 로드맵은 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 Backend/API/DB 후보와 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 현재 구현 대비 최종 서비스 gap을 입력으로 삼아 만든 상위 기능 슬롯이다. 두 입력 문서의 후보를 기능 목표로 재배치하고, 실제 구현은 각 번호 폴더에서 확정한 뒤 진행한다.

따라서 이 문서의 1차 목적은 UX/UI 전체 polish가 아니라 Global B2C를 위해 필요한 기능 묶음을 빠짐없이 만들고 추적하는 것이다. UX/UI 전체 정리는 기능 흐름이 충분히 갖춰진 뒤 별도 계획에서 잡는다.

이 문서는 바로 구현하는 `/goal` 문서가 아니다. 각 번호 폴더는 착수 전 검토 슬롯이며, 실제 작업은 해당 번호 폴더 안의 문서를 보강하고 검수한 뒤 별도 `/goal`로 전환한다.

## 1.1 First-sale 선행 Gate

`TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`은 최종 방향의 기준 문서다. 따라서 아래 항목은 01~12 번호 순서와 별개로 Global B2C 첫 판매 전 gate로 추적한다.

| Gate | 기준 | 적용 방식 |
|---|---|---|
| DB/Prisma 운영 gate | `NBA-014`, `RQA-005` release blocker | 신규 migration이 있는 goal마다 선행 체크한다. 상세 운영 closeout은 11에서 다루지만 11까지 미루지 않는다. |
| Product UX first-sale gate | 핵심 `/app` 업무 흐름 제품화 QA | 전체 시각 polish와 분리한다. 회사, 담당자, 제품, 딜, 일정, 회의록, 명함, import, search, trash, export 흐름은 첫 판매 전 필수 검토한다. |
| Trust/policy first-sale gate | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, 보관 기간 | 03, 11, 12에 흩어진 구현을 첫 판매 전 하나의 체크리스트로 닫는다. |
| Trash private memo response gate | `NBA-007` | Trash/삭제 정책 안에 묻지 않고 Backend response에서 private memo 원문 제한 여부를 독립 확인한다. |

상세 기준은 `COMMON/FIRST-SALE-GATE-MAP.md`를 따른다.

## 2. 사용자 결정

- 기능을 먼저 만든다.
- UX/UI 전체 polish는 기능이 어느 정도 갖춰진 뒤 한 번에 잡는다.
- 단, Product UX first-sale gate는 polish가 아니다. 핵심 업무 흐름이 첫 판매 가능한 수준인지 기능별 closeout과 별도 gate에서 검토한다.
- Admin 운영과 구독/결제/세금 상세 구현은 마지막 묶음으로 둔다.
- 단, `NBA-014` DB/Prisma 운영 gate와 Trust/policy first-sale gate는 11~12까지 미루지 않고 관련 goal마다 선행/병행 확인한다.
- 01 작업을 시작할 때는 01 폴더 안에 추가 문서를 작성하고 검수/검토한 뒤 진행한다.
- 01~03까지는 순차 실행이 완료됐고, 이후에도 다음 미완료 슬롯으로 넘어가는 순차 흐름을 기본으로 한다.
- 12개 슬롯의 추천 의사결정은 `COMMON/DECISION-LOG.md`를 기본값으로 삼는다.
- 각 슬롯은 Notion식 작업공간 UX, Attio식 CRM record 관계, 사용 편의성 기준을 유지한다.

## 3. 12개 기능 슬롯

| 순서 | 폴더 | 기능 묶음 | 현재 성격 |
|---:|---|---|---|
| 01 | `01_IMPORT_JOB_PERSISTENCE` | ImportJob 영속화 | Done: Global B2C 전 데이터 신뢰 기반 완료 |
| 02 | `02_NOTIFICATION_REMINDER` | 알림/리마인더 | Done: 일정/딜 reminder 기반 retention loop 완료 |
| 03 | `03_WEEKLY_SCHEDULE_REPORT` | 주간 일정 보고서 | Done: 화면 보고서와 동기식 Excel 다운로드 완료 |
| 04 | `04_GOOGLE_CALENDAR_INTEGRATION` | Google Calendar 연동 | Done: Google read-only import, calendar 선택, sync, source badge, Schedule soft delete/Trash 구현 및 QA closeout 완료 |
| 05 | `05_AI_WEEKLY_SALES_REPORT` | AI 주간 영업 리포트 | AI 영업 판단 기능 |
| 06 | `06_DEAL_ACTIVITY_TIMELINE` | DealActivity 타임라인 | 딜 활동 통합 |
| 07 | `07_MEETING_NOTE_AI_PROVIDER_LOG` | 회의록 AI/provider log 고도화 | AI 운영 신뢰 |
| 08 | `08_GLOBAL_DATA_I18N` | 다국가 데이터 모델과 `/app` 다국어 | Global B2C 제품화 |
| 09 | `09_PRODUCT_ANALYTICS` | 제품 분석 | 판매 후 판단 기반 |
| 10 | `10_MOBILE_PWA_FIELD_USE` | 모바일/PWA/현장 사용성 | Series A급 현장성 |
| 11 | `11_ADMIN_OPERATION` | Admin 운영 | 상세 구현은 마지막 운영 묶음. 단 DB/Prisma gate, Trust/policy, Trash private memo는 first-sale gate로 선행 추적 |
| 12 | `12_BILLING_SUBSCRIPTION_TAX` | 결제/구독/세금 | 상세 구현은 마지막 판매 묶음. 단 환불/약관/세금 정책은 Trust/policy gate와 연결 |

## 4. 문서 구성

- `COMMON/ROADMAP-OVERVIEW.md`: 01~12 전체 흐름과 단계 기준
- `COMMON/WORKFLOW.md`: 각 번호 폴더를 `/goal`로 전환하기 전 절차
- `COMMON/REFERENCE-MAP.md`: 전체 참조 문서와 번호별 연결 문서
- `COMMON/COVERAGE-MATRIX.md`: 앞으로 만들 모든 기능 후보를 01~12 슬롯에 배정한 표
- `COMMON/DECISION-LOG.md`: 이 로드맵에서 확정한 결정 기록
- `COMMON/FIRST-SALE-GATE-MAP.md`: `NBA-014`, Product UX, Trust/policy, `NBA-007`의 first-sale gate 반영 기준
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

1. 미완료 번호 폴더는 현재 `draft slot` 상태이며, 완료된 번호는 각 폴더의 README와 TODO_LOG를 정본 이력으로 본다.
2. 구현 전에 `COMMON/DECISION-LOG.md`에서 해당 슬롯의 추천 결정을 확인한다.
3. `COMMON/COVERAGE-MATRIX.md`에서 해당 번호에 배정된 하위 기능을 모두 확인한다.
4. `COMMON/FIRST-SALE-GATE-MAP.md`에서 해당 슬롯이 건드리는 first-sale gate가 있는지 확인한다.
5. 해당 번호 폴더의 `COMMON/SCOPE.md`를 보강한다.
6. API/DB가 있으면 `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`를 `draft`에서 `confirmed` 수준으로 올린다.
7. 신규 Prisma migration이 있으면 `NBA-014` DB/Prisma 운영 gate 체크를 `/goal` 착수 전 선행 조건으로 둔다.
8. FE 작업이 있으면 `FE-TODO/USER-WEB-TODO.md`에 화면, route, 상태, client, 검증 기준을 적는다.
9. 검수/검토가 끝나면 별도 `/goal` 문서로 쪼개 실행한다.
10. UX/UI 전체 polish는 01~10의 주요 기능 흐름이 나온 뒤 별도 계획으로 잡되, Product UX first-sale gate는 첫 판매 전 별도 closeout으로 닫는다.

## 6. 먼저 읽을 문서

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
