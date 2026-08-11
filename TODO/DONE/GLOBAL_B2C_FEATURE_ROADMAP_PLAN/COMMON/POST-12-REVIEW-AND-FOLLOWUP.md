# Post-12 Review And Follow-up

상태: Superseded / Archived
최종 업데이트: 2026-08-11

## 1. 현재 결론

이 문서가 원래 정의했던 "12 Billing 완료 후 01~12 전체를 다시 재검토한다"는 순서는 더 이상 현재 실행 순서가 아니다.

2026-08-11 결정으로 기존 12 `12_BILLING_SUBSCRIPTION_TAX`는 `TODO/PADDLE_PLAN`으로 이관했고, Global B2C 01~11 + PRE12 로드맵은 DONE으로 닫는다.

## 2. 대체된 실행 순서

현재 실행 순서는 아래와 같다.

1. `GLOBAL_B2C_FEATURE_ROADMAP_PLAN` 01~11 완료 이력 유지
2. `PRE12_FOLLOWUP_RECHECK` 완료 이력 유지
3. 결제/구독/세금/Paddle 후보는 `TODO/PADDLE_PLAN`에서 관리
4. 기능 유지보수와 UX/UI 상품성 개선 진행
5. 100명 베타 테스트 진행
6. 베타 피드백으로 가격/플랜/entitlement/AI 사용량 제한/policy 확정
7. 확정 후 `TODO/PADDLE_PLAN`에서 Paddle Billing 구현

## 3. 보존되는 원칙

이 문서의 아래 원칙은 여전히 유효하다.

- 기존 완료 폴더의 closeout 의미를 깨지 않는다.
- 후속 기능은 기존 01~11 완료 폴더에 끼워 넣지 않고 새 TODO 또는 별도 계획으로 승격한다.
- billing/paywall/churn/paid conversion/source-of-truth는 임시 구현하지 않는다.
- API/DB/FE 후보는 confirmed 계약 없이 구현하지 않는다.
- Product UX first-sale gate와 Trust/policy gate는 유지보수, 베타, Paddle 작업에서도 계속 확인한다.

## 4. 이관된 결제 후속

결제와 직접 연결되는 후속은 아래 문서를 따른다.

- `TODO/PADDLE_PLAN/README.md`
- `TODO/PADDLE_PLAN/COMMON/SOURCE-COVERAGE-REVIEW.md`
- `TODO/PADDLE_PLAN/COMMON/BACKLOG-PRODUCTIZATION-EXTRACT.md`
- `TODO/PADDLE_PLAN/COMMON/PRE12-DEPENDENCY-MAP.md`

## 5. 비결제 후속

PRE12의 non-billing post-12 seed는 이 문서에서 바로 실행하지 않는다. 필요성이 확인될 때 별도 TODO 폴더로 승격한다.

대표 후보:

- 다음 행동 reminder
- 회의록 follow-up reminder/자동 발송
- SMS 실제 provider
- Google Calendar write/sync/watch/recurrence
- generic ExportJob/PDF
- backup/restore drill
- PWA/native packaging
- B2B tenant admin
- Admin direct domain mutation
- 자동 민감정보 감지
