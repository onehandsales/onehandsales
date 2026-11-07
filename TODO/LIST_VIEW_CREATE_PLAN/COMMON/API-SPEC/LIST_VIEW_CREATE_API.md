# 업무 목록과 첫 보기 생성

계약 상태: implemented
소비자: User Web. 기존 조회 API와 호환되는 신규 mutation이다.

## 사용자 흐름

사이드바 업무 목록 + → 이름·기준 관리 항목 → 아이콘·설명·첫 보기 → 생성.
첫 보기는 TABLE 기본 선택, LIST/KANBAN 선택 가능하다. 기준 관리 항목의 제목으로
표시할 속성을 선택한다. 이 선택은 첫 보기의 RECORD 속성 바인딩이며 List의
허용 Object 종류를 고정하는 정책이 아니다. 기존 Record를 자동 등록하거나 복제하지 않는다.
KANBAN은 기존 관리 항목의 단일값 Status/Select를 재사용하거나 목록 전용 상태와
사용자가 입력한 단계를 생성한다. 단계 이름을 임의로 저장하지 않는다.

## 요청

`POST /api/users/me/workspaces/:workspaceId/list-definitions`

- Bearer 인증 필수, workspaceId UUID. 현재 멤버십과 Actor 확인. UUID는 대소문자를 정규화한다.
- DTO: `CreateWorkspaceListDefinitionDto`
- body의 미정의 필드는 whitelist 검증으로 거부한다. constructor·__proto__ 같은 예약 키도
  DTO 변환 전에 거부하고 기존 class-validator 검증을 이어서 실행한다. query/cookie 입력 없음.

| 필드 | 타입/검증 |
| --- | --- |
| listDefinitionName | 필수 string, trim 후 1~80 Unicode 문자. name/apiSlug에 저장 |
| objectDefinitionId | 필수 UUID, 동일 Workspace의 관리 항목 |
| titleAttributeDefinitionId | 필수 UUID, 위 Object의 속성. 첫 보기 TITLE로 사용 |
| viewType | 필수 TABLE / LIST / KANBAN |
| icon | 선택 string/null, 빈 문자열·null·생략은 null |
| description | 선택 string/null, 최대 300 문자. 빈 문자열·null·생략은 null |
| kanban | KANBAN일 때 필수, 나머지 타입에서는 금지. null 불허 |
| kanban.attributeDefinitionId | 기존 상태를 쓸 때 UUID. 위 Object의 단일값 Status/Select만 허용 |
| kanban.newStatus | 새 상태를 쓸 때 객체. attributeDefinitionId와 정확히 하나만 사용 |
| kanban.newStatus.title | trim 후 1~80 문자 |
| kanban.newStatus.options | string 배열, 1~50개, 각 trim 후 1~80 문자, 중복 금지, 입력 순서 유지 |

```json
{
  "listDefinitionName": "매물 상담",
  "objectDefinitionId": "00000000-0000-4000-8000-000000000001",
  "titleAttributeDefinitionId": "00000000-0000-4000-8000-000000000002",
  "viewType": "KANBAN",
  "kanban": { "newStatus": { "title": "진행 단계", "options": ["상담 접수", "방문 협의", "계약 협의"] } }
}
```

배열/문자 길이 제한은 이 생성 API 입력 한도이며 DB 도메인 전체의 제약은 아니다.

## 응답

201, `CreateWorkspaceListDefinitionResponse`:
`{ "listDefinitionId": "UUID", "viewDefinitionId": "UUID" }` (두 필드 non-null).
생성 시각·pagination·filter·sort 입력은 없다.

## 오류

| 상황 | 코드 / HTTP | FE 처리 / log |
| --- | --- | --- |
| 미인증 | Unauthorized / 401 | 공통 인증 흐름 |
| Workspace·멤버십 없음 | ListDefinitionWorkspaceNotFound / 404 | 안전한 오류, 입력 유지, warn |
| Object·속성 부재/다른 Workspace·Object 소속 | ListDefinitionSourceNotFound / 404 | 입력 재선택, warn |
| DTO 타입·UUID·추가 필드 | 공통 validation envelope / 400 | 생성 차단, 입력 수정 |
| 이름·보기·보드 설정 오류 | ValidationError / 400, field 포함 | 입력 수정, warn |
| 같은 Workspace의 apiSlug 중복·동시 생성 | ListDefinitionApiSlugAlreadyExists / 409 | 다른 이름 안내, warn |
| 저장 실패 | InternalServerError / 500 | 입력 유지/수동 재시도, error |

정상 업무 오류에 입력 원문을 포함하지 않는다. 존재하지 않는 다른 Workspace 자료도 같은 404로 처리한다.

## 소유권과 transaction

- orchestration owner: list-definition application use case.
- ListDefinition: list-definition command repository.
- 신규 AttributeDefinition·StatusOption: attribute-definition 공개 생성 port.
- ViewDefinition·ViewAttributeSettingDefinition·ViewGroupDefinition: view-definition 공개 생성 port.
- 필요: TransactionManager/TransactionContext로 모든 쓰기를 같은 Prisma transaction에 묶는다.
- 첫 View는 listDefinitionId만 연결, objectDefinitionId=null, sortOrder=0, 이름 `전체 {목록명}`.
- TABLE/LIST config: rowDensity=COMFORTABLE.
- KANBAN: cardDensity=COMFORTABLE, showEmptyGroups=true. GROUP 하나, ASC, 순서 0.
- TITLE은 RECORD scope, reference path=[]. 보드 상태는 RECORD 또는 LIST_ENTRY scope.
- 기존 상태 재사용 시 Attribute/Option 생성 없음. 신규 상태 apiSlug=status, type=Status,
  isMultiselect=false, 옵션 sortOrder는 입력순서, color=null. GROUP 속성은 DISPLAY에도 연결한다.
  GROUP이 TITLE과 같은 속성이면 기존 TITLE 표시를 재사용하고 중복 DISPLAY를 만들지 않는다.
- ViewGroupSetting은 사용자별 override가 없으므로 생성하지 않는다.
- Record/Record 값/ListEntry/List 값/즐겨찾기/필터/정렬은 생성하지 않는다.
- 선택된 Object와 속성 소속은 공개 port로 검증하며 속성은 transaction 안에서 재확인한다.
- 중간 실패/unique 충돌 시 List부터 모든 신규 row rollback. 부분 성공 없음.
- 외부 provider/이력 row 없음. 성공 로그는 commit 이후, transaction 오류 로그는 rollback 이후.
  application 입력·접근 검증 실패는 transaction 진입 전에도 기록한다.
- schema/migration 없음. List의 Object FK와 List+Record UNIQUE를 임의 추가하지 않는다.

## Idempotency / Outbox / 관측성

- 별도 idempotency key 없음. 기존 workspaceId+apiSlug unique로 중복 시409.
  응답 유실 후 재전송은 성공 응답 재사용 없이409이며 사용자는 사이드바에서 확인한다.
- FE 같은 tick 중복 제출 차단, mutation 자동 재시도 없음.
- outbox 없음: 현재 동기 DB 생성만 필요. 미래 service 분리 시 List 생성 command를 소유자로
  유지하고 idempotency/outbox 및 준비 상태·보상 설계를 선행한다.
- 이벤트: crm.listDefinition.created / crm.listDefinition.createFailed.
- requestId, userId, workspaceId, 성공 List/View ID와 실패 errorCode만 기록한다.
  오류 코드는 DomainError.code 또는 InternalServerError다. 이름·설명·단계·토큰·DB 오류 원문 제외.

## FE 상태

- crm-list feature에서 요청. 기존 관리 항목/속성 조회 API와 사용자·Workspace별 Query key 재사용.
- 성공 시 원래 사용자/Workspace의 sidebarCrmListQueryKeys.list 무효화.
- 활성 모달일 때 `/app/workspaces/:workspaceId/view-definitions/:viewId?sourceType=LIST`로 이동.
- 닫기·재열기·사용자/Workspace/route 전환 뒤 늦은 응답은 현재 화면 이동 금지.
- 입력 유지 오류/다시 시도, 조회 loading/error/empty, 이름 중복, 한국어·영어 지원.
- Admin Web 변경 없음.

## 검증 계획

권한/소속/조건부 입력/동시 중복, transaction 공통 client와 실패 전파, 실제 Nest DTO/오류 계약,
TABLE/LIST/KANBAN 빈 보기 조회 호환, FE 기본값·보드 분기·중복 클릭·실패 재시도·늦은 응답을 확인한다.
실제 DB를 사용하는 rollback 검증은 별도 test DB가 준비된 경우에만 실행한다.

구현 검증 결과와 실행 범위는 [BE-TODO](../../BE-TODO.md), [FE-TODO](../../FE-TODO.md)에 기록한다.
