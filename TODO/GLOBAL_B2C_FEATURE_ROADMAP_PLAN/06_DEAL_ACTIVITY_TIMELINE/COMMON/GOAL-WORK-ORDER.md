# Goal Work Order

상태: Confirmed
확정일: 2026-07-25

## 1. 원칙

06은 전체 목표를 문서화하지만 구현은 한 번에 하지 않는다. 각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

모든 goal은 구현 전에 아래 문서를 먼저 읽는다.

- `COMMON/SCOPE.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/USER-FLOW.md`
- `COMMON/SOURCE-PLAN-COVERAGE.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/DEAL_ACTIVITY_API.md`
- `COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 2. 실행 순서

```text
G01_PLANNING_API_DB_CONTRACT
-> G02_DEAL_ACTIVITY_DB_PRISMA
-> G03_DEAL_ACTIVITY_BACKEND
-> G04_DEAL_ACTIVITY_USER_WEB
-> G05_DEAL_RECORD_SUMMARY_BACKEND
-> G06_DEAL_RECORD_SUMMARY_USER_WEB
-> G07_QA_REVIEW_CLOSEOUT
```

## 3. G01 Planning API DB Contract

상세 명세: `COMMON/GOAL-SPECS/G01_PLANNING_API_DB_CONTRACT.md`

목표:

- 현재 코드와 06 문서 계약을 대조한다.
- 상위 입력 계획의 포함/제외 범위가 `SOURCE-PLAN-COVERAGE.md`와 일치하는지 확인한다.
- API/DB/FE 계약 충돌을 구현 전에 보정한다.
- G02~G07 구현 착수 blocking 질문이 없음을 확인한다.

## 4. G02 Deal Activity DB Prisma

상세 명세: `COMMON/GOAL-SPECS/G02_DEAL_ACTIVITY_DB_PRISMA.md`

목표:

- `DealActivity` 관련 enum/model/relation/index/migration을 추가한다.
- Prisma schema와 migration에 한글 주석/COMMENT를 남긴다.
- `NBA-014` DB/Prisma 운영 gate를 선행 확인한다.

## 5. G03 Deal Activity Backend

상세 명세: `COMMON/GOAL-SPECS/G03_DEAL_ACTIVITY_BACKEND.md`

목표:

- `DEAL_ACTIVITY_API.md`의 timeline 조회, 수동 activity 생성/수정 API를 구현한다.
- 핵심 자동 activity 생성 지점을 Backend transaction 안에 연결한다.

## 6. G04 Deal Activity User Web

상세 명세: `COMMON/GOAL-SPECS/G04_DEAL_ACTIVITY_USER_WEB.md`

목표:

- 딜 상세에 `딜 활동` timeline을 구현한다.
- 수동 activity 생성/수정 UX를 구현한다.
- 현재 FE host인 `DealDetailPanel` 안에 통합한다.
- 기존 다음 행동/메모/follow-up 섹션과 충돌하지 않게 점진 통합한다.

## 7. G05 Deal Record Summary Backend

상세 명세: `COMMON/GOAL-SPECS/G05_DEAL_RECORD_SUMMARY_BACKEND.md`

목표:

- `DEAL_RECORD_SUMMARY_API.md` 기준으로 Deal list products/latest activity summary와 Contact list dealCount를 Backend에 반영한다.
- page size 15 계약을 Backend/API/test 기준으로 정리한다.

## 8. G06 Deal Record Summary User Web

상세 명세: `COMMON/GOAL-SPECS/G06_DEAL_RECORD_SUMMARY_USER_WEB.md`

목표:

- 딜 목록에 제품 summary와 최신 activity를 표시한다.
- 담당자 목록에 dealCount를 표시한다.
- 모바일/desktop record list에서 API 응답에 없는 summary를 꾸미지 않는다.

## 9. G07 QA Review Closeout

상세 명세: `COMMON/GOAL-SPECS/G07_QA_REVIEW_CLOSEOUT.md`

목표:

- Backend/User Web 검증, ownership, redaction, transaction, mobile QA를 점검한다.
- `COMMON/REVIEW-CHECKLIST.md` 기준으로 closeout한다.

## 10. 현재 상태

```text
G01~G07 완료. 06 Deal Activity Timeline closeout 완료.
```
