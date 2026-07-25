# Planning Review

상태: Ready for G01
검토일: 2026-07-25

## 1. 결론

- 판정: G01 구현 착수 가능
- 이유: 06의 제품 방향, 포함/제외 범위, 비즈니스 로직, 유저 플로우, API 계약, DB 후보, FE 작업, goal 순서, UXUI/SOFTWARE guardrail이 구현 착수 전 검토 가능한 수준으로 정리됐다.
- 주의: G02 이후 코드 구현 전 G01에서 현재 코드와 계약을 최종 대조해야 한다.

## 2. 사용자 결정 반영

| 항목 | 반영 결과 |
|---|---|
| 06 준비 방식 | 전체 목표를 문서화하고 `/goal` 단위로 순차 구현한다. |
| 1차 목표 | `DealActivity` 정본 + 딜 상세 timeline |
| 자동 기록 범위 | 핵심 딜 진행 + follow-up 발송 이력 |
| 수동 기록 | 포함 |
| 수동 기록 수정 | 포함 |
| 수동 기록 삭제 | 1차 제외 |
| UX 기준 | Notion식 작업공간 UX + Attio식 CRM record 관계 UX |
| 구현 전략 | 기능 구현 우선, 전체 UX polish는 후속 |

## 3. 검토 대상

- `README.md`
- `COMMON/SCOPE.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/*`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/*`
- `COMMON/REVIEW-CHECKLIST.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`

## 4. 핵심 설계 판단

| 판단 | 내용 |
|---|---|
| Deal 중심 | 1차는 모든 도메인 공통 activity bus가 아니라 Deal 중심 정본을 만든다. |
| Timeline 정본 | 목록 summary보다 `DealActivity`와 딜 상세 timeline을 먼저 만든다. |
| 자동/수동 구분 | sourceType으로 시스템 생성 activity와 사용자 수동 activity를 구분한다. |
| 수정 가능 범위 | 수동 activity만 수정 가능하다. 자동 activity는 수정/삭제하지 않는다. |
| 삭제 보류 | 수동 activity 삭제는 Trust/policy, retention, audit와 엮이므로 후속으로 분리한다. |
| 메모 보류 | 메모는 민감정보 가능성이 있어 activity 통합을 후속으로 둔다. |
| Summary 후속 | Deal list products/latest activity, Contact dealCount는 G05/G06에서 구현한다. |
| Page size | 15개 page 계약을 유지하고 FE 단독 변경을 금지한다. |

## 5. 미해결 Critical/Major

없음. 단 G01에서 현재 코드와 실제 route/repository 구조를 다시 확인해야 한다.

## 6. 구현 중 주의

- 신규 migration이 있으므로 G02에서 `NBA-014` DB/Prisma 운영 gate를 확인한다.
- `DealActivity` title/body 원문은 structured log에 남기지 않는다.
- follow-up 본문 전체는 timeline 목록에 넣지 않는다.
- follow-up 발송 성공/실패는 `FollowUpDeliveryAttempt.id`를 sourceId로 사용하고 messageId는 metadata에 둔다.
- 딜 생성 시 초기 다음 행동 row가 함께 생성되므로 `DEAL_CREATED`와 초기 `NEXT_ACTION_CREATED`를 같은 transaction에서 처리한다.
- private memo, meeting note raw text, provider raw response를 summary에 넣지 않는다.
- schedule/meeting-note/follow-up 모듈에 activity writer를 연결할 때 module dependency cycle을 피한다.
- 기존 following-action/memo API를 즉시 제거하지 않는다.

## 7. 사용자 추가 결정이 필요한 질문

현재 G01 착수를 막는 질문은 없다.

후속 결정 후보:

- 수동 activity 삭제를 언제 포함할지
- 일반 메모 activity 통합을 할지
- 회사/제품 latest activity summary를 G06 이후 포함할지
- 고급 검색/필터와 딜 확률/score를 별도 goal로 언제 다룰지

## 8. 구현 시작 권장 문구

```text
/goal TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md 기준으로 G01을 구현해줘.
```
