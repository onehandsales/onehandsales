# Backend 구현 순서와 검증 기준

- 상태: G00~G99 구현·검증·검토 완료 (2026-10-29)
- 범위: 현재 View의 헤더 필터·정렬·보기 설정 조회 API 3개.
- 계약 정본: [VIEW_HEADER_MENU_QUERY_API.md](../COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md). Request/Response를 이 문서에 중복 정의하지 않는다.

## 1. 반드시 먼저 읽을 문서

- [TODO Software Agent Reference](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)
- [BE/AGENTS.md](../../../../BE/AGENTS.md)
- [Backend Agent](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION / ARCHITECTURE / DECISIONS
- [DB 기준](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md)
- [View 제약 검토](../../../VIEW_인덱스관련검토문서.md): 기본 ID FK와 미적용 복합 소속 FK 후보를 구분한다.
- [View 텍스트 UX](../../../VIEW_TWO_AREA_TEXT_UX.md)
- [계획 범위](../README.md)

## 2. 현재 코드 확인 결과

| 현재 파일 | 확인한 내용 / 활용 |
| --- | --- |
| `BE/src/modules/view-definition/presentation/http/user-workspace-view-header.controller.ts` | 초기 헤더 endpoint. 세 메뉴 endpoint는 별도 추가한다. |
| `BE/src/modules/view-definition/application/use-cases/get-workspace-view-header.use-case.ts` | Auth 이후 멤버십 → 소유 모듈 Summary → View 읽기 패턴을 참고한다. |
| `BE/src/modules/view-definition/infrastructure/view-definition.module.ts` | 신규 controller/use case/query port 바인딩을 조립할 위치. |
| `BE/src/modules/view-definition/domain/view-definition.errors.ts` | Workspace NotFound 재사용과 신규 오류를 정의할 위치. |
| `BE/src/modules/attribute-definition/application/ports/attribute-definition-detail-query.port.ts` | 현재 Object 한정 단건 계약. List 및 여러 참조 속성 batch 조회에 그대로 사용할 수 없다. |
| `BE/src/modules/attribute-definition/infrastructure/attribute-definition.module.ts` | 신규 `ATTRIBUTE_DEFINITION_METADATA_QUERY`를 exports에 공개했다. 기존 단건 계약은 유지한다. |
| `BE/src/shared/presentation/filters/http-exception.filter.ts` | 기존 오류 envelope/상태 매핑 보존. |
| `BE/prisma/schema.prisma` | 데이터 출처·nullable·Enum의 실제 기준. |

위 표는 착수 시 확인한 구조와 재사용 지점이다. 현재 세 메뉴 endpoint도 구현되어 있으며 초기 헤더 endpoint를 유지한다.

## 3. 계층·모듈 책임

```text
UserWorkspaceViewHeaderMenusController
  → GetWorkspaceViewFiltersUseCase
  → GetWorkspaceViewSortsUseCase
  → GetWorkspaceViewSettingsUseCase
      → ViewHeaderMenuReader                 (공통 읽기 검증)
      → WorkspaceAccessQuery                 (workspace 공개 계약)
      → Object/ListDefinitionSummaryQuery    (각 소유 모듈 공개 계약)
      → ViewHeaderConfigurationQuery         (view-definition 자체 계약)
      → AttributeDefinitionMetadataQuery     (attribute-definition 새 공개 계약)
          → 각 모듈 infrastructure의 Prisma adapter
```

위 이름의 controller/use case/Port를 구현했다. 공통 접근·참조 검증은 `ViewHeaderMenuReader`, 공개 필드 매핑은 `view-header-menu.mapper.ts`가 담당한다.

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
5. 하위 행의 where에 Workspace와 View를 모두 넣는다. 조회 범위 밖 행을 발견하기 위한 전역 진단 query는 추가하지 않는다. 제외된 행까지 오류로 감지한다고 보장하지 않는다.
6. 경로 JSON의 배열/UUID 형식을 먼저 확인한 뒤 최종 속성과 참조 경로, 그룹 설정의 속성 ID를 합쳐 batch Port에 전달한다. ID 비교 키만 정규화하고 저장 경로와 설정 행은 보존한다.
7. 필요한 Select/Status 옵션과 위젯 원본 View 요약을 일괄 조회한다. ID마다 단건 조회를 반복하는 N+1 구조를 피한다.
8. API 계약 7절의 조건으로 참조를 확인한다. 모든 필터 그룹의 순환을 검사하고, GroupSetting의 부모·속성·옵션을 각각 비교한다. 깨진 참조는 `ViewHeaderConfigurationInvalid`이며 정상 행만 남겨 성공시키지 않는다. 조회 중 DB 행을 보정하지 않는다.
9. 계약에 따라 정렬하고 nullable/빈 배열/저장 JSON을 보존해서 반환한다.

추가 기준:

- 참조 경로는 저장된 순서 그대로 읽는다. 빈 경로도 정상이다.
- List의 첫 ListEntry를 조회해 전체 List의 Object 타입으로 확정하지 않는다. 이번에는 저장된 속성 참조 메타데이터를 읽는다.
- 소속 검증과 미래 쿼리 실행기용 관계 경로 해석을 구분한다. 경로의 전체 실행 가능성, 다중값 비교, 지원 연산자·집계 방식은 현재 응답 읽기에 임의 제약으로 추가하지 않는다.
- 같은 Workspace에 있다는 사실만으로 최종 속성의 Object/List 소속까지 올바르다고 판정하지 않는다. 직접 속성의 SourceScope별 판정은 G00에서 저장/실행 API로 후속 분리했다.
- 숨김 row, 중복 역할 row, 동일 원본을 참조하는 여러 위젯을 누락하지 않는다.
- 위젯 원본 요약은 1단계만 조회한다. 재귀 렌더링이나 자기/순환 참조 금지 도메인 규칙은 이번에 확정하지 않는다.
- 원본 Record/RecordAttributeValue/ListEntryValue와 ViewWorkDependency는 읽지 않는다. 본문 결과 건수도 계산하지 않는다.
- 설정이 없으면 빈 배열이다. 기본 View·루트 필터·기본 정렬·기본 JSON을 자동 생성하지 않는다.
- 신규 DB 인덱스는 이번 계획에 포함하지 않는다. 규모에 따른 성능 문제는 실제 읽기 쿼리와 실행 계획을 근거로 별도 검토한다.

### 4.1. 공개 batch Port의 입력/결과 설계

아래 내부 계약을 실제 interface로 구현했다. HTTP 응답과 달리 검증용 소속 필드를 유지하고, Prisma model/`Prisma.JsonValue`/외부 HTTP DTO는 공개 Port에 노출하지 않는다. 기존 단건 Attribute Port의 가공된 `config`를 원본 `configJson` 대용으로 쓰지 않는다.

| 소유 Port / 조회 | 입력 | 결과와 누락의 의미 |
| --- | --- | --- |
| View / 선택 View | `workspaceId`, `viewDefinitionId` | 해당 범위의 View projection 또는 null. ID, Workspace, Object/List ID, name/type/config 등 필요한 필드 |
| View / 메뉴별 하위 행 | `workspaceId`, `viewDefinitionId` | 필요한 테이블의 행 배열. 검증에 필요한 Workspace/View/부모/속성 ID와 `createdAt`을 내부 결과에 보존 |
| Attribute / 속성 batch | `workspaceId`, `attributeDefinitionIds: UUID[]` | 요청 Workspace에 있는 Attribute만 반환. id/workspaceId/objectDefinitionId/listDefinitionId/type/title/icon/isMultiselect/configJson 포함 |
| Attribute / 옵션 batch | `workspaceId`, 참조 Select/Status 속성 ID 집합, 명시된 `selectOptionIds`/`statusOptionIds` | 참조 속성의 전체 옵션과 명시 옵션 검증에 필요한 행을 각 테이블에서 일괄 조회. id/workspaceId/attributeDefinitionId/title/color/sortOrder/createdAt 포함 |
| View / 위젯 원본 batch | `workspaceId`, `contentViewDefinitionIds: UUID[]` | 같은 Workspace의 원본 요약만 반환. 내부 workspaceId와 응답용 id/name/type/icon. 재귀 조회 없음 |

- 모든 ID 입력은 중복을 제거한다. 빈 ID 집합은 해당 조회를 생략하고, 빈 조건이 전체 목록 조회로 바뀌지 않게 한다.
- 옵션 조회는 Workspace 조건 아래에서 `참조 속성 ID 집합 OR 명시 옵션 ID 집합`에 해당하는 행을 가져오는 방식으로 설계한다. 명시 ID가 다른 속성에 속해도 검증에 필요한 소속을 확인할 수 있어야 한다. 해당 행을 즉시 HTTP 응답에 섞지 않고 먼저 정확한 속성 일치를 검사한다.
- 참조 속성은 빈 배열인데 명시 옵션 ID는 있는 경우에도 명시 옵션 검증은 생략하지 않는다. 옵션의 타입별 조합 제한은 API 계약의 미확정 정책과 구분한다.
- Port는 결과에서 빠진 ID를 다른 Workspace에서 보충하지 않는다. View Application이 요청 ID 집합과 결과 map을 대조하여 선택 View 부재는 404, 조회된 설정의 필수 참조 누락은 500으로 변환한다. 빈 query 결과 자체를 항상 오류로 취급하지 않는다.
- metadata map의 UUID 키는 정규화하되 저장된 경로 JSON/비교값은 바꾸지 않는다. 최종 HTTP 응답에는 API 계약의 필드만 매핑한다.

### 4.2. 일괄 조회와 호출 수 검토

| 읽기 단위 | 요청당 설계 상한 / 생략 기준 |
| --- | --- |
| Workspace 멤버십 | 공개 Port 1회. Actor 생성이나 별도 사용자별 반복 확인 없음 |
| 선택 View | View Port 단건 조회 1회 |
| View의 Object/List 요약 | null이 아닌 각 참조에 대해 공개 Port 최대 1회씩 |
| 메뉴별 설정 테이블 | 필터 2개, 정렬 1개, 보기 설정 4개 테이블. 다른 메뉴나 Record 값 조회 없음 |
| Attribute 메타데이터 | 수집한 ID 집합으로 batch 1회. 집합이 비면 생략 |
| Select/Status 옵션 | 필요한 경우 각 테이블 batch 최대 1회. 정렬에서는 조회하지 않음 |
| 위젯 원본 View | 원본 ID 집합으로 batch 최대 1회. 필터/정렬 또는 위젯이 없으면 생략 |

이 표는 Port 호출과 테이블 batch의 기준이며 AuthGuard의 인증 조회를 포함한 실제 DB 총 query 수가 아니다. G99에서 세 메뉴와 메타데이터 adapter를 차례로 호출하는 통합 테스트의 SELECT 12회와 빈 batch의 SQL 생략을 확인했다. 단일 HTTP 요청의 총 query 수를 12회로 의미하지 않는다. 설정 행/속성/옵션/위젯 개수에 비례하는 단건 반복은 없다.

### 4.3. Application 검증 순서

1. 접근 가능한 View와 null이 아닌 원본 참조를 확인한다. 저장된 View의 원본 참조가 해당 Workspace에서 해석되지 않으면 설정 오류로 분류한다.
2. 해당 메뉴 행을 읽고 경로 JSON 형식을 검사한다. 잘못된 경로를 조용히 제외하거나 빈 경로로 바꾸지 않는다.
3. ID 집합을 만들어 메타데이터를 일괄 조회하고 누락을 확인한다. API 계약 7.4절의 직접 소속 판정은 G00 결정에 맞춘다.
4. 필터는 모든 그룹을 대상으로 부모 존재 및 순환을 검사하고 모든 조건의 그룹 연결을 검사한다. 여러 루트와 빈 그룹은 보존한다.
5. 보기 설정은 현재 View의 그룹 map과 GroupSetting의 속성을 비교한 뒤 명시된 각 옵션의 Workspace/속성을 비교한다. 위젯은 같은 Workspace의 원본 요약 존재를 확인한다.
6. 모든 검증 후 정렬·응답 매핑을 수행한다. 실패 시 API 계약의 고정 오류/로그 reason만 사용하고 부분 성공이나 기본값 복원 응답을 만들지 않는다.

동시 변경이 가능한 비트랜잭션 읽기다. 누락 참조가 관측되었다고 영구적 DB 손상으로 단정하거나, 다른 시점의 재조회 결과로 응답을 조립하지 않는다.

## 5. Transaction·로그·주석

- transaction: 없음. 여러 읽기의 동일 snapshot을 보장한다고 설명하지 않는다.
- 변경 모델, rollback, idempotency key, outbox, 후속 저장, 신규 Provider 호출: 없음.
- 오류 event와 redaction은 API 계약 9절을 따른다. application logger port를 사용한다.
- class/interface에 `// 역할 : ...`, controller method에 `// API : ...`, 내부 함수에 `// 기능 : ...` 한글 주석을 둔다.
- 권한·조회·검증·응답 구성 흐름은 `// 1. ...`, `// 2. ...` 단계 주석으로 설명한다.

## 6. 작업 순서

### G00. 계약 검토와 공통 설계 확정

- 목적: 구현자가 다른 의미로 해석할 부분을 먼저 닫는다.
- 포함: API 계약 10절 검토, 실제 schema/fixture 대조, SourceScope별 직접 소속 판정의 포함/후속 분리 결정, 안전한 참조 검증·오류·빈 입력 정책, 4.1절 batch Port 입력/출력, 4.2절 호출 수 검토.
- 제외: 메뉴 추가/편집용 후보 API, 실제 데이터 쿼리 엔진, Frontend, DB 변경.
- 완료 기준: API 계약이 구현 가능한 `confirmed` 상태이고 미확정 후보는 후속 범위로 분리되어 있다. 새 도메인 제약을 임의로 확정하지 않는다.
- 완료 증거: 직접 소속 판정표의 처리 결과, 분리 배열/비교값 라벨의 소비 범위, 실제 fixture의 정상·잘못된 참조 사례, 신규 오류 매핑과 public Port의 입력/결과 및 DI 공개 계획. 문서 보완 체크를 구현 테스트 통과로 기록하지 않는다.

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
| HTTP 계약 | 3개 경로·GET·200 응답, AuthGuard, UUID/빈 입력의 허용·거부 사례, 누락 없는 nullable/배열, 저장 경로 오류의 500, 기존 경로 회귀 |
| Application | 비멤버·다른 Workspace 격리, Actor 없는 읽기, 필요한 메뉴만 조회, 빈 batch 생략, ID 개수가 늘어도 batch 호출 수 유지, 조회에 mutation 없음 |
| 필터 | 중첩 AND/OR, 여러 루트·빈 그룹 보존, null 비교값, 미정 String 연산자 원본, 끊긴 부모, 자기 순환, 여러 그룹 순환, 루트 없는 순환 컴포넌트 |
| 정렬 | ASC/DESC가 섞여도 조건 우선순위 유지, 동률 정렬, null config 보존, 본문 값 조회 없음 |
| 속성/경로 | 경로의 비배열·JSON null·잘못된 UUID 항목, 중간/최종 Attribute 누락, UUID 대소문자, 저장 경로 순서·중복 보존. 직접 소속 허용/거부는 G00에서 결정한 범위만 검증 |
| 보기 설정 | 11개 타입, 숨김/접힘, 표시역할과 그룹역할 구분, 반복 설정 보존, 그룹과 GroupSetting의 속성 불일치, 같은 Workspace의 다른 속성 옵션, 원본 View 누락/교차 Workspace, 반복 위젯 보존·1단계 요약 |
| Repository 통합 | 실제 Prisma where/select/orderBy, 조회 범위 밖 행 제외와 조회된 행의 참조 오류 구분, 옵션의 Workspace+Attribute 일치, JSON/null 매핑, 전역 보충 조회 없음 |
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

- [x] API 계약을 confirmed로 확정 후 구현하고, Request/Response/Error 대조 후 implemented로 갱신.
- [x] 신규 API 3개와 필요한 public port/module wiring 구현.
- [x] 설정 메뉴 조회 외 데이터 계산·저장이 추가되지 않음.
- [x] 현재 View 소속과 참조 데이터 격리 검증.
- [x] 필터 순환·경로 형식·그룹/속성/옵션 연결을 검증하고, 스코프 밖 행까지 전체 진단한다고 표시하지 않음.
- [x] SourceScope의 G00 결정과 미래 실행기/저장 API의 미확정 정책이 혼동되지 않음.
- [x] 전체 64 suites / 462 tests, typecheck/lint/build/Prisma validate 통과. 격리 PostgreSQL 검증과 실제 Supabase 미검증 구분.
- [x] API 계약 상태와 TODO_LOG를 실제 완료 수준에 맞게 갱신.
- [x] Frontend·schema/migration·실제 업무 DB·ENV 변경 없음 확인. 이번 구현은 커밋하지 않음.

검토 근거와 알려진 제한: [최종 검토](REVIEW.md).
