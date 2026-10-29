# View 헤더 메뉴 조회 Backend 작업 문서 작성

- 작업일: 2026-10-29
- 상태: 문서 작성·검토 완료 / API 계약 draft / Backend 구현 미착수
- 사용자 요청: TODO 아래에 필터·정렬·보기 설정 버튼을 눌렀을 때 필요한 Backend 조회 API 작업 문서를 작성한다.
- 관련 계획: `TODO/VIEW_HEADER_MENU_QUERY_PLAN/`
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
- `TODO/VIEW_HEADER_MENU_QUERY_PLAN/README.md`
- `TODO/VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md`
- `TODO/VIEW_HEADER_MENU_QUERY_PLAN/BE-TODO/IMPLEMENTATION.md`
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
