# 07 MeetingNote AI Provider Log

상태: Confirmed Plan
확정일: 2026-07-26
순서: 07
성격: 회의 직후 next action/follow-up AI 후보 + MeetingNote AI/STT provider log 운영 기반
결정 상태: 사용자 결정과 `COMMON/DECISION-LOG.md` 07 baseline 반영

## 1. 목적

07은 단순한 provider log 작업이 아니다.

Global B2C에서 실제 구매를 이끌어낼 수 있도록, 회의록 AI/STT를 `회의 내용 정리`에서 `회의 후 해야 할 일과 후속 연락을 바로 만드는 기능`으로 확장한다.

핵심 사용자 가치는 다음이다.

- 회의가 끝난 뒤 다음 행동을 놓치지 않는다.
- 고객에게 보낼 follow-up 문구를 빠르게 만든다.
- AI/STT 실패 시에도 직접 작성으로 업무를 이어갈 수 있다.
- 서비스 운영자는 AI 실패율, latency, 비용을 추적해 유료 제품 수준의 안정성을 만든다.

## 2. 제품 방향

| 기준 | 07 반영 |
|---|---|
| Global B2C | AI 기능은 실제 업무 시간을 줄이고 후속 행동 누락을 줄여야 한다. |
| Notion식 UX | 회의록 상세는 record page처럼 유지하고 AI 후속 작업은 조용한 section/block으로 제공한다. |
| Attio식 CRM | 회의록, 딜, 담당자, 다음 행동, follow-up 문구를 linked record 맥락으로 연결한다. |
| AI 원칙 | AI는 후보와 초안만 만들고, 실제 업무 데이터 저장은 사용자가 확인한 뒤 실행한다. |
| 운영 신뢰 | provider raw/prompt/transcript 원문은 저장하지 않고, 비용/latency/실패 상태만 추적한다. |

UX/UI는 반드시 `AGENT/UXUI_AGENT`를 따른다. 특히 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`의 Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 우선한다.

Software/API/DB/FE/BE 구현은 반드시 `AGENT/SOFTWARE_AGENT`를 따른다.

## 3. 1차 구현 범위

| 항목 | 포함 여부 | 결정 |
|---|---:|---|
| 공통 `AiProviderCallLog` 확장 | 포함 | 05에서 만든 공통 AI provider log를 재사용하고 MeetingNote operation을 추가한다. |
| STT transcript 원문 DB 저장 | 제외 | transcript는 사용자 확인 전 임시 표시만 한다. 별도 transcript table을 만들지 않는다. |
| provider raw response/prompt 저장 | 제외 | raw response, prompt, API key, quota detail은 DB/log/response에 저장하지 않는다. |
| AI/STT safe failure UX | 포함 | 사용자에게 안전한 message와 재시도 가능 여부만 보여준다. |
| 회의록 next action 후보 생성 | 포함 | AI가 후보만 만들고, 사용자가 확인 후 기존 딜 다음 행동 저장 흐름으로 저장한다. |
| follow-up 초안 생성 | 포함 | AI가 초안만 만들고, 사용자가 확인/수정/복사한다. 자동 발송하지 않는다. |
| follow-up 초안 DB 저장 | 제외 | 초안 subject/body는 response로만 반환하고 DB에 저장하지 않는다. |
| AI data cleanup 제안 | 1차 제외 | 09/10/11과 연결될 수 있어 후속 후보로 남긴다. |
| MeetingNote 목록 summary | 1차 제외 | raw text/next action 정책 안정화 뒤 후속 API 후보로 남긴다. |
| Admin 운영 조회 | 제외 | 11 Admin Operation에서 masking, reason, audit와 함께 다룬다. |

## 4. 구현 실행 순서

정본 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_AI_PROVIDER_LOG_DB_PRISMA
-> G03_MEETING_NOTE_AI_LOG_BACKEND
-> G04_MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_BACKEND
-> G05_MEETING_NOTE_AI_USER_WEB
-> G06_QA_REVIEW_CLOSEOUT
```

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

## 5. 문서 구조

```text
07_MEETING_NOTE_AI_PROVIDER_LOG/
  README.md
  COMMON/
    DECISION-LOG.md
    SCOPE.md
    BUSINESS-LOGIC.md
    USER-FLOW.md
    SOURCE-PLAN-COVERAGE.md
    REFERENCES.md
    ARCHITECTURE-GUARDRAILS.md
    API-SPEC/
      README.md
      MEETING_NOTE_AI_DRAFT_LOG_API.md
      MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md
    GOAL-WORK-ORDER.md
    GOAL-COMPLETION-CHECKLIST.md
    GOAL-SPECS/
      README.md
      G01_PLANNING_API_DB_CONTRACT.md
      G02_AI_PROVIDER_LOG_DB_PRISMA.md
      G03_MEETING_NOTE_AI_LOG_BACKEND.md
      G04_MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_BACKEND.md
      G05_MEETING_NOTE_AI_USER_WEB.md
      G06_QA_REVIEW_CLOSEOUT.md
    PLANNING-REVIEW.md
    REVIEW-CHECKLIST.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    USER-WEB-TODO.md
```

## 6. 완료 기준

- MeetingNote AI/STT provider 호출이 공통 `AiProviderCallLog`에 기록된다.
- `AiProviderOperation`에 MeetingNote AI/STT/next action/follow-up operation이 추가된다.
- `AiProviderCallLog`는 MeetingNote target 연결이 가능하다.
- transcript 원문, 회의록 원문, prompt 원문, provider raw response가 DB/log/response에 저장되지 않는다.
- AI/STT 실패 시 사용자에게 safe message와 retryable 기준만 노출된다.
- 회의록 상세에서 next action 후보를 생성하고 사용자가 확인 후 딜 다음 행동으로 저장할 수 있다.
- 회의록 상세에서 follow-up 초안을 생성하고 사용자가 확인/수정/복사할 수 있다.
- 자동 발송, 자동 일정 생성, 자동 딜 변경은 없다.
- Backend/Frontend class/interface/API/function/복잡한 handler에 한글 주석 규칙을 적용한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- `COMMON/REVIEW-CHECKLIST.md`와 G06 QA closeout을 통과한다.

## 7. 참고

- `COMMON/SCOPE.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
