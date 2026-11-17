# Backend Agent

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

NestJS/Prisma Backend의 계층·API·권한·트랜잭션·검증 기준을 관리한다. 현재 단일 서버의 modular monolith이며 다른 module의 Prisma repository를 직접 공유하지 않는다.

## 현재 범위

Auth/User/Workspace, Object/List/Attribute/Record/View, 오류·지원·공개 문의, Health와 관리자 확인이 있다. [구현 현황](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md), [API 목록](../COMMON/API_SAMPLE.md)을 따른다.

## Bonsai 전환

[CRM_CORE_BACKEND](ARCHITECTURE/CRM_CORE_BACKEND.md), [DB 계획](../DB_SCHEMA/BONSAI_SCHEMA_PLAN.md), [전환 영향](../COMMON/BONSAI_TRANSITION_MATRIX.md)에 따라 기존 코어를 재편한다. 첫 Kit 선택은 선행 조건이 아니다. 새 endpoint와 모델은 실제 화면의 소유 범위·권한·오류를 확인한 후 정한다.

## 반드시 확인

- [Backend 구조](ARCHITECTURE/BACKEND.md)
- [Module 경계](ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md)
- [Shared HTTP](ARCHITECTURE/SHARED_PRESENTATION.md)
- [API 계약](CONVENTION/API_CONTRACT.md)
- [트랜잭션](CONVENTION/TRANSACTION.md)
- [검토 기준](ENGINEERING_REVIEW_CHECKLIST.md)
- [DB 문서](../DB_SCHEMA/README.md)

검증은 BE/AGENTS.md와 변경 영향에 따른다. schema 변경 시 validate/generate, 실행 코드 변경 시 typecheck/lint/test 및 필요한 build를 수행한다. 실제 실행하지 않은 검증을 통과로 기록하지 않는다.
