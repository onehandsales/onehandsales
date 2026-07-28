# Current vs Final Gap Matrix

상태: Draft Guide
최종 업데이트: 2026-07-28

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: Done (2026-07-21)
- [x] Import gap 중 "confirm 전 job in-memory" 항목은 닫힘
- [x] `NBA-009 Schedule week report`: Done (2026-07-22)
- [x] `/app/schedules/week`, weekly schedule report API, Excel export 구현 완료
- [x] `NBA-010 Notification`: Done (2026-07-22)
- [x] 일정/딜 reminder 기반 retention loop와 `/app/notifications` UX 구현 완료
- [x] `NBA-015 Google Calendar Integration`: Done (2026-07-23)
- [x] Google Calendar read-only import, calendar selection, sync/source badge, Schedule Trash restore 구현 완료
- [x] `06_DEAL_ACTIVITY_TIMELINE`: Done (2026-07-26)
- [x] 딜 상세 `DealActivity` timeline, 딜 목록 products/latest activity, 담당자 목록 dealCount, page size 15 계약 구현 및 QA closeout 완료
- [x] `07_MEETING_NOTE_AI_PROVIDER_LOG`: Done (2026-07-26)
- [x] MeetingNote AI/STT provider log, 상세 next action/follow-up draft, User Web AI 후속 작업 UX 구현 및 QA closeout 완료
- [x] `08_GLOBAL_DATA_I18N`: Done (2026-07-28)
- [x] `/app` i18n, user global settings, Product/Deal currency, Contact global phone, Company country/region/address, Import/Export localization, Google/LINE/Apple auth 구현 및 QA closeout 완료

## 1. Gap 분류 기준

| 분류 | 의미 |
|---|---|
| MVP/internal quality | 이미 기능은 있으나 내부 품질 기준에서 안정성, 흐름, UX 완성도를 더 봐야 하는 영역 |
| UX/UI productization | 이미 기능은 있으나 Global B2C 유료 제품처럼 읽히고 쓰이는지 더 봐야 하는 영역 |
| UX/API gap | UX에서 필요한 정보가 확정되면 API 계약으로 승격할 수 있는 영역 |
| Feature gap | 최종 서비스에는 필요하지만 현재 기능/API가 없는 영역 |
| Ops/security gap | 운영, 보안, 감사, 복구, DB 안전성 관련 영역 |
| First-sale global gap | Global B2C 첫 판매를 위해 필요한 결제, 현지화, 운영, 정책, 분석 영역 |
| First-sale/Series A gap | 첫 판매에 필요한 최소 리텐션인지 Series A 이후 기능인지 결정해야 하는 영역 |
| Series A gap | 리텐션, AI 차별화, 성장/분석 관련 영역 |

## 2. 최종 대비 현재 차이

| 영역 | 최종 서비스에 필요한 상태 | 현재 상태 | 차이 | 분류 | 우선 판단 |
|---|---|---|---|---|---|
| 핵심 CRM 루프 | 회사/담당자/제품/딜/일정/회의록이 한 흐름으로 이어진다. | 대부분 구현 완료. 딜 중심 `DealActivity` timeline으로 일정/회의록/follow-up/다음 행동 흐름 연결 완료 | MVP 핵심 루프는 있으나 Global B2C 유료 사용자가 반복 사용할 완성감 점검 필요 | UX/UI productization | 첫 판매 전 점검 |
| 홈 | 오늘 일정, 진행 딜, 다음 행동, 최근 회의록이 바로 읽힌다. | `/app` dashboard 구현 | 실제 사용자가 하루 업무를 시작하기 충분한지 재점검 필요 | UX/UI productization | 첫 판매 전 점검 |
| 딜 목록 | 단계, 금액, 회사/담당자/제품, 다음 행동, 마감일이 빠르게 비교된다. | pipeline/list/detail, 제품 summary, 최신 활동 summary, page size 15 계약 구현 완료 | 딜 목록 products/latest activity gap은 닫힘. 다음 행동 강조, 고급 필터, UX polish는 후속 | Closed for 06 / UX/UI productization | 완료, polish 후속 |
| 회사/담당자/제품 목록 | linked record, 진행 딜, 최근 활동, 다음 행동 맥락이 보인다. | 기본 목록/count 구현. 담당자 `dealCount` 완료. Company/Product latest summary는 없음 | Contact dealCount gap은 닫힘. Company/Contact/Product latest activity summary는 후속 후보 | UX/API gap | 잔여 summary는 후속 |
| 일정 | 월간/목록과 딜 연결이 된다. 주간 보고서와 외부 캘린더 import가 있다. | CRUD, 월간/목록, `/app/schedules/week`, weekly report API, Excel export, Google Calendar read-only import/sync/calendar selection/source badge 구현 | 주간 일정 보고서와 Google Calendar read-only import gap은 닫힘. Google export/write, realtime webhook/watch, 반복 일정, AI 요약은 후속 확장 | Closed for NBA-009/NBA-015 | 완료 |
| 회의록 | 직접 작성, AI/STT, 딜 활동 연결, 후속 행동 추출이 된다. | 직접/AI/STT draft, provider log, 상세 next action/follow-up draft, 딜 연결 구현. 회의록 연결/해제는 딜 activity timeline에 안전한 summary로 연결 | 상세 AI 후속 작업 gap은 닫힘. 목록 latest/next summary, 자동 발송/알림, Admin audit/retention 정책은 후속 | Closed for 07 / Feature/Ops gap | 상세 완료, 잔여 후속 |
| 명함 스캔 | 모바일 현장 촬영, OCR, 다국가 연락처 검증까지 자연스럽다. | 이미지 업로드 OCR과 KR/US 전화번호 정규화 구현 | 카메라 UX와 provider failure contract는 후속. KR/US 전화번호 gap은 08에서 닫힘 | Feature/Ops gap | 후속 |
| Import | 업로드 중단/새로고침/배포에도 이어받는다. | ImportJob DB persistence/resume 구현 완료 | Live Supabase 수동 QA와 장기 운영 cleanup은 운영 확인 단계 | Closed for NBA-006 | 완료 |
| Search | 빠르고 안전하며 다른 사용자 데이터가 섞이지 않는다. | 구현 및 보안 QA 완료 | 고급 필터/정렬은 후속 | UX/UI productization | 낮음 |
| Trash | 7일 이내 복구와 만료 후 정책이 명확하다. | 7일 이내 복구와 Schedule soft delete/restore 구현 | 7일 이후 정책, private memo backend restriction 후보 | Ops/security gap | 후속 |
| Export | 도메인별 export와 민감 export 정책이 안전하다. | 도메인별 xlsx와 `ko-KR`/`en` header/date-time/currency localization 구현 | 기본 현지화 gap은 08에서 닫힘. 민감 export, 대량/비동기 export 정책은 없음 | Ops/security gap | 후속 |
| Notification | 다음 행동/일정/딜 지연 reminder가 온다. | 일정/딜/Google-origin schedule reminder, 앱 안 알림, email/browser push delivery attempt, `/app/notifications` 구현 | 실제 SMTP/Web Push provider smoke는 env 준비 후 운영 확인. 회의록 follow-up 알림은 후속 기능 | Closed for NBA-010/NBA-015 | 완료 |
| Admin 운영 | 사용자/구독/결제/민감정보/감사를 운영한다. | `/admin/api/me`만 구현, 운영 route redirect | Admin API, screen, masking, audit 필요 | First-sale global gap | 첫 판매 전 필요 |
| 결제/구독 | trial, 월/연 구독, 환불, 영수증, failed payment recovery | 구현 없음 | 결제 provider/MoR, plan, entitlement 필요 | First-sale global gap | 첫 판매 전 필요 |
| 세금/컴플라이언스 | VAT/GST, 환불, chargeback, 국가별 약관 | 구현 없음 | 글로벌 판매 운영 계층 필요 | First-sale global gap | 첫 판매 전 필요 |
| `/app` 다국어 | 판매 시장 기준 앱 내부 언어/문구 지원 | `/app` i18n provider/resource/formatter와 핵심 화면 `ko-KR`/`en` 번역 구현 | 기본 app 다국어 gap은 08에서 닫힘. legacy static fallback 직접 keying 축소와 시장별 UX writing polish는 후속 | Closed for 08 / UX/UI productization | 완료, polish 후속 |
| 다국가 데이터 모델 | 전화번호, 통화, 날짜/주소가 국가별로 자연스럽다. | User country/default currency, Product/Deal currency, Contact KR/US global phone, Company country/region/address, localized import/export 구현 | 기본 global data model gap은 08에서 닫힘. 추가 국가/통화/전화번호 포맷과 세금/가격 정책은 후속 결정 | Closed for 08 / First-sale ops decision | 완료, 운영 후속 |
| 제품 분석 | activation, retention, paid conversion, churn, AI cost를 본다. | 정본 없음 | event taxonomy, analytics pipeline 필요 | First-sale global gap | 첫 판매 전 필요 |
| AI next action | 딜 리스크, follow-up, 다음 행동을 추천한다. | 회의록 상세 next action/follow-up draft 구현. 딜 리스크와 고급 영업 판단 AI는 없음 | 회의록 기반 AI 후속 작업은 시작됐지만 Series A급 딜 리스크/리포트/자동화는 후속 | Series A gap | 후속 |
| 모바일 앱/PWA | 현장 입력, 카메라, 음성, push reminder가 자연스럽다. | 모바일 브라우저 Web과 browser push UX 구현 | native 앱/PWA 패키징, 모바일 카메라/음성 최적화는 후속 | Series A gap | 후순위 |

## 3. 당장 판단해야 할 질문

| 질문 | 답을 정해야 하는 이유 |
|---|---|
| Global B2C 첫 판매 국가를 어디로 볼지 | 언어, 결제, 세금, 약관, 전화번호/통화/날짜 기준이 달라진다. |
| 첫 판매를 Stripe 직접 결제로 할지, Merchant of Record로 할지 | 세금/환불/인보이스/Admin 범위가 크게 달라진다. |
| MVP를 내부 검증으로만 둘 때 어떤 품질 gate를 통과해야 Global B2C 계획으로 넘어갈지 | 화면 QA와 Backend 운영 gate의 범위가 달라진다. |
| User Web의 최우선 화면이 `/app` 홈인지 `/app/deals`인지 | UX polish와 API summary 우선순위가 달라진다. |
| 딜 목록에서 제품/최근 활동/다음 행동을 얼마나 1급 정보로 볼지 | 제품 summary, Deal latest activity, page size 15는 06에서 완료. 다음 행동 강조와 Company/Contact/Product latest summary는 후속 판단이다. |
| ImportJob 유실이 Global B2C 첫 판매 blocker인지 known limitation인지 | 완료 처리됨. `NBA-006`은 `01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료. |
| Notification 실제 provider smoke와 회의록 follow-up 알림을 언제 다룰지 | 일정/딜 reminder와 회의록 follow-up draft는 완료됐고, 실제 SMTP/Web Push env 검증과 회의록 follow-up 알림/발송은 운영/후속 범위로 남는다. |
| Google Calendar export/write/realtime webhook/watch/반복 일정/여러 Google 계정 동시 연결을 언제 다룰지 | 현재 read-only import와 한손 Schedule/Trash/Reminder 연결은 완료됐고, 쓰기/실시간/고급 캘린더 범위는 후속 확장으로 남는다. |
| 실제 Google/LINE/Apple provider smoke를 언제 실행할지 | 08 구현과 자동 QA, DB migration 최신 상태 확인은 완료됐다. 실제 provider smoke는 Supabase/provider secret 설정 후 운영 확인이 필요하다. |
| Admin 운영을 결제 전에 어느 수준까지 구현할지 | 유료 고객 지원/민감정보 정책 범위가 달라진다. |

## 4. 권장 다음 큰 방향

1. User Web 화면별 제품화 gap을 실제 화면 기준으로 다시 확인한다.
2. MVP를 판매 버전이 아니라 Global B2C 첫 판매 gate로 가기 위한 내부 품질 기준으로 고정한다.
3. 결제, Admin, 정책/운영 신뢰, 제품 분석, 세금/컴플라이언스를 Global B2C 첫 판매 필수 bundle로 따로 계획한다.
4. API/DB 후보는 UX/UI와 첫 판매 운영 필요성으로 확인된 것만 `confirmed` 계약으로 승격한다.
