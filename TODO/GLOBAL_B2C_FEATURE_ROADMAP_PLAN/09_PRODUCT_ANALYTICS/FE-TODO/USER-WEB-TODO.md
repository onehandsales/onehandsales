# User Web TODO

상태: Draft

## 화면/이벤트 후보

- signup/login completion
- first company/contact/product/deal
- first schedule
- first meeting note
- first business card scan
- first import
- first export
- notification interaction
- weekly report generation
- paywall impression/click
- coupon/referral interaction
- churn survey submit

## 작업 후보

- analytics client wrapper
- route/page view event 기준
- mutation success event 기준
- user consent/cookie 정책 연결
- local dev event disable 기준
- experiment flag/display 기준
- paywall/trial 상태 이벤트 기준

## 검증 후보

- 민감 데이터가 event payload에 들어가지 않는다.
- 실패한 mutation은 success event로 기록되지 않는다.
- E2E/test 환경에서 provider 호출이 차단된다.
- paywall/coupon/referral 이벤트가 결제 성공 이벤트와 혼동되지 않는다.
