# Workflow

상태: Archived / Closed Roadmap Workflow
최종 업데이트: 2026-08-11

## 1. 현재 기준

이 로드맵은 DONE으로 닫혔다. 기존 번호 폴더를 새 `/goal`로 전환하는 흐름은 더 이상 active workflow가 아니다.

완료 상태:

- 01~11 구현 완료
- PRE12 closeout 완료
- 12 Billing 문서 `TODO/PADDLE_PLAN`으로 이관

## 2. 기존 번호 폴더 처리

| 대상 | 처리 기준 |
| --- | --- |
| 01~11 완료 폴더 | 완료 이력 정본으로 보존한다. 후속 기능 구현을 위해 재개하지 않는다. |
| `PRE12_FOLLOWUP_RECHECK` | 완료된 재대조 이력으로 보존한다. |
| `12_BILLING_SUBSCRIPTION_TAX` | 이관 안내만 남긴다. 실제 계획은 `TODO/PADDLE_PLAN`을 따른다. |
| COMMON 문서 | DONE/Archived 상태와 handoff 기준을 설명하는 문서로 보존한다. |

## 3. 새 작업을 만들 때

이 로드맵에서 바로 구현하지 않는다.

새 작업이 필요하면 아래 기준을 따른다.

1. 결제/구독/세금/Paddle 관련이면 `TODO/PADDLE_PLAN`에서 post-beta confirmed scope로 승격한다.
2. UX/UI 유지보수와 기능 상품성 개선은 별도 product maintenance/UXUI 계획에서 다룬다.
3. PRE12 non-billing 후속 후보는 필요성이 확인될 때 새 TODO 폴더로 만든다.
4. 기존 01~11 완료 폴더의 closeout 의미를 깨지 않는다.

## 4. 구현 전 체크 원칙

아래 원칙은 앞으로도 유지한다.

| 체크 | 기준 |
| --- | --- |
| API 계약 | method/path/request/response/error/business logic/transaction/observability가 있어야 한다. |
| DB 계약 | model/relation/index/retention/rollback/migration 영향이 있어야 한다. |
| DB/Prisma gate | 신규 migration, generate, seed, 운영성 DB 영향이 있으면 `NBA-014` 체크가 있어야 한다. |
| FE 계약 | route, 화면 상태, query key, invalidation, empty/error/loading이 있어야 한다. |
| Product UX gate | 핵심 `/app` 업무 흐름을 바꾸면 첫 판매 전 제품화 QA 영향이 기록되어야 한다. |
| Trust/policy gate | Trash/export/delete/retention/billing/policy를 바꾸면 정책 gate 영향이 기록되어야 한다. |
| 보안 | user ownership, 민감정보, provider error redaction을 확인한다. |

## 5. Paddle 작업 기준

Paddle 작업은 이 폴더가 아니라 `TODO/PADDLE_PLAN`을 따른다.

Paddle 구현 전제:

- 기능 유지보수와 UX/UI 상품성 개선이 먼저 정리된다.
- 100명 베타 테스트 피드백이 반영된다.
- 가격/플랜/entitlement/AI 사용량 제한/trial/policy가 확정된다.
- Paddle sandbox, webhook, checkout, customer portal, Admin 운영 범위가 confirmed로 승격된다.
