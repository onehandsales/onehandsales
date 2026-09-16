# SOFTWARE_AGENT

## 1. 목적

`SOFTWARE_AGENT`는 OneHand CRM의 구현 구조, API/DB 계약, Frontend/Backend 경계, 검증 기준을 관리하는 문서 영역이다.

PM_AGENT가 제품 범위와 우선순위를 정하고, UXUI_AGENT가 화면 흐름과 사용자 경험을 정하면, SOFTWARE_AGENT는 그 기준을 실제 코드로 안전하게 구현하기 위한 구조를 정의한다.

## 2. 역할

SOFTWARE_AGENT는 아래 질문에 답한다.

- Backend module, application service, repository, controller를 어떻게 나눌 것인가?
- 현재 단일 Backend 서버의 module 경계를 미래 MSA service 경계처럼 어떻게 유지할 것인가?
- User Web과 Admin Web의 feature boundary를 어떻게 유지할 것인가?
- API request/response, error, transaction, observability 계약은 어디에 남길 것인가?
- Prisma schema와 제품 개념 모델은 어떻게 연결할 것인가?
- 현재 활성 구현과 비활성 레거시 흔적을 어떻게 구분할 것인가?
- 어떤 자동 검증과 수동 QA를 통과해야 변경을 완료로 볼 것인가?

## 3. 폴더 구조

```text
SOFTWARE_AGENT/
  README.md
  COMMON/
  BACKEND_AGENT/
  FRONT_AGENT/
  DB_SCHEMA/
```

## 4. 역할별 범위

| 영역 | 책임 |
| --- | --- |
| `COMMON` | 공통 구현 경계, 환경 변수, API 샘플, QA 기준, 다음 구현 우선순위 |
| `BACKEND_AGENT` | NestJS module, API, application/service/repository 구조, modular monolith/MSA 대비, transaction, observability |
| `FRONT_AGENT` | User Web/Admin Web 구조, route, feature, state, E2E, 배포 기준 |
| `DB_SCHEMA` | 현재 Prisma schema 설명, 후속 CRM Core schema draft, 레거시 제거 기록 |

## 5. 현재 구현 기준

현재 활성 구현은 foundation 범위다.

- Auth/User
- Error Report
- Support Request
- Public Contact Request
- Health
- Admin authority check
- User Web `/app`, `/app/more`, account/help/public contact
- Admin Web `/login`, `/`

고정형 Company/Product/Deal CRM은 활성 구현 기준이 아니다.

## 6. 후속 CRM Core 기준

후속 CRM Core는 고정형 영업 CRM 복구가 아니라 아래 개념을 구현하는 방향으로 설계한다.

- Workspace
- Kit
- Object
- Attribute
- Relationship
- Record
- List
- View
- Status
- Next Action

Software 문서에서는 이 개념을 DB schema, Backend module/API, Frontend feature/route로 옮기는 기준을 관리한다.

## 7. 우선 확인 문서

1. `COMMON/IMPLEMENTATION_BOUNDARY.md`
2. `COMMON/ENVIRONMENT.md`
3. `COMMON/QA_CHECKLIST.md`
4. `BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
5. `BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md`
6. `BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
7. `FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
8. `FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md`
9. `DB_SCHEMA/README.md`
10. `DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
11. `DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md`

## 8. 협업 원칙

- 제품 범위는 PM_AGENT를 따른다.
- 사용자 흐름과 화면 우선순위는 UXUI_AGENT를 따른다.
- Software 문서는 구현 구조와 검증 기준을 확정한다.
- API가 포함된 작업은 구현 전에 API 계약을 먼저 작성한다.
- DB schema 변경은 migration, API, FE 사용 방식, 테스트를 함께 검토한다.
- 현재 코드에 없는 기능을 활성 구현처럼 문서화하지 않는다.

## 9. 관련 문서

- `README.md`
- `AGENT/README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
