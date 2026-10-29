# View 헤더 메뉴 조회 Backend 작업 기록

- 작업일: 2026-10-29
- 현재 상태: Backend G00~G99 구현·검증·검토 완료 / API 계약 implemented
- 사용자 요청: TODO 아래에 필터·정렬·보기 설정 버튼을 눌렀을 때 필요한 Backend 조회 API 작업 문서를 작성한다.
- 관련 계획: [완료 계획](../../../TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/README.md)
- 예정 범위: 계획 README, 공통 API 계약, Backend 구현 순서·검증 기준, TODO 색인.
- 시작 시 Git 작업 트리는 깨끗했다.

## 관련 기준

- `BE/AGENTS.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `TODO/VIEW_TWO_AREA_TEXT_UX.md`

## 진행 기록

- Backend 규칙, 현재 View 헤더 controller/use case, AttributeDefinition 공개 Port 여부, Prisma View 설정 모델을 확인했다.
- 저장 설정을 메뉴에 표시하는 조회와 주 화면 Record/ListEntry 조회를 구분한다.
- `sortOrder`는 조건의 표시 우선순위, `sortDirection`은 메뉴의 오름차순/내림차순 선택 상태로 계약에 기록한다.
- Attio 공식 문서에서 확인된 UX와 우리 서비스의 API/DB 설계를 구분한다.
- 계획 README, API 계약, Backend 작업 순서 문서를 만들고 TODO 색인의 활성 계획·우선순위를 갱신했다.
- 사용자의 후속 Git 커밋 요청을 받았다. 문서 검증 후 이번 변경만 커밋한다.

## 적용 범위

- 이번 작업은 문서 작성이다. Backend/Frontend 소스, DB, 환경 파일과 실행 중 서버는 변경하지 않는다.
- `TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/README.md`
- `TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md`
- `TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/BE-TODO/IMPLEMENTATION.md`
- `TODO/README.md`
- 이 `WORK_LOG.md`

## 검증 결과

- 신규 계획 문서 3개의 상대 링크 27개: 대상 파일 존재 확인 통과.
- JSON 코드 블록 5개: JSON 파싱 통과.
- 응답 예시의 DB 필드 54개: Prisma 모델의 실제 컬럼과 대조 통과.
- ViewType 11개: schema Enum과 타입별 설정 표의 대응 확인 통과.
- 타입별 configJson 예시: 로컬 더미 fixture의 실제 키·값과 대조했다. 실 Supabase 재조회 결과로 표시하지 않았다.
- 한글 인코딩·잘못 들어간 외국어 표기를 확인하고 수정했다.
- 문서 전용 변경이므로 Backend 실행 테스트·빌드·DB 통합 검증은 수행하지 않는다. 기존 실행 결과를 이번 구현 완료 증거로 사용하지 않는다.

## 검토 결과·보류 사항

- API 구현 여부와 문서 완료 여부를 구분한다.
- 추가 조건의 전체 속성 후보·지원 연산자 목록과 설정 변경/저장 API는 후속 범위로 명시한다.
- API 계약에 요청/응답, 테이블 출처, 정렬, 모듈별 내부 흐름, transaction 없음, 오류·로그·후속 소비자 기준을 포함했다.
- 미확정 항목은 계약 10절과 G00에 남겼다. Actor/Record 비교값 라벨, 필터 그룹/조건 혼합 표시 순서, 저장 규격이 없는 메뉴 설정을 구현 완료처럼 설명하지 않는다.

## 전체 진행 현황·다음 작업

- 완료: 작업 문서, API 계약 초안, Backend 단계별 작업·검증 기준, TODO 색인과 작업 기록.
- 후속: G00에서 계약 검토 후 confirmed로 갱신하고 G01 필터 → G02 정렬 → G03 보기 설정 → G99 검증 순서로 Backend를 구현한다.

## 2026-10-29 스키마 재검토 후 문서 보완

- 사용자 요청: `schema.prisma`와 문서를 다시 대조하여 비즈니스 로직을 검토하고 문서를 보완한다.
- 작업 전 Git 상태: 깨끗함. 이번 요청의 변경 대상은 계획 문서 3개와 이 작업 기록이다.
- View 관련 기본 ID FK는 존재만 보장하며 Workspace/View/Attribute의 조합 일치와 JSON 경로를 보장하지 않음을 확인했다. 미적용 복합 FK/CHECK 후보를 현재 제약으로 설명하지 않는다.
- API 계약에 조회된 행의 참조 무결성 조건, 조회 범위 밖 행의 제외 정책, 경로 UUID 배열과 전체 필터 그룹 순환 검사, GroupSetting·그룹·옵션의 정확한 소속 비교를 추가했다.
- SourceScope별 직접 속성 판정안은 사례와 확인 이유를 남겼다. Object/List XOR나 혼합 Object List 제한을 임의 확정하지 않고 G00 확인 대상으로 유지한다.
- Backend 계획에 공개 batch Port 입력/결과와 소속 필드, 명시 옵션 ID 조회, 빈 batch 생략, 호출 수 설계 기준, 검증 순서와 실패 사례를 추가했다.
- 비트랜잭션 읽기의 동시 변경 가능성과 고정된 내부 로그 reason을 명시했다. 조회 실패를 영구 DB 손상이나 전체 DB 진단 결과로 단정하지 않는다.
- 계약은 draft, Backend 구현은 미착수로 유지한다. 문서 보완 후 사용자가 Git 커밋을 요청하여 관련 문서 4개만 검증 후 커밋한다.
- 검증 결과: 계획 문서 3개의 로컬 링크 31개(앵커 포함), JSON 코드 블록 6개 파싱, 예시의 고유 모델·필드 조합 44개와 경로 배열 3개, ViewType 11개 대응 확인 통과. `git diff --check` 통과.
- 실행 테스트·빌드·DB 조회/변경은 이번 문서 작업에서 수행하지 않았다. 수정 파일은 계획 문서 3개와 이 작업 기록이며 코드·스키마·ENV 변경은 없다.

## 2026-10-29 Backend Agent 학습 후 구현·최종 검토

- 사용자 요청: Backend Agent 문서를 먼저 학습하고 비즈니스 로직·컨벤션·주석 규칙을 준수해 구현 및 검토한다.
- 착수 상태: 이전 문서 보완 커밋 `d1f2df53` 이후 깨끗한 작업 트리. 위의 draft/미착수 기록은 구현 전 이력이며 현재 상태는 이 절을 따른다.
- 사전 학습: root/BE AGENTS, Software README, Backend Agent 23개 문서, 관련 DB·시간 정책, 현재 View 코드/schema·API 계획을 확인했다.
- G00: 저장 설정 복원 범위와 참조 검증을 confirmed로 정리한 뒤 구현했다. 직접 SourceScope 소속 판정과 전체 경로 실행, 혼합 Object 정책은 저장/실행 API로 후속 분리했다.
- G01~G03: filters/sorts/settings GET, 공통 Reader·mapper, View query adapter, Attribute 소유 모듈의 공개 메타데이터 batch Port와 DI를 구현했다.
- 조회 흐름: 멤버십 → Workspace 내 선택 View·Object/List 참조 → 해당 메뉴 행 → 속성/옵션/위젯 batch → 참조 검증 → 공개 응답. Actor·기본 설정 생성, Record 값 조회, 보정 쓰기는 없다.
- G99: 신규 application 36개, HTTP·모듈 연결 23개, 실제 PostgreSQL adapter 1개 테스트를 포함한 전체 **64 suites / 462 tests 통과**, 실패·skip 0. typecheck/lint/build/Prisma validate 통과.
- DB 검증: 저장소 밖 임시 PostgreSQL 17 사용. 현재 schema와 기존 복합 FK·CHECK를 테스트 DB에만 준비했다. 세 메뉴/메타데이터 adapter SELECT 합계 12회, 빈 batch 0회, 교차 Workspace 제외, 결정적 정렬, 전체 옵션·JSON·숨김·반복 위젯 보존과 fixture rollback을 확인했다.
- 규칙 검토: 변경 TS 20개 파일의 선언 117개에 필요한 역할/API/기능 주석 존재. application/domain 금지 의존성과 다른 모듈의 구체 repository 직접 import 없음. 주요 흐름 번호 주석과 안전한 오류 로그 확인.
- 알려진 제한: Prisma의 기존 복합 FK SetNull 경고 4개. 실제 Supabase 데이터·성능과 배포, Frontend·설정 저장·본문 쿼리 실행은 이번 검증 대상이 아니다.
- [최종 검토](../../../TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN/BE-TODO/REVIEW.md)에 항목별 근거를 남기고 계약을 implemented로 갱신했다. 계획 전체는 TODO 완료 규칙에 따라 `TODO/DONE/VIEW_HEADER_MENU_QUERY_PLAN`으로 보관한다.
- FE·schema/migration·package/lockfile·ENV 파일과 실제 업무 DB는 변경하지 않았다. 이번 Backend 구현 커밋은 수행하지 않는다.
- 마무리 검증: 보관 후 계획·검토·작업 기록 링크 44개, JSON 블록 6개, 응답 배열의 모델/필드 38개, 경로 배열 3개, ViewType/config 예시 11개 대조 통과. 테스트용 임시 PostgreSQL만 정상 종료하고 pid 파일 제거를 확인했다.

## 후속 규칙 재검토·수정

예약 키 입력의 검증 누락과 일부 모델에 없는 숨김 상태를 설명한 주석을 추가로 발견했다. 사용자 요청에 따라 공통 빈 요청 검증과 주석을 수정했으며 [후속 작업 기록](../VIEW_HEADER_EMPTY_REQUEST_FIX_PLAN/WORK_LOG.md)에 수정 전 재현과 수정 후 관련 103개 테스트·정적/빌드 검증을 분리해 남겼다. 초기 주석 AST 검사는 주석의 의미까지 보장하는 증거가 아니다.
