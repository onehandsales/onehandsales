# Roadmap Overview

상태: Draft / 01~11 Done / 12 Next / Post-12 Review Planned

## 0. 완료 현황

- [x] `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22), 새 DB/migration 없음
- [x] `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23), DB migration/QA closeout 완료
- [x] `05_AI_WEEKLY_SALES_REPORT`: Done (2026-07-24), AI weekly report/follow-up delivery 구현 및 QA closeout 완료
- [x] `06_DEAL_ACTIVITY_TIMELINE`: Done (2026-07-26), DealActivity timeline/record summary subset/DB gate closeout 완료
- [x] `07_MEETING_NOTE_AI_PROVIDER_LOG`: Done (2026-07-26), MeetingNote AI provider log/detail follow-up draft 완료
- [x] `08_GLOBAL_DATA_I18N`: Done (2026-07-28), DB 최신 상태 2026-07-29 재확인. 2026-07-29 사용자 확인 기준 LINE/Apple 운영 설정과 실제 OAuth 동작 완료
- [x] `09_PRODUCT_ANALYTICS`: Done (2026-07-30), ProductAnalyticsEvent, route/server events, activation/retention snapshot, AI usage summary 구현 및 QA closeout 완료
- [x] `10_MOBILE_PWA_FIELD_USE`: Done (2026-07-31), 모바일 명함 촬영/OCR safe failure, 회의 녹음, local draft, push permission UX, mobile analytics 구현 및 QA closeout 완료
- [x] `11_ADMIN_OPERATION`: Done (2026-08-01), Admin 운영 API/Web, audit/redaction, Trash/account request/provider/system gate, QA closeout 완료
- [ ] `12_BILLING_SUBSCRIPTION_TAX`

## 1. 로드맵 기준

이 로드맵은 기능을 먼저 만들고, UX/UI 전체 정리는 후반에 한 번에 잡는다는 사용자 결정을 따른다.

`TODO/NEXT_BACKEND_API_BACKLOG_PLAN`은 Backend/API/DB 후보를 제공하고, `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`은 현재 구현 대비 Global B2C 첫 판매/최종 서비스 gap을 제공한다. 이 로드맵은 두 입력 문서를 01~12 기능 슬롯으로 변환한 실행 준비용 상위 계획이다.

단, 기능 먼저 만든다는 것은 화면만 임시로 붙인다는 뜻이 아니다. 각 기능은 Backend/API/DB/FE 상태 관리가 이후 UX/UI 제품화 QA에서 유지보수 가능한 형태로 남아야 한다.

Product UX first-sale gate는 전체 시각 polish와 다르다. 핵심 `/app` 업무 흐름이 첫 판매 가능한 수준인지 확인하는 gate이며, 01~11 기능 closeout 이후 첫 판매 전 별도로 닫는다.

제품 방향은 Notion식 작업공간 UX, Attio식 CRM record 관계 UX, 사용자가 설정 없이 바로 쓰는 편의성을 기준으로 한다.

적용 원칙:

- 강한 기본값을 제공하고 설정을 최소화한다.
- 회사, 담당자, 제품, 딜, 일정, 회의록을 linked record로 정확히 연결한다.
- AI는 자동 변경이 아니라 사용자가 확인하는 제안과 초안을 만든다.
- 모바일은 desktop table 축소가 아니라 card/list와 현장 draft 중심으로 설계한다.
- API 응답에 없는 summary/count/latest 정보를 FE에서 사실처럼 꾸미지 않는다.
- Backend/DB/Frontend는 `AGENT/SOFTWARE_AGENT`, UX/UI와 사용자 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.

## 2. 단계 구분

| 단계 | 포함 폴더 | 목적 |
|---|---|---|
| First-sale 선행/횡단 gate | 전체 | `NBA-014`, Product UX, Trust/policy, `NBA-007`은 번호 순서와 별개로 추적 |
| 기능 신뢰 기반 | 01 | Done: Import 중 유실 같은 데이터 신뢰 문제 제거 |
| 리텐션/일정 루프 | 02~05 | Done: 02 알림, 03 주간 일정 보고서, 04 Google Calendar 연동, 05 AI weekly report/follow-up delivery 완료 |
| 영업 기록 고도화 | 06~07 | Done: 딜 활동과 회의록 AI 운영 이력을 실제 영업 판단 데이터로 연결 완료 |
| Global B2C 제품화 | 08~10 | Done: 08 다국가 데이터/앱 다국어 기반, 09 제품 분석 기반, 10 모바일 현장 입력성 완료 |
| Series A 확장성 | 10 이후 후속 | PWA install/offline shell, native app, native push/contact/calendar는 후속 로드맵으로 유지 |
| 마지막 운영/판매 묶음 | 11~12 | Done: 11 Admin 운영 완료. Next: 12 결제/구독/세금 |
| Post-12 재검토 | 01~12 완료 후 | 12 완료 뒤 01~12 전체와 입력 계획 2개를 다시 학습하고 미구현/후속 항목을 새 TODO로 재배치 |

## 3. 기본 순서

1. `01_IMPORT_JOB_PERSISTENCE` - Done
2. `02_NOTIFICATION_REMINDER` - Done
3. `03_WEEKLY_SCHEDULE_REPORT` - Done
4. `04_GOOGLE_CALENDAR_INTEGRATION` - Done
5. `05_AI_WEEKLY_SALES_REPORT` - Done
6. `06_DEAL_ACTIVITY_TIMELINE` - Done
7. `07_MEETING_NOTE_AI_PROVIDER_LOG` - Done
8. `08_GLOBAL_DATA_I18N` - Done
9. `09_PRODUCT_ANALYTICS` - Done
10. `10_MOBILE_PWA_FIELD_USE` - Done
11. `11_ADMIN_OPERATION` - Done
12. `12_BILLING_SUBSCRIPTION_TAX`

## 3A. 12 이후 재검토 원칙

사용자 결정 기준으로 다음 큰 흐름은 12를 먼저 진행하는 것이다. 12 완료 전에는 billing/paywall/churn/paid conversion source와 정책/운영 기준이 확정되지 않으므로, 전체 UX/UI 유지보수나 잔여 기능 대규모 정리는 먼저 진행하지 않는다.

12 완료 후에는 `COMMON/POST-12-REVIEW-AND-FOLLOWUP.md`를 기준으로 아래를 다시 확인한다.

1. `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 01~12 전체 README, API-SPEC, GOAL-SPECS, TODO_LOG/closeout
2. `NEXT_BACKEND_API_BACKLOG_PLAN`의 잔여 후보와 완료 이력
3. `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 제품화 gap과 first-sale gate
4. 실제 `BE`, `FE/user-web`, `FE/admin-web`, `BE/prisma/schema.prisma` 상태

재검토 결과 미구현/후속/보류로 남은 항목은 기존 완료 폴더를 다시 여는 방식이 아니라 새 TODO 폴더로 승격한다. UX/UI 디자인 유지보수는 이 재검토와 필요한 후속 기능/운영 정리 이후 별도 계획으로 잡는다.

## 4. 선행/횡단 Gate

아래 항목은 11~12 상세 구현에 연결되더라도 첫 판매 전 gate로 별도 추적한다.

| Gate | 실행 순서 기준 |
|---|---|
| `NBA-014` DB/Prisma 운영 gate | 신규 Prisma migration이 있는 goal 착수 전마다 확인한다. 11까지 미루지 않는다. |
| Product UX first-sale gate | 01~11 주요 기능 closeout 이후, 첫 판매 전 별도 QA checklist로 닫는다. |
| Trust/policy first-sale gate | 03/11/12에 흩어진 export/delete/retention/billing/policy를 첫 판매 전 하나의 gate로 닫는다. |
| `NBA-007` Trash private memo response gate | 11 Trash/삭제 정책의 일부지만 private memo 원문 제한은 독립 보안 체크로 둔다. |

상세 기준은 `COMMON/FIRST-SALE-GATE-MAP.md`를 따른다.

## 5. 순서 변경 원칙

- 사용자 결정이 있으면 순서를 바꿀 수 있다.
- 순서를 바꿀 때는 `COMMON/DECISION-LOG.md`에 이유를 남긴다.
- 앞 번호 기능의 DB/API가 뒤 번호 기능의 전제가 되면 앞 번호를 먼저 끝낸다.
- Admin 운영은 11에서 완료됐고, 결제/구독/세금 상세 구현은 명시적 사용자 결정 전까지 12로 유지한다.
- 단, `NBA-014` DB/Prisma 운영 gate와 Trust/policy first-sale gate는 11~12 순서를 기다리지 않는다.

## 6. Coverage 원칙

- 모든 기능 후보는 `COMMON/COVERAGE-MATRIX.md`에서 01~12 슬롯 중 하나 이상에 배정한다.
- 검색/필터, ExportJob, Trash 정책, BusinessCard OCR 고도화처럼 독립 번호가 없는 기능도 matrix의 배정 슬롯에서 반드시 검토한다.
- 한 기능이 제품 화면과 운영 정책에 모두 걸리면 두 슬롯에 나눠 기록한다.
- first-sale gate 항목은 포함 슬롯과 별개로 `COMMON/FIRST-SALE-GATE-MAP.md`에도 연결한다.

## 7. UX/UI 처리 원칙

- 각 기능은 최소 작동 화면과 상태 처리를 포함한다.
- 전체 시각 polish, 밀도, 문구, 모바일 polish는 후반 UX/UI 계획으로 따로 묶는다.
- Product UX first-sale gate는 polish가 아니라 판매 가능한 업무 흐름 검증이다.
- FE가 API 응답에 없는 summary/count/latest 정보를 사실처럼 꾸미지 않는다.
