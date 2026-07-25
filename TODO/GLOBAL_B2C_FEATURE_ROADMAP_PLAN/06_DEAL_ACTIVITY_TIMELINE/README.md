# 06 Deal Activity Timeline

상태: Implementation-ready Plan
확정일: 2026-07-25
순서: 06
성격: Deal 중심 activity 정본 + 상세 timeline + record summary 기반 계획
결정 상태: 사용자 결정과 `COMMON/DECISION-LOG.md` 06 baseline 반영

## 1. 목적

딜 하나를 열었을 때 영업이 어떻게 진행돼 왔는지 시간순으로 읽을 수 있게 한다.

06의 핵심은 화면 장식이 아니라 `DealActivity` 정본을 만드는 것이다. 현재 딜 상세에는 다음 행동 로그, 메모 로그, follow-up 이력이 분리돼 있고, 일정/회의록 연결은 각 도메인에 흩어져 있다. 06은 이 조각들을 딜 중심 activity timeline으로 연결해 Notion식 record page와 Attio식 CRM activity 맥락을 만든다.

## 2. 제품 방향

| 기준 | 06 반영 |
|---|---|
| Global B2C | 개인 영업자가 딜 진행 맥락을 반복해서 확인하고 다음 행동으로 이어갈 수 있어야 한다. |
| Notion식 UX | 딜 상세를 조용한 page/detail 구조로 유지하고 activity를 block/section 단위로 읽게 한다. |
| Attio식 CRM | 딜, 회사, 담당자, 제품, 일정, 회의록, follow-up을 linked record와 activity timeline으로 연결한다. |
| 기능 우선 | 전체 UX polish는 후속으로 두되, 데이터 정본과 사용자 흐름은 1차부터 올바르게 만든다. |

## 3. 이번 06에서 준비하는 전체 목표

06은 전체 목표를 지금 문서화하되, 구현은 `/goal` 단위로 나눠 순차 진행한다.

상위 입력 계획 반영 범위는 `COMMON/SOURCE-PLAN-COVERAGE.md`를 정본으로 본다. 06은 `NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-001`, `NBA-002`, `NBA-008`, `NBA-014`와 `NBA-003` 중 Deal latest activity subset을 포함한다. `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 first-sale global bundle인 Admin 운영, 결제/구독/세금, 앱 내부 다국어, 다국가 데이터 모델, 제품 분석은 06에서 구현하지 않고 별도 큰 계획으로 분리한다.

1. `DealActivity` DB 정본 모델을 만든다.
2. 딜 상세에서 `GET /api/deals/:dealId/activities`로 timeline을 조회한다.
3. 핵심 딜 진행 activity를 자동 기록한다.
4. follow-up email/SMS 발송 이력을 딜 timeline에 연결한다.
5. 사용자가 직접 수동 activity를 남기고 수정할 수 있게 한다.
6. 딜 목록에 연결 제품과 최신 activity summary를 추가한다.
7. 담당자 목록에 `dealCount`를 추가한다.
8. page size 15 계약을 Backend/FE/test/API 문서 기준으로 정리한다.
9. 검색/필터 고도화, 딜 가능성/확률, 메모 통합은 후속 결정 대상으로 문서화한다.

## 4. 1차 구현 범위

| 항목 | 포함 여부 | 결정 |
|---|---:|---|
| `DealActivity` model/API | 포함 | 06의 정본이다. |
| 딜 상세 activity timeline | 포함 | `GET /api/deals/:dealId/activities` 기준으로 구현한다. |
| 자동 activity | 포함 | 딜 생성, 단계 변경, 다음 행동 생성/완료, 일정 연결/해제, 회의록 연결/해제, follow-up 발송 이력 |
| 수동 activity 생성 | 포함 | 통화, 미팅, 이메일, 방문, 기타 |
| 수동 activity 수정 | 포함 | 수동 activity만 수정할 수 있다. |
| 수동 activity 삭제 | 1차 제외 | Trust/policy, retention, 감사 기준과 묶어 후속으로 결정한다. |
| 자동 activity 수정/삭제 | 제외 | 시스템 이력 정합성을 위해 수정/삭제하지 않는다. |
| 메모 activity 통합 | 후속 | 민감정보/원문 노출 정책 확정 뒤 별도 결정한다. |
| 목록 summary | 후속 goal | DealActivity 정본 뒤 G05/G06에서 다룬다. |

## 5. 자동 activity 기준

1차 자동 기록 대상:

- 딜 생성
- 딜 단계 변경
- 다음 행동 생성
- 다음 행동 완료/미완료 변경
- 일정 연결
- 일정 연결 해제
- 회의록 연결
- 회의록 연결 해제
- follow-up email/SMS 발송 성공
- follow-up email/SMS 발송 실패

자동 activity는 사용자가 직접 수정하거나 삭제할 수 없다.

## 6. 제외 범위

- 수동 activity 삭제
- 자동 activity 수정/삭제
- 일반 메모와 private memo의 timeline 통합
- 모든 도메인 공통 activity bus
- 고급 검색/필터 전체 개편
- 딜 가능성/확률 score 모델
- AI activity 자동 판단
- MeetingNote transcript/provider log
- Admin 감사/민감정보 원문 조회
- Admin 운영 화면/API
- 결제, 구독, 세금/컴플라이언스
- 앱 내부 다국어, 다국가 phone/currency/address 모델
- 제품 분석

## 7. 구현 실행 순서

정본 실행 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_DEAL_ACTIVITY_DB_PRISMA
-> G03_DEAL_ACTIVITY_BACKEND
-> G04_DEAL_ACTIVITY_USER_WEB
-> G05_DEAL_RECORD_SUMMARY_BACKEND
-> G06_DEAL_RECORD_SUMMARY_USER_WEB
-> G07_QA_REVIEW_CLOSEOUT
```

각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

권장 첫 실행 문구:

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```

## 8. 문서 구조

```text
06_DEAL_ACTIVITY_TIMELINE/
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
      DEAL_ACTIVITY_API.md
      DEAL_RECORD_SUMMARY_API.md
    GOAL-WORK-ORDER.md
    GOAL-COMPLETION-CHECKLIST.md
    GOAL-SPECS/
      README.md
      G01_PLANNING_API_DB_CONTRACT.md
      G02_DEAL_ACTIVITY_DB_PRISMA.md
      G03_DEAL_ACTIVITY_BACKEND.md
      G04_DEAL_ACTIVITY_USER_WEB.md
      G05_DEAL_RECORD_SUMMARY_BACKEND.md
      G06_DEAL_RECORD_SUMMARY_USER_WEB.md
      G07_QA_REVIEW_CLOSEOUT.md
    PLANNING-REVIEW.md
    REVIEW-CHECKLIST.md
  BE-TODO/
    API-TODO.md
    DB-SCHEMA.md
  FE-TODO/
    USER-WEB-TODO.md
```

## 9. 완료 기준

- `DealActivity` DB model과 migration이 구현된다.
- 딜 상세 timeline 조회 API가 구현된다.
- 자동 activity가 지정된 mutation과 같은 transaction에서 생성된다.
- 수동 activity 생성/수정 API가 구현된다.
- 딜 상세 화면에서 timeline이 loading/empty/error/success 상태를 가진다.
- follow-up 발송 이력이 딜 timeline에 안전한 summary로 표시된다.
- private memo, provider raw response, follow-up 본문 전체, 회의록 원문 전문이 timeline summary에 노출되지 않는다.
- Deal list `products` summary와 latest activity summary가 API 계약에 맞게 반영된다.
- Contact list `dealCount`가 ownership/soft delete 기준을 지킨다.
- page size 15 계약이 FE 단독 숫자 변경 없이 정리된다.
- `COMMON/REVIEW-CHECKLIST.md`와 G07 QA closeout을 통과한다.

## 10. 참고

- `COMMON/SCOPE.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/SOURCE-PLAN-COVERAGE.md`
- `COMMON/API-SPEC/DEAL_ACTIVITY_API.md`
- `COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
