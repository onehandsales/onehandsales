# Backend API TODO

상태: No API Change / Verified

## 1. 현재 API 변경 계획

없음.

이번 계획은 Backend API의 외부 계약을 바꾸지 않고 내부 계층 구조와 주석 규칙을 정리하는 작업이다.

## 2. API 변경 금지 기준

G02-G05에서는 기본적으로 다음을 변경하지 않는다.

- method/path
- path param/query/body/header/cookie
- response DTO field
- success status
- error code
- 인증/권한 정책

## 3. API 계약 문서가 필요한 경우

작업 중 외부 API shape가 바뀌어야 한다면 구현을 멈추고 다음 문서를 먼저 추가한다.

- `TODO/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/COMMON/API-SPEC/Gxx-*.md`

그 문서는 최소 `confirmed` 상태가 된 뒤 구현한다.

## 4. Backend 작업 메모

- controller는 application service만 호출한다.
- response mapping은 presentation 계층에 둔다.
- application result type은 application 계층에 둔다.
- Prisma type과 Prisma enum은 infrastructure mapper에서 application type으로 변환한다.
- cross-module write는 transaction boundary를 먼저 문서화하고 정리한다.
