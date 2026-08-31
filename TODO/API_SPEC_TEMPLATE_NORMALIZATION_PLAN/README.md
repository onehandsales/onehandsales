# API-SPEC Template Normalization Plan

상태: In Progress / Documentation-only / G04 Completed / G05 Next
작성일: 2026-08-29
생성 근거: `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`

## 1. 목적

이 계획은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`와 `API_CONTRACT.md` 기준에 맞춰 API-SPEC 문서의 템플릿 누락을 정리하기 위한 후속 문서 작업 계획이다.

G07 감사에서 활성 API-SPEC 문서와 `TODO/DONE` 보관 API-SPEC 문서가 서로 다른 템플릿 수준을 가진 것으로 확인되었으므로, 코드 수정 Goal과 분리해 문서 정규화만 별도 관리한다.

2026-08-31 기준 G01에서 활성 Service QA API-SPEC 문서 정규화를 완료했고, G02에서 `TODO/DONE` 보관 API-SPEC 92개 감사 인덱스를 작성했다. G03에서 Core/User 보관 API-SPEC 후보 9개를 제한 정규화하고 `DOMAIN_GLOBAL_DATA_API.md`는 별도 G06으로 분리했다. G04에서 Mobile Field 보관 API-SPEC 후보 4개를 제한 정규화하고 HTTP API와 browser/local-only contract 경계를 보강했다.

다음 실행 대상은 `COMMON/G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md`이다.

## 2. 감사 요약

2026-08-29 G07 기준 API-SPEC 문서 현황:

| 구분 | 파일 수 | 판단 |
| --- | ---: | --- |
| 전체 `COMMON/API-SPEC/*.md` | 95 | 감사 대상 |
| 활성 TODO API-SPEC | 3 | 우선 정규화 대상 |
| `TODO/DONE` 보관 API-SPEC | 92 | 직접 수정 전 별도 감사 인덱스 필요 |
| 보관 문서 중 README 제외 비인덱스 문서 | 71 | `NO_API_CHANGE`, `NO_NEW_API_CONTRACT` 2개를 수동 제외하면 API 계약 후보는 69개 |

활성 API-SPEC 우선 판단:

| 문서 | 판단 |
| --- | --- |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/ERROR_REPORT_API.md` | 2026-08-31 G01에서 현재 production User API 구현 기준으로 계약 상태 `implemented`, API 이름, API 식별자, 소비자, 호환성, Request/Response 이름, 권한, FE error 처리/log level, Transaction/Observability 세부 항목을 보강했다. |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/SUPPORT_REQUEST_API.md` | 2026-08-31 G01에서 별도 `권한` 항목을 추가하고 계약 상태 표기를 정규화했다. |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/README.md` | 2026-08-31 G01에서 `SUPPORT_REQUEST_API.md` 인덱스를 추가하고 per-API 템플릿 감사 제외 문서임을 명시했다. |

## 3. 포함 범위

- 활성 API-SPEC 문서의 템플릿 필수 항목 보강
- API-SPEC README/index 최신화
- `TODO/DONE` 보관 API-SPEC의 수정 대상과 제외 대상 분류
- 보관 문서 직접 수정 전 감사 인덱스 작성
- G02에서 분류된 보관 API-SPEC 정규화 후보의 제한 보강
- 문서 변경 결과의 TODO_LOG 기록

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API path, method, request, response, error code, transaction, observability 동작 변경
- DB schema 또는 Prisma migration 변경
- 완료 보관 문서의 무차별 대량 수정
- 결제/Paddle/Billing, Admin/B2B 신규 기능

## 5. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/README.md` | 공통 문서 안내 |
| `COMMON/API_SPEC_AUDIT_RESULT.md` | G07 감사 결과와 정규화 우선순위 |
| `COMMON/DONE_API_SPEC_AUDIT_INDEX.md` | G02 보관 API-SPEC 전수 분류 인덱스 |
| `COMMON/GOAL-WORK-ORDER.md` | 실행 순서 |
| `COMMON/G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md` | 활성 Service QA API-SPEC 정규화 |
| `COMMON/G02-DONE-API-SPEC-AUDIT-INDEX.goal.md` | 보관 API-SPEC 감사 인덱스 작성 |
| `COMMON/G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md` | 보관 Core/User API-SPEC 정규화 |
| `COMMON/G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md` | 보관 Mobile Field API-SPEC 정규화 |
| `COMMON/G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md` | 보관 Admin Operation API-SPEC 정규화 |
| `COMMON/G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md` | Domain Global Data 복합 API-SPEC 정규화 |
| `COMMON/G99-FINAL-REVIEW.goal.md` | 문서 정규화 최종 검토 |
| `BE-TODO/README.md` | Backend 코드 변경 없음 안내 |
| `FE-TODO/README.md` | Frontend 코드 변경 없음 안내 |

## 6. 실행 순서

한 번의 `/goal`에서는 하나의 goal 파일만 실행한다.

```text
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G02-DONE-API-SPEC-AUDIT-INDEX.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G99-FINAL-REVIEW.goal.md 실행해줘.
```

현재 다음 실행 프롬프트:

```text
/goal D:\workspace_repository\onehandsales\TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md 실행해줘.
```

## 7. 공통 원칙

- API 계약의 의미를 바꾸지 않고 누락된 템플릿 항목만 보강한다.
- 실제 코드와 다른 내용을 문서에 적지 않는다.
- 완료 보관 문서는 먼저 감사 인덱스로 분류하고, 필요한 경우에만 명시된 goal에서 제한적으로 수정한다.
- 문서 작업이더라도 `TODO_LOG`에 읽은 문서, 수정 파일, 검증 결과, 남은 리스크를 기록한다.
- 사용자가 명시적으로 요청하지 않으면 커밋하지 않는다.
