# Backend API Todo

상태: Draft / confirmed backend API 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK` 후보가 Backend에 어떤 영향을 줄 수 있는지 기록한다. 현재 바로 구현할 Backend API 작업은 없다.

## 2. 현재 코드 사실

| 영역 | 현재 사실 |
| --- | --- |
| Notification | `NotificationSourceType`은 `SCHEDULE`, `DEAL`만 사용한다. 일정 시작 reminder와 딜 마감 reminder 중심이다. |
| DealActivity | `NEXT_ACTION_CREATED`, `NEXT_ACTION_COMPLETION_CHANGED`, `MEETING_NOTE_LINKED`, `FOLLOW_UP_SENT/FAILED` 같은 activity event가 있다. |
| MeetingNote AI | `AiProviderOperation`에 MeetingNote draft/STT/next action/follow-up draft operation이 있다. |
| Follow-up Delivery | `FollowUpMessage`, `FollowUpDeliveryAttempt`, `ExternalEmailConnection` 계열이 있고 Gmail/Microsoft email adapter는 구현됐다. SMS provider는 production 실제 provider가 아니라 test/not-configured provider 상태다. |
| ImportJob | `/api/imports` 계열 persistence/resume/confirm/cancel과 10MB/5,000 data row 제한은 01에서 완료됐다. 현재 import 대상은 회사, 담당자, 제품, 딜이다. |
| MeetingNote raw storage | transcript/raw provider response/follow-up draft body 전용 저장 API나 table은 없다. 07은 safe metadata log만 남긴다. |
| Global Data I18N | User global settings, Product/Deal currency, Contact KR/US phone, Company KR/US region/address, Import/Export localization, Google/LINE/Apple auth는 08에서 완료됐다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 Backend 변경을 하지 않는다.

- `NotificationSourceType` 확장
- `NotificationType` 확장
- next action reminder scheduling use case 추가
- MeetingNote follow-up reminder scheduling use case 추가
- Follow-up 자동 발송 worker 추가
- Company/Contact/Product list summary API field 추가
- MeetingNote list summary API field 추가
- AI data cleanup 제안 저장/적용 API 추가
- MeetingNote transcript/raw provider response/follow-up draft 저장 또는 조회 API 추가
- 대용량 import worker API 추가
- 일정/회의록 import API 추가
- ImportJob Admin 전용 API 추가
- generic ExportJob API 추가
- billing/paywall/churn API 추가
- User locale/country/currency 허용값 확장
- Contact phone country 확장
- Company region country 확장 또는 국가별 상세 주소 validation 추가
- Product/Deal amount minor unit 전환
- email/password, Microsoft, Kakao runtime, 신규 auth provider 추가

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 API contract 확정 대상으로 올리지 않는다.

08 재대조 기준으로 Google/LINE/Apple 외 provider, `/app` locale prefix, 추가 국가/통화/전화번호 포맷은 새 계약 없이 확장하지 않는다. 국가별 tax/terms/pricing과 amount precision은 12 Billing 결정 전 Backend API 작업으로 올리지 않는다.

## 4. 후보별 Backend 영향

| 후보 | 예상 Backend 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | Notification source/setting/scheduler/dedupe/cancel rule 확정 필요 | Question |
| 회의록 follow-up reminder | MeetingNote source, follow-up draft/send 상태, notification rule 확정 필요 | post-12-seed |
| MeetingNote 자동 발송 | consent, retry, unsubscribe, send policy, provider cost policy 필요 | post-12-seed |
| record summary | 기존 list API field 추가 또는 별도 summary endpoint, redaction 기준 필요 | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| AI data cleanup | cleanup suggestion 생성/적용/rollback API, audit log, ownership/redaction 기준 필요 | post-12-seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 | retention, 삭제권, raw access audit, redaction, Admin/User 노출 기준 필요 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | worker queue/status/cancel/retry, schedule/meeting-note source mapping, Admin 조회/cleanup API 기준 필요 | post-12-seed |
| provider smoke | 새 API 없음. 운영 환경과 runbook 기록만 필요 | pre-12-follow-up-needed |
| App locale 확장 | `preferredLocale` 허용값, validation error, app translation delivery 기준 확정 필요 | post-12-seed |
| Global country/currency/phone 확장 | User/Contact/Company/Product/Deal validation과 import/export/report 변환 기준 필요 | post-12-seed |
| amount precision/minor unit | Product/Deal amount 저장 단위, 기존 row migration, import/export/report 호환 기준 필요 | billing-blocked |
| address/tax/terms/pricing policy | 청구 주소, 세금, 약관, 가격 정책과 API 경계 확정 필요 | billing-blocked |
| auth strategy 확장 | password reset, email verification, provider linking, account recovery, abuse/rate limit 기준 필요 | defer / 정책 필요 |
| app i18n/Settings/bundle polish | 새 Backend API 없음. 필요 시 FE 유지보수만 검토 | post-12-seed / UXUI quality |

## 5. 권장 검색 명령

```powershell
rg -n "enum NotificationSourceType|model Notification|model UserNotificationSetting|model NotificationDeliveryAttempt" BE\prisma\schema.prisma
rg -n "NotificationSourceType|schedule.*reminder|deal.*reminder|NEXT_ACTION|MEETING_NOTE|FOLLOW_UP" BE\src -g "*.ts"
rg -n "@Controller" BE\src\modules\notification BE\src\modules\deal BE\src\modules\meeting-note BE\src\modules\follow-up -g "*.controller.ts"
rg -n "SUPPORTED_LOCALES|SUPPORTED_COUNTRY_CODES|SUPPORTED_CURRENCY_CODES|SUPPORTED_CONTACT_PHONE_COUNTRY_CODES|COMPANY_REGION_COUNTRY_CODES" BE\src -g "*.ts"
rg -n "ExternalAuthProvider|OAuthProvider|normalizeProvider" BE\src\modules\auth BE\src\shared -g "*.ts"
```

## 6. 관련 문서

- `../COMMON/API-SPEC/README.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
