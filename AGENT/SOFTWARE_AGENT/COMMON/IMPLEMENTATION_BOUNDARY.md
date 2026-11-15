# Implementation Boundary

Status: Current / target boundary
Date: 2026-11-15

## 현재

[IMPLEMENTATION_STATUS](../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)가 현재 코드의 정본이다. Auth/지원 기반 외에 Workspace, Object/List/Attribute/Record/View API와 TABLE/KANBAN/LIST UI가 존재한다. Prisma는 32개 모델이다.

이름에 Definition이 붙은 현재 엔진을 folk 구현 완료로 보지 않는다. 과거 고정형 CRM 기능 제거와 현재 범용 CRM 구현을 구분한다.

## 목표

[기능 대응표](../../PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)에 있는 folk 기능과 UX를 대응시킨다. People/Companies/Groups/Custom fields/Custom objects/Views 및 활동·공유·연동을 조사하고 구현한다.

## 전환 경계

- 계정·Workspace·Team·감사 및 지원 기반은 보존 후보이며 folk 정책과 의미를 대조한다.
- 기존 범용 CRM은 [DB 계획](../DB_SCHEMA/FOLK_SCHEMA_PLAN.md)의 대체·통합·제거 후보를 따른다.
- 화면 프로토타입은 mock으로 진행할 수 있다. 실연동에는 같은 흐름의 계약이 필요하다.
- schema만 먼저 삭제하거나 기존 API 명칭을 목표 API로 그대로 확정하지 않는다.
- 이번 변경은 문서 정비다. 기존 실행 코드·schema·migration은 그대로다.

[전환 영향](FOLK_TRANSITION_MATRIX.md)에 API·FE·데이터 순서를 기록한다.
