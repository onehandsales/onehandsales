# 통합 구현 기준과 진행 기록

사용자 요청에 따라 현재 목표를 **Backend 주 화면 GET + User Web 11개 본문 구현·연결·검증**으로 변경한다. 필터·정렬·보기 설정 저장 API, 원본 쓰기, 배포·커밋은 제외한다. 이전 Backend-only/FE 후속 표기보다 이 요청을 우선한다.

## 공통 기술 계약

공통 읽기 Port와 snapshot의 기술 계약은 아래 기준으로 구현한다. 다른 모듈의 repository를 직접 참조하지 않고 원본 모듈이 제공하는 공개 query Port를 사용한다. 실제 Supabase에는 읽기만 수행한다.

- 원본 ID 250개씩 배치 조회, 한 요청 원본 최대 5,000개. 전체 필터/집계 전에 페이지로 자르지 않는다.
- 읽은 값 최대 100,000개, 관계 경로 최대 3 hop/참조 Record 최대 2,000개, 설정 테이블별 최대 500개, 그룹 최대 200개, 피벗 셀 최대 10,000개, 위젯 최대 50개, 응답 최대 5 MiB.
- 한 요청 read-only RepeatableRead, transaction 최대20초/개별 DB statement15초/connection 대기5초. 실행 상한 초과는422, timeout은503. 부분 합계를 성공으로 반환하지 않는다.
- 페이지 기본25/최대100, 기간 최대366일, 검색어 최대200자. cursor는 사용자·Workspace·View·source·part·필터 맥락·설정 식별값에 결합한다.
- 숫자는 Decimal 문자열을 유지한다. SUM/MIN/MAX는 정확한 십진수 연산, AVG/비율은 최대 소수10자리로 반올림한다. Decimal 계산에 IEEE754 Number 합산을 쓰지 않는다.
- 필터는 eq/neq/gt/gte/lt/lte/contains/starts_with/ends_with/in/not_in/is_empty/is_not_empty를 지원한다. 타입과 연산자/비교값이 맞지 않으면 실행 미지원 또는 손상 오류로 처리한다. 여러 필터 루트는AND, 빈 그룹은 조건 없음, ALL은 비어 있지 않은 값 집합에만 참이다.
- 문자열 검색은 Unicode NFC·대소문자 무시 부분 일치, 문자열 정렬은 고정 한국어 locale, 숫자/날짜/boolean은 해당 타입 비교, nulls LAST 기본. 다중값 정렬은 명시 MIN/MAX reducer가 없으면 설정 안내를 반환한다.
- Record/List 양쪽 소속이면 sourceType으로 선택, 원본 없는 일반 View는 설정 안내. List 집계는 Entry 단위. 참조 이름의 대표 TITLE이 없거나 모호하면 빈 라벨/‘이름 없는 기록’으로 표시하고 임의 첫 Text를 선택하지 않는다.
- 기존 typed 값과 JSON-only 값 모두 정규화하며 충돌은 감지한다. 삭제되거나 접근할 수 없는 참조의 ID/라벨은 반환하지 않는다.
- BODY/IMAGE/LOCATION 등의 값을 읽는 기능과 해당 값을 저장하는 기능을 구분한다. 미지원 config는 조용히 무시하지 않고 NEEDS_CONFIGURATION으로 안내한다.

## 사용자 답변 확인 중

다음 세 항목은 구현 전 확인 질문을 보냈다. 답변이 필요한 타입별 계산은 이 항목의 확정 후 반영한다. 공통 읽기 기반·DTO·비동기 상태와 관련 없는 작업은 먼저 진행한다.

1. 날짜만 있는 기간은 저장 종료일 포함.
2. 여러 그룹에 표시되는 Entry의 전체 합계 기여는 원본 Entry 기준 한 번.
3. 중첩 Dashboard는 초기 버전에서 안내 상태, 일반 View 위젯부터 지원.

## 구현·검증 상태

- 시작 시 작업 트리 깨끗함.
- 공통 snapshot/소유 모듈 query Port 구현 중.
- Backend/Frontend API·타입별 로직·브라우저 검증: 진행 전/진행 중이며 완료로 표시하지 않는다.
- 실제 데이터 조사와 가상 응답 예제는 구현 성공의 증거로 대체하지 않는다.
