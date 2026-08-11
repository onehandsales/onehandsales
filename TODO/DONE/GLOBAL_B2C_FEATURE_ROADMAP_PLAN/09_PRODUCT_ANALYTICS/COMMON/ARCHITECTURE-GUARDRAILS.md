# Architecture Guardrails

상태: Confirmed

## 1. 공통

- 09 구현은 `AGENT/UXUI_AGENT`, `AGENT/SOFTWARE_AGENT`, `BE/prisma` 기준을 따른다.
- 기존 `/app` UX 흐름을 방해하지 않는다.
- Admin analytics UI/API는 09에서 만들지 않는다.
- Billing/paywall/churn 실제 흐름은 `TODO/PADDLE_PLAN`에서 만든다.
- 기존 migration 파일은 수정하지 않는다.
- 운영/공유 DB에 무단 migrate/seed를 실행하지 않는다.
- 새 코드와 수정 코드에는 한국어 주석 규칙을 적용한다.

## 2. Backend

- `analytics` 신규 module은 기존 BE module 구조를 따른다.
- controller에는 비즈니스 로직을 두지 않는다.
- event taxonomy validation은 domain/application 계층에 둔다.
- server event 기록은 auth/deal/schedule/meeting-note/business-card/data-import/company/contact/product use case와 application service 성공 후 명시적으로 호출한다.
- analytics 저장은 제품 mutation transaction에 묶지 않는다.
- analytics 저장 실패는 제품 기능 실패로 전파하지 않는다.
- payload 원문을 log에 남기지 않는다.
- provider raw error, token, email, phone, memo, meeting note body, AI prompt/raw response는 저장/로그 금지다.
- optional processor runner는 기존 setInterval runner 패턴을 따른다.

## 3. Frontend

- User Web에서 `/admin/api/*`를 호출하지 않는다.
- analytics 실패를 사용자에게 toast/modal/banner로 보여주지 않는다.
- route tracking은 `FE/user-web/src/components/layout/app-shell.tsx`에 한 번만 둔다.
- 각 page component에 같은 route tracking 로직을 흩뿌리지 않는다.
- raw URL, query, UUID path param을 payload에 넣지 않는다.
- FE는 userId/sessionId/deviceId를 analytics request에 넣지 않는다.
- public/auth route와 legacy redirect route는 09 1차 tracking 대상이 아니다.
- 신규/수정 component/hook/API client에는 `// 기능 : ...` 주석을 둔다.

## 4. DB / Prisma

- 신규 enum/model/field에는 Prisma schema `/// 기능 : ...` 주석을 둔다.
- migration SQL에는 table/column/index COMMENT 또는 의도 주석을 남긴다.
- `ProductAnalyticsEvent.userId`는 계정 hard delete 시 함께 삭제될 수 있어야 한다.
- `authSessionId`, `authDeviceId`는 nullable relation으로 둔다.
- `occurredAt`은 UTC instant다.
- `eventDate`는 사용자 timezone 기준 날짜다.
- D1/D7/D30 계산은 `eventDate` date-only 값에 day offset을 더하며 서버 local timezone에 의존하지 않는다.
- `timeZone`은 IANA timezone ID다.
- raw event retention 365일 purge를 고려해 index를 설계한다.

## 5. Privacy

- Analytics payload는 allowlist schema만 저장한다.
- PII/raw text/prompt/provider raw response는 저장하지 않는다.
- 이름, 이메일, 전화번호, 회사명, 담당자명, 주소 상세는 event payload에 넣지 않는다.
- 법무/세금/보안/결제 예외 보관 기록은 ProductAnalyticsEvent가 아니라 별도 정책 table에서 다룬다.

## 6. UX/UI

- 09는 새 사용자-facing 화면을 만들지 않는다.
- 기존 Notion + Attio식 record flow를 유지한다.
- analytics wrapper 때문에 route 전환, table row open, detail panel, create flow가 느려지면 안 된다.
- 11 Admin에서 UI를 만들 때는 Admin desktop 운영 콘솔 톤과 table/filter/detail panel 기준을 따른다.
