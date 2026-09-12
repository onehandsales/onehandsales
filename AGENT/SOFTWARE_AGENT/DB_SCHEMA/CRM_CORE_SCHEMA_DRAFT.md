# CRM Core Schema Draft

Status: Draft / Not Migration Ready
Date: 2026-09-13

## 1. 목적

이 문서는 OneHand CRM의 후속 CRM Core를 DB schema 관점에서 검토하기 위한 초안이다.

이 문서는 Prisma migration 지시서가 아니다. 구현 착수 전 PM의 Kit 정책, UX의 첫 사용 flow, Backend API 계약이 함께 확정되어야 한다.

## 2. 설계 원칙

- 고정형 Company/Product/Deal 테이블을 되살리지 않는다.
- 사용자 화면은 Kit의 업무 언어를 쓰지만, 내부 모델은 Workspace, Kit, Object, Attribute, Relationship, Record 중심으로 설계한다.
- 첫 MVP는 복잡한 schema builder보다 Kit 적용, 첫 Record 생성, 기본 List/View 조회를 우선한다.
- Team/조직 권한은 후속 범위로 두고, MVP는 개인 Workspace 기준을 우선한다.
- 모든 사용자 데이터 row는 Workspace ownership 경계를 가져야 한다.

## 3. 후보 모델

후보 모델은 아래처럼 나눌 수 있다.

| 후보 모델 | 책임 |
| --- | --- |
| `Workspace` | 사용자의 CRM 데이터 경계 |
| `WorkspaceMember` | 후속 Team/권한 확장을 위한 후보. MVP에서는 보류 가능 |
| `KitDefinition` | 제품이 제공하는 Kit 정의 |
| `WorkspaceKit` | Workspace에 적용된 Kit snapshot |
| `ObjectDefinition` | Kit 또는 Workspace 안의 관리 대상 정의 |
| `AttributeDefinition` | Object의 입력/표시 필드 정의 |
| `RelationshipDefinition` | Object 간 연결 정의 |
| `Record` | 실제 업무 기록 |
| `RecordValue` | Record의 attribute 값 저장 후보 |
| `RecordRelationship` | Record 간 연결 저장 후보 |
| `ViewDefinition` | 기본 목록/상태별 보기/예정 보기 정의 |

## 4. Kit snapshot 원칙

Kit은 단순 템플릿 파일이 아니다.

DB 설계에서는 Kit 변경이 기존 Workspace와 Record에 주는 영향을 줄이기 위해 snapshot 전략을 우선 검토한다.

검토 기준:

- `KitDefinition`은 제품이 제공하는 원본 정의다.
- `WorkspaceKit`은 사용자가 시작한 시점의 Kit 적용 상태를 보존한다.
- Kit이 업데이트되어도 기존 Workspace가 자동으로 깨지면 안 된다.
- Kit 변경/추가/마이그레이션 정책은 PM 결정 후 구현한다.

## 5. Record 값 저장 방식 검토

`RecordValue`는 유연성을 주지만 query와 validation 비용이 커진다.

구현 전 검토해야 할 항목:

- 필드 타입별 validation 위치
- 필수 field와 optional field 처리
- list row에서 자주 읽는 핵심 attribute의 조회 최적화
- 검색/index 전략
- 정렬/필터 가능한 값의 저장 방식
- audit, 삭제, 복구, 병합의 후속 범위

첫 MVP에서는 고급 field builder보다 Kit별 필수 입력과 기본 보기 성능을 우선한다.

## 6. Relationship 저장 방식 검토

Relationship은 OneHand CRM이 단순 목록 앱이 아니라 CRM인 이유다.

검토 기준:

- Relationship definition은 Object 간 허용 관계를 설명한다.
- Record relationship은 실제 두 Record의 연결을 저장한다.
- 관계 이름은 Kit별 업무 언어로 표시되어야 한다.
- 양방향 조회가 필요한 관계는 index와 API response shape를 함께 설계한다.

## 7. 제외 범위

이 draft는 아래를 확정하지 않는다.

- 최종 Prisma model 이름과 field 이름
- migration 순서
- Team/seat 권한 모델
- billing/entitlement schema
- 자동화 workflow schema
- 대량 import/export schema
- analytics schema

## 8. 구현 착수 전 필요한 결정

- 첫 Kit 확정
- 한 사용자와 Workspace의 관계
- 한 Workspace에 여러 Kit을 적용할 수 있는지
- Kit 변경 시 기존 Record 보존 방식
- MVP에서 커스터마이즈 가능한 범위
- 목록 조회 성능을 위한 index/read model 전략

## 9. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md`
