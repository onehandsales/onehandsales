# 05 User Web TODO

상태: G04/G08/G09 Done / G10 Ready

## 1. Source of truth

User Web 구현자는 아래 문서를 따른다.

- AI report User Web TODO: `FE-TODO/AI_WEEKLY_REPORT_USER-WEB-TODO.md`
- Follow-up delivery User Web TODO: `FE-TODO/FOLLOW_UP_DELIVERY_USER-WEB-TODO.md`
- AI report user flow: `COMMON/AI_WEEKLY_REPORT_USER-FLOW.md`
- Follow-up user flow: `COMMON/FOLLOW_UP_DELIVERY_USER-FLOW.md`
- Follow-up email provider user flow: `COMMON/FOLLOW_UP_EMAIL_PROVIDER_USER-FLOW.md`
- UX/UI guardrails: `COMMON/ARCHITECTURE-GUARDRAILS.md`
- Goal specs: `COMMON/GOAL-SPECS/*`

## 2. 구현 순서

1. G04 AI report User Web
2. G08 Follow-up User Web
3. G09 Frontend QA closeout
4. G10 Follow-up email provider User Web 보강

## 3. 화면 원칙

- 05-A는 `/app/schedules/week` 안에 AI report section으로 붙인다.
- 05-B provider 연결은 `/app/settings`에서 관리한다.
- 05-B compose는 AI report follow-up suggestion에서 진입한다.
- 발송 이력은 AI report와 딜/담당자/회의록/일정 timeline 양쪽에서 표시한다.
- 모바일은 table 대신 card/list를 쓴다.
- 사용자 문구는 해요체를 쓴다.
- G10에서 `RECONNECT_REQUIRED`는 `/app/settings` 다시 연결 CTA로 이어져야 한다.
- G10 smoke allowlist 차단은 provider/internal detail 없이 짧은 safe error로 표시한다.

## 4. 기존 기능 보호

- 기존 주간 일정 보고서 조회를 깨지 않는다.
- 기존 Excel 다운로드를 깨지 않는다.
- 05-B 구현 전에는 실제 발송 버튼을 사용자에게 노출하지 않는다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- G10 신규/수정 FE 코드에는 한국어 `// 기능 : ...` 주석을 반드시 추가한다.
