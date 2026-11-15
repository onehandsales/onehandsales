# Data Model

Status: 현재 / 목표 구분
Date: 2026-11-15

현재는 Workspace 아래 Object/Attribute/Record, List/Entry, View 정의와 값 테이블을 사용하는 범용 CRM 코어다. 이미 32개 Prisma 모델이 존재하며 “인증 테이블만 있다”는 과거 문구는 현재 상태가 아니다.

목표는 People/Companies 기본 정보 + Group별 포함 관계·사용자 필드 + 그룹 Custom objects + View 설정을 분리하는 구조다. 모든 동적 데이터를 없애는 방향은 아니다.

- 제품 개념: [CRM_CORE_CONCEPT_MODEL](CRM_CORE_CONCEPT_MODEL.md)
- 현재 구현: [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md)
- 현재 물리 모델: [schema.prisma](../../../BE/prisma/schema.prisma)
- 32개 모델별 유지·대체·제거 후보: [FOLK_SCHEMA_PLAN](../../SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md)
- API/FE 영향: [FOLK_TRANSITION_MATRIX](../../SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md)

스키마 세부안을 이 문서에 중복하지 않는다. 실제 데이터 이전·삭제 방식은 사용자 보존 요구와 새 계약을 확인한 후 결정한다.
