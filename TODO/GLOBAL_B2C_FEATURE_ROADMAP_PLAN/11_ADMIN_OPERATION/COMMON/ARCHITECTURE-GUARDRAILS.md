# Architecture Guardrails

상태: Confirmed

## 1. API 경계

- User API: `/api/*`
- Admin API: `/admin/api/*`
- Admin API는 AuthGuard + AdminGuard 필수
- User Web은 `/admin/api/*` 호출 금지
- Admin Web은 `/api/*` 일반 사용자 API로 운영 데이터 처리 금지

## 2. Backend 경계

- Domain layer는 Nest/Prisma/HTTP/AdminGuard를 import하지 않는다.
- Application layer에서 권한, transaction, audit, use case orchestration을 처리한다.
- Infrastructure layer에서 Prisma query와 provider adapter를 처리한다.
- Presentation layer에서 controller/DTO/mapper/guard를 처리한다.
- 외부 provider 호출을 DB transaction 안에 길게 넣지 않는다.

## 3. Frontend 경계

- Admin Web은 `FE/admin-web` 전용 구현이다.
- User Web feature/client/component를 직접 import하지 않는다.
- Admin Web API client는 `/admin/api/*`만 호출한다.
- User Web 변경은 G05/G08에서만 허용한다.

## 4. DB 경계

- 기존 migration 파일은 수정하지 않는다.
- 신규 migration은 새 folder로만 만든다.
- 운영/공유 DB에 무단 migrate/seed를 실행하지 않는다.
- 신규 Prisma enum/model/field/index는 한글 주석과 SQL COMMENT를 가진다.
- audit log는 append-only다. update/delete 기능을 만들지 않는다.

## 5. Privacy/Redaction

저장/로그/응답 금지:

- provider raw response
- prompt 전문
- STT transcript 전문
- API key/token/authorization header
- quota detail
- DB URL
- private memo 원문 audit 저장
- email/phone/provider email 원문 log 저장

## 6. Trash

- Trash 만료는 hard delete/purge trigger가 아니다.
- `trashExpiresAt`은 무료 self-restore 만료 기준이다.
- User Web restore 불가 상태와 Admin recovery request는 결제/구독과 연결하지 않는다.

## 7. Analytics

- 11은 09 DB foundation만 읽는다.
- billing/paywall/churn event를 새로 만들지 않는다.
- external analytics provider forwarding을 만들지 않는다.
