# Roadmap Overview

상태: Draft

## 0. 완료 현황

- [x] `01_IMPORT_JOB_PERSISTENCE`: Done (2026-07-21)
- [x] `02_NOTIFICATION_REMINDER`: Done (2026-07-22)
- [x] `03_WEEKLY_SCHEDULE_REPORT`: Done (2026-07-22), 새 DB/migration 없음
- [x] `04_GOOGLE_CALENDAR_INTEGRATION`: Done (2026-07-23), DB migration/QA closeout 완료
- [ ] `05_AI_WEEKLY_SALES_REPORT`
- [ ] `06_DEAL_ACTIVITY_TIMELINE`
- [ ] `07_MEETING_NOTE_AI_PROVIDER_LOG`
- [ ] `08_GLOBAL_DATA_I18N`
- [ ] `09_PRODUCT_ANALYTICS`
- [ ] `10_MOBILE_PWA_FIELD_USE`
- [ ] `11_ADMIN_OPERATION`
- [ ] `12_BILLING_SUBSCRIPTION_TAX`

## 1. 로드맵 기준

이 로드맵은 기능을 먼저 만들고, UX/UI 전체 정리는 후반에 한 번에 잡는다는 사용자 결정을 따른다.

`TODO/NEXT_BACKEND_API_BACKLOG_PLAN`은 Backend/API/DB 후보를 제공하고, `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`은 현재 구현 대비 Global B2C 첫 판매/최종 서비스 gap을 제공한다. 이 로드맵은 두 입력 문서를 01~12 기능 슬롯으로 변환한 실행 준비용 상위 계획이다.

단, 기능 먼저 만든다는 것은 화면만 임시로 붙인다는 뜻이 아니다. 각 기능은 Backend/API/DB/FE 상태 관리가 이후 UX/UI 제품화 QA에서 유지보수 가능한 형태로 남아야 한다.

Product UX first-sale gate는 전체 시각 polish와 다르다. 핵심 `/app` 업무 흐름이 첫 판매 가능한 수준인지 확인하는 gate이며, 01~10 기능 closeout 이후 첫 판매 전 별도로 닫는다.

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
| 리텐션/일정 루프 | 02~05 | 02 알림, 03 주간 일정 보고서, 04 Google Calendar 연동은 완료. AI 리포트로 반복 사용 이유를 이어 만든다. |
| 영업 기록 고도화 | 06~07 | 딜 활동과 회의록 AI 운영 이력을 실제 영업 판단 데이터로 만들기 |
| Global B2C 제품화 | 08~09 | 다국가 데이터/앱 다국어와 제품 분석 기반 만들기 |
| Series A 확장성 | 10 | 모바일/PWA/현장 사용성 후보 정리 |
| 마지막 운영/판매 묶음 | 11~12 | Admin 운영과 결제/구독/세금 |

## 3. 기본 순서

1. `01_IMPORT_JOB_PERSISTENCE` - Done
2. `02_NOTIFICATION_REMINDER` - Done
3. `03_WEEKLY_SCHEDULE_REPORT` - Done
4. `04_GOOGLE_CALENDAR_INTEGRATION` - Done
5. `05_AI_WEEKLY_SALES_REPORT`
6. `06_DEAL_ACTIVITY_TIMELINE`
7. `07_MEETING_NOTE_AI_PROVIDER_LOG`
8. `08_GLOBAL_DATA_I18N`
9. `09_PRODUCT_ANALYTICS`
10. `10_MOBILE_PWA_FIELD_USE`
11. `11_ADMIN_OPERATION`
12. `12_BILLING_SUBSCRIPTION_TAX`

## 4. 선행/횡단 Gate

아래 항목은 11~12 상세 구현에 연결되더라도 첫 판매 전 gate로 별도 추적한다.

| Gate | 실행 순서 기준 |
|---|---|
| `NBA-014` DB/Prisma 운영 gate | 신규 Prisma migration이 있는 goal 착수 전마다 확인한다. 11까지 미루지 않는다. |
| Product UX first-sale gate | 01~10 주요 기능 closeout 이후, 첫 판매 전 별도 QA checklist로 닫는다. |
| Trust/policy first-sale gate | 03/11/12에 흩어진 export/delete/retention/billing/policy를 첫 판매 전 하나의 gate로 닫는다. |
| `NBA-007` Trash private memo response gate | 11 Trash/삭제 정책의 일부지만 private memo 원문 제한은 독립 보안 체크로 둔다. |

상세 기준은 `COMMON/FIRST-SALE-GATE-MAP.md`를 따른다.

## 5. 순서 변경 원칙

- 사용자 결정이 있으면 순서를 바꿀 수 있다.
- 순서를 바꿀 때는 `COMMON/DECISION-LOG.md`에 이유를 남긴다.
- 앞 번호 기능의 DB/API가 뒤 번호 기능의 전제가 되면 앞 번호를 먼저 끝낸다.
- Admin과 결제/구독/세금 상세 구현은 명시적 사용자 결정 전까지 11~12로 유지한다.
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
