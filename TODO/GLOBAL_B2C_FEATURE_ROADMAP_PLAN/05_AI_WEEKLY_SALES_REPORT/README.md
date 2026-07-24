# 05 AI Weekly Sales Report

상태: Ready
순서: 05
성격: 저장형 AI 주간 영업 리포트 + follow-up email/SMS 실행
결정 상태: 2026-07-24 구현 착수 문서 정리 완료
구현 기준: `COMMON/GOAL-WORK-ORDER.md`

## 1. 목적

사용자가 이미 완성된 03 주간 일정 보고서 위에서 한 주의 영업 흐름을 AI로 해석하고, 리스크/다음 행동/follow-up/data cleanup 제안을 저장형 리포트로 추적하며, 필요한 follow-up을 email 또는 SMS로 직접 확인 후 보낼 수 있게 한다.

05는 `/app/schedules/week` 화면과 `GET /api/schedules/week`를 새로 만드는 작업이 아니다. 03 weekly schedule report를 기반으로 AI report와 follow-up delivery layer를 추가하는 작업이다.

## 2. 준비 상태

- G01~G09 작업 단위가 정의됐다.
- 05-A AI Weekly Report API, DB SQL, business logic, user flow, FE TODO가 문서화됐다.
- 05-B Follow-up Delivery API, DB SQL, business logic, user flow, FE TODO가 문서화됐다.
- 모든 신규 API의 request/response 이름과 business logic, transaction, observability 기준을 문서에 두었다.
- 신규 DB SQL 초안에는 enum/table/index/FK와 `COMMENT ON` 주석을 포함했다.
- UXUI 기준은 `AGENT/UXUI_AGENT`, software 기준은 `AGENT/SOFTWARE_AGENT`를 따른다.

## 3. 확정 범위

포함:

- 수동 생성형 AI weekly sales report
- 비동기 AI generation job
- report version 저장
- 실패 version 저장
- 같은 user/week/timeZone 생성 중복 차단
- 회의록 본문 전체를 포함한 AI input snapshot 저장
- 사용자에게는 snapshot summary만 노출
- summary, risk, next action, follow-up draft, data cleanup section
- AI suggestion target record 열기
- Gmail/Microsoft 365 email 연결
- 국제 SMS 발신번호 인증
- follow-up compose 확인/수정
- email/SMS 즉시 발송
- 발송 실패 safe error와 재시도
- 발송 제목/본문 전체 영구 보관
- AI report와 Deal/Contact/MeetingNote/Schedule timeline 발송 이력 표시

제외:

- AI report 자동 생성
- AI 제안 기반 Deal/Schedule/Contact/MeetingNote 자동 mutation
- 예약 발송
- campaign/bulk marketing 발송
- SMTP 직접 설정
- Google Calendar write/webhook
- PDF/generic ExportJob
- Admin 민감 원문 조회
- 사용자 화면 비용 기본 노출
- 계정 삭제/법적 삭제 요청 시 영구 로그 처리 정책

## 4. 확정 정책 요약

| 항목 | 결정 |
|---|---|
| 05 분리 | 05-A AI Weekly Report 후 05-B Follow-up Delivery 순서로 구현한다. |
| 생성 방식 | 사용자가 수동으로 생성한다. 자동 생성은 제외한다. |
| 처리 방식 | AI report 생성은 비동기 job으로 처리한다. |
| 저장 방식 | report는 version으로 저장하고 재생성은 새 version을 만든다. |
| 실패 보관 | 실패 version도 저장하고 삭제/숨김을 제공하지 않는다. |
| AI 입력 | 회의록 본문 전체를 포함하고 full input snapshot을 저장한다. |
| 사용자 노출 | full snapshot 원문은 노출하지 않고 summary만 보여준다. |
| 언어 | report는 사용자 app language 기준, follow-up은 compose에서 선택한다. |
| section | summary, risk, next action, follow-up draft, data cleanup. |
| 자동 변경 | AI suggestion은 원본 record를 자동 변경하지 않는다. |
| email | Gmail과 Microsoft 365만 지원한다. |
| SMS | 국제 SMS와 인증 발신번호만 지원한다. |
| sender | 사용자 본인 연결 email account 또는 인증 발신번호만 사용한다. |
| provider 설정 | `/app/settings`에서 관리한다. |
| compose | 수신자/제목/본문 확인과 수정 후에만 발송한다. |
| SMS 길이 | 1~2 segment로 제한한다. |
| 발송 시점 | 즉시 발송만 지원한다. |
| 첫 발송 안내 | channel별 1회 확인한다. |
| branding | onehand.sales branding 문구를 기본 삽입하지 않는다. |
| 비용 | 내부 추적만 하고 사용자 화면에는 기본 노출하지 않는다. |
| 로그 | 발송 제목/본문 전체는 영구 보관하고 사용자가 삭제할 수 없다. |
| 실패 | provider 실패는 safe error와 retryable flag로 처리한다. |
| Admin | 이번 범위에는 Admin 민감 원문 조회를 포함하지 않는다. |

## 5. 구현 문서

- Scope: `COMMON/SCOPE.md`
- API 계약: `COMMON/API-SPEC/README.md`
- AI report API: `COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md`
- Follow-up API: `COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md`
- Backend API TODO: `BE-TODO/API-TODO.md`
- DB Schema TODO: `BE-TODO/DB-SCHEMA.md`
- AI report DB SQL: `BE-TODO/AI_WEEKLY_REPORT_DB-SCHEMA.md`
- Follow-up DB SQL: `BE-TODO/FOLLOW_UP_DELIVERY_DB-SCHEMA.md`
- User Web TODO: `FE-TODO/USER-WEB-TODO.md`
- AI report User Web TODO: `FE-TODO/AI_WEEKLY_REPORT_USER-WEB-TODO.md`
- Follow-up User Web TODO: `FE-TODO/FOLLOW_UP_DELIVERY_USER-WEB-TODO.md`
- AI report business logic: `COMMON/AI_WEEKLY_REPORT_BUSINESS-LOGIC.md`
- Follow-up business logic: `COMMON/FOLLOW_UP_DELIVERY_BUSINESS-LOGIC.md`
- AI report user flow: `COMMON/AI_WEEKLY_REPORT_USER-FLOW.md`
- Follow-up user flow: `COMMON/FOLLOW_UP_DELIVERY_USER-FLOW.md`
- Goal 실행 순서: `COMMON/GOAL-WORK-ORDER.md`
- Goal 완료 체크리스트: `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- Goal 상세 명세: `COMMON/GOAL-SPECS/*`
- Planning review: `COMMON/PLANNING-REVIEW.md`
- Review checklist: `COMMON/REVIEW-CHECKLIST.md`

## 6. 첫 실행 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
