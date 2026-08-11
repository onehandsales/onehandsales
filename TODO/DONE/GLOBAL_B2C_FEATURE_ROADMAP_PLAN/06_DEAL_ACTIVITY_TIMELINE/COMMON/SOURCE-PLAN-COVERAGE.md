# Source Plan Coverage

상태: Confirmed
확정일: 2026-07-25
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 06 Deal Activity Timeline이 아래 두 입력 계획의 어떤 항목을 포함하고, 어떤 항목을 후속으로 제외했는지 추적한다.

- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`

06은 위 두 문서를 기반으로 만든 구현 계획이지만, 모든 후보를 한 번에 구현하지 않는다. Global B2C, Notion식 작업공간, Attio식 CRM record/activity 방향에 맞는 Deal 중심 activity와 그 위의 최소 record summary만 06 범위로 승격한다.

## 2. NEXT_BACKEND_API_BACKLOG_PLAN 반영

| 후보 | 06 반영 | 구현 위치 | 결정 |
|---|---|---|---|
| `NBA-001` Deal list `products` summary | 포함 | G05/G06, `DEAL_RECORD_SUMMARY_API.md` | `GET /api/deals` item에 `products`를 추가한다. |
| `NBA-002` Contact list `dealCount` | 포함 | G05/G06, `DEAL_RECORD_SUMMARY_API.md` | `GET /api/contacts` item에 active deal count를 추가한다. |
| `NBA-003` latest memo/activity/next action summary | 부분 포함 | G05/G06, `DealActivity` 기반 Deal latest activity | 06은 Deal list `latestActivity`만 포함한다. Company/Contact/Product latest summary와 generic summary endpoint는 2026-08-06 A 결정에 따라 12 전 계약화/구현 대상이 아니다. |
| `NBA-008` Page size 15 contract cleanup | 포함 | G05/G06, G07 | FE 단독 변경 없이 Backend/API/FE/test 계약을 15개 기준으로 확인한다. |
| `NBA-014` DB/Prisma migration 운영 gate | 포함, 실행 gate | G02/G07 | DB target, migration status, seed/generate 정책을 확인한다. 사용자 결정 없이 공유/운영성 DB에 migrate/seed를 실행하지 않는다. |
| `NBA-004` MeetingNote next/latest summary | 제외 | 후속 MeetingNote 계획 | 회의록 raw text, AI/STT 요약, next action 추출 정책이 필요하다. |
| `NBA-005` BusinessCard provider failure contract | 제외 | 후속 OCR/provider 계획 | DealActivity와 직접 연결하지 않는다. |
| `NBA-007` Trash private memo backend restriction | 제외 | 후속 Trust/policy 계획 | private memo 원문 제한 정책은 06에서 확장하지 않는다. |
| `NBA-011` MeetingNote transcript/provider call log | 제외 | 후속 Admin/Ops 계획 | provider raw/transcript 저장, 감사, retention 정책이 필요하다. |
| `NBA-012` Trash 7일 이후 복구 정책 | 제외 | 후속 Trust/policy 계획 | activity 삭제/복구 정책과 함께 후속으로 둔다. |
| `NBA-013` Admin 운영 UX/API | 제외 | 11 Admin Operation | User Web 기능과 Admin 운영 API를 섞지 않는다. |
| `NBA-006`, `NBA-009`, `NBA-010`, `NBA-015` | 완료 이력으로만 참조 | 01/02/03/04 완료 계획 | 06에서 재구현하지 않는다. Schedule, notification, Google Calendar는 activity source로만 연결한다. |

## 3. `NBA-003` 부분 포함 기준

`NBA-003` 원본 후보는 Company/Contact/Product 최신 메모, 최신 activity, 다음 행동 summary까지 넓게 열려 있다.

06에서 확정하는 범위:

- Deal list item의 `latestActivity`
- `DealActivity` 정본에서 나온 안전한 `title`, `summary`, `occurredAt`
- private memo, provider raw response, follow-up body 전체, meeting note raw text 제외

06에서 제외하는 범위:

- Company list latest activity summary
- Contact list latest activity summary
- Product list latest activity summary
- `latestMemoAt`, `latestMemoSummary`
- `nextActionSummary` 신규 계산
- 모든 record를 묶는 generic summary endpoint

이 경계는 Global B2C에서 필요한 CRM 맥락을 Deal 중심으로 먼저 정본화하고, 개인정보/메모 정책이 정해지지 않은 summary 확장을 막기 위한 것이다.

2026-08-06 후속 재검토 결론:

- 06은 Completed 상태를 유지한다.
- Company/Contact/Product latest summary, generic summary endpoint, record별 상세 activity timeline은 12 전 API/DB/FE 계약화 대상이 아니다.
- 위 후보는 B2B 또는 team CRM 성격이 더 강한 post-12 전략 재검토 seed로 보존한다.
- UX/UI 전체 polish는 06 후속으로 쪼개서 진행하지 않고, 로드맵 DONE 이후 별도 UX/UI 전면 유지보수 계획에서 다룬다.

## 4. USER_WEB_PRODUCTIZATION_GAP_PLAN 반영

| 제품화 기준 | 06 반영 | 결정 |
|---|---|---|
| Global B2C first-sale 방향 | 포함 | 개인 영업자가 딜 진행 맥락을 다시 보고 다음 행동으로 이어가는 기능을 우선한다. |
| Notion + Attio UX | 포함 | 딜 상세는 조용한 record/detail page, activity는 CRM timeline과 linked record로 구성한다. |
| Deal-first 업무 흐름 | 포함 | 딜 상세 timeline과 딜 목록 products/latest activity로 진행 맥락을 강화한다. |
| Data honesty | 포함 | API 응답에 없는 latest activity, products summary, dealCount를 FE에서 만들지 않는다. |
| Mobile browser | 포함 | 390px/360px에서 timeline과 list summary가 겹치지 않아야 한다. |
| 핵심 CRM 루프 | 부분 포함 | 딜, 일정, 회의록, follow-up을 DealActivity로 연결한다. 회사/제품 중심 summary는 후속이다. |
| 첫 판매 global gap | 제외 | Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 phone/currency/address, 제품 분석은 별도 큰 계획이다. |
| 정책/신뢰/DB 운영 gate | 부분 포함 | `NBA-014` migration gate만 확인한다. activity deletion, retention, audit policy는 후속이다. |
| Google Calendar Integration | 완료 이력 참조 | Google Calendar read-only import는 완료된 source로 보고, 06에서는 일정 연결 activity만 기록한다. |
| MeetingNote 고도화 | 제외 | next/latest summary, transcript/provider log, AI/STT raw 정책은 06에 넣지 않는다. |

## 5. 승격 결정

`USER_WEB_PRODUCTIZATION_GAP_PLAN`과 `NEXT_BACKEND_API_BACKLOG_PLAN`에서는 `Deal list products summary`, `Contact dealCount`, `latest activity summary`, `page size 15 cleanup`을 바로 구현하지 말고 별도 계약 후 진행하라고 둔다.

06에서는 2026-07-25 사용자 결정에 따라 아래 범위를 `confirmed`로 승격한다.

1. `DealActivity` 정본과 딜 상세 timeline
2. Deal list `products`
3. Deal list `latestActivity`
4. Contact list `dealCount`
5. page size 15 계약 정리

단, 이 승격은 06 문서 안의 API/DB/FE 계약과 `/goal` 순서를 지킨다는 조건이다. G02~G04에서 DealActivity 정본을 먼저 만들고, G05/G06에서 목록 summary를 붙인다.

## 6. 구현자가 확장하지 말아야 할 것

- Company/Contact/Product 전체 latest activity summary를 06에 끼워 넣지 않는다. 2026-08-06 A 결정에 따라 12 전 계약화도 하지 않는다.
- private memo나 일반 memo를 최신 활동 summary로 합치지 않는다.
- MeetingNote raw text, transcript, provider log를 User API response에 노출하지 않는다.
- Admin API, billing/subscription/tax, product analytics, app i18n/l10n을 06에 섞지 않는다.
- FE가 API 응답에 없는 summary/count/product 정보를 임의로 계산해 표시하지 않는다.
