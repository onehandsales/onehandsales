# Global B2C Feature Roadmap Plan

상태: Draft Roadmap / 01~11 Implemented / Pre-12 Follow-up Workspace Created / 05 Provider Smoke Pending / 12 Next
작성일: 2026-07-20
최종 업데이트: 2026-08-06
성격: 기능 선구현 로드맵 슬롯 + Global B2C first-sale gate 추적

## 0. 완료 현황

- [x] 01 `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] 02 `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] 03 `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22)
- [x] 04 `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23)
- [x] 05 `05_AI_WEEKLY_SALES_REPORT`: G01-G09 Done (2026-07-24), G10 code/automatic validation done (2026-08-05), provider smoke pending
- [x] 06 `06_DEAL_ACTIVITY_TIMELINE`: Done (2026-07-26)
- [x] 07 `07_MEETING_NOTE_AI_PROVIDER_LOG`: Done (2026-07-26)
- [x] 08 `08_GLOBAL_DATA_I18N`: Done (2026-07-28, DB 최신 상태 2026-07-29 재확인)
- [x] 09 `09_PRODUCT_ANALYTICS`: Done (2026-07-30)
- [x] 10 `10_MOBILE_PWA_FIELD_USE`: Done (2026-07-31)
- [x] 11 `11_ADMIN_OPERATION`: Done (2026-08-01)
- [ ] PRE12 `PRE12_FOLLOWUP_RECHECK`: Draft workspace (2026-08-06). 12 착수 전 01~11 후속 후보 재분류 전용이며, 13번 기능 슬롯이 아니다.
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
- Admin 운영은 11에서 완료했고, 구독/결제/세금 상세 구현은 12로 둔다.
- 단, `NBA-014` DB/Prisma 운영 gate와 Trust/policy first-sale gate는 11~12까지 미루지 않고 관련 goal마다 선행/병행 확인한다.
- 01 작업을 시작할 때는 01 폴더 안에 추가 문서를 작성하고 검수/검토한 뒤 진행한다.
- 01~11까지는 순차 실행이 완료됐고, 12 착수 전 01~11 pre-12 재대조를 진행한다.
- 2026-08-06 기준 01~05는 진행/확인 완료로 보고, 06은 병행 작업/검토 대상, 다음 대상은 07~11이다.
- 12 전 후속 후보 분류와 작업 후보 문서화는 `PRE12_FOLLOWUP_RECHECK`를 정본 작업공간으로 사용한다.
- 01~11 pre-12 재대조가 끝나면 `12_BILLING_SUBSCRIPTION_TAX`를 진행한다.
- 12 완료 후 01~12 전체와 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`, `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`을 다시 학습하고 미구현/후속 항목을 새 TODO 폴더로 재배치한다.
- UX/UI 디자인 유지보수는 01~11 pre-12 재대조, 12, post-12 후속 항목 재분류 이후 별도 계획으로 진행한다.
- 12개 슬롯의 추천 의사결정은 `COMMON/DECISION-LOG.md`를 기본값으로 삼는다.
- 각 슬롯은 Notion식 작업공간 UX, Attio식 CRM record 관계, 사용 편의성 기준을 유지한다.

## 3. 12개 기능 슬롯

| 순서 | 폴더 | 기능 묶음 | 현재 성격 |
|---:|---|---|---|
| 01 | `01_IMPORT_JOB_PERSISTENCE` | ImportJob 영속화 | Done: Global B2C 전 데이터 신뢰 기반 완료 |
| 02 | `02_NOTIFICATION_REMINDER` | 알림/리마인더 | Done: 일정/딜 reminder 기반 retention loop 완료 |
| 03 | `03_WEEKLY_SCHEDULE_REPORT` | 주간 일정 보고서 | Done: 화면 보고서와 동기식 Excel 다운로드 완료 |
| 04 | `04_GOOGLE_CALENDAR_INTEGRATION` | Google Calendar 연동 | Done: Google read-only import, calendar 선택, sync, source badge, Schedule soft delete/Trash 구현 및 QA closeout 완료 |
| 05 | `05_AI_WEEKLY_SALES_REPORT` | AI 주간 영업 리포트 | Implemented: 저장형 AI weekly report, follow-up delivery, Gmail/Microsoft 실제 email provider adapter 구현 및 자동 검증 완료. 운영 credential/callback/allowlist 기반 provider smoke는 pending |
| 06 | `06_DEAL_ACTIVITY_TIMELINE` | DealActivity 타임라인 | Done: 딜 활동 정본, 딜 목록 products/latest activity, 담당자 dealCount, page size 15 계약 구현 및 QA closeout 완료 |
| 07 | `07_MEETING_NOTE_AI_PROVIDER_LOG` | 회의록 AI/provider log 고도화 | Done: MeetingNote AI/STT provider log, 상세 next action/follow-up draft, User Web AI 후속 작업 UX 구현 및 QA closeout 완료 |
| 08 | `08_GLOBAL_DATA_I18N` | 다국가 데이터 모델과 `/app` 다국어 | Done: `/app` i18n, 글로벌 데이터 모델, Import/Export localization, Google/LINE/Apple auth 구현 완료. 현재 DB 최신 상태 확인 완료. 2026-07-29 사용자 확인 기준 LINE/Apple 운영 설정과 실제 OAuth 동작도 완료 |
| 09 | `09_PRODUCT_ANALYTICS` | 제품 분석 | Done: allowlist event taxonomy, client/server event 수집, activation/retention snapshot, AI usage summary, billing reserved event 경계 구현 및 QA closeout 완료 |
| 10 | `10_MOBILE_PWA_FIELD_USE` | 모바일/PWA/현장 사용성 | Done: 모바일 명함 촬영, OCR safe failure, 회의 녹음, local draft, push permission UX, mobile analytics 구현 및 QA closeout 완료. PWA install/offline shell/native app은 후속 |
| 11 | `11_ADMIN_OPERATION` | Admin 운영 | Done: 사용자/도메인/Trash/provider failure/analytics/account request/system gate 운영 API와 Admin Web, audit/redaction, QA closeout 완료. 결제/구독 운영은 12로 제외 |
| 12 | `12_BILLING_SUBSCRIPTION_TAX` | 결제/구독/세금 | 상세 구현은 마지막 판매 묶음. 단 환불/약관/세금 정책은 Trust/policy gate와 연결 |

## 4. 문서 구성

- `COMMON/ROADMAP-OVERVIEW.md`: 01~12 전체 흐름과 단계 기준
- `COMMON/WORKFLOW.md`: 각 번호 폴더를 `/goal`로 전환하기 전 절차
- `COMMON/REFERENCE-MAP.md`: 전체 참조 문서와 번호별 연결 문서
- `COMMON/COVERAGE-MATRIX.md`: 앞으로 만들 모든 기능 후보를 01~12 슬롯에 배정한 표
- `COMMON/DECISION-LOG.md`: 이 로드맵에서 확정한 결정 기록
- `COMMON/FIRST-SALE-GATE-MAP.md`: `NBA-014`, Product UX, Trust/policy, `NBA-007`의 first-sale gate 반영 기준
- `COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`: 12 완료 후 01~12 전체 재검토와 후속 TODO 승격 규칙
- `PRE12_FOLLOWUP_RECHECK`: 12 착수 전 01~11 후속 후보 재분류와 확정 전 goal 후보 문서화
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

1. `12_BILLING_SUBSCRIPTION_TAX` 미완료 번호 폴더는 현재 `draft slot` 상태이며, 완료된 번호는 각 폴더의 README와 TODO_LOG/GOAL-SPECS를 정본 이력으로 본다.
2. 구현 전에 `COMMON/DECISION-LOG.md`에서 해당 슬롯의 추천 결정을 확인한다.
3. `COMMON/COVERAGE-MATRIX.md`에서 해당 번호에 배정된 하위 기능을 모두 확인한다.
4. `COMMON/FIRST-SALE-GATE-MAP.md`에서 해당 슬롯이 건드리는 first-sale gate가 있는지 확인한다.
5. 해당 번호 폴더의 `COMMON/SCOPE.md`를 보강한다.
6. API/DB가 있으면 `BE-TODO/API-TODO.md`, `BE-TODO/DB-SCHEMA.md`를 `draft`에서 `confirmed` 수준으로 올린다.
7. 신규 Prisma migration이 있으면 `NBA-014` DB/Prisma 운영 gate 체크를 `/goal` 착수 전 선행 조건으로 둔다.
8. FE 작업이 있으면 `FE-TODO/USER-WEB-TODO.md`에 화면, route, 상태, client, 검증 기준을 적는다.
9. 검수/검토가 끝나면 별도 `/goal` 문서로 쪼개 실행한다.
10. UX/UI 전체 polish는 01~11의 주요 기능 흐름 closeout을 기준으로 별도 계획에서 잡되, Product UX first-sale gate는 첫 판매 전 별도 closeout으로 닫는다.
11. 12 착수 전 01~11 후속 후보는 `PRE12_FOLLOWUP_RECHECK`에서 먼저 분류하고, API/DB/FE 계약이 확정된 항목만 별도 goal로 쪼갠다.
12. 12 완료 후에는 `COMMON/POST-12-REVIEW-AND-FOLLOWUP.md` 기준으로 01~12 전체, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`, 실제 BE/FE/Prisma 구현을 다시 대조한다.
13. post-12 재검토에서 미구현/후속/보류로 남은 항목은 기존 완료 폴더를 재개하지 않고 새 TODO 폴더로 승격한다.
14. UX/UI 디자인 유지보수는 post-12 재검토와 후속 작업 재분류 이후 별도 계획으로 진행한다.

## 6. 먼저 읽을 문서

- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-IMPLEMENTED-FUNCTIONS.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/DECISION-LOG.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
