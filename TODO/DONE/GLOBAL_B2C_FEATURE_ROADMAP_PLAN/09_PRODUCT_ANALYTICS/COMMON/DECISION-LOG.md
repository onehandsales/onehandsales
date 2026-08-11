# Decision Log

상태: Confirmed
최종 업데이트: 2026-07-30

## 1. 09 1차 범위

결정: 09는 제품 분석 수집/계산 기반만 만든다.

- Admin analytics full UI/API는 `11_ADMIN_OPERATION`에서 만든다.
- Billing/paywall/churn의 최종 상태 전이는 이관된 `TODO/PADDLE_PLAN`에서 post-beta에 만든다.
- 09는 raw event, taxonomy, privacy, activation/retention snapshot, AI usage 계산 기반까지 담당한다.

## 2. 이벤트 저장 방식

결정: 자체 DB `ProductAnalyticsEvent`를 1차 정본으로 사용한다.

- 외부 analytics provider는 1차 구현하지 않는다.
- 09에서는 provider forwarding port, adapter, runtime call을 만들지 않는다.
- 후속 provider forwarding이 필요하면 12 이후 별도 계획에서 port/adapter를 추가한다.
- 외부 provider가 추가되더라도 자체 DB 정본을 대체하지 않는다.

## 3. Activation 기준

결정: activation은 `첫 딜 생성 + 다음 행동/일정/회의록 중 하나 연결`이다.

2026-07-30 사용자 재확인: 이 기준을 유지한다.

의미:

- 단순 가입이나 첫 화면 진입은 activation이 아니다.
- 개인 영업자가 실제 업무 가치를 경험하려면 딜이 생기고 후속 행동 anchor가 있어야 한다.
- 현재 Deal 생성 흐름이 다음 행동을 함께 받는 구조라면, 유효한 첫 딜 생성 시 `deal_created`와 `deal_next_action_created`가 같은 사용자 행동에서 발생할 수 있다.

## 4. Server / Client Event 경계

결정:

- Server event: DB mutation/provider/billing 같은 핵심 성공 결과의 정본이다.
- Client event: route view, CTA click 같은 UX 행동 보조다.

09 1차:

- Server event는 use case/service 성공 후 명시적으로 기록한다.
- Client event는 core `/app` route view만 수집한다.
- FE가 server mutation success event를 중복으로 보내지 않는다.

## 5. Analytics 실패 처리

결정: analytics 실패는 제품 기능을 막지 않는다.

예:

```text
딜 생성 성공
-> analytics event 저장 실패
-> 사용자에게는 딜 생성 성공 응답
-> 서버에는 analytics.event.recordFailed warning log
```

따라서 analytics event 저장은 제품 mutation transaction 밖에서 best-effort로 처리한다.

## 6. Session / Device

결정: 기존 `AuthSession`, `AuthDevice`를 사용한다.

- 새로운 analytics session/device 식별자를 만들지 않는다.
- Client는 `sessionId`, `authDeviceId`, `deviceId`를 보내지 않는다.
- Backend가 `CurrentUserContext.sessionId`와 `AuthSession.authDeviceId`로 event row를 보강한다.
- `AuthSession.lastUsedAt`, `AuthDevice.lastSeenAt`은 로그인/refresh 성격이므로 product usage/retention 정본으로 쓰지 않는다.

## 7. Payload Allowlist

결정: event별 allowlist schema만 허용한다.

금지:

- 자유 JSON
- 이름, 이메일, 전화번호, 회사명, 담당자명
- memo, meeting note body, private memo
- AI prompt, raw response, provider raw response
- token, authorization header, provider token

## 8. 시간과 timezone

결정:

- `occurredAt`은 UTC instant로 저장한다.
- `eventDate`는 이벤트 당시 사용자 `timeZone` 기준 날짜로 저장한다.
- `timeZone`은 IANA timezone ID로 저장한다.

이유:

- 운영 로그와 DB 정렬은 UTC가 안정적이다.
- D1/D7/D30 retention은 사용자의 현지 날짜 기준이어야 Global B2C에서 자연스럽다.

## 9. Retention / 삭제

결정:

- non-deleted user의 raw `ProductAnalyticsEvent`는 365일 보관한다.
- 비식별 aggregate snapshot은 장기 보관한다.
- 계정 삭제 요청 시 즉시 접근을 막고 30일 유예를 둔다.
- 30일 이후 user-linked raw analytics event와 user-level snapshot은 실제 삭제한다.
- 법무/세금/보안/결제 예외 기록은 별도 최소 보관 정책으로 다룬다.

2026-07-30 사용자 재확인: raw event 365일 보관, 비식별 aggregate snapshot 장기 보관, 계정 삭제 30일 유예 후 user-linked raw event와 user-level snapshot 실제 삭제 기준을 유지한다.

## 10. AI Usage

결정: 09 1차는 기존 `AiProviderCallLog`를 사용한다.

- 사용자별 AI 요청 수, 성공/실패/대기/취소, latency, token, 추정 비용을 집계한다.
- day grouping은 현재 `User.timeZone` 기준 관리자 참고용 read model로 둔다.
- `AiUsageDaily`는 만들지 않고 reserved로 둔다.
- 11 Admin에서 사용자별 AI 사용 횟수와 비용을 볼 수 있어야 한다.
- `TODO/PADDLE_PLAN`에서 AI plan/quota/paywall을 만들 때 `AiUsageDaily` 또는 `UsageMeter` 중 하나를 source of truth로 반드시 다시 확정한다.

## 11. Billing / Paywall / Churn

결정:

- 09는 billing/paywall/churn event 이름을 reserved list에만 둔다.
- 실제 plan, entitlement, checkout, webhook, cancel/churn survey 저장은 12가 최종 확정한다.
- 12의 최종 이벤트 계약이 09 reserved 이름보다 우선한다.
- 12 문서 작성 시 09 reserved taxonomy와 반드시 다시 sync한다.

## 12. Client Page View

결정: 09 1차 client page view는 core `/app` route만 수집한다.

- public/auth route 제외
- UTM/ad attribution 제외
- raw URL query 제외
- UUID path param 원문 제외

## 13. Snapshot / Aggregate

결정:

- raw event는 즉시 저장한다.
- activation/retention/cohort snapshot은 batch/runner로 계산한다.
- 기존 프로젝트 패턴과 맞게 optional setInterval runner를 우선 사용한다.
- runner는 env flag로 켜고 끌 수 있어야 한다.

## 14. Event Naming / Versioning

결정:

- eventName은 `snake_case`만 허용한다.
- event payload는 eventName + eventVersion 기준으로 allowlist한다.
- event 의미가 바뀌면 같은 이름을 재사용하지 않고 version을 올리거나 새 event를 만든다.
- deprecated event는 즉시 삭제하지 않고 taxonomy에 deprecated 상태로 남긴다.

## 15. 코드 주석

결정: 신규/수정 코드에는 한국어 주석을 반드시 둔다.

Backend:

- controller endpoint: `// API : ...`
- class/interface: `// 역할 : ...`
- use case/service/repository/helper: `// 기능 : ...`
- 긴 orchestration: `// 1. ...`, `// 2. ...`

Frontend:

- component/hook/function/event handler/API client: `// 기능 : ...`

## 16. 09 Runtime Event Taxonomy 유지

결정: 2026-07-30 사용자 재확인 기준, 09 runtime event taxonomy는 현재 `COMMON/EVENT-TAXONOMY.md`에 확정된 최소 event set 그대로 유지한다.

- Notification 클릭/도달/발송 상세 event는 09에 추가하지 않는다.
- Google Calendar sync 세부 event는 09에 추가하지 않는다.
- AI weekly report와 follow-up delivery 세부 event는 09에 추가하지 않는다.
- PWA 설치, 모바일 권한, 오프라인 draft event는 `10_MOBILE_PWA_FIELD_USE`에서 결정한다.
- Admin 조회, 운영자 action, 민감정보 접근 event는 `11_ADMIN_OPERATION`에서 결정한다.
- paywall, trial, coupon, referral, subscription, churn event는 `TODO/PADDLE_PLAN`에서 결정한다.

이유:

- 09의 목표는 모든 행동 로깅이 아니라 Global B2C 첫 판매 전 필요한 분석 정본이다.
- activation, retention, AI usage, core `/app` usage를 먼저 정확하게 만들기 위해 범위를 유지한다.
- 10/11/12의 도메인 책임을 09에서 앞당겨 섞지 않는다.
