# CRM Core Backend Architecture

Status: Draft Architecture
Date: 2026-09-13

## 1. 목적

이 문서는 OneHand CRM의 후속 CRM Core를 Backend 관점에서 어떻게 나눌지 정의하는 초안이다.

현재 Backend에 CRM Core module은 없다. 이 문서는 구현 전 설계 기준이며, API 계약과 Prisma migration을 바로 의미하지 않는다.

## 2. 기본 원칙

- 고정형 Company/Product/Deal module을 복구하지 않는다.
- Workspace ownership을 모든 CRM Core data의 기본 경계로 둔다.
- Kit은 단순 템플릿이 아니라 Object, Attribute, Relationship, View, Status, Next Action의 시작 구조다.
- 사용자 화면의 업무 언어와 내부 model 용어를 분리한다.
- MVP는 Kit 적용, 첫 Record 생성, 기본 List/View 조회를 우선한다.

## 3. 후보 Module

후속 Backend module 후보는 아래와 같다.

| Module | 책임 |
| --- | --- |
| `workspace` | 사용자의 CRM 공간 생성, 조회, ownership 검증 |
| `kit` | 제품 제공 Kit 정의 조회, Workspace에 Kit 적용 |
| `crm-core` | Object/Attribute/Relationship/View definition 관리 |
| `record` | Record 생성, 조회, 수정, 연결, 기본 목록 조회 |

초기 MVP에서는 module을 더 작게 나누기보다 응집도와 API 계약 안정성을 우선한다.

## 4. Layer 기준

각 module은 기존 Backend 표준 구조를 따른다.

```text
<module>/
  domain/
  application/
  infrastructure/
  presentation/
```

원칙:

- controller는 application use case만 호출한다.
- application layer가 transaction boundary를 갖는다.
- Prisma repository는 infrastructure에 둔다.
- domain/application 공개 계약에 Prisma model type을 노출하지 않는다.

## 5. API 후보

API 후보는 확정이 아니다. 실제 구현 전 `COMMON/API-SPEC` 계약이 필요하다.

| API 후보 | 목적 |
| --- | --- |
| `GET /api/kits` | 선택 가능한 Kit 조회 |
| `GET /api/kits/:kitId/preview` | Kit 미리보기 조회 |
| `POST /api/workspaces` | 기본 Workspace 생성 또는 Kit 적용 |
| `GET /api/workspaces/current` | 현재 Workspace 조회 |
| `GET /api/workspaces/:workspaceId/objects` | 관리 대상 목록 조회 |
| `GET /api/workspaces/:workspaceId/objects/:objectId/records` | Record 목록 조회 |
| `POST /api/workspaces/:workspaceId/objects/:objectId/records` | Record 생성 |
| `GET /api/workspaces/:workspaceId/records/:recordId` | Record 상세 조회 |
| `PATCH /api/workspaces/:workspaceId/records/:recordId` | Record 수정 |
| `POST /api/workspaces/:workspaceId/records/:recordId/relationships` | Record 연결 |

## 6. Ownership / Authorization

CRM Core API는 아래를 기본으로 한다.

- 모든 사용자 API는 AuthGuard 이후 current user를 사용한다.
- 모든 Workspace data는 current user ownership을 검증한다.
- MVP에서는 Team 권한을 추가하지 않는다.
- 후속 Team/WorkspaceMember가 생기면 ownership 검증을 membership 검증으로 확장한다.

## 7. Transaction 기준

transaction이 필요한 후보:

- Workspace 생성 + Kit snapshot 적용
- Object/Attribute/Relationship/View definition 일괄 생성
- Record 생성 + 기본 relationship 생성
- Record 상태 변경 + 다음 행동/활동 기록 생성

외부 Provider 호출은 transaction 안에 넣지 않는다.

## 8. Observability 기준

CRM Core mutation은 구조화 로그 event key를 가진다.

후보:

- `crm.workspace.created`
- `crm.kit.applied`
- `crm.record.created`
- `crm.record.updated`
- `crm.relationship.created`

로그에는 Record 원문 값, 개인정보, 자유 입력 memo를 남기지 않는다.

## 9. 구현 전 필요한 문서

구현 전 최소 필요 문서:

- PM의 첫 Kit 확정
- UXUI의 first use / record flow 확정
- DB schema draft 확정 또는 migration 계획
- `COMMON/API-SPEC` API 계약
- transaction / observability / error 계약

## 10. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
