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

## 열린 질문

- activation event는 무엇인가?
- analytics provider를 쓸지 자체 DB event log로 시작할지?
- client event와 server event 중 무엇을 정본으로 볼지?
- 개인정보 삭제 요청 시 분석 event는 어떻게 처리할지?
- paywall/trial/coupon/referral 실험은 12 Billing 구현 전 어떤 mock/state로 검증할지?
- churn survey는 해지 flow에 둘지 별도 feedback flow로 둘지?

## 완료 기준 초안

- 핵심 event taxonomy가 문서화된다.
- 최소 이벤트가 수집된다.
- activation/retention을 계산할 수 있다.
- 개인정보와 redaction 기준이 있다.
- growth experiment 이벤트와 billing entitlement 이벤트의 연결 기준이 있다.
