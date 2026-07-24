# 05 DB Schema TODO

상태: Ready

## 1. Source of truth

DB schema와 SQL 초안은 아래 문서가 정본이다.

- AI report DB SQL: `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`
- Follow-up delivery DB SQL: `BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`

## 2. Migration 순서

1. G02 05-A migration
   - `AiWeeklySalesReport`
   - `AiWeeklySalesReportSuggestion`
   - `AiJob`
   - `AiProviderCallLog`
2. G05 05-B migration
   - `ExternalEmailConnection`
   - `ExternalEmailOAuthState`
   - `SmsSenderNumber`
   - `FollowUpConsentNotice`
   - `FollowUpMessage`
   - `FollowUpMessageTarget`
   - `FollowUpDeliveryAttempt`

## 3. 공통 DB 정책

- 신규 enum/table/index/FK에는 migration SQL과 주석을 둔다.
- Prisma schema에는 한글 `/// 기능 : ...` 주석을 둔다.
- 05-B migration은 05-A table 존재를 전제로 한다.
- provider token과 phone 원문은 암호화 저장한다.
- OAuth state, SMS verification code 원문은 저장하지 않는다.
- AI prompt와 provider raw response는 저장하지 않는다.
- report version과 follow-up 발송 로그는 사용자 삭제/숨김 기능을 제공하지 않는다.

## 4. 운영 gate

새 migration은 shared/cloud DB에 적용하기 전에 DB/Prisma migration 운영 gate를 확인한다.
