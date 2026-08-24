# User Web TODO

상태: Deferred / Candidate

## 1. 원칙

User Web 결제 UX는 베타 피드백과 유료 플랜 가치가 확정된 뒤 설계한다. 지금은 결제창, paywall, upgrade modal, AI 사용량 제한 UI를 구현하지 않는다.

## 2. 화면 후보

| 화면 | 목적 |
| --- | --- |
| `/{locale}/pricing` | public pricing 표시. 현재 페이지를 post-beta 가격 결정에 맞게 재정리 |
| `/app/settings/billing` | 내 구독 상태, 결제 관리, billing portal 진입 |
| paywall/upgrade modal | 제한 초과 또는 유료 기능 접근 시 결제 유도 |
| AI usage panel | plan별 AI 사용량, reset 기준, 초과 상태 표시 |
| cancel/downgrade survey | 해지 또는 downgrade 사유 수집 후보 |

## 2A. 현재 User Web/Productization 기준

| 영역 | 현재 상태 | Paddle Plan 반영 |
| --- | --- | --- |
| Public pricing | public pricing page는 있으나 실제 결제/구독과 연결되어 있지 않다. | post-beta 가격/플랜 결정 후 다시 쓴다. |
| `/app/settings` | profile/devices, 국가/앱 언어/기본 통화, provider 연결, account/data request는 구현되어 있다. | 구독 상태 UX와 billing portal 진입은 Paddle confirmed scope에서 추가한다. |
| Analytics | route analytics와 mobile field-use event는 구현됐다. | billing/paywall/churn runtime UI/event는 Paddle 이후 연결한다. |
| Admin subscription | Admin Web `/subscriptions`는 redirect 상태다. | Billing Admin 화면을 만들지, Paddle portal/support 중심으로 둘지 결정한다. |
| Account/data/billing UX | 계정 삭제 요청과 데이터 export 요청 UX/API/Admin queue는 11에서 완료됐다. | account deletion과 invoice/tax retention 충돌은 Paddle policy gate에서 확인한다. |

## 3. 작업 후보

- Paddle checkout 진입 버튼
- Paddle customer portal 진입 버튼
- subscription status 표시
- plan별 entitlement 표시
- AI 사용량/plan limit 표시
- 무료 제한 초과 시 paywall/upgrade modal
- past_due/canceled 상태 안내
- 결제 실패/카드 만료 안내
- coupon 입력/검증 상태 후보
- referral link/code 표시 후보
- cancel/downgrade 시 churn survey 후보
- KR/US/CA 우선 기준의 KRW/USD/CAD 통화와 `ko`/`en-us`/`en-ca` locale 문구 정리
- Paddle Merchant of Record, 세금/영수증/환불 안내 문구 정리
- first-sale gate에 맞는 가격/플랜/trial/free limit/paywall copy 정리
- billing status가 account deletion, data export/delete, retention 안내와 충돌하지 않도록 settings copy 정리

## 4. UX 결정 후보

- pricing page는 베타 종료 후 실제 유료 상품 가치가 확인된 뒤 다시 쓴다.
- Paddle checkout은 overlay와 hosted 방식 중 브랜드 신뢰와 구현 비용 기준으로 선택한다.
- subscription 관리는 직접 UI를 크게 만들기보다 Paddle customer portal 활용을 우선 검토한다.
- plan 제한 UI는 사용자가 막히는 순간에만 보여줄지, dashboard/settings에 상시 표시할지 결정한다.
- AI 사용량 초과 안내는 단순 upgrade 유도인지, 사용량 reset 날짜를 함께 보여줄지 결정한다.

## 5. 검증 후보

- subscription 상태별 UI가 명확하다.
- 권한 없는 기능 접근 시 upgrade 안내가 나온다.
- checkout 진입 전 가격, 세금, 환불, 결제 주기 문구가 오해를 만들지 않는다.
- Paddle checkout 후 success/cancel/error 상태가 자연스럽게 처리된다.
- past_due/canceled 상태에서 접근 가능한 기능과 제한되는 기능이 명확하다.
- coupon/referral/churn survey가 09 analytics event와 충돌하지 않는다.

## 6. 지금 금지

- 베타 전 checkout 버튼 활성화
- 임시 가격/플랜을 실제 결제 UX로 고정
- AI usage/paywall UI를 billing API 없이 먼저 구현
- Paddle Billing과 ProfitWell Metrics를 같은 기능처럼 노출
- 결제 실패/환불/해지 정책 없는 upgrade modal 구현
- 09 analytics reserved billing event를 UI 작업만으로 runtime 이벤트처럼 발생시키는 것
- 기존 `/app/settings`에 임시 subscription 상태 문구만 끼워 넣고 실제 billing 계약 없이 판매 가능처럼 보이게 하는 것
