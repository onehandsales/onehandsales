# Roadmap Overview

상태: Draft

## 1. 로드맵 기준

이 로드맵은 기능을 먼저 만들고, UX/UI 전체 정리는 후반에 한 번에 잡는다는 사용자 결정을 따른다.

단, 기능 먼저 만든다는 것은 화면만 임시로 붙인다는 뜻이 아니다. 각 기능은 Backend/API/DB/FE 상태 관리가 이후 UX/UI 제품화 QA에서 유지보수 가능한 형태로 남아야 한다.

제품 방향은 Notion식 작업공간 UX, Attio식 CRM record 관계 UX, 사용자가 설정 없이 바로 쓰는 편의성을 기준으로 한다.

적용 원칙:

- 강한 기본값을 제공하고 설정을 최소화한다.
- 회사, 담당자, 제품, 딜, 일정, 회의록을 linked record로 정확히 연결한다.
- AI는 자동 변경이 아니라 사용자가 확인하는 제안과 초안을 만든다.
- 모바일은 desktop table 축소가 아니라 card/list와 현장 draft 중심으로 설계한다.
- API 응답에 없는 summary/count/latest 정보를 FE에서 사실처럼 꾸미지 않는다.

## 2. 단계 구분

| 단계 | 포함 폴더 | 목적 |
|---|---|---|
| 기능 신뢰 기반 | 01 | Import 중 유실 같은 데이터 신뢰 문제 제거 |
| 리텐션/일정 루프 | 02~05 | 알림, 주간 보고서, Calendar, AI 리포트로 반복 사용 이유 만들기 |
| 영업 기록 고도화 | 06~07 | 딜 활동과 회의록 AI 운영 이력을 실제 영업 판단 데이터로 만들기 |
| Global B2C 제품화 | 08~09 | 다국가 데이터/앱 다국어와 제품 분석 기반 만들기 |
| Series A 확장성 | 10 | 모바일/PWA/현장 사용성 후보 정리 |
| 마지막 운영/판매 묶음 | 11~12 | Admin 운영과 결제/구독/세금 |

## 3. 기본 순서

1. `01_IMPORT_JOB_PERSISTENCE`
2. `02_NOTIFICATION_REMINDER`
3. `03_WEEKLY_SCHEDULE_REPORT`
4. `04_GOOGLE_CALENDAR_INTEGRATION`
5. `05_AI_WEEKLY_SALES_REPORT`
6. `06_DEAL_ACTIVITY_TIMELINE`
7. `07_MEETING_NOTE_AI_PROVIDER_LOG`
8. `08_GLOBAL_DATA_I18N`
9. `09_PRODUCT_ANALYTICS`
10. `10_MOBILE_PWA_FIELD_USE`
11. `11_ADMIN_OPERATION`
12. `12_BILLING_SUBSCRIPTION_TAX`

## 4. 순서 변경 원칙

- 사용자 결정이 있으면 순서를 바꿀 수 있다.
- 순서를 바꿀 때는 `COMMON/DECISION-LOG.md`에 이유를 남긴다.
- 앞 번호 기능의 DB/API가 뒤 번호 기능의 전제가 되면 앞 번호를 먼저 끝낸다.
- Admin과 결제/구독/세금은 명시적 사용자 결정 전까지 11~12로 유지한다.

## 5. Coverage 원칙

- 모든 기능 후보는 `COMMON/COVERAGE-MATRIX.md`에서 01~12 슬롯 중 하나 이상에 배정한다.
- 검색/필터, ExportJob, Trash 정책, BusinessCard OCR 고도화처럼 독립 번호가 없는 기능도 matrix의 배정 슬롯에서 반드시 검토한다.
- 한 기능이 제품 화면과 운영 정책에 모두 걸리면 두 슬롯에 나눠 기록한다.

## 6. UX/UI 처리 원칙

- 각 기능은 최소 작동 화면과 상태 처리를 포함한다.
- 전체 시각 polish, 밀도, 문구, 모바일 polish는 후반 UX/UI 계획으로 따로 묶는다.
- FE가 API 응답에 없는 summary/count/latest 정보를 사실처럼 꾸미지 않는다.
