# Backend 구현 순서와 검증 기준

- 상태: 계획 / 구현 미착수
- 범위: 현재 View의 헤더 필터·정렬·보기 설정 조회 API 3개.
- 계약 정본: [VIEW_HEADER_MENU_QUERY_API.md](../COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md). Request/Response를 이 문서에 중복 정의하지 않는다.

## 1. 반드시 먼저 읽을 문서

- [TODO Software Agent Reference](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [BE/AGENTS.md](../../../BE/AGENTS.md)
- [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION / ARCHITECTURE / DECISIONS
- [DB 기준](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md)
- [View 텍스트 UX](../../VIEW_TWO_AREA_TEXT_UX.md)
- [계획 범위](../README.md)

## 2. 현재 코드 확인 결과

| 현재 파일 | 확인한 내용 / 활용 |
| --- | --- |
| `BE/src/modules/view-definition/presentation/http/user-workspace-view-header.controller.ts` | 초기 헤더 endpoint. 세 메뉴 endpoint는 별도 추가한다. |
| `BE/src/modules/view-definition/application/use-cases/get-workspace-view-header.use-case.ts` | Auth 이후 멤버십 → 소유 모듈 Summary → View 읽기 패턴을 참고한다. |
| `BE/src/modules/view-definition/infrastructure/view-definition.module.ts` | 신규 controller/use case/query port 바인딩을 조립할 위치. |
| `BE/src/modules/view-definition/domain/view-definition.errors.ts` | Workspace NotFound 재사용과 신규 오류를 정의할 위치. |
| `BE/src/modules/attribute-definition/application/ports/attribute-definition-detail-query.port.ts` | 현재 Object 한정 단건 계약. List 및 여러 참조 속성 batch 조회에 그대로 사용할 수 없다. |
| `BE/src/modules/attribute-definition/infrastructure/attribute-definition.module.ts` | 현재 조회 Port가 exports에 공개되어 있지 않다. 새 batch Port를 공개한다. |
| `BE/src/shared/presentation/filters/http-exception.filter.ts` | 기존 오류 envelope/상태 매핑 보존. |
| `BE/prisma/schema.prisma` | 데이터 출처·nullable·Enum의 실제 기준. |

문서의 오래된 활성 모듈 목록으로 현재 소스의 기능을 미구현이라고 판정하지 않는다. 이번 세 메뉴 endpoint가 없는 사실과 초기 헤더가 존재하는 사실을 구분한다.

## 3. 계층·모듈 책임

```text
UserWorkspaceViewHeaderMenusController
  → GetWorkspaceViewFiltersUseCase
  → GetWorkspaceViewSortsUseCase
  → GetWorkspaceViewSettingsUseCase
      → WorkspaceAccessQuery                 (workspace 공개 계약)
      → Object/ListDefinitionSummaryQuery    (각 소유 모듈 공개 계약)
      → ViewHeaderConfigurationQuery         (view-definition 자체 계약)
      → AttributeDefinitionMetadataQuery     (attribute-definition 새 공개 계약)
          → 각 모듈 infrastructure의 Prisma adapter
```

위 신규 이름은 구현 예정 이름이다. 파일을 이미 생성했다는 뜻이 아니다.

- 현재 구조는 단일 NestJS modular monolith + Clean Architecture다.
- Controller: AuthGuard/UUID/빈 입력 검증, use case 호출, presentation DTO 매핑.
- Application: 멤버십·소속·참조 검증, 필요한 메뉴 query 조합, 오류와 로그의 책임.
- Query port: Prisma 타입 없는 scope/result 계약. 외부 HTTP DTO와 repository projection을 구분한다.
- Infrastructure: Prisma where/select/orderBy, JSON 직렬화 경계, query port 구현 및 DI 연결.
- 다른 모듈의 Prisma repository를 직접 import하거나 View repository에서 Attribute 테이블을 편의상 직접 읽지 않는다.
- AttributeDefinition 모듈은 Attribute/SelectOption/StatusOption 표시 메타데이터를 묶는 batch read port를 공개한다. 새 public HTTP API를 함께 만들 필요는 없다.
- 단일 프로세스의 port 호출이며 모듈 간 HTTP 호출을 만들지 않는다. 미래 service 분리 때문에 현재 MSA를 새로 구성하지 않는다.
- domain/application에 Prisma, Supabase SDK, Express, ConfigService, 구체 logger 타입을 노출하지 않는다. Nest DI decorator만 기존 허용 범위로 사용한다.

## 4. 조회 구현 방식

1. `currentUser.id`로 Workspace 멤버십을 한 번 확인한다. Actor가 없다는 이유로 정상 읽기를 차단하거나 생성하지 않는다.
2. View query port에서 `workspaceId + viewDefinitionId`를 조회한다. 다른 Workspace View를 전역 ID 조회로 찾아 응답하지 않는다.
3. 존재하는 Object/List 참조를 각각 공개 Summary Port로 검증한다. View의 두 FK에 임의 XOR, List의 단일 Object 소속, 같은 속성/역할의 유일성 규칙을 추가하지 않는다.
4. 필터는 그룹·조건, 정렬은 정렬 행, 보기 설정은 표시·그룹·그룹별 상태·위젯을 조회한다.
5. 하위 행의 where에 Workspace와 View를 모두 넣는다. 부모와 자식의 FK만으로 복합 소속까지 보장된다고 가정하지 않는다.
6. 최종 속성과 참조 경로의 속성 ID를 합쳐 batch Port에 전달한다. 응답 메타데이터만 중복 제거하고 설정 행은 보존한다.
7. 필요한 Select/Status 옵션과 위젯 원본 View 요약을 일괄 조회한다. ID마다 단건 조회를 반복하는 N+1 구조를 피한다.
8. parent group/condition/group setting의 연결이 현재 View 안에서 성립하는지 확인한다. 깨진 연결은 안전한 오류로 처리한다. 조회 중 DB 행을 보정하지 않는다.
9. 계약에 따라 정렬하고 nullable/빈 배열/저장 JSON을 보존해서 반환한다.

추가 기준:

- 참조 경로는 저장된 순서 그대로 읽는다. 빈 경로도 정상이다.
- List의 첫 ListEntry를 조회해 전체 List의 Object 타입으로 확정하지 않는다. 이번에는 저장된 속성 참조 메타데이터를 읽는다.
- 소속 검증과 미래 쿼리 실행기용 관계 경로 해석을 구분한다. 경로의 전체 실행 가능성, 다중값 비교, 지원 연산자·집계 방식은 현재 응답 읽기에 임의 제약으로 추가하지 않는다.
- 숨김 row, 중복 역할 row, 동일 원본을 참조하는 여러 위젯을 누락하지 않는다.
- 위젯 원본 요약은 1단계만 조회한다. 재귀 렌더링이나 자기/순환 참조 금지 도메인 규칙은 이번에 확정하지 않는다.
- 원본 Record/RecordAttributeValue/ListEntryValue와 ViewWorkDependency는 읽지 않는다. 본문 결과 건수도 계산하지 않는다.
- 설정이 없으면 빈 배열이다. 기본 View·루트 필터·기본 정렬·기본 JSON을 자동 생성하지 않는다.
- 신규 DB 인덱스는 이번 계획에 포함하지 않는다. 규모에 따른 성능 문제는 실제 읽기 쿼리와 실행 계획을 근거로 별도 검토한다.

## 5. Transaction·로그·주석

- transaction: 없음. 여러 읽기의 동일 snapshot을 보장한다고 설명하지 않는다.
- 변경 모델, rollback, idempotency key, outbox, 후속 저장, 신규 Provider 호출: 없음.
- 오류 event와 redaction은 API 계약 9절을 따른다. application logger port를 사용한다.
- class/interface에 `// 역할 : ...`, controller method에 `// API : ...`, 내부 함수에 `// 기능 : ...` 한글 주석을 둔다.
- 권한·조회·검증·응답 구성 흐름은 `// 1. ...`, `// 2. ...` 단계 주석으로 설명한다.

## 6. 작업 순서

### G00. 계약 검토와 공통 설계 확정

- 목적: 구현자가 다른 의미로 해석할 부분을 먼저 닫는다.
- 포함: API 계약 10절 검토, 실제 schema/fixture 대조, 안전한 참조 검증·오류·빈 입력 정책, batch Port 입력/출력, 예상 query 수 검토.
- 제외: 메뉴 추가/편집용 후보 API, 실제 데이터 쿼리 엔진, Frontend, DB 변경.
- 완료 기준: API 계약이 구현 가능한 `confirmed` 상태이고 미확정 후보는 후속 범위로 분리되어 있다. 새 도메인 제약을 임의로 확정하지 않는다.

### G01. 공통 접근·메타데이터 기반과 필터 조회

- 목적: 현재 저장된 필터 메뉴 상태를 읽는다.
- 포함: scoped View 읽기 Port, Attribute 메타데이터 batch Port와 DI exports, 필터 그룹·조건 조회, 안전한 응답 매핑, 해당 endpoint 테스트.
- 제외: 필터 추가/변경/저장과 실제 Record 필터링.
- 완료 기준: 빈 설정, 여러 루트/중첩 그룹, 직접/참조 속성, Select/Status 옵션, Workspace/View 격리와 오류가 계약대로 처리된다.

### G02. 정렬 조회

- 목적: 정렬 조건의 표시 우선순위와 방향을 읽는다.
- 포함: sort query adapter/use case/controller/DTO, 저장 JSON 보존.
- 제외: 방향 변경·드래그 순서 저장·본문 결과 정렬.
- 완료 기준: 서로 다른 ASC/DESC 조건이 `sortOrder` 순서로 반환되고 방향 값은 그대로 유지된다. `sortOrder` 동률도 결정적으로 반환한다.

### G03. 보기 설정 조회

- 목적: 11개 타입의 현재 저장된 메뉴 설정을 동일 외곽 응답으로 읽는다.
- 포함: 표시 속성·역할·형식, 그룹·그룹 상태, 위젯·원본 View 요약, configJson, 필요한 옵션.
- 제외: 렌더러, 집계·좌표·일정 계산, 위젯 결과 재귀 조회, 설정 저장.
- 완료 기준: 타입별 fixture, null/빈 배열, 숨김 row, 반복 속성·위젯, titleOverride/showTitle 분리, 교차 Workspace 참조가 계약대로 처리된다.

### G99. 회귀·문서·검증 정리

- 목적: 기존 헤더 기능과 모듈 경계를 보존한 상태로 Backend 완료 여부를 판정한다.
- 포함: 관련 자동 검증, 기존 헤더/목록/즐겨찾기 회귀, API 계약/작업 로그 갱신.
- 제외: Frontend 연결 완료 판정, 배포, 요청 없는 commit.
- 완료 기준: 실제 실행 결과와 미검증 범위가 구분되고 계약/소스/테스트가 일치한다. 통합 검증이 막히면 환경 원인과 남은 검증을 기록하고 전체 통과로 표시하지 않는다.

## 7. 검증 항목

| 계층 | 의미 있는 검증 |
| --- | --- |
| HTTP 계약 | 3개 경로·GET·200 응답, AuthGuard, UUID/빈 입력, 누락 없는 nullable/배열, 기존 경로 회귀 |
| Application | 비멤버·다른 Workspace 격리, Actor 없는 읽기, 필요한 메뉴만 조회, batch 호출, 조회에 mutation 없음 |
| 필터 | 중첩 AND/OR, 여러 루트 보존, null 비교값, 미정 String 연산자 원본, 끊긴 부모/순환 그룹 처리 |
| 정렬 | ASC/DESC가 섞여도 조건 우선순위 유지, 동률 정렬, null config 보존, 본문 값 조회 없음 |
| 보기 설정 | 11개 타입, 숨김/접힘, 표시역할과 그룹역할 구분, 반복 설정 보존, 직접 위젯 요약만 반환 |
| Repository 통합 | 실제 Prisma where/select/orderBy, Workspace/View/옵션 소속, JSON/null 매핑, 잘못된 교차 참조 차단 |
| 모듈 경계 | 다른 모듈 concrete repository import 없음, application/domain Prisma 타입 없음, public port DI 조립 |

Backend 구현 후 저장소 루트에서 실행할 기본 명령:

```powershell
pnpm.cmd -C BE typecheck
pnpm.cmd -C BE lint
pnpm.cmd -C BE exec jest --runInBand
pnpm.cmd -C BE prisma:validate
pnpm.cmd -C BE build
git diff --check
```

- 이번 문서 작성만으로 위 구현 검증이 통과했다고 기록하지 않는다.
- 전체 Jest 전에 전용 테스트 DB의 연결 대상과 가용성을 확인한다. 환경 파일 내용·secret을 출력하지 않는다.
- Prisma 로딩 시 `.env`가 process에 반영될 수 있으므로 실행 전 셸 환경 변수 유무만으로 DB 통합 테스트의 실행 여부를 단정하지 않는다.
- DB 통합 테스트는 전용 테스트 환경에서 수행한다. 실제 Supabase 업무 DB에 테스트 쓰기를 하지 않는다.
- ENV 파일을 바꾸거나 Docker를 실행하지 않는다. 실행 중인 다른 터미널의 서버를 임의로 종료하지 않는다.
- schema를 바꾸지 않으므로 불필요한 `prisma:generate`는 실행하지 않는다. 필요 시 Windows Prisma DLL 잠금은 서버 종료로 우회하지 않고 상황을 기록한다.
- 의미가 같은 테스트를 반복 추가하지 않고 권한·참조·순서·응답의 위험을 검증한다.

## 8. 완료 체크리스트

- [ ] API 계약 confirmed, Request/Response/Error 구현 일치.
- [ ] 신규 API 3개와 필요한 public port/module wiring 구현.
- [ ] 설정 메뉴 조회 외 데이터 계산·저장이 추가되지 않음.
- [ ] 현재 View 소속과 참조 데이터 격리 검증.
- [ ] 관련 검증 실행 결과와 DB 통합 환경 한계 기록.
- [ ] API 계약 상태와 TODO_LOG를 실제 완료 수준에 맞게 갱신.
- [ ] Frontend·DB·ENV 변경 없음 확인. commit은 명시적 요청 시에만 수행.
