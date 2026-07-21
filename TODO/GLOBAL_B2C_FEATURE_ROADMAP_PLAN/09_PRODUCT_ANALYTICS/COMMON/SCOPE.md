# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Event taxonomy | signup, first deal, first import, first meeting note, first report 등 |
| Activation | 개인 영업자가 가치를 느끼는 기준 정의 |
| Retention | D1/D7/D30, weekly active |
| AI usage | 요청 수, 실패율, 비용/user |
| Funnel | signup -> activation -> paid conversion 후보 |
| Growth experiment | paywall, trial, coupon, referral, churn survey |
| Unit economics | ARPU, LTV/CAC, AI cost/user 후보 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 완성형 BI dashboard | 1차는 수집/정의가 먼저 |
| Admin analytics full UI | 11 이후 또는 병행 후보 |
| 광고 attribution | 판매 funnel 이후 |

## 구현 전 세부 확인 질문

- activation 기준은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`로 둔다.
- analytics는 자체 DB event log와 allowlist taxonomy로 시작한다.
- client event는 UX 행동 보조, server event는 과금/핵심 정본으로 본다.
- 개인정보 삭제 요청 시 PII 없는 event와 user 연결 해제/삭제 정책을 정한다.
- paywall/trial/coupon/referral 실험은 12 Billing과 연결되는 mock/state로 검증한다.
- churn survey는 해지 flow에 둘지 별도 feedback flow로 둘지?

## 완료 기준 초안

- 핵심 event taxonomy가 문서화된다.
- 최소 이벤트가 수집된다.
- activation/retention을 계산할 수 있다.
- 개인정보와 redaction 기준이 있다.
- growth experiment 이벤트와 billing entitlement 이벤트의 연결 기준이 있다.
