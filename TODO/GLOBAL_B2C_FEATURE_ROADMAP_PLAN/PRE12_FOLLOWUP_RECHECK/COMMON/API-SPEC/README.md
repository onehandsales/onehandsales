# API Spec

상태: Draft / confirmed API 없음
작성일: 2026-08-06

## 1. 목적

이 폴더는 `PRE12_FOLLOWUP_RECHECK`에서 생길 수 있는 API 후보의 계약 상태를 관리한다.

현재 이 계획에는 바로 구현 가능한 confirmed API가 없다. 아래 후보는 모두 contract 작업 전용이다.

## 2. 후보 API 계약 상태

| 후보 | 예상 API 방향 | 상태 | 구현 가능 여부 |
| --- | --- | --- | --- |
| 다음 행동 reminder | Notification source 확장 또는 NextAction reminder 전용 endpoint/setting | draft placeholder | 구현 금지 |
| 회의록 follow-up reminder | MeetingNote 기반 follow-up reminder 생성/취소/목록 | draft placeholder | 구현 금지 |
| MeetingNote follow-up 자동 발송 | Follow-up delivery 예약/자동 발송/취소/재시도 | post-12-seed | 구현 금지 |
| Company/Contact/Product latest summary | 기존 list response field 추가 또는 summary endpoint | defer | 12 전 계약화/구현 금지. 비고: 2026-08-06 A 결정, post-12 B2B/team CRM strategy seed. |
| MeetingNote list latest/next summary | `GET /api/meeting-notes` response field 추가 또는 별도 summary endpoint | post-12-seed | 12 전 구현 금지 |
| AI data cleanup 제안 저장/적용 | MeetingNote/record cleanup suggestion 생성, 적용, 되돌리기 | post-12-seed / 별도 data quality 계획 | 구현 금지 |
| MeetingNote transcript/raw/follow-up draft 저장/조회 | transcript, provider raw response, follow-up draft body 저장 또는 raw access API | defer / 정책 필요 | 구현 금지 |
| Import scale/source/Admin 확장 | 대용량 import worker API, 일정/회의록 import source API, ImportJob Admin 전용 API | post-12-seed | 12 전 구현 금지 |
| Gmail/Microsoft provider smoke closeout | 새 API 없음 | not applicable | 운영 smoke 기록만 가능 |
| App locale 확장 | User profile locale 허용값, app translation resource delivery 방식 검토 | post-12-seed | `ja`, `zh-TW`, `zh-CN` 구현 금지 |
| Global country/currency/phone 확장 | User country/default currency, Contact phone, Company region dictionary 확장 계약 | post-12-seed | 12 전 구현 금지 |
| Amount precision/minor unit | Product/Deal amount 저장 단위, import/export/report 변환 계약 | billing-blocked | 12 money model 전 구현 금지 |
| Country address/tax/terms/pricing policy | billing/tax/policy API 또는 address validation API | billing-blocked | 12 전 구현 금지 |
| Auth strategy 확장 | email/password, Microsoft, Kakao runtime, 신규 provider 계약 | defer / 정책 필요 | 구현 금지 |
| `/app` locale route prefix | User API path 변경 없음. FE routing contract 이슈 | defer / guardrail | 새 라우팅 계약 없이 구현 금지 |
| app i18n/Settings/bundle polish | 새 API 없음 | post-12-seed / UXUI quality | API 구현 대상 아님 |
| account deletion 실제 hard delete/anonymization | 30일 유예 만료 request 처리, session revoke/access block, hard delete/anonymization, audit/result contract | Question / 정책 필요 | 구현 금지 |
| Product analytics 세부 event 확장 | Notification/Calendar/follow-up delivery/click/reach/sync/detail event taxonomy와 payload allowlist | post-12-seed / 별도 analytics 계획 | 구현 금지 |
| external analytics provider forwarding | Backend provider forwarding adapter/outbox/retry 또는 FE SDK 삽입 방식 결정 | post-12-seed / growth/ops | 구현 금지 |
| public site/UTM/ad attribution/growth experiment | public route event, attribution cookie/referrer policy, experiment assignment API | post-12-seed / growth/marketing | 구현 금지 |
| AI usage billing source/paywall runtime | `AiUsageDaily` 또는 `UsageMeter`, plan/quota/paywall/upgrade event contract | billing-blocked | 12 전 구현 금지 |
| PWA/native packaging과 install attribution | install/offline/full offline sync/native push/contact/calendar/native app install attribution API 필요 여부 결정 | post-12-seed / 별도 mobile roadmap | 구현 금지 |
| 10 FE/BE TODO 체크리스트 정합성 | 새 API 없음. 완료 체크리스트 문서 정리만 대상 | pre-12-doc-cleanup | API 구현 대상 아님 |
| User Web route/architecture 문서 정합성 | 새 API 없음. 실제 route 기준 문서 정리만 대상 | pre-12-doc-cleanup | API 구현 대상 아님 |
| generic ExportJob/PDF | `/api/exports`, `ExportJob`, export file TTL/ownership/audit contract | post-12-seed | 12 전 구현 금지 |
| 11 Admin 문서 체크리스트/goal index 정합성 | 새 API 없음. 완료 체크리스트와 goal index 문서 정리만 대상 | pre-12-doc-cleanup | API 구현 대상 아님 |
| Admin Web architecture 문서 정합성 | 새 API 없음. 실제 Admin route/API 기준 architecture 문서 정리만 대상 | pre-12-doc-cleanup | API 구현 대상 아님 |
| Admin 직접 Trash 복구/유료 복구/hard delete/purge | Admin restore mutation, paid recovery payment, purge/hard delete API가 필요할 수 있으나 정책 미확정 | Question / 정책 및 billing 필요 | 구현 금지 |
| User data export artifact/download endpoint | artifact 생성 processor, signed URL, `GET /api/users/me/data-export-requests/:requestId/download` 또는 `/api/exports` 계약 필요 | post-12-seed / `PRE12-F09` 연결 | 12 전 구현 금지 |
| 자동 민감정보 감지 | PII/DLP scan API/worker 또는 저장 시 detection hook 필요 여부 결정 | defer / 정책 필요 | 구현 금지 |

## 3. API 계약을 만들 때 필수로 채울 항목

새 API 계약을 confirmed로 올리기 전에는 아래를 모두 채운다.

- API 이름과 생명주기
- 소비자
- method/path
- path param, query, header, body
- request DTO 이름과 validation
- success status와 response DTO
- error code와 사용자 표시 기준
- 인증, 권한, ownership
- transaction 필요 여부와 rollback 범위
- provider 호출 여부와 호출 위치
- observability event key, audit log 필요 여부, redaction 기준
- 연결 Prisma model, enum, index, retention 기준
- FE 처리 기준과 optimistic update 여부

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/USER_GLOBAL_SETTINGS_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/AUTH_PROVIDER_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/IMPORT_EXPORT_LOCALIZATION_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/PRODUCT_ANALYTICS_EVENT_API.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC`
