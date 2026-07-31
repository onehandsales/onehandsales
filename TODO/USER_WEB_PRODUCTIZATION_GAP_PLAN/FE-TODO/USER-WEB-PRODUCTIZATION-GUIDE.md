# User Web Productization Guide

상태: Draft Guide
최종 업데이트: 2026-07-31

## 0. 완료 반영

- [x] `/app/import` ImportJob persistence/resume UX 구현 완료
- [x] `NBA-006` User Web productization gap 종료
- [x] `/app/schedules/week` Weekly Schedule Report UX와 Excel 다운로드 구현 완료
- [x] `NBA-009` User Web productization gap 종료
- [x] `/app/notifications` Notification reminder UX 구현 완료
- [x] `NBA-010` User Web productization gap 종료
- [x] `/app/schedules`/`/app/settings`/`/app/trash` Google Calendar UX 구현 완료
- [x] `NBA-015` User Web productization gap 종료
- [x] `/app/deals/:dealId` 딜 활동 timeline 구현 완료
- [x] `/app/deals` products/latest activity summary 구현 완료
- [x] `/app/contacts` dealCount 구현 완료
- [x] `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-008` User Web productization gap 종료
- [x] `/app/meeting-notes/:meetingNoteId` AI 후속 작업 UX 구현 완료
- [x] `NBA-004` MeetingNote detail subset, `NBA-011` provider log subset User Web productization gap 종료
- [x] `/app/settings` 국가/앱 언어/기본 통화 UX 구현 완료
- [x] `/app` i18n foundation과 핵심 화면 `ko-KR`/`en` 번역 구현 완료
- [x] Product/Deal currency, Contact KR/US phone, Company country/region/address UX 구현 완료
- [x] Import template/export localization UX 구현 완료
- [x] Google/LINE/Apple login/signup provider buttons 구현 완료
- [x] `08_GLOBAL_DATA_I18N` User Web productization gap 종료
- [x] `/app` route analytics wrapper와 routeKey mapper 구현 완료
- [x] `09_PRODUCT_ANALYTICS` User Web product analytics foundation gap 종료
- [x] `/app/business-cards` 모바일 촬영과 OCR safe failure UX 구현 완료
- [x] `/app/meeting-notes` 모바일 녹음/fallback과 local draft UX 구현 완료
- [x] `/app/notifications` browser push permission explicit click UX 구현 완료
- [x] `10_MOBILE_PWA_FIELD_USE` User Web mobile field-use gap 종료

## 1. 목적

이 문서는 `FE/user-web`을 최종 서비스 형태와 비교할 때 보는 화면/UX 기준이다.

이 문서는 구현 지시서가 아니다. 화면을 고치기 전에 무엇을 확인해야 하는지 정리한다.

## 2. User Web 판단 기준

| 기준 | 확인할 내용 |
|---|---|
| Work-first | 로그인 후 화면이 마케팅 사이트가 아니라 반복 업무 도구처럼 보이는가 |
| Notion + Attio | sidebar/page/database/detail 문법과 CRM linked record 맥락이 살아 있는가 |
| Deal-first | 딜 단계, 금액, 다음 행동, 마감일, 연결 record가 빨리 보이는가 |
| Global B2C first-sale | 앱 내부 언어와 글로벌 데이터 기본값은 08 기준으로 닫혔고, 가격/플랜 노출, 계정/데이터 관리, 결제 상태 UX가 첫 판매에 맞는가 |
| Mobile browser | 390px/360px에서 table을 억지로 유지하지 않고 card/list와 현장 입력 흐름으로 쓸 수 있는가. 10의 명함 촬영/회의 녹음/local draft/push permission QA 기준을 유지하는가 |
| State UX | loading, empty, error, success, validation, delete/restore 상태가 해요체와 행동형 기준을 따르는가 |
| Data honesty | API 응답에 없는 최신 활동/summary/count를 FE에서 사실처럼 꾸미지 않는가 |

## 3. 화면별 제품화 gap 체크

| 화면 | 현재 상태 | 제품화 점검 질문 | API/BE 영향 |
|---|---|---|---|
| Public/auth | locale 진입면과 Google/LINE/Apple login/signup provider 버튼 구현 | Global B2C 첫 판매용 가치 제안, 가격/플랜, trial 기준이 충분한가. LINE/Apple 실제 provider smoke도 운영 완료 상태로 유지되는가 | Provider UI와 LINE/Apple 운영 smoke는 08 완료. 가격/플랜은 중간 |
| `/app` | home dashboard 구현 | 오늘 해야 할 일과 진행 딜이 바로 읽히는가 | 중간 |
| `/app` route analytics | `AppShell`에서 보호된 `/app` route 진입을 routeKey allowlist 기반으로 전송하고, mobile field-use event도 allowlist payload로 전송 | 사용자는 analytics 전송 여부를 보지 않는다. Admin dashboard와 billing conversion UI는 아직 별도 | `09_PRODUCT_ANALYTICS`, `10_MOBILE_PWA_FIELD_USE` 완료. Admin/Billing 연결은 11/12 |
| `/app/deals` | pipeline/list/detail, 딜 상세 activity timeline, 목록 제품 summary, 최신 활동 summary, currency-aware 금액 구현 | 딜 비교, 다음 행동, 연결 회사/담당자/제품 맥락이 충분한가 | `NBA-001`, `NBA-003` Deal subset, `NBA-008`, 08 currency 완료. 다음 행동 강조와 UX polish는 후속 |
| `/app/companies` | 목록/상세/생성/메모/export, country/region/address 구현 | 담당자/진행 딜/최근 활동 맥락이 충분한가 | 08 region/address 완료. `NBA-003` latest summary는 후속 후보 |
| `/app/contacts` | 목록/상세/생성/export, dealCount, KR/US phone 표시 구현 | 연결 딜 수와 회사 맥락이 충분한가 | `NBA-002`와 08 phone 완료. `NBA-003` latest summary는 후속 후보 |
| `/app/products` | 목록/상세/생성/export, currencyCode 구현 | 제품이 어느 딜에서 쓰이는지 빠르게 보이는가 | 08 currency 완료. `NBA-003` latest summary는 후속 후보 |
| `/app/schedules` | 목록/월간/상세, Google Calendar status/source badge/manual sync/calendar hidden handling 구현 | 일정과 딜, Google에서 가져온 일정이 하루/주 단위 영업 판단으로 연결되는가 | 기본 일정 및 `NBA-015` 완료 |
| `/app/schedules/week` | 주간 보고서, 이전/다음/이번 주 이동, Excel 다운로드, loading/empty/error/export error 구현 | 주간 일정 보고서는 구현 완료. PDF/범용 ExportJob, 반복 일정, AI 요약은 별도 후속 확장 | `NBA-009` 완료 |
| `/app/meeting-notes` | 수동/AI/STT draft/딜 연결, 모바일 녹음/fallback, local draft, 상세 AI 후속 작업, 다음 행동 후보 편집 저장, follow-up draft 수정/복사 구현 | 회의록 목록에서도 최신/다음 행동 맥락이 충분히 보이는가. 상세 AI 후보는 자동 저장/자동 발송하지 않는가 | `NBA-004` detail subset, `NBA-011` provider log subset, 10 mobile recording/local draft 완료. 목록 summary, 자동 발송/알림, Admin audit는 후속 |
| `/app/business-cards` | OCR/upload/confirm, 모바일 촬영/앨범 선택, OCR safe failure, local draft, KR/US phone validation 구현 | advanced crop/preview가 필요한지, Admin provider failure dashboard가 필요한지 | `NBA-005`, 08 phone, 10 mobile capture 완료. Admin 운영 추적은 후속 |
| `/app/import` | template language selector, upload/mapping/row edit/validation/resume/confirm/cancel/log 구현 | 새로고침/탭 이동/배포 중 유실 복구와 template localization 구현 완료 | `NBA-006`, 08 완료 |
| `/app/trash` | list/detail/restore, Schedule restore 구현 | private memo preview와 7일 이후 정책이 안전한가 | `NBA-007`, `NBA-012` 후보. Schedule restore는 `NBA-015` 완료 |
| `/app/settings` | profile/devices, 국가/앱 언어/기본 통화, Google Calendar 연결/캘린더 선택/연결 해제 구현 | 첫 판매 전 계정 삭제/데이터 삭제/구독 상태 UX가 충분한가 | global settings는 08 완료. Payment/Admin 계획과 연결. Google Calendar 설정은 `NBA-015` 완료 |
| `/app/more` | 보조 메뉴 구현 | 숨긴 기능이 잘못 노출되지 않는가 | 낮음 |
| `/app/notifications` | list/read/settings/browser push explicit permission/fallback 구현 | 일정/딜 reminder가 사용자가 놓치지 않게 표시되는지 운영 env에서 최종 smoke 필요 | `NBA-010`, 10 permission UX 완료 |
| `/app/export` | `/app` redirect | 범용 export가 정말 필요한지 정책 결정 필요 | 낮음 |

## 4. 지금 바로 FE에서 하지 말 것

- 완료된 Notification 범위를 넘어서는 새 알림 화면은 API/DB 계약 없이 확장하지 않는다.
- 완료된 주간 일정 보고서 범위를 넘어서는 PDF/범용 ExportJob, 반복 일정, AI 요약은 API/DB 계약 없이 확장하지 않는다.
- 완료된 Google Calendar Integration 범위를 넘어서는 Google Calendar export/write, realtime webhook/watch, 반복 일정, 여러 Google 계정 동시 연결은 API/DB 계약 없이 확장하지 않는다.
- 완료된 Deal Activity Timeline 범위를 넘어서는 범용 activity bus, Company/Contact/Product latest summary, activity deletion/retention/audit 정책은 API/DB/정책 계약 없이 확장하지 않는다.
- 완료된 MeetingNote AI Provider Log 범위를 넘어서는 회의록 목록 summary, 자동 저장/자동 발송, 회의록 follow-up 알림, Admin provider audit 조회는 API/DB/정책 계약 없이 확장하지 않는다.
- 완료된 Global Data I18N 범위를 넘어서는 신규 국가/통화/provider, `/app` locale prefix, 추가 DB migration은 계약/운영 계획 없이 진행하지 않는다.
- 완료된 Product Analytics/Mobile Field Use 범위를 넘어서는 Admin analytics dashboard, billing/paywall/churn runtime event, PWA install/offline shell, native app은 별도 계약 없이 확장하지 않는다.
- `/app/export` generic export를 다시 노출하지 않는다.
- page size를 FE 단독으로 바꾸지 않는다.
- API 응답에 없는 latest activity, next action summary, product summary, dealCount를 임의로 계산해 사실처럼 표시하지 않는다. Deal list products/latest activity와 Contact dealCount는 06 API 응답 기준으로만 표시한다.
- Admin Web 운영 화면을 User Web feature와 섞지 않는다.

## 5. FE 변경이 필요하다고 판단되면

1. 화면에서 해결 가능한 UX 문제인지 확인한다.
2. Global B2C 첫 판매 gate에 필요한지, 내부 MVP polish인지 분리한다.
3. API 응답이 부족한 문제인지 분리한다.
4. API가 필요하면 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 후보와 연결한다.
5. 구현은 별도 TODO 계획과 `/goal`로 분리한다.
