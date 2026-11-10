# 관리항목 TABLE 인라인 속성 생성 API

- 계약 상태: implemented (구현 전에 confirmed로 작성)
- 소비자: User Web
- 범위: 단일 Object 소속 TABLE의 새 속성·현재 보기 표시 연결·기존 Record 빈 셀 생성.
- 기존 속성 API, schema, migration, 실제 값 편집, List 전용 속성, 옵션 관리, 관계 생성, View 편집은 변경하지 않는다.

## 요청

`POST /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns`

Bearer 인증 필수. 경로는 UUID, query는 허용하지 않는다.
DTO: `CreateWorkspaceTableColumnDto`. 알 수 없는 body 필드는 400.

| 필드 | 필수 | 계약 |
| --- | --- | --- |
| creationId | 예 | UUID v4. 입력 확정 시 발급하고 같은 입력의 재시도에 재사용. 표시 설정 PK로 사용 |
| attributeDefinitionName | 예 | 문자열, trim 후 1~80자. null/빈 문자열 금지. 현행 apiSlug 규칙 유지 |
| attributeType | 예 | 기존 AttributeDefinitionType 17종 중 하나. null 금지 |

17종: ActorReference, Checkbox, Currency, Date, Domain, EmailAddress, Interaction, Location, PersonalName, Number, PhoneNumber, Rating, RecordReference, Select, Status, Text, Timestamp.
기존 서비스의 생성 가능 범위를 유지한다. Attio의 시스템 전용 타입 정책을 새 도메인 제약으로 도입하지 않는다.
Object/Actor/표시 역할/순서는 서버에서 결정한다. icon/description은 null, isMultiselect는 기존 생성 기본값 false.
Currency는 기존 사용자의 기본 통화 정규화를 재사용한다. 옵션/양방향 관계는 자동 생성하지 않는다.

## 응답

신규 201, 동일 요청 재실행 200. DTO: `CreateWorkspaceTableColumnResponse`.
`{ viewDefinitionId, objectDefinitionId, attributeDefinitionId, viewAttributeSettingDefinitionId }` (모두 UUID).
날짜/사용자 원문은 반환하지 않는다.

## 업무 및 트랜잭션

1. 인증 사용자 Workspace 멤버/Actor 확인. View와 Object의 같은 Workspace 소속 확인.
2. View row 잠금으로 같은 View의 컬럼 생성·순서를 직렬화한다. READ COMMITTED를 사용한다.
3. TABLE이고 objectDefinitionId가 있으며 listDefinitionId가 없는 요청만 지원한다. 이는 이번 endpoint 범위이며 기존 이중 소속 데이터를 수정하지 않는다.
4. creationId 기존 설정은 Workspace/View/Actor, 직접 RECORD/DISPLAY 및 Attribute 소속·이름·타입이 같을 때만 재사용한다. 다른 입력/범위는 409.
5. 기존 Attribute 공개 생성 Port를 호출자의 TransactionContext로 실행한다. AttributeDefinition과 기존 Record의 null 값 행을 만든다.
6. 현재 View에 RECORD/DISPLAY, 빈 참조 경로, 숨김 false, 마지막 sortOrder 다음의 ViewAttributeSettingDefinition을 생성한다. labelOverride/width/formatJson은 null.
7. commit 뒤 안전한 식별자와 requestId만 로그에 남긴다.

- transaction: 필요. owner는 view-definition application. Attribute/Record 소유 기능은 공개 application Port로 호출한다.
- 변경 모델: AttributeDefinition, RecordAttributeValueDefinition(기존 기록이 있을 때), ViewAttributeSettingDefinition.
- 실패 시 세 모델 전체 rollback. 다른 View/기존 값/제목 역할은 변경하지 않는다.
- 기존 조회 상한 500개의 표시 설정을 넘기는 생성은 409로 거부한다.
- View 순서는 ViewAttributeSettingDefinition.sortOrder, Object 속성 순서는 기존 Attribute 생성 로직이 결정한다.
- idempotency: creationId를 클라이언트에서 발급, UUID 전역 PK 및 Workspace/View/Actor 검증. 같은 요청의 재시도는 기존 응답, 키 충돌/입력 변경은 409. 설정이 존재하는 동안 유지하며 삭제 이후의 재실행은 보장하지 않는다. 별도 멱등성 테이블/마이그레이션 없음.
- outbox: 사용하지 않음. 외부 호출/비동기 부수 효과 없음. 향후 MSA 분리 시 동기 일관성·보상/이벤트를 별도 설계한다.
- 감사: 각 신규 행의 createdByActorId는 서버 Actor. 기존 행은 재시도로 수정하지 않는다.

## 오류

기존 HttpExceptionFilter envelope를 유지한다.

| 상황 | 오류 / 상태 | FE 처리 |
| --- | --- | --- |
| 미인증 | 기존 AuthGuard / 401 | 기존 인증 복구 |
| 잘못된 UUID/body/query | validation / 400 | 입력 유지 |
| 이름/타입 검증 실패 | 기존 ATTRIBUTE_DEFINITION_* / 400 | 필드 안내 |
| Workspace/View/Object 접근 불가 | ViewColumnNotFound / 404 | 입력 유지, 접근 불가 안내 |
| TABLE Object 범위 아님 | ViewColumnTargetUnsupported / 409 | 생성 불가 안내 |
| 같은 apiSlug | AttributeDefinitionApiSlugAlreadyExists / 409 | 이름 수정 안내 |
| creationId 충돌 | ViewColumnCreationConflict / 409 | 중복 확인 안내; 자동 키 재발급 금지 |
| 표시 설정 상한 | ViewColumnLimitExceeded / 409 | 상한 안내 |
| 저장 실패 | 기존 500 | 입력·creationId 유지, 명시적 재시도 |

## 프론트 및 관측

- + 클릭은 서버 쓰기 없이 기존 추가 영역을 220px 이름 입력으로 전환한다. 초안 때문에 grid 열이나 본문 셀을 추가하지 않으며 작성 중에는 별도의 +를 표시하지 않는다. 헤더에는 유형 아이콘과 테두리 없는 이름 입력만 두고 placeholder는 사용자 지정 문구 `컬럼명을 작성해주세요.`를 사용한다. 상시 저장/취소 버튼은 없다. 취소 시 같은 자리에 +를 복원하고, 저장 후에는 실제 새 컬럼 다음에 +를 표시한다.
- 헤더 아래 Portal 팝오버에서 아이콘·이름을 갖는 17종 유형을 검색 가능한 2열 목록으로 표시한다. 스크롤/화면 가장자리/모바일 viewport에 맞춰 위치·높이를 보정한다.
- 팝오버 제목은 `유형 선택`이며 바로 오른쪽 돋보기 버튼을 누르면 그 오른쪽 같은 줄에 검색창을 펼친다. 처음에는 검색창을 숨기고 펼칠 때 검색 입력으로 포커스를 이동한다. 다시 누르면 검색어를 비우고 검색창을 닫아 전체 유형을 표시한다.
- 유형 검색 입력의 placeholder는 `찾는 유형을 검색하세요.`이며 버튼·접근성 이름인 `유형 검색`과 분리한다.
- 유형 팝오버는 기본 340px 폭, 내부 전체 텍스트 12px, 아이콘 16×16px로 표시한다. 기본 텍스트 색상은 #4B5563이며 유형 항목/재시도 버튼의 hover·키보드 포커스 색상은 #111827이다. 화면이 더 좁으면 기존 viewport 여백에 맞춰 폭을 줄인다.
- 유형 항목과 검색 버튼은 hover 배경 #E4E2DC, 누르는 동안 active 배경 #D3D1CB를 사용한다. 누름 해제 후 포인터가 요소 위에 있으면 hover 배경으로 복귀하며, 유형 항목의 키보드 포커스 배경은 #E4E2DC다.
- 이름 입력 후 유형을 선택하면 생성한다. 유형을 먼저 선택하면 이름 입력으로 돌아가며 Enter/영역 바깥 클릭으로 완성된 입력을 저장한다. 유형이 없는 Enter는 선택으로 안내한다.
- 헤더와 팝오버 내부 이동은 영역 이탈이 아니다. 바깥 클릭 시 이름이 비었거나 공백뿐이면 유형 선택 여부와 관계없이 입력창·팝오버를 닫고 +로 복원한다. 이름이 있고 유형이 없는 초안은 팝오버만 닫고 유지한다. 바깥 클릭은 대상의 포커스를 유지하며 Esc는 초안을 취소하고 +에 포커스를 돌린다. 한글 IME 조합 중에는 저장하거나 자동 취소하지 않는다.
- 중복 제출 방지. 실패 뒤 바깥 클릭 자동 재시도는 하지 않으며 명시적 재시도/입력 수정으로 복구한다.
- 이름·유형 변경 시 새 creationId로 새 의도를 구분한다. 동일 입력 재시도에는 같은 ID를 유지한다.
- 사용자/Workspace/View 전환 후 늦은 응답은 새 화면의 임시 컬럼을 변경하지 않는다.
- 성공 후 요청 scope의 본문 페이지·메뉴·Object 속성 캐시를 갱신한다. 저장 성공 뒤 조회 실패는 재생성이 아니라 조회 재시도로 복구한다.
- 실패 메시지와 명시적 다시 시도 버튼은 팝오버에 표시한다. 영문/한국어 문구, 유형별 고정 아이콘, 검색·방향키·Enter와 스크롤을 지원한다.
- 로그: crm.viewColumn.created / crm.viewColumn.createFailed. requestId, userId와 검증된 식별자만 사용. 이름·설명·config·토큰·원본 DB 오류 금지.
- 호환성: 추가 endpoint이며 기존 API 계약과 Admin Web 영향 없음.
