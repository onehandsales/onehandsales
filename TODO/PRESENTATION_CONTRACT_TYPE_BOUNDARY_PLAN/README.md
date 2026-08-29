# Presentation Contract Type Boundary Plan

상태: Ready / Backend Follow-up / G01 Next
작성일: 2026-08-29
생성 근거: `TODO\DONE\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\BE-TODO\G08-PRESENTATION-REPOSITORY-PROJECTION-AUDIT.goal.md`

## 1. 목적

이 계획은 Backend `presentation` 계층이 `application/ports/*repository*`의 DTO validation enum/const, mapper input projection record에 직접 기대는 패턴을 정리하기 위한 후속 작업이다.

G08 감사 결과 repository token/interface를 presentation에서 직접 사용한 위반은 없었다. 다만 DTO 런타임 검증 값과 response mapper 입력 타입이 repository port 파일에 함께 있어 계층 경계가 흐려져 있으므로, API 응답 shape를 바꾸지 않고 타입 소유 위치만 단계적으로 분리한다.

다음 실행 대상은 `COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`이다.

## 2. 감사 요약

2026-08-29 G08 기준:

| 항목 | 결과 |
| --- | ---: |
| presentation의 `application/ports/*repository*` import line | 22 |
| 영향을 받는 presentation 파일 | 20 |
| repository token/interface 직접 사용 | 0 |
| DTO validation 값/타입 경계 정리 대상 | 11 files |
| response mapper projection record 경계 정리 대상 | 9 files |

상세 목록은 `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`를 기준으로 한다.

## 3. 포함 범위

- DTO query/body validation에 쓰이는 enum/const/type의 소유 위치 정리
- repository port 파일에 있는 HTTP 계약성 sort/filter/status 값을 application non-repository contract 또는 presentation contract로 분리
- response mapper 입력 record를 repository projection type에서 application service read model/output contract로 분리
- 기존 API path, method, request field, response field, error code 의미 보존
- 코드 변경 시 Backend typecheck/lint/test 검증

## 4. 제외 범위

- API 응답 shape 변경
- repository 구현체의 DB 조회 로직 변경
- Prisma schema/migration 변경
- FE 타입/API 소비 코드 변경
- Admin/B2B 신규 기능 추가
- 결제/Paddle/Billing 작업

## 5. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/README.md` | 공통 문서 안내 |
| `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md` | G08 전수 감사 결과 |
| `COMMON/GOAL-WORK-ORDER.md` | 실행 순서 |
| `COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md` | DTO validation 계약 타입 분리 |
| `COMMON/G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md` | response mapper read model 입력 타입 분리 |
| `COMMON/G99-FINAL-REVIEW.goal.md` | 최종 검토 |
| `BE-TODO/README.md` | Backend 작업 안내 |
| `FE-TODO/README.md` | Frontend 변경 없음 안내 |

## 6. 실행 순서

한 번의 `/goal`에서는 하나의 goal 파일만 실행한다.

```text
/goal D:\workspace_repository\onehandsales\TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md 실행해줘.
/goal D:\workspace_repository\onehandsales\TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G99-FINAL-REVIEW.goal.md 실행해줘.
```

## 7. 공통 원칙

- repository token/interface를 presentation으로 가져오지 않는다.
- DTO에서 런타임 validation에 필요한 값은 repository port 파일이 아니라 HTTP 계약 또는 application query contract가 소유한다.
- response mapper는 application service 출력/read model 계약을 입력으로 받도록 한다.
- 타입 이동 과정에서 API 계약 의미를 바꾸지 않는다.
- 코드 변경 시 수정한 class/interface/type/helper에는 Backend 한글 주석 규칙을 적용한다.
- 사용자가 명시적으로 요청하지 않으면 커밋하지 않는다.
