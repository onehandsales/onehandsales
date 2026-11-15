# Backend 구현 준비와 검증 기준

- 상태: 신규 기능 구현 전 설계. 이 문서 작성으로 구현을 시작하지 않는다.
- 필수 선행: [TODO Software Agent Reference](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [BE 규칙](../../../BE/AGENTS.md), [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION / ARCHITECTURE / DECISIONS, [DB 기준](../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md).
- 정본: [API 명세](../COMMON/API-SPEC/VIEW_TYPE_HEADER_ACTION_API.md), [선행 결정·작업 순서](../COMMON/PLANNING-REVIEW.md).

## 1. 현재 코드와 책임

| 위치 | 현재 책임 | 이 계획에서의 판단 |
| --- | --- | --- |
| view-definition/presentation/http/user-workspace-view-header-menus.controller.ts | filters/sorts/settings HTTP 경계 | 기존 GET 유지 |
| view-definition/application/view-header-menu-reader.ts | 저장 메뉴의 접근·참조 검증 | 전체 실행기로 오해하지 않음 |
| view-definition/infrastructure/persistence/prisma-view-header-configuration-query.repository.ts | View 설정의 scoped SELECT | 복잡한 업무값 실행을 몰아넣지 않음 |
| attribute-definition의 공개 metadata query Port | Attribute/옵션 일괄 조회 | 실행 검증에 필요한 계약 확장 여부 검토 |
| workspace의 공개 access query Port | 멤버십/Actor 조회 | 쓰기 권한 규격 D12와 구분 |
| record-definition의 공개 list query Port | Object+cursor 기록 조회 | 현재 View 필터·정렬·집계를 지원하지 않음 |
| list-definition | List 요약·사이드바 조회 | ListEntry 실행 Port와 소유권은 후속 설계 |

## 2. 계층과 모듈 경계

Backend는 modular monolith이며 domain/application/infrastructure/presentation을 유지한다.

- Controller: 인증 context, UUID/DTO 검증, application 호출, HTTP 응답.
- Application: 접근·실행 가능성·정책 판단, Port 조합, transaction 경계.
- Domain 또는 순수 application 규칙: 속성 타입과 연산, 그룹/구간 해석, 정렬/집계 의미.
- Infrastructure: Prisma/SQL, 조회 최적화, transaction adapter, 안전한 로그 구현.
- Shared presentation: 기존 Guard·Pipe·Filter·middleware 재사용. 공통 입력 검증을 View 내부의 중복 폴더로 새로 만들지 않는다.

다른 module의 Prisma repository를 import/주입하지 않는다. View 설정은 View 모듈, Record·속성·ListEntry 값은 명시된 소유 모듈의 공개 application/query Port로 협력한다. ListEntry의 실행 책임이 아직 없으므로 G00/G01에서 소유자와 Port를 문서화한다.

프론트용 filters/sorts/settings endpoint를 Backend에서 HTTP로 다시 호출해 실행 설정을 조립하지 않는다. 내부 Port로 필요한 정의를 읽고 일관성을 관리한다. 공개 메뉴 응답을 실행용 DB 스냅샷으로 취급하지 않는다.

대량 데이터를 행별 Port 호출로 읽어 필터링하는 방식도 피한다. 확정된 실행 계약을 DB에 적용할 수 있는 batch/query Port를 설계하고 SQL 조건·파라미터는 infrastructure에서 안전하게 구성한다. 임의 연산자/속성 문자열을 SQL 조각으로 사용하지 않는다.

## 3. 공통 조회 실행의 구현 기준

1. 현재 사용자·Workspace·선택 View를 확인한다. 사용자 입력 View Type을 신뢰하지 않는다.
2. D01에 따라 Object/Record 또는 List/ListEntry의 행 기준을 정한다.
3. 저장 설정과 미저장 초안의 출처를 분리한다. D07/D08 없이 둘을 합치지 않는다.
4. 속성·옵션·참조 경로를 일괄 조회하고 sourceScope·출발/도착 대상·타입을 검증한다.
5. 확정 연산자·여러 루트·빈 그룹·ANY/ALL 규칙으로 실행 계획을 구성한다.
6. 원본·집계·지도 목록에 같은 필터/참조 의미를 적용한다.
7. 원본/지도 목록은 전체 조건·정렬 후 행 기준으로 페이지를 선택한다.
8. 선택된 행의 필요한 값·표시 메타데이터를 일괄 복원한다. 숫자 정밀도·날짜 의미·다중값을 유지한다.

집계/원본 사이의 의미 공유와 데이터 조회 시점 보장은 별도로 설계한다. query plan 공유만으로 과거 집계값이 재현되는 것은 아니다.

## 4. 대시보드 저장 구현 기준

1. D12의 권한과 감사 Actor를 서버에서 판정한다.
2. 쓰기 필드 allow-list와 신규/기존/삭제 위젯의 식별 규격을 검증한다.
3. application 소유 TransactionManager로 변경 단위를 실행한다.
4. D13의 충돌/재요청 정책을 적용한다. 필요한 소속·원본 존재 검증과 잠금은 같은 저장 경계에서 수행한다.
5. D10의 순환 금지 채택 시 동시 A→B/B→A 경합에 대한 전략을 포함한다.
6. ViewWidgetDefinition 및 필요한 ViewDefinition 설정/감사 필드만 반영하고 다른 설정·업무값을 보존한다.
7. 성공 응답은 실제 커밋된 논리 저장과 대응한다. 별도 재조회 실패와 저장 실패를 구분한다.

Prisma transaction client는 infrastructure 안에서만 사용한다. 새 멱등 기록/버전 컬럼이 필요하면 API/DB 계약과 migration·rollback 영향을 먼저 적는다. 단순 schema 편집이나 샘플 JSON에 version 키 추가로 동시성을 구현했다고 보지 않는다.

## 5. DB 영향과 성능

- 문서 작업에서 DB schema·migration·데이터를 변경하지 않는다.
- 기존 A01/A02 재사용에 신규 테이블은 필요 없다.
- A03/A04는 현재 저장 모델을 바탕으로 설계할 수 있으나 읽기 snapshot 저장소·인덱스 필요 여부는 D07/D14 이후 판단한다.
- A05의 동시성/멱등 보장은 추가 상태가 필요할 수 있다. 현재 모델만으로 자동 보장된다고 설명하지 않는다.
- View 기본 ID FK가 같은 Workspace/View/Attribute 소속을 모두 강제하지 않는다. 쓰기 유스케이스에서 해당 연결을 확인한다.
- 실제 조회 계획과 데이터량을 보고 Workspace/View 및 타입별 값 검색 인덱스를 검토한다. 조회 계획 없이 모든 속성에 인덱스를 일괄 추가하지 않는다.
- 기존 List 복합 FK와 SQL 전용 SET NULL/CHECK를 변경하지 않는다.
- 인증·환경·실행 중 서버·Docker·외부 provider 설정을 이 작업의 편의 때문에 바꾸지 않는다.

## 6. 위험 기반 검증 시나리오

| ID | 시나리오 | 확인할 결과 |
| --- | --- | --- |
| B01 | 비멤버/타 Workspace View 요청 | 정의·원본 데이터 노출 없음 |
| B02 | 같은 Workspace의 다른 Object/List 속성 | D01/D02의 정확한 판정, 잘못된 값 혼용 없음 |
| B03 | 같은 Record의 서로 다른 ListEntry | 두 Entry 식별·업무값 보존 |
| B04 | 관계 다중값 연결로 JOIN 행 증가 | 원본 행 수·페이지·집계에 우발 중복 없음 |
| B05 | 여러 루트·빈 그룹·ANY/ALL 빈 값 | 확정 진리표와 동일 |
| B06 | 미지원 연산자·깨진 경로 | 조건을 무시한 넓은 성공 결과 없음 |
| B07 | null/0/큰 Decimal/Date/Timestamp | 타입별 비교·표시·집계 기준 일치 |
| B08 | CHART 그룹/계열, PIVOT 셀/소계/전체 | 실제 선택 구간과 기여 행 일치 |
| B09 | 빈 값 그룹과 전체 선택 | 서로 다른 구간으로 처리 |
| B10 | 차트 이후 설정/업무값 변경 | D07의 현재값/동일 시점 계약 충족 |
| B11 | MAP 값 동률·null·다중값·페이지 경계 | 전체 정렬 후 안정적 페이지, 조건 변경 커서 처리 |
| B12 | 좌표 없는 MAP 기록 | 목록 보존, 가짜 좌표 생성 없음 |
| B13 | 숨긴 위젯·동일 원본의 여러 위젯 | 각 위젯 ID·제목·배치 보존 |
| B14 | 후보 조회 이후 원본 삭제·변경 | 저장 시 재검증, 원자적 실패 |
| B15 | 동시 구성 저장·동시 순환 참조 | 확정 충돌/순환 정책대로 처리 |
| B16 | 신규 위젯 저장 응답 유실 후 재요청 | 중복 생성 없이 계약된 응답 |
| B17 | 저장 중간 실패 | 허용 변경 전체 rollback, 원본 업무값 보존 |
| B18 | partial 입력·null·[]·명시 삭제 | D12대로 처리, 숨긴 위젯 우발 삭제 없음 |
| B19 | 새 domain code의 HTTP 매핑 | 실제 status/envelope·FE 처리 일치 |
| B20 | 로그와 batch 조회 수 | 민감 원문 미노출, 행별 N+1 방지 |

순수 규칙/application unit, 실제 Controller·module 연결, 격리 DB repository/동시성 테스트를 역할에 맞게 나눈다. mock 성공만으로 DB 정렬·rollback·경합 검증을 대체하지 않는다.

## 7. 컨벤션·주석·검증 완료 기준

- class/interface: `// 역할 : ...`
- HTTP method: `// API : ...`
- 내부 method/function: `// 기능 : ...`
- 주요 orchestration: `// 1. ...` 형태의 단계 주석.
- domain/application 공개 타입에 Prisma/Nest HTTP/외부 SDK 타입을 노출하지 않는다.
- 구조화 로그의 event/requestId와 민감값 제외 기준은 API 명세를 따른다.

구현 후 변경 범위에 맞는 typecheck, lint, 관련 tests, build를 실행한다. DB 변경이면 prisma validate와 migration·실제 DB 검증을 추가한다. 생성기 DLL 잠금 시 실행 중 프로세스를 임의 종료하지 않는다.

현재 문서는 이 구현을 수행한 결과가 아니다. 기존 메뉴 64개 테스트 통과 기록은 [README](../README.md)의 범위로만 해석한다.
