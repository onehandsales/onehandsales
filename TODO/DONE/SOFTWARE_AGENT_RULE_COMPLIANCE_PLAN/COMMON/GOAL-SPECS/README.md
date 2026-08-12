# Goal Specs

상태: Done / Archived

## 1. 목적

이 폴더는 `SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`을 `/goal` 단위로 실행하기 위한 상세 스펙을 보관한다.

각 goal은 구현 전에 `AGENT/SOFTWARE_AGENT` 하위 관련 규칙 문서를 반드시 확인하고 그대로 따른다. 이 폴더의 goal 문서와 `AGENT/SOFTWARE_AGENT` 규칙이 충돌하면 `AGENT/SOFTWARE_AGENT`를 우선한다.

## 2. Goal 목록

| Goal | 상태 | 목적 |
| --- | --- | --- |
| `G01-ADMIN-WEB-AUTH-MOCK-REMOVAL.goal.md` | Implemented / Verified | Admin Web mock token/fallback role 제거 |
| `G02-BE-APPLICATION-PRESENTATION-BOUNDARY.goal.md` | Implemented / Verified | Backend application -> presentation 의존 제거 |
| `G03-BE-ADMIN-PRISMA-TYPE-BOUNDARY.goal.md` | Implemented / Verified | Admin Operation application/port의 Prisma type 제거 |
| `G04-BE-CROSS-MODULE-REPOSITORY-BOUNDARY.goal.md` | Implemented / Verified | Backend module 간 repository 직접 import 정리 |
| `G05-BE-COMMENT-COVERAGE.goal.md` | Implemented / Verified / Re-review Follow-up Recorded | Backend 주석 규칙 커버리지 보완 |
| `G06-FE-FEATURE-PUBLIC-API-BOUNDARY.goal.md` | Implemented / Verified / Re-review Verified | Frontend feature deep import 정리 |
| `G07-FE-COMMENT-COVERAGE.goal.md` | Implemented / Verified / Re-review Follow-up Recorded | Frontend 주석 규칙 커버리지 보완 |

## 3. 완료 보관 메모

- 2026-08-12 기준 G01-G07 재검토와 완료 로그 정합성 보강을 마쳤다.
- 계획 전체는 `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`에 보관한다.
