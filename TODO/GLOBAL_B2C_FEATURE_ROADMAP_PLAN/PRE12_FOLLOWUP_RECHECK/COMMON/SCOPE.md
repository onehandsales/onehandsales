# Scope

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`가 어떤 후보를 다루고, 어떤 후보는 기존 완료 슬롯 또는 12 이후로 남기는지 고정한다.

## 2. 포함 범위

| 범위 | 설명 |
| --- | --- |
| 01~06 재대조 결과 정리 | 01~04 완료, 05 provider smoke pending 상태와 06 후속 재검토 A 결정을 07~11 재대조에서 참고할 수 있게 정리한다. |
| 01 Import 확장 후보 분리 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API가 01 미완성이 아니라 별도 post-12 seed임을 고정한다. |
| 02 후속 후보 분리 | 다음 행동 알림과 회의록 후속 알림이 02 구현 범위가 아니었음을 고정한다. |
| 06 작업 경계 설정 | DealActivity event와 실제 Notification reminder를 분리한다. |
| 07 작업 경계 설정 | MeetingNote 상세 AI draft와 MeetingNote 목록 summary/자동 발송/알림/AI data cleanup/raw 저장 후보를 분리한다. |
| 08 작업 경계 설정 | `/app` 기본 i18n/global data/auth provider 완료 범위와 시장/국가/통화/auth 확장 후보를 분리한다. |
| 후보 상태 분류 | `pre-12-follow-up-needed`, `post-12-seed`, `billing-blocked`, `Question`, `defer` 중 하나로 분류한다. |
| 구현 전 계약 요구 | API/DB/FE 변경 후보는 API contract와 DB 영향 문서를 먼저 확정하도록 한다. |

## 3. 제외 범위

| 제외 항목 | 이유 |
| --- | --- |
| 06 DealActivity 구현 재개 | 06은 이미 완료 슬롯이다. 현재 작업이 있더라도 이 문서는 06 범위 확장을 지시하지 않는다. |
| 07 MeetingNote AI 구현 재개 | 07은 이미 완료 슬롯이다. 목록 summary, 자동 발송, 알림은 별도 후보다. |
| 01 ImportJob 구현 재개 | 대용량 import worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 완료 의미를 깨지 않고 post-12에서 재검토한다. |
| 08 Global Data I18N 구현 재개 | 08은 `ko-KR/en`, KR/US, KRW/USD, Google/LINE/Apple 기준으로 완료됐다. 시장/국가/auth 확장은 별도 후속이다. |
| 12 Billing 구현 | 결제, 구독, 세금, paywall, churn, paid conversion은 12 결정 없이는 기준을 확정할 수 없다. |
| 새 API 즉시 구현 | 현재 `COMMON/API-SPEC`에는 confirmed API가 없다. |
| 새 Prisma migration 즉시 작성 | 후보 계약이 확정되기 전에는 schema를 바꾸지 않는다. |
| UX/UI 전체 polish | Product UX first-sale gate와 UX/UI 유지보수는 별도 흐름이다. |
| Company/Contact/Product latest summary pre-12 계약화 | 2026-08-06 A 결정에 따라 `NBA-003` 잔여 record summary는 B2B/team CRM 성격이 강한 post-12 전략 후보로 둔다. |
| 07 MeetingNote AI 구현 재개 | 07은 완료 슬롯이다. AI data cleanup, list summary, follow-up reminder/자동 발송, transcript/raw/follow-up draft 저장은 별도 후보로만 둔다. |
| 08 market/global expansion pre-12 구현 | `ja/zh-TW`, `zh-CN`, 전 세계 국가/통화/전화번호, USD minor unit, 상세 주소 검증, 신규 auth provider는 08 완료 범위를 넓히지 않는다. |

## 4. 06 작업에 직접 영향을 주는 기준

06에서 다뤄도 되는 범위:

- DealActivity model, repository, timeline API, deal list `latestActivity`
- `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`
- `SCHEDULE_LINKED`, `SCHEDULE_UNLINKED`
- `MEETING_NOTE_LINKED`, `MEETING_NOTE_UNLINKED`
- `FOLLOW_UP_SENT`, `FOLLOW_UP_FAILED`
- list summary에 필요한 safe title, safe summary, occurredAt

06에서 다루면 안 되는 범위:

- Notification reminder row 생성
- due processor와 next action due date 연동
- MeetingNote follow-up reminder 생성
- MeetingNote follow-up 자동 발송
- follow-up body 전체 또는 meeting note raw text 전문 노출
- Company/Contact/Product latest summary response field 추가
- MeetingNote list latest/next summary response field 추가
- Company/Contact/Product summary 전용 endpoint 또는 record별 상세 activity timeline 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 table 추가

## 5. 08 Global Data I18N에 직접 영향을 주는 기준

08에서 완료로 보는 범위:

- `/app` 내부 `ko-KR`, `en` i18n provider/resource/formatter
- User global settings: `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`
- Product/Deal `currencyCode`와 KRW/USD 정수 금액 정책
- Contact KR/US `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`
- Company KR/US country/region code와 free address
- Import template `locale=ko-KR|en`과 domain export localization
- Google, LINE, Apple auth provider와 verified email linking
- LINE/Apple provider smoke와 08 DB migration 최신 상태 확인

08 완료 범위로 다루면 안 되는 범위:

- `/app` `ja`, `zh-TW`, `zh-CN` translation 추가
- 전 세계 country/currency/phone dictionary 추가
- Product/Deal amount를 minor unit으로 migration
- 국가별 상세 주소 validation, 국가별 tax/terms/pricing policy
- Contact personal address 추가
- email/password login, Microsoft login, Kakao runtime 복구, 신규 auth provider 추가
- `/app` locale route prefix 추가
- legacy static fallback 직접 keying, Settings OAuth 계정 라벨, bundle chunk 최적화를 08 blocker로 취급

## 6. 기존 PRE12 후보와 연결되는 08 항목

08 재대조에서 다시 발견됐지만 새 후보로 중복 생성하지 않는 항목:

| 항목 | 기존 PRE12 후보 |
| --- | --- |
| generic ExportJob/PDF/bulk export | `PRE12-F09` |
| backup/restore runbook/drill | `PRE12-F11` |
| billing/paywall/churn/paid conversion | `PRE12-F12` |
| Import scale/source/Admin 확장 | `PRE12-F13` |

## 7. 상태 분류 기준

| 상태 | 의미 |
| --- | --- |
| `done` | 실제 구현과 QA가 이미 닫힌 항목 |
| `pre-12-follow-up-needed` | 12 전 별도 goal로 처리할 수 있고, billing 결정과 직접 충돌하지 않는 항목 |
| `post-12-seed` | 12 이후 최종 재검토에서 새 TODO로 승격할지 판단할 항목 |
| `billing-blocked` | 12 결정 없이는 구현 기준을 확정할 수 없는 항목 |
| `Question` | 사용자의 제품 판단 또는 정책 결정이 필요한 항목 |
| `defer` | 현재 의도적으로 미루는 항목 |

## 8. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SCOPE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/DECISION-LOG.md`
