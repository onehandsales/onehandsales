# Candidate Matrix

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 01~11 완료 슬롯 재대조에서 나온 후속 후보를 한 표로 관리한다. 이 표는 구현 지시가 아니라 분류 기준이다.

## 2. 후보 표

| ID | 후보 | 출처 | 현재 코드/문서 사실 | 기본 분류 | 다음 조치 |
| --- | --- | --- | --- | --- | --- |
| PRE12-F01 | 다음 행동 reminder | 02 제외, 06에서 재설계 언급 | Notification source는 `SCHEDULE`, `DEAL`만 있다. 06의 다음 행동 범위는 Notification reminder가 아니라 DealActivity `NEXT_ACTION_CREATED/COMPLETION_CHANGED` 기록이다. | Question | G00에서 12 전 처리 여부 결정. 결정 전 구현 금지. |
| PRE12-F02 | 회의록 follow-up reminder | 02 제외, 07에서 후속 언급 | 07은 follow-up draft만 만들고 자동 발송/알림/DB 저장을 제외했다. | post-12-seed | G03에서 계약 후보만 정리. 구현 금지. |
| PRE12-F03 | MeetingNote follow-up 자동 발송 | 05/07 후속 | 05는 사용자가 확인 후 발송하는 follow-up delivery를 제공한다. 07은 초안만 반환한다. | post-12-seed | 자동 발송 정책, 수신 동의, retry, 취소, 알림 정책 필요. |
| PRE12-F04 | Gmail/Microsoft provider smoke | 05 G10 | Gmail/Microsoft adapter와 자동 검증은 완료됐다. 운영 credential/callback/allowlist 실제 수신자 smoke는 미실행 상태다. | pre-12-follow-up-needed | G05에서 운영 smoke 실행 조건과 결과 기록. |
| PRE12-F05 | SMS 실제 provider | 05 G10 제외 | SMS sender verification UI/API foundation은 있으나 실제 SMS provider는 제외됐다. | post-12-seed | SMS 비용, 국가, 발신자 정책 결정 후 별도 계획. |
| PRE12-F06 | B2B sender/email sync/sequence/campaign | 05 G10 제외 | G10은 Gmail/Microsoft send adapter만 닫는다. | post-12-seed | Growth/B2B 정책 후 별도 계획. |
| PRE12-F07 | Company/Contact/Product latest summary | NBA-003 잔여, 06 제외 | 06은 Deal list `latestActivity`만 완료했다. 2026-08-06 A 결정으로 06 완료 범위를 재오픈하지 않는다. | defer | 12 전 G04 계약화와 구현은 하지 않는다. post-12 B2B/team CRM strategy seed로 재검토한다. |
| PRE12-F08 | MeetingNote list latest/next summary | NBA-004 잔여, 07 제외 | 07은 상세 next action/follow-up draft만 완료했다. list response에는 `latestSummary`, `nextActionSummary`가 없다. | post-12-seed | 12 전 구현하지 않는다. raw text 제외 계약은 post-12 필요성이 확인될 때만 만든다. |
| PRE12-F09 | generic ExportJob/PDF | 03/11 후속 | 03은 sync Excel만 완료했고 generic ExportJob/PDF는 제외됐다. | post-12-seed | Trust/policy, file TTL, audit, Admin queue와 함께 재검토. |
| PRE12-F10 | Google Calendar write/watch/recurrence | 03/04 후속 | 04는 read-only import/sync만 완료했다. write, webhook, recurrence는 제외됐다. | post-12-seed | Calendar 정책과 conflict resolution 결정 필요. |
| PRE12-F11 | backup/restore runbook/drill | NBA-014/data reliability | 11 Admin system gate는 운영 결과 기록이지 shell 실행/운영 drill runbook이 아니다. | post-12-seed | 운영 절차 문서로 승격할지 재검토. |
| PRE12-F12 | billing/paywall/churn/paid conversion | 09/11/12 연결 | 09는 reserved taxonomy, 11은 Admin operation만 완료했다. | billing-blocked | 12 전 구현 금지. |
| PRE12-F13 | Import scale/source/Admin 확장 | 01 제외 | 01은 회사/담당자/제품/딜 import와 10MB/5,000 data row 제한, 보관/삭제/복구 기준으로 완료됐다. 대용량 worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 최종형 밖이다. | post-12-seed | 12 전 구현하지 않는다. post-12 product scale/Admin ops/import source 전략에서 새 TODO 승격 여부를 판단한다. |
| PRE12-F14 | AI data cleanup 제안 저장/적용 | 07 제외, USER_WEB productization gap | 07은 data cleanup suggestion을 1차 제외했다. 05 AI weekly report에는 저장형 report suggestion이 있으나 MeetingNote cleanup 적용 흐름은 없다. | post-12-seed / 별도 data quality 계획 | 09 Product Analytics 또는 별도 data quality TODO에서 권한, 적용, 감사 로그, rollback 기준을 먼저 정한다. |
| PRE12-F15 | MeetingNote transcript/raw provider response/follow-up draft 저장 | NBA-011 원본 후보, 07 명시 제외 | 07은 전용 transcript/follow-up draft/raw provider response table을 만들지 않고 공통 `AiProviderCallLog` safe metadata만 남긴다. | defer / 정책 필요 | retention, 삭제권, raw access audit, redaction 정책 없이는 구현 금지. |
| PRE12-F16 | MeetingNote Admin/internal provider audit 조회 | NBA-011, USER_WEB gap | Admin provider failure 조회와 raw access audit 기준은 11 Admin Operation에서 완료됐다. | done | 07 또는 PRE12에서 재구현하지 않는다. 11 완료 문서를 참조한다. |
| PRE12-F17 | `/app` `ja`, `zh-TW` 번역과 시장별 UX writing | 08 제외, USER_WEB productization gap | public/auth는 `ja`, `zh-TW` locale URL/copy가 있지만 `/app` i18n은 `ko-KR`, `en`만 지원한다. | post-12-seed | 일본/대만 판매 준비 goal에서 시장, 용어, QA 범위를 확정한 뒤 진행한다. |
| PRE12-F18 | `zh-CN` 중국 본토 지원 | 08 결정 로그 | 08은 `zh-CN`을 현재 글로벌 후보로 보지 않았다. 코드도 `/app` locale에 `zh-CN`을 포함하지 않는다. | defer / 시장 진입 결정 필요 | 중국 본토 시장, 인프라, 정책, 결제/세금 기준이 정해지기 전 구현 금지. |
| PRE12-F19 | 전 세계 국가/통화/전화번호 확장 | 08 제외, USER_WEB/NEXT backlog | 현재 Backend/Frontend는 `KR/US`, `KRW/USD`, `ko-KR/en`으로 좁혀져 있다. | post-12-seed | 실제 판매 국가와 운영 지원 국가를 확정한 뒤 country/currency/phone dictionary와 migration 전략을 새 TODO로 만든다. |
| PRE12-F20 | USD cent/minor unit과 금액 정밀도 | 08 제외 | Product/Deal 금액은 `Int` 정수와 `currencyCode`를 사용한다. export/report도 정수 금액 정책을 따른다. | billing-blocked / amount-precision 후속 | 12 Billing money model, invoice/tax 표시, 기존 금액 migration 기준이 정해지기 전 구현 금지. |
| PRE12-F21 | 국가별 상세 주소 검증 | 08 제외, USER_WEB productization gap | Company는 free address와 KR/US region code만 사용한다. Contact 주소는 없다. | billing-blocked / post-12-seed | 세금/약관/청구 주소 또는 주소 품질 요구가 확정될 때 validation과 UX를 설계한다. |
| PRE12-F22 | Contact 개인 주소 | 08 결정 로그 | 08은 Company에만 주소/지역을 적용했고 Contact에는 주소 필드를 추가하지 않았다. | post-12-seed / CRM 확장 | 개인 주소가 실제 CRM workflow 요구로 확정될 때 별도 Contact data expansion으로 판단한다. |
| PRE12-F23 | Auth strategy 확장 | 08 제외, NEXT backlog | 런타임 provider는 Google/LINE/Apple이다. 이메일/비밀번호, Microsoft login, Kakao runtime 복구는 없다. | defer / auth strategy 필요 | 보안, 계정 복구, 약관, provider 운영 정책을 확정하기 전 추가 provider 또는 password auth 구현 금지. |
| PRE12-F24 | `/app` locale route prefix | 08 guardrail | 현재 `/app` route는 locale prefix 없이 `/app/*`만 사용한다. public/auth locale routing과 app i18n은 분리돼 있다. | defer / guardrail | 새 라우팅 계약 없이 `/:locale/app` 또는 `/ko/app` 구조를 만들지 않는다. |
| PRE12-F25 | app i18n 직접 keying, OAuth 계정 라벨, bundle 최적화 polish | 08 G09/G10, 실제 FE 코드 재대조 | 핵심 `/app` 화면은 app i18n resource와 legacy static fallback으로 동작한다. Settings OAuth account label은 `line/apple`이 raw 값으로 보일 수 있고, Vite large chunk warning은 기존 후속으로 남았다. | post-12-seed / UXUI quality | 08 완료를 재오픈하지 않고 UX/UI 제품화 유지보수 또는 bundle optimization 계획에서 처리한다. |

## 3. 06과 직접 충돌하는 후보

아래 후보는 06 작업에 끼워 조정하면 안 된다.

| 후보 | 06에서 가능한 것 | 06에서 금지 |
| --- | --- | --- |
| 다음 행동 reminder | 다음 행동 생성/완료 변경을 DealActivity로 기록 | Notification scheduling, due processor, reminder setting 추가 |
| 회의록 follow-up reminder | 회의록 연결/해제를 DealActivity로 기록 | MeetingNote 기반 Notification 생성 |
| follow-up sent/failed | Deal target follow-up delivery attempt를 safe summary로 기록 | follow-up body 전체, provider raw, 연락처 원문을 summary/log에 저장 |
| record summary | Deal list `latestActivity` 유지 | Company/Contact/Product/MeetingNote list summary를 몰래 추가 |

## 4. 07과 직접 충돌하는 후보

아래 후보는 07 완료 범위를 넓히지 않고 PRE12 후보로만 남긴다.

| 후보 | 07에서 완료된 것 | 07/PRE12에서 금지 |
| --- | --- | --- |
| MeetingNote list summary | 상세 next action/follow-up draft | list `latestSummary`, `nextActionSummary` API/FE 추가 |
| follow-up reminder/자동 발송 | 사용자가 확인/수정/복사하는 follow-up draft | 자동 발송, 자동 알림, draft 저장 상태 추가 |
| AI data cleanup | provider log와 safe draft UX | cleanup suggestion 저장/적용 API 추가 |
| transcript/raw storage | STT transcript 임시 표시, safe metadata log | transcript/raw provider response/follow-up draft table 추가 |
| Admin provider audit | 11 Admin Operation에서 완료 | 07 또는 PRE12에서 Admin audit를 재구현 |

## 5. 08과 직접 충돌하는 후보

아래 후보는 08 완료 범위를 넓히지 않고 PRE12 후보 또는 guardrail로만 남긴다.

| 후보 | 08에서 완료된 것 | 08/PRE12에서 금지 |
| --- | --- | --- |
| app locale 확장 | `/app` `ko-KR`, `en` i18n foundation/resource/formatter와 legacy static fallback | `ja`, `zh-TW`, `zh-CN`을 08 완료 범위로 끼워 넣기 |
| 글로벌 데이터 확장 | User global settings, KR/US phone/region, KRW/USD currency | 전 세계 country/currency/phone dictionary를 계약 없이 추가 |
| 금액 정밀도 | Product/Deal `Int` 금액과 `currencyCode` | 12 money model 없이 USD cent/minor unit migration 추가 |
| 주소/세금/가격 정책 | Company free address와 KR/US region code | 국가별 tax/terms/pricing/address validation을 08 후속으로 우회 구현 |
| auth provider | Google/LINE/Apple runtime provider와 Kakao legacy 호환 | 이메일/비밀번호, Microsoft, Kakao runtime 복구, 신규 provider 추가 |
| app route | `/app/*` 고정 route | `/app` locale prefix 추가 |

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/README.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/DECISION-LOG.md`
