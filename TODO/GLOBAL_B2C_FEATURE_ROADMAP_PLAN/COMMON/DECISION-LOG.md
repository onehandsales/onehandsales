# Decision Log

상태: Decision Baseline
기준일: 2026-07-21

## 0. 완료 반영

- [x] 01 ImportJob Persistence: Done (2026-07-21)
- [x] 완료 기록: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 1. 제품 방향 결정

| 결정 | 내용 |
|---|---|
| UX 기준 | Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 함께 따른다. |
| 사용 편의성 | 설정을 많이 요구하지 않고, 강한 기본값과 짧은 action으로 사용자가 바로 업무를 이어가게 한다. |
| Record 관계 | 회사, 담당자, 제품, 딜, 일정, 회의록은 linked record로 정확히 연결한다. |
| AI 원칙 | AI는 자동 mutation하지 않고, 사용자가 확인할 수 있는 제안과 초안을 만든다. |
| 모바일 원칙 | 모바일은 desktop table 축소가 아니라 card/list, 현장 입력, draft 중심으로 간다. |
| 운영 원칙 | 민감정보, provider raw response, 결제/운영 판단은 User Web 일반 화면에 노출하지 않는다. |

## 2. 로드맵 운영 결정

| 결정 | 내용 |
|---|---|
| 로드맵 방식 | 01~12 기능 폴더를 미리 만들고, 각 폴더를 착수 전 검토 슬롯으로 사용한다. |
| 구현 순서 | 기능을 먼저 만들고 UX/UI 전체 polish는 후반에 한 번에 잡는다. 단 Product UX first-sale gate는 polish가 아니라 첫 판매 가능한 업무 흐름 검증이므로 후반 polish까지 미루지 않는다. |
| 판매 기준 | MVP는 판매하지 않는다. Global B2C가 첫 판매 기준이다. |
| 마지막 묶음 | Admin 운영과 구독/결제/세금 상세 구현은 11~12로 둔다. 단 `NBA-014` DB/Prisma 운영 gate, Trust/policy first-sale gate, `NBA-007` Trash private memo response gate는 관련 goal마다 선행/병행 확인한다. |
| `/goal` 관계 | 이 로드맵은 `/goal`이 아니며, 각 번호 폴더를 보강한 뒤 별도 `/goal`로 전환한다. |
| 슬롯 의사결정 | 각 슬롯은 이 문서의 추천 결정을 기본값으로 삼고, 구현 전 `SCOPE/API/DB/FE` 문서에서 confirmed로 승격한다. |
| First-sale gate | `COMMON/FIRST-SALE-GATE-MAP.md`를 Global roadmap의 선행 gate 기준으로 둔다. `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 최종 방향이 01~12 순서에서 약해지지 않게 추적한다. |

## 3. 슬롯별 추천 결정

| 슬롯 | 결정 상태 | 추천 결정 |
|---|---|---|
| 01 ImportJob Persistence | Done | `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`로 확정 전 작업을 DB에 저장한다. 작업 재개 TTL은 7일로 둔다. 원본 파일 binary는 DB에 저장하지 않고 storage에 두며 장기 보관하지 않는다. confirm/cancel/expire 후 원본 파일 삭제를 추적한다. resume route와 cancel API를 제공한다. 구현 및 QA closeout 완료. |
| 02 Notification Reminder | 결정 confirmed | 2026-07-22 사용자 결정으로 1차 채널은 앱 안 알림, browser push, email을 모두 포함한다. 1차 알림 대상은 일정 시작 전과 딜 마감일만 포함한다. 일정 알림은 시작 30분 전, 딜 마감 알림은 사용자 timezone 기준 마감일 1일 전 오전 9시에 보낸다. 다음 행동 알림은 딜 데이터 구조 변경 가능성이 있어 06 DealActivity/다음 행동 고도화에서 다시 설계한다. 회의록 후속 알림은 07에서 다시 설계한다. 설정은 toggle 중심으로 단순하게 둔다. |
| 03 Weekly Schedule Report | Goal Ready | 2026-07-22 사용자 결정으로 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현한다. `NBA-009 Schedule week report`를 confirmed 기능 goal로 승격하며, API는 `GET /api/schedules/week`, `GET /api/schedules/week/export/xlsx`로 확정한다. `weekStart`는 월요일 date-only로 받고, 다일 일정은 겹치는 날짜마다 표시하며, 일정 없는 날도 7일 모두 표시한다. 딜 금액/단계/마감일/회사/담당자/다음 행동은 포함하되 일정 메모 본문은 제외하고 `hasMemo`만 둔다. 새 DB 구조와 migration은 만들지 않으며, DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다. Backend/DB/Frontend 아키텍처는 `AGENT/SOFTWARE_AGENT`, UX/UI와 사용자 문구는 `AGENT/UXUI_AGENT` 기준을 따른다. 03은 Global B2C retention/Product UX 일부를 강화하지만 첫 판매 gate 전체를 닫지 않는다. 결제/Admin/앱 전체 다국어/통화 모델/제품 분석, 제품 요약, PDF, `/app/export`, 범용 ExportJob, 반복 일정 정식 모델은 이번 03에서 제외하고 별도 사용자 결정/goal로 분리한다. `/goal` 실행 문서는 `03_WEEKLY_SCHEDULE_REPORT/COMMON/GOAL-WORK-ORDER.md`와 `COMMON/GOAL-SPECS/*`에 둔다. |
| 04 Google Calendar Integration | 결정 baseline | Google login과 Calendar scope를 분리한다. 1차는 read-only import와 수동 sync다. 양방향 실시간 sync는 제외한다. 가져온 일정은 source badge와 `externalEventId`를 가진다. provider가 지원하면 `syncToken`을 저장한다. imported schedule의 정본은 Google event로 보고, local memo/link는 유지한다. 연결 해제 시 가져온 일정은 유지하되 source 상태를 남긴다. |
| 05 AI Weekly Sales Report | 결정 baseline | 수동 생성형과 저장형으로 시작한다. 사용자가 `이번 주 리포트 생성`을 누르면 요약, 리스크, 다음 행동, follow-up 초안을 만든다. AI 제안은 자동으로 딜/일정/담당자를 변경하지 않는다. 05는 주간/cross-record 리포트, 07은 회의록 직후 후보 추출로 나눈다. AI 입력은 redaction 후 사용하고 비용 추적을 남긴다. |
| 06 Deal Activity Timeline | 결정 baseline | Attio식 핵심 기능으로 `DealActivity` 별도 모델을 만든다. 단계 변경, 회의록 연결, 일정 연결, 다음 행동을 timeline에 자동 기록한다. 기존 memo/following action log는 즉시 폐기하지 않고 연결 또는 점진 통합한다. private memo는 timeline summary에서 제외한다. |
| 07 MeetingNote AI Provider Log | 결정 baseline | 회의록 전용이 아니라 공통 `AiProviderCallLog`를 우선 검토한다. transcript는 사용자 확인 전 임시 데이터로 다루고, 장기 저장은 명시 정책이 있을 때만 허용한다. provider raw response는 저장 최소화한다. next action과 follow-up은 후보 생성 후 사용자 확인 방식으로 저장한다. |
| 08 Global Data I18N | 결정 baseline | 첫 판매 locale은 `ko`와 `en`을 우선으로 제한하고, 이후 `ja`, `zh-tw`를 확장 후보로 둔다. phone은 E.164 기반으로 정리한다. Deal/Product 금액에는 `currencyCode`를 추가한다. `/app` i18n은 public site locale과 분리한다. Apple login은 iOS 전략과 연결하고, LINE login은 일본/대만 확장 시점에 검토한다. |
| 09 Product Analytics | 결정 baseline | 자체 DB event log와 allowlist event taxonomy로 시작한다. activation 기준은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`이다. client event는 UX 행동 보조, server event는 과금/핵심 정본으로 본다. PII는 저장하지 않고 retention을 둔다. billing/paywall 이벤트는 12와 연결한다. |
| 10 Mobile PWA Field Use | 결정 baseline | native app 전에는 PWA와 모바일 웹에 집중한다. 우선 범위는 명함 촬영, 회의 직후 음성 기록, local draft, 권한 거부 fallback이다. offline full sync는 제외한다. 음성 파일은 STT/회의록 저장 이후 장기 보관하지 않는 방향을 기본값으로 둔다. browser push는 02와 연결한다. native app 전환은 PWA 사용 지표와 현장 사용 빈도로 판단한다. |
| 11 Admin Operation | 결정 baseline | 최소 Admin부터 시작한다. 첫 Admin bootstrap은 `INITIAL_ADMIN_EMAILS`로 시작한다. 사용자와 핵심 domain data는 read-only 조회를 기본으로 하고, 민감정보는 masking한다. raw 조회는 reason 필수와 append-only audit log가 필요하다. 계정 삭제, 데이터 export, provider failure, DB/migration gate는 운영 신뢰 필수 범위로 포함한다. 단 `NBA-014` DB/Prisma 운영 gate는 11까지 미루지 않고 migration이 있는 goal마다 선행 체크한다. `NBA-007` Trash private memo backend response restriction은 Trash/삭제 정책에 묻지 않고 독립 보안 체크로 둔다. |
| 12 Billing Subscription Tax | 결정 baseline | Global B2C는 Merchant of Record를 우선 검토한다. Stripe 직접 결제는 세금/환불/인보이스 운영 부담이 커서 2순위로 둔다. 판매 rollout은 한국/KRW 유료 검증, 일본/대만 확장, 영어권 확장 순서로 둔다. plan, entitlement, paywall은 단순하게 시작한다. AI 사용량 limit은 plan에 포함한다. 가격 수치는 PRD의 월 5,900~6,900원 가설을 출발점으로 두고 12 confirmed 문서에서 provider 수수료/세금을 반영해 확정한다. 기본 구조는 무료체험과 월간/연간 개인 플랜으로 둔다. failed payment grace period, refund, chargeback, invoice/tax 정책은 Admin 운영과 연결한다. |

## 4. 구현 전 승격 규칙

이 문서의 결정은 슬롯별 기본 방향이다. 구현에 들어가려면 해당 슬롯 문서에서 아래를 완료해야 한다.

1. `COMMON/SCOPE.md`에 포함/제외 범위를 confirmed 수준으로 반영한다.
2. API가 있으면 `COMMON/API-SPEC`을 만들고 계약 상태를 `confirmed`로 둔다.
3. DB 변경이 있으면 `BE-TODO/DB-SCHEMA.md`에 Prisma model, DDL, index, retention을 적는다.
4. 신규 migration이 있으면 `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` 체크를 선행 조건으로 goal spec에 넣는다.
5. User Web 변경이 있으면 `FE-TODO/USER-WEB-TODO.md`에 route, state, query key, empty/error/success를 적는다.
6. `/app` 핵심 업무 흐름을 바꾸면 Product UX first-sale gate 영향 여부를 적는다.
7. Trash/export/delete/retention/billing/policy를 건드리면 Trust/policy first-sale gate 영향 여부를 적는다.
8. `/goal` 실행 전 `COMMON/GOAL-SPECS`와 `COMMON/PLANNING-REVIEW.md`를 만든다.

## 5. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/FIRST-SALE-GATE-MAP.md`
