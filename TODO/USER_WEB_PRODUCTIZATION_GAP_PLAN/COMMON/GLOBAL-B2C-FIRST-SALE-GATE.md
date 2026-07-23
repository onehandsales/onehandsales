# Global B2C First Sale Gate

상태: Draft Guide

## 0. 완료 반영

- [x] Data reliability 중 ImportJob persistence/resume는 `01_IMPORT_JOB_PERSISTENCE`에서 완료
- [x] Retention 중 일정/딜 Notification reminder는 `02_NOTIFICATION_REMINDER`에서 완료
- [x] Product UX/Retention 중 주간 일정 보고서는 `03_WEEKLY_SCHEDULE_REPORT`에서 완료
- [x] Product UX/Retention 중 Google Calendar read-only import는 `04_GOOGLE_CALENDAR_INTEGRATION`에서 완료
- [ ] DB/Prisma 운영 gate, backup/restore, provider log, 장애 대응 기준은 별도 gate로 남음

## 1. 목적

이 문서는 `한손에 영업 / onehand.sales`가 실제로 돈을 받고 판매되기 전에 통과해야 하는 Global B2C 첫 판매 기준을 정의한다.

MVP는 판매 버전이 아니다. MVP는 핵심 업무 루프가 동작하는지 확인하는 내부 기준이며, 실제 판매는 이 문서의 gate를 통과한 뒤 판단한다.

## 2. 첫 판매 gate

| Gate | 판매 전 필요한 상태 | 현재 방향 |
|---|---|---|
| Product UX | 회사, 담당자, 제품, 딜, 일정, 주간 일정 보고서, Google Calendar read-only import, 회의록, 명함, import, search, trash, export가 반복 업무 도구처럼 자연스럽게 이어진다. | 현재 MVP 핵심 루프를 화면별로 제품화 QA한다. 주간 일정 보고서와 Google Calendar read-only import는 구현 완료됐다. |
| Global UX | 판매 국가 기준 언어, 날짜/시간, 통화, 전화번호, 주소, UX writing이 어색하지 않다. | `/app` 내부 다국어와 다국가 데이터 표현을 별도 계획으로 분리한다. |
| Pricing/plan | 가격표, trial 여부, 무료/유료 제한, paywall, plan별 entitlement가 명확하다. | Public pricing과 app 내부 구독 상태 UX를 함께 정의한다. |
| Billing | 결제 provider 또는 Merchant of Record, 구독 생성/갱신/해지, 환불, 결제 실패 복구, 영수증/인보이스가 준비된다. | Payment/subscription은 첫 판매 전 큰 계획으로 다룬다. |
| Admin/support | 사용자, 구독, 결제 이슈, 민감정보 마스킹, 감사 로그, provider 실패를 운영자가 처리할 수 있다. | Admin Web/API 최소 운영 범위를 별도 계획으로 다룬다. |
| Trust/policy | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, 보관 기간 정책이 판매 범위와 맞는다. | 정책 문서와 Backend 데이터 처리 기준을 함께 확정한다. |
| Data reliability | migration, seed, backup/restore, import job 유실, provider log, 장애 대응 기준이 있다. | ImportJob persistence와 Google Calendar token encryption/redaction, callback/redirect QA는 완료. DB/Prisma 운영 gate, backup/restore, provider log, 장애 대응 기준은 별도 계획으로 남긴다. |
| Analytics | activation, retention, paid conversion, churn, ARPU, AI cost/user를 볼 수 있다. | 제품 분석 event taxonomy와 privacy 기준을 첫 판매 전 정의한다. |
| Retention | 다음 행동, 일정, 딜 지연, 회의록 follow-up을 사용자가 놓치지 않는다. | 일정/딜 Notification reminder, 주간 일정 보고서, Google Calendar read-only import와 Google-origin schedule reminder는 완료. 회의록 follow-up과 실제 SMTP/Web Push provider smoke는 후속 운영 확인으로 분리한다. |

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
| Admin minimal operation | 유료 고객의 계정/결제/데이터 문제를 운영할 최소 화면과 API가 필요하다. |
| App localization/account/billing UX | `/app` 내부 언어, 계정 관리, 데이터 삭제, 구독 상태 UX가 필요하다. |
| Product analytics | 유료 판매 후 activation, conversion, churn을 보지 못하면 제품 판단이 불가능하다. |
| Data reliability/DB gate | migration, import job, provider failure, backup/restore 기준이 판매 신뢰와 연결된다. |
| Retention follow-up | 일정/딜 알림, 주간 일정 보고서, Google Calendar read-only import는 구현 완료. 회의록 follow-up 알림, 실제 SMTP/Web Push provider smoke, 운영 모니터링 기준은 별도 확인이 필요하다. |

## 5. 판단 원칙

- MVP 완료는 판매 가능 상태가 아니다.
- 첫 판매는 기능 수가 아니라 결제, 운영, 신뢰, 현지화, 분석이 연결된 상태로 판단한다.
- Series A 기능은 첫 판매 gate를 통과한 뒤 지표를 보고 확장한다.
- 이 문서는 구현 지시서가 아니며, 실제 구현은 별도 TODO 계획과 `/goal`로 분리한다.
