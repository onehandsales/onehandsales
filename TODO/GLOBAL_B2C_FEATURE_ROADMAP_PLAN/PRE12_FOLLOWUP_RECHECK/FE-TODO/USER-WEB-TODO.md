# User Web Todo

상태: Draft / confirmed User Web 작업 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 후속 후보가 User Web에 어떤 영향을 줄 수 있는지 기록한다. 현재 이 계획만으로 새 화면, route, API client, state를 만들지 않는다.

## 2. 현재 기준

| 영역 | 현재 기준 |
| --- | --- |
| Notification | `/app/notifications`, notification settings, browser push 설정은 02 범위로 완료됐다. |
| Weekly report | `/app/schedules/week`와 Excel export는 03 범위로 완료됐다. |
| Google Calendar | `/app/schedules`, `/app/settings`, schedule detail source badge/sync/status는 04 범위로 완료됐다. |
| AI weekly report/follow-up | `/app/schedules/week` AI report section, `/app/settings` follow-up delivery settings, compose/send/retry UX는 05 범위로 구현됐다. |
| DealActivity | deal list `latestActivity`, deal detail activity timeline은 06 범위다. |
| MeetingNote AI | meeting note detail AI next action/follow-up draft section은 07 범위다. STT transcript는 생성 흐름의 임시 확인용이고 저장/목록/상세 summary 대상이 아니다. |
| Import | `/app/import` review/resume, row detail 만료 안내, 10MB/5,000행 제한 안내는 01 범위로 완료됐다. |
| Global Data I18N | `/app` `ko-KR/en`, Settings global profile, Product/Deal currency, Contact KR/US phone, Company KR/US region/address, Import/Export localization, Google/LINE/Apple auth는 08 범위로 완료됐다. |
| Product Analytics | User Web analytics helper, `/app` route view hook, mobile field-use client event, `VITE_PRODUCT_ANALYTICS_ENABLED` gate가 있다. analytics 실패는 사용자-facing UI로 표시하지 않는다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 User Web 변경을 하지 않는다.

- 다음 행동 reminder 설정 UI 추가
- MeetingNote follow-up reminder UI 추가
- follow-up 자동 발송 toggle 추가
- Company/Contact/Product latest summary를 API 없이 FE에서 조합 표시
- MeetingNote list latest/next summary를 API 없이 FE에서 조합 표시
- AI data cleanup 제안 저장/적용 UI 추가
- transcript 원문, follow-up draft 저장 상태, provider raw response를 User Web에 표시
- 대용량 import worker UI 추가
- 일정/회의록 import source UI 추가
- ImportJob Admin 전용 화면 추가
- generic ExportJob/PDF/export route 추가
- billing/paywall/churn UI 추가
- `/app` `ja`, `zh-TW`, `zh-CN` translation 추가
- `/app` locale route prefix 추가
- 전 세계 country/currency/phone option 추가
- Product/Deal amount minor unit 입력 전환
- 국가별 상세 주소 validation UI 또는 Contact 개인 주소 UI 추가
- email/password, Microsoft, Kakao runtime, 신규 auth provider 버튼 추가
- account deletion 실제 hard delete/anonymization 실행 UI 추가
- Notification/Calendar/follow-up 세부 analytics event를 화면별로 임의 추가
- 외부 analytics provider SDK/script 삽입
- public site/UTM/ad attribution, campaign attribution, experiment assignment UI 추가
- billing/paywall/churn/AI quota 사용량 UI를 12 전 추가
- PWA install/offline shell/native app/native install attribution UI 추가

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 User Web 작업으로 올리지 않는다. UX/UI 전체 polish는 별도 전면 유지보수 계획에서 다룬다.

08 재대조 기준으로 `/app` 기본 Global Data I18N은 완료다. market locale 확장, country/currency/phone 확장, auth strategy 확장, Settings OAuth 계정 라벨과 bundle 최적화는 08 blocker가 아니다.

09 재대조 기준으로 Product Analytics User Web foundation은 완료다. 신규 사용자-facing analytics 화면, external provider SDK, billing/paywall/churn UI, public attribution, PWA/native install flow는 09 미완성이 아니라 PRE12 후속 후보 또는 12 이후 계획으로 둔다.

## 4. 후보별 FE 영향

| 후보 | 예상 FE 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | notification settings, next action form, deal detail 상태 표시 | Question |
| 회의록 follow-up reminder | meeting note detail/list, notification settings, follow-up draft 상태 표시 | post-12-seed |
| record summary | Company/Contact/Product/MeetingNote list item summary 위치와 empty fallback | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| AI data cleanup | cleanup suggestion 확인/적용/되돌리기 UX, 적용 전 diff 표시 | post-12-seed / 별도 data quality 계획 |
| transcript/raw/follow-up draft 저장 표시 | transcript 보관 상태, raw access 안내, draft 저장/발송 상태 | defer / 정책 필요 |
| Import scale/source/Admin 확장 | 대용량 import progress, 일정/회의록 source mapping, Admin-only job cleanup/조회 화면 | post-12-seed |
| provider smoke | 화면 변경 없음. 운영 smoke 결과 문서 반영 | pre-12-follow-up-needed |
| App locale/market UX 확장 | `/app` `ja`, `zh-TW` resource, validation/empty/toast copy, market UX writing QA | post-12-seed |
| `zh-CN` 지원 | public/auth/app locale, market routing, policy copy, 결제/세금/인프라 요구 확인 | defer / 시장 진입 결정 필요 |
| Global country/currency/phone 확장 | Settings option, Contact phone UI, Company region selector, Product/Deal currency selector 확장 | post-12-seed |
| amount precision/minor unit | 금액 입력/표시/import/export/report 호환 UX 변경 | billing-blocked |
| address/tax/terms/pricing policy | 청구 주소, 세금/약관/가격 표시 UX | billing-blocked |
| Contact personal address | Contact create/edit/detail/list/export UX 확장 | post-12-seed / CRM 확장 |
| Auth strategy 확장 | email/password, Microsoft, Kakao runtime, 신규 provider 버튼과 오류 UX | defer / 정책 필요 |
| `/app` locale route prefix | router, legacy redirect, auth callback, deep link 전체 변경 필요 | defer / guardrail |
| i18n/Settings/bundle polish | legacy static fallback 직접 keying, Settings OAuth account `LINE/Apple` 라벨, Vite chunk split | post-12-seed / UXUI quality |
| account deletion 실제 처리 | 삭제 예정 상태 표시, access block, session 종료, 처리 완료/실패 UX 기준 필요 | Question / 정책 필요 |
| Product analytics 세부 event 확장 | Notification/Calendar/follow-up 화면의 click/reach/sync/detail tracking 위치와 payload privacy 기준 필요 | post-12-seed / 별도 analytics 계획 |
| external analytics provider forwarding | FE SDK를 직접 넣을지, Backend forwarding만 사용할지, consent/banner/DNT 기준 결정 필요 | post-12-seed / growth/ops |
| public/UTM attribution/growth experiment | public/auth route attribution, campaign parameter 보존, experiment assignment 표시/노출 기준 필요 | post-12-seed / growth/marketing |
| AI usage billing source/paywall UI | 12의 plan/quota/paywall/upgrade contract와 API 필요 | billing-blocked |
| PWA/native packaging과 attribution | install prompt, offline shell, native app deep link, install attribution UX 기준 필요 | post-12-seed / 별도 mobile roadmap |

## 5. UX 기준

- list item에 없는 API 정보를 FE에서 사실처럼 만들지 않는다.
- reminder나 자동 발송처럼 사용자 신뢰에 영향을 주는 기능은 명시적 상태, 취소, 실패, 재시도 기준이 먼저 있어야 한다.
- 모바일에서는 table 확장이 아니라 card/list summary 기준을 우선 검토한다.
- private memo, meeting note raw text, follow-up body 전체를 list summary에 노출하지 않는다.
- transcript 원문과 provider raw response는 저장 정책이 확정되기 전까지 UI에 장기 보관 상태로 표현하지 않는다.
- public/auth locale이 있다고 해서 `/app` locale 지원이 완료된 것으로 간주하지 않는다.
- `/app` route는 새 routing contract 전까지 `/app/*`를 유지한다.
- analytics event는 payload allowlist와 privacy contract 없이 화면 컴포넌트에서 임의로 추가하지 않는다.
- analytics 실패는 사용자 작업을 막거나 toast/modal/banner로 노출하지 않는다.
- external analytics SDK/script는 consent/privacy/DPA 기준 없이 User Web에 삽입하지 않는다.
- account deletion 실제 처리와 billing/paywall/churn은 12/정책 결정 전 표시하지 않는다.

## 6. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `../COMMON/CANDIDATE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/USER-FLOW.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/FE-TODO/USER-WEB-TODO.md`
