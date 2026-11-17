# Data Model

Status: 현재 기록 / 목표 설계 구분
Updated: 2026-11-17

기존 구현 기록에는 Workspace 아래 Object/Attribute/Record, List/Entry, View 정의와 값 테이블을 사용하는 32개 Prisma 모델이 있다. 이번 문서 변경에서 실제 schema·DB를 변경하거나 재검증하지 않았다.

Bonsai 재현을 위해 고객·거래·견적·문서·프로젝트·작업·시간·청구·입금과 권한·공유를 구분한다. 핵심 업무는 명시적 모델 후보로 검토하고 사용자 필드·보기 등 확장 기능은 요구에 맞게 설계한다. 현재 범용 엔진 유지나 모든 동적 모델 제거를 전제로 정하지 않는다.

- [제품 개념](CRM_CORE_CONCEPT_MODEL.md)
- [기존 구현 기록](IMPLEMENTATION_STATUS.md), [현재 물리 모델 파일](../../../BE/prisma/schema.prisma)
- [32개 기존 모델의 처리 후보와 목표 설계](../../SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)
- [API·FE 의존과 전환](../../SOFTWARE_AGENT/COMMON/BONSAI_TRANSITION_MATRIX.md)

기존 데이터 보존·이전 여부와 최종 모델 수·관계·삭제 정책은 별도 설계 사항이다. 공개 API가 Bonsai 내부 schema와 같다고 가정하지 않는다.
