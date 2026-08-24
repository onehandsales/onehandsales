# Final Classification

상태: Final / DONE / PRE12 closeout 완료 / Billing moved to `TODO/PADDLE_PLAN`
작성일: 2026-08-07
최종 업데이트: 2026-08-11
기준 문서: `TODO/PADDLE_PLAN`

## 1. 목적

이 문서는 `PRE12_FOLLOWUP_RECHECK`에 모인 01~11 후속 후보를 기존 Billing 착수 전에 최종 분리한 완료 이력을 보존한다.

후속 작업 분류는 아래 세 축만 사용한다. 이미 완료된 항목은 이 세 축에 넣지 않고 완료 참조로 따로 기록한다.

| 분류 | 의미 |
| --- | --- |
| BEFORE_12에서 닫힌 것 | Paddle Billing 착수 전에 닫을 수 있었던 운영 smoke 또는 문서 정합성 작업. 새 제품 기능, API, DB migration, FE route 추가는 포함하지 않는다. |
| 후속 seed | Global roadmap closeout 이후 새 TODO 폴더 또는 별도 유지보수/제품화 계획에서 다시 판단할 후보. |
| billing 충돌 / Paddle 종속 | plan, payment, subscription, entitlement, tax, invoice, refund, failed payment, paywall, churn, paid recovery, paid conversion, AI usage billing source와 충돌하거나 Paddle/Billing 결정이 선행되어야 하는 후보. |

이 분류는 기능 구현 지시가 아니다. 현재 PRE12에는 confirmed API, confirmed migration, confirmed FE 구현 작업이 없다.

## 2. 결론 요약

| 최종 분류 | 후보 ID |
| --- | --- |
| PRE12에 닫힌 것 | `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34` |
| 후속 seed | `PRE12-F01`, `PRE12-F02`, `PRE12-F03`, `PRE12-F05`, `PRE12-F06`, `PRE12-F07`, `PRE12-F08`, `PRE12-F09`, `PRE12-F10`, `PRE12-F11`, `PRE12-F13`, `PRE12-F14`, `PRE12-F15`, `PRE12-F17`, `PRE12-F18`, `PRE12-F19`, `PRE12-F22`, `PRE12-F23`, `PRE12-F24`, `PRE12-F25`, `PRE12-F27`, `PRE12-F28`, `PRE12-F29`, `PRE12-F30`, `PRE12-F36`, `PRE12-F37`, `PRE12-F38`, `PRE12-F39`, `PRE12-F40`, `PRE12-F42`, `PRE12-F43`, `PRE12-F44`, `PRE12-F45` |
| billing 충돌 / Paddle 종속 | `PRE12-F12`, `PRE12-F20`, `PRE12-F21`, `PRE12-F26`, `PRE12-F35`, `PRE12-F41` |

따라서 PRE12에서 새 기능으로 착수할 후보는 없다. Provider smoke와 문서 정합성은 BEFORE_12에서 모두 닫혔고, PRE12-F04는 2026-08-10 배포 환경 smoke verified 기준으로 승격됐다. 2026-08-10 Admin provider failure 목록 cursor pagination 편중 누락 Finding도 11 품질 보정으로 해결했다. billing 종속 후보는 `TODO/PADDLE_PLAN`으로 이관했고, 그 외 제품 기능 후보는 필요성이 확인될 때 새 TODO에서 다시 다룬다.

분류 제외 완료 참조: `PRE12-F16`

## 2A. 2026-08-09/2026-08-10 Closeout 반영

| 후보 | closeout 반영 |
| --- | --- |
| `PRE12-F04` | BEFORE_12 G01에서 provider smoke closeout을 2026-08-10 배포 환경 verified 기준으로 완료 처리했다. |
| `PRE12-F31` | BEFORE_12 G02에서 10 FE/BE TODO 체크리스트 정합성을 닫았다. |
| `PRE12-F32` | BEFORE_12 G03에서 User Web route/architecture 정합성을 닫았다. |
| `PRE12-F33` | BEFORE_12 G04에서 11 Admin 문서 체크리스트/goal index 정합성을 닫았다. |
| `PRE12-F34` | BEFORE_12 G05에서 Admin Web architecture/legacy route 정합성을 닫았다. |
| G99 | BEFORE_12 G06와 이 문서 갱신으로 PRE12 closeout 및 상위 문서 반영을 닫았다. 2026-08-10 Admin provider failure pagination 보정 결과도 반영했다. |

PRE12에는 새 API, Prisma migration, User Web route, Admin Web route, 후속 TODO 생성 작업이 남아 있지 않다.

## 3. PRE12에 닫힌 것

| 후보 | 작업 | 허용 범위 | 금지 |
| --- | --- | --- | --- |
| `PRE12-F04` | Gmail/Microsoft provider smoke closeout | 운영 credential, callback URL, allowlist 기준으로 실제 수신자 smoke를 실행하고 결과를 문서에 기록한다. | 새 email API, 새 provider, SMS vendor, sequence/campaign, scheduled send 구현 |
| `PRE12-F31` | 10 Mobile Field Use 문서 체크리스트 정합성 | 10 README/G07 closeout/실제 코드 기준으로 미체크 문서를 정리한다. | 10 기능 재구현, PWA/offline/native, server draft, `/api/exports` 추가 |
| `PRE12-F32` | User Web route/architecture 문서 정합성 | 실제 `/app/notifications` 활성, `/app/export` redirect 상태를 FE architecture 문서와 맞춘다. | stale 문서에 맞춰 `/app/notifications`를 숨기거나 route를 되돌림 |
| `PRE12-F33` | 11 Admin Operation 문서 체크리스트/goal index 정합성 | 11 README/G10 closeout/실제 코드 기준으로 checklist와 goal index를 정리한다. | 11 Admin 기능 재구현, Admin route/API rollback |
| `PRE12-F34` | Admin Web architecture/legacy route 정합성 | 실제 11 Admin route/API와 `/organizations`, `/subscriptions`, `/support` redirect 상태를 문서에 반영하고 legacy 잔여 코드 방향을 정리한다. | Billing Admin, customer tenant admin, legacy `admin-query` route/API를 활성화 |

## 4. 후속 seed

아래 후보는 PRE12나 Global roadmap 안에서 구현하지 않는다. 필요성이 확인되면 새 TODO 폴더 또는 별도 유지보수/제품화 계획에서 우선순위를 다시 판단한다.

| 후보 | 후속 seed로 보내는 이유 |
| --- | --- |
| `PRE12-F01` | 다음 행동 reminder는 Notification source/setting/scheduler 정책을 새로 요구한다. PRE12 필수 closeout이 아니다. |
| `PRE12-F02` | 회의록 follow-up reminder는 07 완료 범위를 넓히는 알림 정책 후속이다. |
| `PRE12-F03` | MeetingNote follow-up 자동 발송은 수신 동의, 취소, retry, audit, provider 정책이 필요하다. |
| `PRE12-F05` | SMS 실제 provider는 국가, 비용, 발신자 인증, provider 운영 정책 후속이다. |
| `PRE12-F06` | B2B sender, email sync, campaign, unsubscribe, scheduled send, SMTP/HTML/첨부/tracking은 growth/compliance 후속이다. |
| `PRE12-F07` | Company/Contact/Product latest summary는 2026-08-06 A 결정에 따라 B2B/team CRM 성격의 후속 seed다. |
| `PRE12-F08` | MeetingNote list summary는 raw text redaction과 list contract가 필요한 후속 후보다. |
| `PRE12-F09` | generic ExportJob/PDF는 file TTL, audit, ownership, Admin queue와 함께 별도 export 계획이 필요하다. |
| `PRE12-F10` | Google Calendar write/sync/watch/recurrence/reminder/attendee/multi-account/other provider는 별도 calendar strategy가 필요하다. |
| `PRE12-F11` | backup/restore runbook/drill은 운영 절차 후보이며 PRE12 기능 구현 대상이 아니다. |
| `PRE12-F13` | import scale/source/Admin 확장은 대용량 worker, source strategy, Admin ops 전략이 필요하다. |
| `PRE12-F14` | AI data cleanup 저장/적용은 data quality, audit, rollback 정책이 필요하다. |
| `PRE12-F15` | transcript/raw/follow-up draft 저장은 retention, 삭제권, raw access audit 정책이 필요하다. |
| `PRE12-F17` | `/app` 보류 locale 번역은 KR/US/CA 우선 검증 이후 보류 시장 판매 준비 goal에서 다시 판단한다. |
| `PRE12-F18` | `zh-CN`은 중국 본토 시장, 인프라, 정책 결정이 필요하다. |
| `PRE12-F19` | 전 세계 country/currency/phone 확장은 KR/US/CA 우선 전략에 맞춘 CA/CAD/캐나다 전화번호를 먼저 판단한 뒤 다룬다. |
| `PRE12-F22` | Contact 개인 주소는 CRM 확장 요구가 확인될 때 다룬다. |
| `PRE12-F23` | auth strategy 확장은 보안, 복구, abuse/rate limit 정책이 필요하다. |
| `PRE12-F24` | `/app` locale route prefix는 현재 guardrail상 유지하고, 새 routing contract 전에는 바꾸지 않는다. |
| `PRE12-F25` | app i18n/Settings/bundle polish는 제품화 유지보수 또는 bundle optimization 계획으로 보낸다. |
| `PRE12-F27` | analytics 세부 event는 별도 taxonomy 계약으로 다룬다. |
| `PRE12-F28` | external analytics provider forwarding은 privacy/DPA/growth 요구 이후 판단한다. |
| `PRE12-F29` | public/UTM/ad attribution/growth experiment는 growth/marketing 계획에서 다룬다. |
| `PRE12-F30` | PWA/native packaging과 install attribution은 별도 mobile roadmap에서 다룬다. |
| `PRE12-F36` | data export artifact/download는 ExportJob/file retention/audit 계약과 함께 재검토한다. |
| `PRE12-F37` | 자동 민감정보 감지는 data governance와 오탐/누락 처리 정책이 필요하다. |
| `PRE12-F38` | Notification TTL/cleanup은 보존 기간, provider failure 조회, account deletion 정책과 함께 다룬다. |
| `PRE12-F39` | DealActivity lifecycle/search/score는 삭제/보존/감사/search/score/AI 판단 정책이 필요하다. |
| `PRE12-F40` | MeetingNote AI 후보 자동 업무 mutation은 동의, diff, undo, rollback, audit 기준이 필요하다. |
| `PRE12-F42` | BusinessCard advanced camera preview/crop은 mobile advanced capture와 device/accessibility QA가 필요하다. |
| `PRE12-F43` | server draft/media raw storage는 retention, encryption, quota, 삭제권, raw access audit 정책이 필요하다. |
| `PRE12-F44` | Admin direct domain mutation은 ownership, 사용자 통지, audit/result, rollback, redaction 정책이 필요하다. |
| `PRE12-F45` | Customer/B2B tenant admin은 B2B strategy, tenant/org/member/role/permission/billing/support 경계가 필요하다. |

## 5. billing 충돌 / Paddle 종속

아래 후보는 PRE12에서 별도 구현하거나 임시 모델을 만들면 Paddle Billing 계약과 충돌한다. `TODO/PADDLE_PLAN`의 confirmed scope/API/DB가 먼저 정해져야 한다.

| 후보 | Paddle 종속 이유 |
| --- | --- |
| `PRE12-F12` | plan, subscription, entitlement, payment, invoice, refund, failed payment, tax, paywall, churn, paid conversion, AI usage billing source-of-truth 자체가 `TODO/PADDLE_PLAN`의 핵심 범위다. |
| `PRE12-F20` | USD cent/minor unit과 amount precision은 Paddle money model, invoice/tax 표시, 기존 금액 migration과 직접 연결된다. |
| `PRE12-F21` | 국가별 주소 검증, tax, terms, pricing policy는 billing address, tax profile, 약관/환불/인보이스 정책과 연결된다. |
| `PRE12-F26` | account deletion 실제 hard delete/anonymization은 subscription 상태, 환불/chargeback, invoice/tax 보관, AI/follow-up 영구 로그 retention과 충돌한다. |
| `PRE12-F35` | Admin 직접 Trash 복구, 유료 복구, hard delete/purge는 paid recovery, refund, audit, recovery policy와 연결된다. |
| `PRE12-F41` | marketing opt-in/communication consent는 growth, churn, billing lifecycle communication, privacy consent audit와 연결된다. |

## 6. 완료 참조 / 재구현 금지

| 후보 | 판정 |
| --- | --- |
| `PRE12-F16` | MeetingNote Admin/internal provider audit 조회는 11 Admin Operation의 provider failure, raw access reason, audit/sensitive access log로 완료된 범위다. PRE12 또는 07에서 재구현하지 않는다. |

## 7. Paddle 착수 전 상태

- PRE12는 PRE12 새 구현 계획이 아니다.
- PRE12에서 confirmed API는 만들지 않는다.
- PRE12에서 migration은 만들지 않는다.
- PRE12에서 User Web/Admin Web 신규 route를 열지 않는다.
- PRE12 실제로 닫을 작업 `PRE12-F04`, `PRE12-F31`, `PRE12-F32`, `PRE12-F33`, `PRE12-F34`는 모두 closeout 완료됐다.
- G99는 선택된 PRE12 후보 closeout 이후 상위 문서 반영 여부를 점검하는 메타 closeout이며, 2026-08-10 Admin provider failure pagination 보정 결과까지 반영 완료됐다. 후속 후보 분류에 넣지 않는다.
- 2026-08-11 이후 billing 종속 후보는 `TODO/PADDLE_PLAN`에서 다룬다. non-billing 후속 후보는 PRE12가 아니라 새 TODO 폴더나 별도 유지보수 계획에서 다시 정리한다.
