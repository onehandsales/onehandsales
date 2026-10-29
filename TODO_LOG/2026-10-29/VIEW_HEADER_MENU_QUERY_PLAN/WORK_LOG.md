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
