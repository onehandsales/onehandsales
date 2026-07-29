# Goal Review Checklist

상태: Confirmed

## 1. 목적

각 `/goal` 완료 전 리뷰어가 확인할 항목을 정의한다.

## 2. 공통 리뷰

- [ ] goal 범위 밖 기능을 구현하지 않았다.
- [ ] Admin analytics full UI/API를 09에서 만들지 않았다.
- [ ] Billing/paywall/churn 최종 흐름을 09에서 구현하지 않았다.
- [ ] 기존 migration 파일을 수정하지 않았다.
- [ ] 운영/공유 DB migrate/seed를 무단 실행하지 않았다.
- [ ] 신규/수정 코드에 한국어 주석 규칙이 적용됐다.
- [ ] 실행한 검증 command와 결과가 기록됐다.
- [ ] 실행하지 못한 검증은 사유를 기록했다.

## 3. API 리뷰

- [ ] `COMMON/API-SPEC`와 실제 controller path/method/DTO가 일치한다.
- [ ] Request DTO가 user/session/device id를 client body에서 받지 않는다.
- [ ] Response DTO와 status가 API spec과 일치한다.
- [ ] Error code가 safe code 중심이다.
- [ ] FE가 analytics error를 사용자에게 표시하지 않는다.

## 4. DB 리뷰

- [ ] `ProductAnalyticsEvent`에 PII/raw text를 저장하지 않는다.
- [ ] `occurredAt`은 UTC instant다.
- [ ] `eventDate`는 사용자 timezone 기준 날짜다.
- [ ] D1/D7/D30 day offset 계산이 서버 local timezone에 의존하지 않는다.
- [ ] `timeZone`은 IANA timezone이다.
- [ ] `eventName`, `eventDate`, `userId`, `source`, `occurredAt` index가 query와 retention purge를 고려한다.
- [ ] account hard delete 시 user-linked analytics row가 삭제될 수 있다.
- [ ] aggregate retention snapshot은 userId를 저장하지 않는다.

## 5. Backend 리뷰

- [ ] server event는 use case 성공 후 명시적으로 기록한다.
- [ ] analytics 저장 실패가 제품 mutation rollback을 만들지 않는다.
- [ ] recorder failure는 warning log만 남긴다.
- [ ] log context에 payload 원문이 없다.
- [ ] domain/application 계층이 Prisma type에 직접 의존하지 않는다.
- [ ] optional runner는 env flag로 켜지고 꺼진다.

## 6. Frontend 리뷰

- [ ] core `/app` route만 tracking한다.
- [ ] public/auth route와 legacy redirect route는 tracking하지 않는다.
- [ ] raw URL/query/UUID path param이 payload에 없다.
- [ ] 각 화면에 tracking 로직을 중복 배치하지 않았다.
- [ ] analytics failure가 route 전환과 사용자 작업을 막지 않는다.
- [ ] `console.log`가 없다.

## 7. Privacy 리뷰

- [ ] name/email/phone/companyName/contactName이 payload에 없다.
- [ ] memo/private memo/meeting note body가 payload에 없다.
- [ ] AI prompt/raw response/provider raw response가 payload에 없다.
- [ ] token/authorization header/provider token이 payload/log에 없다.
- [ ] deletion/retention 정책과 충돌하지 않는다.
