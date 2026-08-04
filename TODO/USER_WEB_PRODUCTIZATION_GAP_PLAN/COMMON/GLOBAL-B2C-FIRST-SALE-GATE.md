# Global B2C First Sale Gate

2026-08-04 `03_WEEKLY_SCHEDULE_REPORT` 최종형 재대조 완료: Product UX/Retention 중 기본 주간 일정 보고서는 추가 후속 구현 없이 완료 상태로 본다. AI 고급 주간 리포트, PDF/범용 ExportJob, 반복 일정, Google write/realtime/watch는 이 gate에서 03 재오픈 사유가 아니라 별도 계획 또는 post-12 후보로 판단한다.

상태: Draft Guide
최종 업데이트: 2026-08-04

## 0. 완료 반영

- [x] Data reliability 중 ImportJob persistence/resume G01~G04는 `01_IMPORT_JOB_PERSISTENCE`에서 완료
- [x] `01_IMPORT_JOB_PERSISTENCE` G05~G08 최종형 보관/삭제/입력량 제한 보강과 G09 최종 QA closeout 완료
- [x] Retention 중 일정/딜 Notification reminder는 `02_NOTIFICATION_REMINDER`에서 완료
- [x] `02_NOTIFICATION_REMINDER` 배포 환경 실제 SMTP/Web Push provider smoke QA 완료 (2026-08-04 사용자 확인)
- [x] Product UX/Retention 중 주간 일정 보고서는 `03_WEEKLY_SCHEDULE_REPORT`에서 완료
- [x] Product UX/Retention 중 Google Calendar read-only import는 `04_GOOGLE_CALENDAR_INTEGRATION`에서 완료
- [x] Product UX 중 DealActivity timeline과 record summary는 `06_DEAL_ACTIVITY_TIMELINE`에서 완료
- [x] DB/Prisma 운영 gate 중 06 범위 DB target/migrate/seed gate는 `06_DEAL_ACTIVITY_TIMELINE`에서 closeout 완료
- [x] Product UX/Retention/Data reliability 중 MeetingNote AI 후속 작업 draft와 provider call log subset은 `07_MEETING_NOTE_AI_PROVIDER_LOG`에서 완료
- [x] Global UX 중 `/app` i18n, user global settings, 통화/전화번호/주소/지역/Import/Export 현지화, Google/LINE/Apple auth는 `08_GLOBAL_DATA_I18N`에서 완료
- [x] 08 운영 DB migration 최신 상태 확인 완료
- [x] LINE/Apple 실제 provider smoke와 provider 설정값 연결은 2026-07-29 사용자 확인 기준 운영 완료
- [x] Product analytics foundation은 `09_PRODUCT_ANALYTICS`에서 완료
- [x] Mobile field-use 1차 범위는 `10_MOBILE_PWA_FIELD_USE`에서 완료
- [x] Admin operation 1차 범위는 `11_ADMIN_OPERATION`에서 완료
- [ ] 12 Billing 완료 후 01~12 전체 post-12 재검토
- [ ] backup/restore 실행 runbook, 장애 대응 drill, Billing 운영 기준은 별도 gate로 남음

## 1. 목적

이 문서는 `한손에 영업 / onehand.sales`가 실제로 돈을 받고 판매되기 전에 통과해야 하는 Global B2C 첫 판매 기준을 정의한다.

MVP는 판매 버전이 아니다. MVP는 핵심 업무 루프가 동작하는지 확인하는 내부 기준이며, 실제 판매는 이 문서의 gate를 통과한 뒤 판단한다.

## 2. 첫 판매 gate

| Gate | 판매 전 필요한 상태 | 현재 방향 |
|---|---|---|
| Product UX | 회사, 담당자, 제품, 딜, 일정, 주간 일정 보고서, Google Calendar read-only import, 회의록, 명함, import, search, trash, export가 반복 업무 도구처럼 자연스럽게 이어진다. | 현재 MVP 핵심 루프를 화면별로 제품화 QA한다. 주간 일정 보고서, Google Calendar read-only import, DealActivity timeline, 딜/담당자 record summary, 회의록 AI 후속 작업 draft, 모바일 명함 촬영/회의 녹음/local draft/push permission UX는 구현 완료됐다. |
| Global UX | 판매 국가 기준 언어, 날짜/시간, 통화, 전화번호, 주소, UX writing이 어색하지 않다. | 08에서 `/app` `ko-KR`/`en` i18n, 사용자 국가/기본 통화, Product/Deal currency, Contact KR/US phone, Company country/region/address, Import/Export localization, Google/LINE/Apple auth를 구현했다. LINE/Apple provider smoke는 2026-07-29 사용자 확인 기준 운영 완료됐고, 추가 시장별 UX writing은 후속 polish로 남긴다. |
| Pricing/plan | 가격표, trial 여부, 무료/유료 제한, paywall, plan별 entitlement가 명확하다. | Public pricing과 app 내부 구독 상태 UX를 함께 정의한다. |
| Billing | 결제 provider 또는 Merchant of Record, 구독 생성/갱신/해지, 환불, 결제 실패 복구, 영수증/인보이스가 준비된다. | Payment/subscription은 첫 판매 전 큰 계획으로 다룬다. |
| Admin/support | 사용자, 민감정보 마스킹, 감사 로그, provider 실패, Trash/account/data request, system gate를 운영자가 처리할 수 있다. 결제/구독 이슈는 Billing 도메인과 연결한다. | 11에서 Admin Web/API 최소 운영 범위를 구현했다. 결제/구독/plan/payment/invoice/refund 운영은 12에서 다룬다. |
| Trust/policy | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, 보관 기간 정책이 판매 범위와 맞는다. | 정책 문서와 Backend 데이터 처리 기준을 함께 확정한다. |
| Data reliability | migration, seed, backup/restore, import job 유실, provider log, 장애 대응 기준이 있다. | ImportJob persistence/resume과 최종형 보관/삭제/입력량 제한은 `01_IMPORT_JOB_PERSISTENCE` G01~G09로 완료. Google Calendar token encryption/redaction, callback/redirect QA, 06/11 범위 DB target/migrate/seed gate, 07 MeetingNote provider call log subset, 08 migration 파일 작성과 DB 최신 상태 확인, 11 Admin system operation check record도 완료. 실제 backup/restore 실행 runbook과 장애 대응 drill은 별도 운영 절차로 남긴다. |
| Analytics | activation, retention, paid conversion, churn, ARPU, AI cost/user를 볼 수 있다. | 09에서 event taxonomy, client/server event 수집, activation/retention snapshot, AI usage/cost summary foundation을 구현했고 10에서 mobile field-use event를 연결했으며 11에서 Admin analytics UI/API를 구현했다. paid conversion/churn/ARPU는 12 Billing runtime source가 연결되어야 완성된다. |
| Retention | 다음 행동, 일정, 딜 지연, 회의록 follow-up을 사용자가 놓치지 않는다. | 일정/딜 Notification reminder, 주간 일정 보고서, Google Calendar read-only import와 Google-origin schedule reminder, 딜 activity timeline, 회의록 follow-up draft, browser push permission UX는 완료. 실제 SMTP/Web Push provider smoke도 2026-08-04 사용자 확인 기준 배포 환경에서 완료됐다. 회의록 follow-up 알림/발송은 후속 기능으로 분리한다. |

12 완료 후에는 `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/POST-12-REVIEW-AND-FOLLOWUP.md` 기준으로 이 gate를 다시 닫는다. 이때 01~12 전체, `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`, 실제 BE/FE/Prisma 상태를 함께 대조한다.

## 3. Gate 판정 상태

| 상태 | 의미 |
|---|---|
| Required before sale | Global B2C 첫 판매 전에 반드시 구현 또는 운영 기준이 필요하다. |
| Decision before sale | 첫 판매 전에 구현할지, known limitation으로 둘지 명시 결정이 필요하다. |
| Series A later | 첫 판매 후 retention, revenue, analytics 지표를 보며 확장한다. |

## 4. 현재 기준으로 첫 판매 전 별도 계획이 필요한 묶음

| 묶음 | 이유 |
|---|---|
| Global B2C sales policy/payment | 가격, trial, plan, 결제 provider, 세금/환불 기준이 없으면 판매할 수 없다. |
| Admin minimal operation | 완료. 11에서 계정/데이터/민감정보/provider/Trash/system gate 운영 화면과 API를 구현했다. 결제/구독 운영은 12 범위다. |
| Account/data deletion/billing UX | `/app` 언어와 global settings는 08에서 완료. 계정 삭제 요청과 데이터 export 요청 UX/API/Admin queue는 11에서 완료. 구독 상태 UX는 12 Billing 범위다. |
| Product analytics | 09 foundation, 10 mobile field-use event, 11 Admin analytics 화면/API는 완료됐다. 유료 판매 후 conversion/churn을 운영하려면 12 Billing source event 연결이 필요하다. |
| Data reliability/DB gate | 06 범위 DB/Prisma gate, ImportJob persistence/resume G01~G09, 07 MeetingNote provider call log subset, 08 migration 작성/검증과 DB 최신 상태 확인, 11 Admin system operation gate는 완료. 실제 backup/restore 실행 runbook과 장애 대응 drill은 판매 신뢰와 연결된다. |
| Auth provider operation QA | Google/LINE/Apple 구현과 LINE/Apple 실제 provider smoke 모두 완료됐다. 2026-07-29 사용자 확인 기준 운영 환경에서 동작한다. |
| Retention follow-up | 일정/딜 알림, 주간 일정 보고서, Google Calendar read-only import, 회의록 follow-up draft, browser push permission UX, 실제 SMTP/Web Push provider smoke, 09 activation/retention snapshot foundation, 10 mobile field event는 구현 완료. 회의록 follow-up 알림/발송과 운영 모니터링 고도화 기준은 별도 후속으로 판단한다. |

## 5. 판단 원칙

- MVP 완료는 판매 가능 상태가 아니다.
- 첫 판매는 기능 수가 아니라 결제, 운영, 신뢰, 현지화, 분석이 연결된 상태로 판단한다.
- Series A 기능은 첫 판매 gate를 통과한 뒤 지표를 보고 확장한다.
- 이 문서는 구현 지시서가 아니며, 실제 구현은 별도 TODO 계획과 `/goal`로 분리한다.
- 12 완료 후 post-12 재검토에서 미완성/후속으로 남은 항목은 새 TODO 폴더로 승격한다. UX/UI 디자인 유지보수는 그 이후 별도 계획으로 진행한다.
