# TABLE 인라인 속성 생성 구현 검토

## 구현 범위

관리항목 Object TABLE에서 `+`를 누르면 우측에 임시 컬럼이 생긴다. 이름 입력과 정보 유형 선택만 제공하며 모달과 설명 입력은 없다. 유형별 아이콘은 고정이다. 완성된 입력은 Enter·저장 버튼·영역 밖 클릭으로 저장하고, 미완성 입력은 유지하며 Esc·취소로 버린다. 한글 조합 중 Enter는 저장하지 않는다.

POST는 현재 View에서 원본 Object를 결정한다. 기존 속성 생성 로직을 공개 Port로 재사용하면서 현재 View 연결까지 같은 트랜잭션으로 저장한다. 같은 생성 ID 재요청은 기존 결과를 반환한다. 화면 이동 후 늦은 응답은 이동한 화면의 입력을 변경하지 않는다.

## 저장 대상

| 모델 | 생성/사용 컬럼 |
| --- | --- |
| AttributeDefinition | workspaceId, objectDefinitionId, createdByActorId, apiSlug/title=trim한 이름, type=선택 유형, sortOrder=Object 마지막 순서 다음. listDefinitionId/icon/description=null, isMultiselect=false. Currency의 configJson은 기존 사용자 기본 통화 규칙 재사용 |
| RecordAttributeValueDefinition | 기존 Record마다 workspaceId, objectDefinitionId, recordDefinitionId, attributeDefinitionId, createdByActorId, attributeType. 값·옵션·참조 FK는 모두 빈 값. 기록이 0개면 생성하지 않음 |
| ViewAttributeSettingDefinition | id=creationId, workspaceId, createdByActorId, viewDefinitionId, attributeDefinitionId, sourceScope=RECORD, attributeDisplayRole=DISPLAY, referenceAttributeIdPathJson=[], sortOrder=현재 View 마지막 다음, isHidden=false. labelOverride/width/formatJson=null |
| ViewDefinition | Workspace/소속/타입 확인 및 행 잠금. 새 View 생성·기존 View 설정 변경 없음 |

RecordDefinition, ListEntryDefinition, ListEntryValueDefinition, SelectOption, StatusOption, RelationshipDefinition, 그룹·필터·정렬 설정은 생성하지 않는다. 기존 TITLE 역할과 다른 View의 표시 설정은 보존한다. 스키마·마이그레이션 변경은 없다.

## 규칙 준수 검토

| 기준 | 확인 내용 |
| --- | --- |
| 계층/모듈 경계 | Controller→application use case→공개 Port→infrastructure 순서. View 모듈에서 다른 모듈의 Prisma 저장소를 호출하지 않음 |
| 트랜잭션 | View application이 TransactionManager 소유. Attribute 공개 Port와 Record materializer에 같은 TransactionContext 전달. 외부 provider 호출 없음 |
| 재시도/순서 | 현재 View 행 잠금, READ COMMITTED 확인, 생성 ID PK와 Workspace/View/Actor/원본 입력 검증. View 표시 순서는 잠금 안에서 계산 |
| API 계약 | 구현 전 COMMON/API-SPEC에 confirmed 계약 작성. 신규 201/재시도 200, validation/404/409/500과 소비자·호환성·DB 연결 명시 |
| 권한/검증 | AuthGuard, 사용자 Workspace 멤버/Actor, View·Object Workspace 소속, Object-only TABLE 범위, 17종 타입, 이름 길이, 알 수 없는 필드/쿼리 거부 |
| 로그/주석 | 역할·기능·API 및 주요 단계 한글 주석. commit 후 식별자 이벤트 기록. 이름/설명/config/토큰/DB 원문 로그 제외 |
| outbox | 외부 효과가 없어 추가하지 않음. 향후 MSA 분리는 별도 이벤트/보상 설계 필요 |
| 프론트 경계 | crm-view 내부 API/컴포넌트, crm-object 공개 index, 공통 인증 API client 사용 |
| 캐시 | 요청 당시 사용자/Workspace/Object/View의 속성 목록·메뉴 무효화, 본문 검색/페이지 캐시 초기화. 저장 후 조회 오류는 조회만 복구 |
| UI | 한국어/영문, 고정 아이콘, 저장 중 중복 차단, 입력 보존/명시적 재시도, Esc 포커스 복구, IME 처리 |

## 검증 결과

Node 24.21.0에서 다음 검증을 통과했다. HTTP 테스트는 실제 Nest 모듈·Guard·use case·Prisma adapter를 조립하고 DB 연결과 외부 인증 해석만 대체한다. Playwright는 실행 중인 localhost:5173을 사용하며 API 응답을 제어한다.

| 검증 | 결과 |
| --- | --- |
| Backend typecheck / lint / build | 통과 |
| Backend 전체 Jest | 62 suites / 684 tests 통과. 별도 DB가 필요한 12 suites / 32 tests skip |
| 신규 컬럼 HTTP 검증 | 위 전체 테스트에 포함된 44개 통과. 17종·빈 기록·기존 기록 빈 셀·재시도·권한·소속·중복 이름·한도·실패 전파·PK 충돌 포함 |
| User Web typecheck / lint / build | 통과 |
| User Web 단위 테스트 | 18 files / 99 tests 통과 |
| Chrome Playwright | 관련 22개 사례 통과: 기존 본문 회귀 13개, 신규 생성 9개. 영문 모바일 사례의 기존 버튼 번역명에 맞게 selector 수정 후 해당 1개 재검증 통과 |
| 화면 확인 | 데스크톱 임시 컬럼과 390px 영문 모바일 캡처 확인. 모바일 입력·유형·저장·취소 버튼이 화면 범위 안에 배치됨 |
| Prisma validate | 통과. 기존 필수 FK + SetNull 관계 경고 4건 유지 |
| git diff --check | 통과 |

FE build의 기존 500kB 초과 청크 안내는 유지된다. 임시 Playwright 설정에는 webServer를 두지 않아 사용자의 서버를 재기동하지 않았다. 한국어 IME, 미완성 입력, 취소 후 포커스, 저장 실패 입력 보존, 응답 유실 재시도, 저장 후 조회 실패 복구, 지연 응답 후 화면 전환도 포함했다.

## 검증 한계 및 후속 범위

- 실제 Supabase 데이터는 사전 읽기 조사만 수행했다. 이번 작업에서 실제 DB 생성·수정·삭제는 하지 않았다.
- 격리 테스트 DB가 없어 PostgreSQL의 실제 rollback/잠금 대기/동시 생성은 실행하지 못했다. 실패가 같은 transaction Promise로 전파되는 것과 고유키 충돌 오류 변환은 mock 기반으로 검증했다. 기존 DB 통합 테스트는 TEST_DATABASE_URL 없이 실행하여 건너뛴다.
- 현재 View의 컬럼 생성만 직렬화한다. 다른 View·기존 속성 생성 endpoint와 Object 전체 속성 순서를 전역 직렬화하는 변경은 포함하지 않았다.
- 실제 기록 생성/값 편집, 선택지·관계 설정, List 전용 속성, KANBAN/LIST 속성 생성 UI, 기존 속성 연결, 저장된 속성 이름/유형/설명 변경은 이번 범위 밖이다.
- 현행 값 수정 API의 Select/Status/참조 FK 정규화 보완은 후속 작업이다. 17종 속성 정의를 만들 수 있다는 것이 모든 유형의 값 편집이 완성됐다는 의미는 아니다.
- 서버/Docker를 기동하거나 재시작하지 않았다.
