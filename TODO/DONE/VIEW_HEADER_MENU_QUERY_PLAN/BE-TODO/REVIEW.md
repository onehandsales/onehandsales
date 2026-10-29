# View 헤더 메뉴 조회 Backend 최종 검토

- 검토일: 2026-10-29
- 판정: 초기 G00~G99 구현 후 재검토에서 발견한 입력 검증·주석 문제를 후속 수정했다. 최신 근거는 5절을 따른다.
- 계약: [View 헤더 메뉴 조회 API](../COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md), 상태 `implemented`.
- 범위: 선택 View의 filters/sorts/settings GET 3개와 공개 메타데이터 조회 Port. Frontend·설정 저장·본문 쿼리 실행은 후속 범위.

## 1. 적용한 규칙

1~4절은 초기 구현의 검토·검증 기록이다. 주석의 존재 확인만으로 의미까지 검증했다고 단정했던 부분과 추가 입력 검증의 누락 사례는 5절에서 정정한다.

작업 전에 [BE/AGENTS.md](../../../../BE/AGENTS.md), [Software Agent](../../../../AGENT/SOFTWARE_AGENT/README.md), [Backend Agent](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)와 하위 CONVENTION / ARCHITECTURE / DECISIONS를 포함한 Backend 문서 23개를 읽었다. [DB 기준](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md), 시간 정책, 실제 Prisma schema와 기존 View 구현도 대조했다.

| 검토 항목 | 구현과 확인 결과 |
| --- | --- |
| 아키텍처 | 단일 NestJS modular monolith + Clean Architecture. Controller → UseCase → 공통 Reader → 공개 Query Port → 각 소유 모듈의 Prisma adapter |
| 모듈 경계 | Workspace 접근, Object/List 요약, Attribute 메타데이터는 각 모듈의 공개 application Port 사용. 다른 모듈의 구체 Prisma repository 직접 의존 없음 |
| 계층 의존성 | application/domain의 Prisma·Supabase·Express·ConfigService·구체 logger import 없음. 시간은 주입한 clock 함수, 로그는 application Port 사용 |
| 공개 타입 | Prisma JSON 타입을 공개하지 않고 중립 JsonValue와 명시적 projection 사용. 소속 검증용 workspaceId와 createdAt 등은 응답 mapper에서 제외 |
| 주석 | 변경 TS 20개 파일의 class/interface/function/method/constructor 선언 117개를 AST로 검사. 역할/API/기능 주석 누락 없음. 접근·참조 검증·응답 구성의 주요 흐름에 번호 주석 적용 |
| DB 쓰기 | 제품 조회 코드에 생성·보정·저장 없음. application에서 Prisma transaction 직접 호출 없음. 동일 snapshot 보장이나 mutation 원자성을 주장하지 않음 |
| 범위 보존 | FE, schema/migration, package manifest/lockfile, ENV 파일 변경 없음. 실제 Supabase 업무 DB에 fixture 쓰기 없음 |

## 2. 비즈니스 로직 검토

| 항목 | 판정과 근거 |
| --- | --- |
| 인증·멤버십 | 기존 AuthGuard 사용. 현재 사용자의 Workspace 멤버십을 먼저 확인하고 Actor 조회/생성 없이 읽기 허용. View 조회도 workspaceId+viewDefinitionId로 제한 |
| View 원본 | null이 아닌 Object/List를 각각 공개 Summary Port로 확인. 두 원본의 XOR, 혼합 Object List 제한을 임의 도입하지 않음 |
| 하위 설정 격리 | 모든 메뉴 행을 Workspace+View로 조회. 조회 범위 밖 행은 제외하며 전역 데이터 진단을 수행한 것으로 표시하지 않음 |
| 필터 | 여러 루트와 빈 그룹 보존. 모든 그룹의 부모 체인을 검사하여 자기 순환·루트 없는 순환·누락 부모를 차단. 조건이 현재 View의 그룹에 속하는지 검사 |
| 속성 경로 | JSON 배열과 각 UUID를 확인한 뒤 최종·중간·그룹 설정 속성을 일괄 조회. 비교 키만 소문자화하며 저장 경로의 순서·대소문자·중복은 보존 |
| SourceScope | G00에서 직접 Object/List 일치 판정과 전체 관계 경로 실행 가능성은 저장/실행 API로 분리. 이 GET의 보장은 참조 존재·Workspace·명시된 그룹/옵션 연결까지 |
| 정렬 | sortOrder/createdAt/id의 결정적 순서로 설정 행을 반환. 각 행의 ASC/DESC 값은 보존하고 Record 정렬을 실행하지 않음 |
| 그룹 설정 | 부모 그룹과 attributeDefinitionId의 일치 확인. 명시한 Select/Status 옵션도 같은 Workspace 및 정확한 Attribute에 속해야 함. 옵션 식별자 XOR를 임의 추가하지 않음 |
| 옵션 목록 | 참조 Select/Status 속성의 전체 옵션을 batch 조회. 선택된 옵션만 반환하지 않으며, 잘못 연결된 명시 옵션은 응답 전에 거부 |
| 위젯 | 같은 Workspace의 원본 View 요약을 1단계 batch 조회. 반복·자기 참조 위젯을 임의 제거/금지하지 않고 재귀 조회 없음 |
| 11개 ViewType | 저장된 configJson, 숨김 행, 반복 역할, 이름 override와 showTitle, null/빈 배열 보존. 없는 기본 설정 생성 없음 |
| 오류 | 인증/입력/존재 오류는 기존 envelope와 상태 사용. 읽은 설정의 참조 문제는 고정 ViewHeaderConfigurationInvalid 500. 부분 성공이나 가짜 기본값 반환 없음 |
| 로그 | 요청 ID, 사용자·요청 Workspace/View, 메뉴, 소요 시간, 행 수와 고정 reason만 기록. 비교값/config JSON, 토큰, 원본 오류 메시지, 다른 Workspace ID 누출 없음 |
| 조회량 | 메뉴별 테이블과 속성/옵션/원본 View를 batch 조회. 빈 ID 집합은 SQL 생략. 실제 Record/RecordAttributeValue/ListEntryValue 조회 없음 |

핵심 구현: [공통 Reader](../../../../BE/src/modules/view-definition/application/view-header-menu-reader.ts), [응답 mapper](../../../../BE/src/modules/view-definition/application/view-header-menu.mapper.ts), [Controller](../../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header-menus.controller.ts).

## 3. 실행 검증

| 검증 | 결과 |
| --- | --- |
| 신규 application 테스트 | 36개 통과. 접근 제어, Actor 없는 읽기, 빈 메뉴, 전체 필터 그래프, 경로 형식, 참조 격리, 옵션 연결, 11개 타입, 안전한 실패 로그 |
| 신규 HTTP·DI 테스트 | 23개 통과. 실제 ViewDefinitionModule과 소유 모듈 wiring 사용. 인증 resolver와 Prisma 경계만 대체. 세 경로, 입력 검증, 401/403/404/500, 응답·요청 ID 확인 |
| 신규 실제 DB 테스트 | 1개 통과. 격리 PostgreSQL 17에서 7개 설정 테이블·메타데이터, 동점 정렬, 교차 Workspace 제외, 전체 옵션, JSON·숨김·반복 위젯 확인 |
| Backend 전체 Jest | **64 suites / 462 tests 통과, 실패 0, skip 0**. 기존 헤더·목록·즐겨찾기 등 회귀 포함 |
| typecheck / lint / build | 모두 통과 |
| prisma:validate | 통과. 기존 복합 FK의 SetNull 경고 4개 있음. 이번 schema 변경 없음 |
| 정적 규칙 검토 | 선언 117개의 주석, 계층 금지 의존성, 다른 모듈 구체 repository 의존 검사 통과 |
| 문서 대조 | 계획·검토·작업 기록의 로컬 링크 44개, JSON 블록 6개, 응답 배열의 모델/필드 38개, 경로 배열 3개, ViewType 및 fixture config 예시 11개 확인 |

실제 DB 테스트에서 View 1회 + 정렬 1회 + 필터 2회 + 보기 설정 4회 + 원본 View 1회 + Attribute 1회 + 옵션 2회의 **합계 SELECT 12회**를 관찰했다. 이는 세 메뉴 adapter를 순차 검증한 합계이며 인증·멤버십까지 포함한 단일 HTTP 호출의 총 SQL 수가 아니다. 빈 batch 호출은 SQL 0회였다. fixture는 transaction rollback 후 남지 않았고 전체 테스트 종료 후 Workspace/View/Sort도 0행을 확인했다.

검증 환경은 임시 PostgreSQL 클러스터 `127.0.0.1:56439`이며 저장소 밖 임시 디렉터리에 구성했다. 현재 schema와 기존 migration의 복합 FK·CHECK를 이 격리 DB에만 적용했다. ENV 파일을 수정하지 않고 해당 테스트 프로세스에만 DB URL을 전달했다. 실제 Supabase의 데이터·성능·배포 동작을 검증한 것으로 해석하지 않는다.

검증 후 이 임시 클러스터만 정상 종료하고 pid 파일 제거를 확인했다. 기존 개발 서버와 실제 Supabase 프로세스는 종료하지 않았다.

## 4. 검토 중 보완과 남은 경계

- Prisma JSON 객체의 선택적 멤버와 중립 JsonValue의 호환성을 맞춰 Prisma 타입이 application으로 유입되지 않도록 했다.
- 속성 누락 검증은 Set으로 비교하여 참조 수에 따라 반복 배열 탐색이 증가하지 않도록 했다.
- 실패 로그에 읽은 메뉴 행 수를 추가하고 원본 입력·예외 문자열을 남기지 않는 테스트를 확인했다.
- 본문 필터 평가·다중값·관계 경로 실행·정렬·집계, 저장 API, Actor/Record 비교값 라벨, Frontend 연결은 이번 완료에 포함하지 않는다.
- 비트랜잭션 읽기 중 동시 변경으로 누락 참조가 관찰될 수 있다. 이를 영구 DB 손상으로 단정하지 않으며 자동 보정·재시도 조합을 하지 않는다.
- Prisma의 기존 SetNull 경고를 없애기 위해 필수 소속 ID를 nullable로 바꾸거나 이번 범위 밖 스키마를 수정하지 않았다.
- 계약·작업 기록을 implemented로 갱신하고 저장소 완료 규칙에 따라 계획을 TODO/DONE으로 보관한다. 이번 구현 커밋은 수행하지 않는다.

## 5. 재검토 지적 및 후속 수정 — 2026-10-29

- 입력 계약 결함: 전역 DTO 변환으로 constructor·__proto__ 키가 사라져 추가 입력이 성공했다. 빈 입력을 unknown으로 받아 공통 EmptyRequestPipe에서 검사하도록 메뉴 GET 3개와 즐겨찾기 POST/DELETE를 수정했다.
- 주석 의미 오류: FilterGroup·FilterCondition·Sort·Group에는 isHidden이 없는데 숨김 상태를 보존한다고 설명했다. 조회 메서드별 실제 의도로 주석을 수정했다.
- 중복 개선: 기능별 Pipe 2개와 빈 DTO 2개를 제거하고 shared/presentation에서 검증한다. pipes 폴더의 존재 자체는 규칙 위반이 아니다.
- 검증: 수정 전 endpoint 5개에서 실패 재현. 수정 후 관련 3 suites / 103 tests와 typecheck/lint/build 통과. 오류 입력은 DB 접근 전에 400, 정상 빈 입력의 성공 응답은 유지했다.
- 현재 미커밋 TS 21개 파일의 선언 121개와 별도 화살표 helper의 주석·계층 의존성을 검사했다. 주석 의미는 모델의 실제 필드와 대조했다.
- 전체 Backend·실제 PostgreSQL은 이번 수정에서 재실행하지 않았다. 위의 64 suites / 462 tests는 초기 구현의 검증 기록이다.
- 상세: [빈 요청 검증 보완 완료 기록](../../VIEW_HEADER_EMPTY_REQUEST_FIX_PLAN/README.md).
