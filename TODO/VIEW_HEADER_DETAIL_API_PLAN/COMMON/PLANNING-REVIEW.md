# View 헤더 구현 계획 기획 검토

- 검토·재구성일: 2026-10-25
- 판정: 문서 검토 통과 / Backend 구현 착수 가능
- 실제 API 구현·실행 검증: 미착수
- 구조 기준: COMPANY_DOMAIN_PLAN의 README·COMMON·BE-TODO·FE-TODO를 참고했다. 단일 통합 문서를 역할·실행 단계별 문서로 분리했다.

## 1. 검토 대상과 기준

[전체 계획](../README.md), [공통 범위](README.md), [사용 흐름](USER-FLOW.md), [작업 분담](WORK-SPLIT.md), [작업 순서](GOAL-WORK-ORDER.md), [API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md), [Backend 문서](../BE-TODO/README.md), [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md), [DB](../BE-TODO/DB-SCHEMA.md), [테스트](../BE-TODO/TEST-PLAN.md), [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md), [FE 후속 범위](../FE-TODO/README.md)를 함께 대조한다.

기준은 [TODO Software 정본](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [기획 검토 체크리스트](../../../AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md), [Backend 규칙](../BE-TODO/README.md)과 현재 Prisma schema다.

## 2. 확인한 내용

| 검토 축 | 문서 판정·근거 |
| --- | --- |
| 사용자 의도 | View 헤더 단건 GET 1개, 합의한 경로·Response 보존 |
| 역할별 문서 | README/COMMON/API-SPEC/BE-TODO/FE-TODO로 분리하고 계약 정본은 하나로 유지 |
| 실행 가능성 | G01에 신규·수정 파일, 공개 Port 계약, provider/export와 순서·완료 기준 명시 |
| DB·권한 | 현재 컬럼·nullable 소속·기본 ID FK·개인 Favorite 범위를 보존하며 새 제약 없음 |
| 검증 | TEST-PLAN에 실제 DB 격리·rollback·HTTP·DI·회귀와 필수 명령 명시 |
| 구현 후 검토 | G99를 필수 후속 단위로 두고 Backend 체크리스트·근거·미확인 기록 방식 명시 |
| Frontend | 현재는 소비 계약·후속 범위만 기록. 활성 FE 구현·본문 작업 추가 없음 |

## 3. 문서 간 충돌과 처리

앞선 '실행 문서 1개' 구성은 이번 사용자 요청으로 대체했다. API 계약 필드·경로·내부 조회·transaction/로그 정책은 바꾸지 않는다. 문서 내 과거 절 번호 참조는 역할별 문서 링크로 교체한다.

현재 문서상 Backend 구현을 막는 미정 정책은 없다. 기본 View·대시보드 제목·즐겨찾기 쓰기 정책은 공통 범위에 후속 결정으로 분리하며 이번 GET에서 임의 확정하지 않는다.

## 4. 구현 가능 여부와 후속 검토

- 첫 작업: [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md)
- 최종 필수 검토: [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)
- 지금 통과한 것은 계획 문서다. 런타임·실제 DB·규칙 준수 최종 판정은 구현 후 실제 증거로 작성한다.
- 구조 변경 후 상대 링크·계약 필수 항목·JSON 예시·원래 승인한 응답 보존과 상태 일치를 확인하고 문서 작업 로그에 결과를 기록한다.

## 5. 문서 재구성 검증 결과

- 계획 문서 13개와 상대 참조 134개: 확인·통과.
- API 정본의 HTTP 계약·내부 조회·DB/transaction/observability 3개 절은 재구성 전과 절 번호를 제외한 내용이 동일하다.
- JSON 예시 2개, 필수 계약 항목과 스키마 View 타입 11개, 문서 공백·코드 블록, 역할별 파일과 활성 목차: 확인·통과.
- `git diff --check`: 통과. 실행 코드 변경과 BE/FE/API 런타임 검증은 이번 문서 작업에 포함하지 않았다.
