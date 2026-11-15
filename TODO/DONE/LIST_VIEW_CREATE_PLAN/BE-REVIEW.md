# 업무 목록 생성 Backend 규칙·비즈니스 로직 재검토

검토일: 2026-11-07. 범위: 새 List/첫 View 생성 API와 협력하는 Attribute/View 공개 port.
규칙 기준: `BE/AGENTS.md`, BACKEND_AGENT의 ENGINEERING_REVIEW_CHECKLIST,
CONVENTION(API_CONTRACT/TRANSACTION/OBSERVABILITY/COMMENT_AND_LOGGING),
ARCHITECTURE(MODULAR_MONOLITH_AND_MSA/SHARED_PRESENTATION), DB_SCHEMA와 실제 Prisma 모델.

## 발견 및 수정

### 추가 필드 거부 계약의 누락

정상 생성 JSON의 최상위에 `constructor` 또는 `__proto__`를 추가했을 때 기존 HTTP 테스트로
400 대신201이 반환되는 것을 재현했다. DTO 변환이 예약 키를 먼저 제거하여 whitelist가
검사하지 못했다. 권한 우회나 원본 데이터 수정이 확인된 것은 아니며, 추가 필드를 거부한다는
API 계약 불일치다.

목록 전용 presentation BodyPipe에서 파싱된 원본의 최상위/kanban/newStatus 객체를 먼저
검사하고, 이후 전역과 동일한 transform/whitelist/forbidNonWhitelisted 설정의 ValidationPipe로
기존 class-validator DTO 검증을 수행한다. Controller는 unknown으로 입력을 받아 이 Pipe의
검증된 DTO만 application에 전달한다. 전역 설정이나 다른 API를 변경하지 않았다.

검증: 예약 키 2종 × 객체 위치 3곳 모두400, use case 미호출. 일반 추가 필드·UUID·중첩 DTO,
배열/null/원시값 거부 및 정상 TABLE/LIST/KANBAN 응답도 유지한다.

### transaction 전 실패의 관측성 누락

입력 이름/보드 검증, 멤버십·Actor·기준 Object 조회가 기존 try/catch 밖에 있었다.
이 단계에서 실패하면 `crm.listDefinition.createFailed`가 남지 않았다.

application 전체 처리의 실패를 같은 로그 경계로 묶었다. DomainError는 warn, 그 외는 error,
requestId/userId/workspaceId/errorCode만 기록한다. 이름·설명·단계·DB 오류 원문은 제외한다.
성공은 여전히 commit 이후에만 기록하고 transaction 실패는 reject 이후 기록한다.
AuthGuard나 HTTP parser/DTO 검증 실패는 application 진입 전이므로 이 업무 이벤트 대상과 구분한다.

## 규칙 확인

| 항목 | 결과와 근거 |
| --- | --- |
| 계층 | Controller/DTO/Pipe는 HTTP 변환, application은 검증·orchestration, infrastructure는 Prisma 저장 |
| module 경계 | List는 Attribute/View의 공개 port만 사용. 다른 모듈 Prisma repository 직접 import/주입 없음 |
| 금지 의존성 | 이번 변경의 production Backend 파일 15개 정적 확인. application/domain에 Prisma/Supabase/ConfigService/Express/구체 logger import 없음 |
| module 조립 | 실제 ListDefinitionModule과 협력 모듈·PrismaTransactionManager를 조립하는 테스트 통과. 순환 의존성 없음 |
| 인증·소속 | AuthGuard, Workspace 사용자 멤버십, Actor 확인. 선택 Object와 제목/그룹 속성의 Workspace/Object 소속 확인 |
| transaction | List application이 TransactionManager를 소유. 모든 쓰기와 속성 조회가 같은 context 사용. 저장소별 독립 transaction 없음 |
| 오류 | 400 입력/보드 설정,404 멤버십/대상 소속,409 같은 Workspace의 apiSlug,500 내부 실패. 공통 Filter 유지 |
| 중복 요청 | 기존 workspaceId+apiSlug unique를 사용해409. 별도 idempotency key나 성공 응답 재사용은 구현하지 않음 |
| 외부 후속 처리 | 외부 provider/outbox 없음. 미래 service 분리 시 준비 상태·재시도·보상 선행 필요를 계약에 명시 |
| 주석·로그 | 역할/기능/API와 주요 단계 주석 확인. 안전한 structured event와 requestId 사용 |
| 문서/FE | 공통 API 계약·응답 ID·FE cache/route 계약 일치. 이번 보완은 정상 FE 요청 형태를 변경하지 않음 |

## 비즈니스 로직 확인

| 생성 유형 | 저장과 재사용 |
| --- | --- |
| TABLE / LIST | ListDefinition + ViewDefinition + RECORD/TITLE ViewAttributeSettingDefinition |
| 기존 상태 KANBAN | 위 구조 + ViewGroupDefinition. 기존 Object의 단일값 Status/Select 참조, 기존 속성/옵션 생성·수정 없음 |
| 새 단계 KANBAN | List 소속 Status AttributeDefinition과 StatusOption 추가. 그룹 sourceScope=LIST_ENTRY |
| 보드 카드 표시 | 그룹 속성을 DISPLAY로 연결. TITLE과 같으면 TITLE 하나를 공유 |
| 초기 보기 | listDefinitionId만 연결, objectDefinitionId=null. TABLE/LIST는 rowDensity, KANBAN은 cardDensity/showEmptyGroups |
| 단계 순서 | 입력 순서를 StatusOption.sortOrder로 저장. 별도 ViewGroupSetting 없이 조회에서 옵션 순서 적용 |
| 실제 기록 | 생성 API에서 Record/RecordValue/ListEntry/ListEntryValue를 쓰지 않음 |
| 미정 정책 | List의 고정 Object FK, 같은 Record의 List 중복 등록 UNIQUE를 추가하지 않음 |

신규 List의 기준 Object 선택은 현재 첫 보기 생성 UX의 입력이다. 기존 모든 List가 한 Object만
허용한다고 보장하는 저장 제약으로 해석하지 않는다. Record를 목록에 추가하는 기능은 후속 범위다.

## 검증과 한계

- 최종 전체 Jest:61 suites/636 tests 통과. typecheck/lint/build/prisma validate 통과.
  기존 Prisma 복합 FK SET NULL 경고4개는 유지했다.
- 이번 보완 뒤 목록 HTTP/module 테스트 68개 통과. 이전55개에서13개 추가.
- 예약 키 재현/수정, transaction 전 로그, 다른 Workspace/Object/List의 그룹 속성 차단,
  TITLE=GROUP 중복 표시 방지까지 확인했다.
- 기존 빈 TABLE/LIST 및 두 scope의 빈 KANBAN 조회 테스트 4개도 전체 회귀에 포함한다.
- 실제 업무 DB에 검증 데이터를 저장하지 않았다. module 테스트의 transaction client는 mock이다.
  실제 PostgreSQL unique 동시성/rollback을 이번 재검토에서 직접 확인한 것으로 주장하지 않는다.
- 기존 DB 테스트12 suites/32 tests는 TEST_DATABASE_URL을 비워 제외한다.
- schema/migration/Docker/실행 중 서버/프론트 코드/커밋은 이번 재검토에서 변경하지 않았다.
