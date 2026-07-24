# Architecture Guardrails

상태: Confirmed
최종 업데이트: 2026-07-24

## 1. 선행 기준

- Backend/DB/Frontend 구조는 `AGENT/SOFTWARE_AGENT`를 따른다.
- UX/UI와 문구는 `AGENT/UXUI_AGENT`를 따른다.
- API 계약은 `COMMON/API-SPEC/*`를 우선한다.
- DB migration을 만든다.
- Prisma schema와 migration SQL에는 한글 주석 기준을 지킨다.

## 2. Backend 계층

- controller는 request validation과 application service 호출만 담당한다.
- application service는 transaction orchestration과 use case 흐름을 담당한다.
- AI provider, email provider, SMS provider 호출은 application port/adapter 뒤에 둔다.
- provider 호출 자체는 DB transaction 밖에서 수행한다.
- provider response는 정규화/redaction한 뒤 짧은 DB transaction으로 저장한다.
- ownership 조건은 모든 repository method에 `userId`로 들어간다.
- 05-A 생성 중복 방지는 DB partial unique index와 application guard를 함께 사용한다.
- 05-B 발송 중복 방지는 message status transition과 delivery attempt 생성 transaction으로 막는다.

## 3. DB/Migration

- 05-A migration은 AI weekly report, suggestion, job, provider call log를 만든다.
- 05-B migration은 05-A의 `AiWeeklySalesReport`, `AiWeeklySalesReportSuggestion` 존재를 전제로 한다.
- report, failed report, provider call log, follow-up message, delivery attempt는 감사 이력으로 보존한다.
- 사용자가 AI report version과 follow-up 발송 이력을 삭제하거나 숨길 수 없게 한다.
- token과 phone 원문은 암호화 저장한다.
- OAuth state와 SMS verification code 원문은 저장하지 않고 hash만 저장한다.
- 모든 timestamp는 UTC instant, week/date 값은 date-only 정책을 따른다.

## 4. AI Weekly Report

- 03 주간 일정 보고서 데이터를 새로 만들지 않고 기존 `/app/schedules/week` 흐름 위에 AI section을 붙인다.
- 생성은 수동 실행이다.
- 생성은 비동기 job으로 처리한다.
- 재생성은 기존 report를 덮지 않고 새 version을 만든다.
- 실패 version도 저장한다.
- AI input snapshot은 회의록 본문 전체를 포함할 수 있다.
- 사용자 response에는 snapshot 전체 원문을 반환하지 않고 summary만 반환한다.
- AI 제안은 Deal, Schedule, Contact, Product, MeetingNote를 자동 변경하지 않는다.

## 5. Follow-up Delivery

- 05-B는 05-A 이후 구현한다.
- email은 Gmail과 Microsoft 365만 지원한다.
- SMS는 국제 SMS를 지원한다.
- 사용자는 본인 연결 email account 또는 인증된 발신번호로만 발송한다.
- 발송 전 compose 화면에서 recipient, subject, body를 확인/수정해야 한다.
- 예약 발송 없이 즉시 발송만 지원한다.
- 첫 발송 주의 안내는 channel별 1회 확인한다.
- 발송 제목/본문 전체는 DB 이력에 영구 보관한다.
- structured log에는 제목/본문 원문을 남기지 않는다.
- 비용은 내부 추적만 하고 사용자 화면에는 기본 노출하지 않는다.

## 6. Frontend

- `/app/schedules/week`는 업무 화면이다. landing/hero 설명 화면을 만들지 않는다.
- AI report section은 compact하고 scan 가능한 work-tool UI로 만든다.
- `/app/settings`에서 Gmail/Microsoft 연결과 SMS 발신번호 인증을 관리한다.
- 모바일은 table을 억지로 유지하지 않고 card/list로 표현한다.
- 사용자 문구는 해요체를 쓴다.
- lucide icon, tooltip, page-number pagination 기준을 따른다.

## 7. Observability

- structured log는 request id, user id, operation, status, latency, safe error code 중심으로 남긴다.
- AI prompt, input snapshot 원문, provider raw response, token, SMS code, phone 원문, email/SMS body는 log에 남기지 않는다.
- AI/provider 비용은 내부 추적 필드에 저장한다.

## 8. 금지

- AI report 자동 생성
- AI 제안 기반 도메인 record 자동 mutation
- email/SMS 예약 발송
- campaign/bulk marketing 발송
- SMTP 직접 설정
- Admin 민감 원문 조회
- provider raw response 사용자 노출
- 사용자 화면 비용 기본 노출
- 로그 hard delete UI
