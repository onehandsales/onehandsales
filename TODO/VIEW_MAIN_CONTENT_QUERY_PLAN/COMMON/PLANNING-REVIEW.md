# 설계 자체 검토와 구현 검증 기준

검토 기준일: 2026-10-30. 검토 대상은 이 계획의 API-SPEC·타입별 비즈니스 로직·FE 구조·텍스트 UX·JSON 예제다. **문서 자체 검토**이며 독립 리뷰어 승인, API 구현 검증, 배포 검증을 뜻하지 않는다. 실제 코드/스키마/읽기 전용 Supabase 조사와 대조한 뒤 문서 간 계약 일치를 다시 점검했다.

## 1. 판정

- 현재 범위: Backend 주 화면 GET 하나와 내부 11개 조회기. FE 11개 컴포넌트 설계는 후속 참고다. 필터·정렬 저장 API는 사용자 지시에 따라 후속으로 분리했다.
- 사실 구분: 기존 메뉴 조회와 신규 본문 실행, 실제 mock 기대값과 가상 응답 예제, 확인된 공식 UX와 우리 확장 정책을 분리했다.
- 계약 상태: **draft 유지**. 현재 범위·Entry 기준·기간 미설정 표시는 사용자 선택을 반영했다. 이번 GET의 남은 실행 의미/기술 계약을 구체화한 뒤 confirmed로 변경한다. 후속 저장 API 확정을 GET 선행 조건으로 두지 않는다.
- 현재 변경: TODO 문서·JSON 예제·탐색 링크. BE/FE 코드, schema, migration, 업무 데이터, 환경 설정, 의존성, 커밋 변경 없음.

## 2. 검토 중 발견한 문제와 문서 반영

| ID | 발견한 위험·잘못된 전제 | 반영한 설계 |
| --- | --- | --- |
| R01 | 메뉴 GET 성공을 실제 필터/정렬 실행으로 오인 | 설정 조회와 실행 query를 분리하고 typed 비교/경로/집계 검증을 새 책임으로 명시 |
| R02 | 기존 Record 25개 조회 후 필터·집계하면 전체 결과가 틀림 | 원본 전체 조건 평가 후 최종 페이지, bounded scan/초과 오류 |
| R03 | List의 Record 필드를 읽는다고 Record가 원본 단위가 됨 | Entry 단위 유지. PIVOT도 파이프라인 Entry 원본이라고 조사 문구 보정 |
| R04 | 한 List는 한 Object/한 Record당 한 Entry라는 제약을 암묵 추가 | 현재 데이터 관측과 허용 정책을 분리, 혼합/중복 검토 P01 |
| R05 | 속성 ID당 Map 하나로 다중값·다른 binding 경로 소실 | binding ID와 Cell.values[]/provenance 보존 |
| R06 | seed typed FK만 읽으면 기존 Record 수정 API의 JSON 값이 사라짐 | typed/JSON 공통 decoder, 충돌·삭제·소속 검증 |
| R07 | Relation metadata만으로 실제 Record 연결을 추정 | RelationshipDefinition과 실제 참조 value를 구분 |
| R08 | 칸반 단계는 무조건 ListEntry Status라고 해석 | 실제 RECORD Status를 확인, sourceScope 기준 처리, GET에서 값 변경 없음 |
| R09 | DISPLAY 금액만 보고 칸반 단계 SUM 자동 생성 | 현재 MEASURE/합계 설정 없음 확인, calculations=[], P10 |
| R10 | List Gantt는 ListEntry endpoint만 찾으면 된다고 해석 | 실제 Record 간 10개 관계 확인, Record→Entry 대응/모호성/필터·페이지 제한 |
| R11 | 실제 mock이 UX 그림의 5건·2200만원과 같다고 가정 | CHART/PIVOT 4 Entry·950000 USD, 11월 일정 9개로 별도 기대값 기록 |
| R12 | Location은 주소뿐이거나 지도에서 미위치를 0,0으로 보정 | 실제 좌표 5개 확인, 미위치 별도 조회와 유효한 0,0 구분 |
| R13 | Gallery는 기존 File/Attachment를 사용한다고 가정 | 현재 Text data SVG 확인, 이미지 정책 P07, 외부 다운로드 없음 |
| R14 | 기본 transaction이면 여러 SELECT가 동일 snapshot | 현재 manager isolation 미지정 확인, 새 read-only snapshot Port 제안 |
| R15 | Dashboard를 endpoint 하나로 구현하면 HTTP 한 번으로 모든 값 응답 | 구성 1회+원본별 같은 endpoint, 위젯별 권한·오류·snapshot 분리 |
| R16 | 새 오류명을 만들기만 하면 409/422/503으로 처리됨 | 현재 shared HttpExceptionFilter에 명시 매핑이 필요하다고 기록 |
| R17 | 로컬 메뉴 draft가 본문 GET에 자동 적용됨 | 현재는 저장 설정만 조회. 사용자 결정에 따라 자동 저장→재조회는 후속 분리하고 임시 override를 현재 요구에서 제외 |
| R18 | Object 속성 순서 변경과 View 열 순서 저장을 혼용 | FE 기존 Attribute 이동 mutation 재사용 금지, View 설정과 구분 |
| R19 | 그룹 중복 항목을 itemKey로 병합하면 다른 그룹 행이 사라짐 | 논리 itemKey와 표시 occurrenceKey 분리, 그룹 page key 검토 |
| R20 | 오류 위젯에도 유효 layout 필수이면 부분 실패 응답 불가능 | layout=null+NEEDS_CONFIGURATION 허용, FE 안내 영역 |
| R21 | 다중 좌표 선택 조회를 ‘marker 한 개’로 고정 | MAP_ITEMS 원본 최대1, MAP_MARKERS 해당 원본의 좌표 목록, P07 한도 |
| R22 | 11개 타입 모두 Attio 기본 View라고 설명 | 공식 Table/Kanban/Report와 우리 enum 확장을 구분, 핀 지도/국가 집계 지도 차이 기록 |
| R23 | 양쪽 소속인 child View에 sourceType 없이 위젯 query 호출 | Widget.content에 sourceType 명시, 선택 불명은 NEEDS_CONFIGURATION, 부모 소속 복사 금지 |

이 반영 결과는 문서의 논리/계약을 보완했다는 뜻이다. 실제 handler 성능·UI 동작은 구현 후 별도 검증 대상이다.

## 3. 결정 현황과 남은 계약 항목

아래는 최초 검토에서 정리한 P01~P10의 현재 상태다. [범위·사용자 선택](SCOPE_AND_DEFERRED_WORK.md)을 반영했다. 확정된 일부 선택을 나머지 세부 정책 전체의 승인이나 DB 도메인 제약으로 확대하지 않는다. 현재 정상 mock은 이 경계 대부분을 포함하지 않는다.

| ID | 결정할 내용 | 현재 상태·기준 | 확정·검증 책임 |
| --- | --- | --- | --- |
| P01 | View 양쪽/없는 소속, 혼합 Object, TITLE/참조 라벨 선택 | 양쪽이면 sourceType 명시, Dashboard 원본 없음 허용, 적용 불가 속성은 null과 구분. 명시 TITLE 기반 대표명 정책 필요 | PM·BE; 중복 Entry/혼합 Object/대표명 없음 fixture |
| P02 | 연산자 목록·JSON 규격·typed/JSON 호환, empty/ANY/ALL, 문자열/정렬 | 실제 gte와 두 값 저장 경로 지원, 비교값 타입 검증, 빈 ALL=false 제안, nulls LAST, 다중 정렬 reducer 명시 | BE·FE; 논리표와 읽기/수정 호환 계약 |
| P03 | 그룹/측정 다중값·COUNT 종류·통화·0/null·총합, Chart 조합·피벗 계층 | **List 원본·집계는 Entry 기준으로 사용자 확정**. 다중값 기여·COUNT 종류·통화/null·차트 조합의 지원표는 남은 GET 계약 항목. Decimal/provenance/원본 totals 제안 유지 | PM·BE·UX; 중복 JOIN/여러 통화/AVG/빈셀 검증 |
| P04 | DATE/TIMESTAMP 경계·끝 없음·첫 조회창·진행률·의존 offset | **A안 선택 반영: Calendar 시작일만 있으면 하루 표시, Timeline/Gantt 기간 부족은 미설정 목록**. 날짜 종료 경계·시간대·초기창·진행률 등은 남은 GET 계약 항목 | PM·BE·FE; DST/겹침/역전/진행률·offset |
| P05 | 실제 처리 한도·페이지·시간·토큰 정책 | 페이지25/최대100, 기간366일 초안. scan/fan-out/group/pivot/응답 byte/시간/메모리/토큰 길이·만료는 수치화 필요 | BE; 부하 측정/EXPLAIN 후 결정, 부분 성공 금지 |
| P06 | 모듈 query 소유권·snapshot·cursor 보호 | 소유 모듈 public Port, read-only RepeatableRead context, 관계·업무 연결 조회의 임시 소유권 명시, 토큰 위변조/노출 방지 | BE 아키텍처; DI/트랜잭션 연결/권한 테스트 |
| P07 | Location 다중 좌표·image data SVG·지도 Provider | 현재 GET의 좌표/이미지 응답 허용 범위는 확정 필요. 지도 Provider·CSP·라이선스/비용 등 FE 연결은 후속. GET에서 지오코딩/다운로드 없음 | PM·UX·FE·BE; 응답 허용 형식·좌표경계와 후속 UI 구분 |
| P08 | Dashboard 중첩·깊이·배치 오류·모바일 | 현재 GET의 구성·순환/한도·layout 오류 응답은 확정 필요. 모바일 재배치와 위젯 편집은 후속 | PM·UX·BE·FE; 반복 참조와 순환 구분 |
| P09 | 필터·정렬 변경의 저장과 즉시 반영 | **범위 결정 완료**: 현재는 저장 설정으로 GET만 구현. 필터·정렬 자동 저장 API 성공 → 같은 GET 재조회는 후속. 임시 override는 현재 계약에서 제외 | 후속 BE·FE; 현재 GET 착수의 선행 조건 아님 |
| P10 | 칸반 합계와 목 데이터에 없는 표시 설정 | 현재 calculations=[]; 합계가 필요하면 명시 metric config 설계. 미저장 표시값은 null과 FE 기본 표현 구분 | PM·UX·BE·FE; 현재 설정으로 표현 가능한 UX 확인 |

P09는 더 이상 사용자의 선택을 기다리는 항목이 아니다. 자동 저장 후 즉시 반영이라는 최종 동작과 저장 API를 나중에 구현한다는 현재 범위가 정해졌다. 현재 GET의 완료 조건에 헤더 저장·임시 override·FE 갱신 구현을 추가하지 않는다.

착수 판단은 **저장 API 없이 GET 구현 가능 / GET 세부 계약은 확정 단계 선행**이다. API-SPEC이 draft이므로 개발 규칙상 먼저 이번 조회의 지원표·기본값·실패 처리·실행 한도를 확정한다. 상세 내용은 [현재 범위의 착수 조건](SCOPE_AND_DEFERRED_WORK.md)을 따른다. 문서 정적 검사 통과만으로 모든 비즈니스 정책이 확정됐다고 보고하지 않는다.

## 4. 이번에 확인한 근거

| 항목 | 실제 확인 내용 | 한계 |
| --- | --- | --- |
| 현재 코드/규칙 | schema, 네 CRM 모듈과 관련 List/Workspace/shared, FE header/Object/List, Backend/Front/DB/UX 규칙 대조 | 코드 읽기는 런타임 실행 검증이 아님 |
| Supabase 읽기 | 현재 BE 연결을 사용한 Prisma read-only transaction, transaction_read_only=on | 사용자 HTTP 인증/인가·RLS·배포 결과 증명 아님 |
| mock 범위 | 목표 Workspace: View24/11타입, Record54, Entry56, 표시113, 위젯3, 관계10 | 다른 Workspace의 개인 값은 분석 대상으로 확대하지 않음 |
| 별도 재계산 | CHART/PIVOT 각 7→4 Entry, BigInt 정수 합950000; Calendar/Gantt 11월 겹침 각9 | 실제 API 엔진이 아직 없음. Decimal 소수 집계 테스트를 대체하지 않음 |
| 공식 자료 | Attio List/Table/Kanban/Filter/Insight/Dashboard, Notion Views | 공개 UX·모델 의미만 근거, 비공개 구현/우리 정책 추정 아님 |
| 문서 정적 검사 | 링크·11타입 coverage·JSON 응답 shape·binding 참조·값 타입·계수·whitespace | JSON 예제는 가상 값. BE/FE 테스트 실행 결과가 아님 |

정적 검사 실행 결과:

- 범위 갱신 후 계획 문서 **11개**, 타입별 독립 응답 JSON **11개**를 검사했다. Prisma ViewTypeEnum의 **11타입**과 비즈니스 로직·UX·FE 매핑의 coverage가 일치했다.
- 상대 파일 링크 **78개**, Markdown 코드 블록 짝, 신규 파일의 줄 끝 공백/깨진 Unicode 검사를 통과했다.
- 11개 JSON의 공통/타입별 필드, 실제 schema의 타입·role enum, UUID, source 단위, binding 참조, Decimal string, summary 수치, 페이지 불변식을 검사했다. 중첩된 **14개 Item 표현·37개 Cell/Value·10개 PageInfo**를 확인했다.
- 차트/피벗 가상 예제의 합계와 축 참조, Gantt endpoint/enum, Map 좌표/건수, Dashboard layout/sourceType을 검사했다. 오류 **0건**.
- 최초 coverage 검사에서 FE 표의 타입명이 컴포넌트명으로만 표시된 것을 확인해 `TABLE → TableView`처럼 11개 enum 매핑을 명시하고 다시 통과했다.
- 기존 두 문서에 추가한 탐색 링크를 확인했고 `git diff --check`를 통과했다. 신규 untracked 파일도 별도의 정적 검사로 포함했다.
- 범위 재검토에서 README/API-SPEC/UX/FE/작업 순서의 임시 override 선행 요구를 제거했다. 필터·정렬 저장→본문 재조회는 후속, Entry 단위와 기간 미설정 A안은 현재 GET에 반영한 것으로 문서 간 일치를 확인했다.

이 검사는 예제/문서 일치 검사이며 API 구현의 단위·통합 테스트가 아니다. 검사 중 사용한 raw mock snapshot과 검사 스크립트는 임시 폴더에 두었고 저장소 산출물에 포함하지 않았다.

## 5. 구현 후 반드시 실행할 검증

아래 Backend/API 항목은 현재 GET의 구현 검증 대상이다. FE 비동기·브라우저·메뉴 회귀 등 화면 검증은 후속 FE 연결 단계에 적용한다. 현재 GET의 Backend 완료 판정에 아직 착수하지 않은 FE/저장 API 구현을 요구하지 않는다.

| 구분 | 핵심 사례 | 통과 기준 |
| --- | --- | --- |
| 인증·격리 | 비로그인, 다른 Workspace View/Attribute/Option/Record/위젯, membership 변경 | 현재 권한 범위 밖 ID·라벨·값 없음, 조회 전 권한 실패 |
| 원본 단위 | Object/List, 중복 Entry, 혼합 Object, 양쪽 FK, 원본 없는 Dashboard | P01 확정 의미대로 count/key/scope 처리, 임의 제약 없음 |
| 값·관계 | typed-only/JSON-only/양쪽 일치·충돌/삭제, 다중 값, 여러 hop, 순환, fan-out | seed/기존 수정 결과 모두 읽기, 값 소실·중복 계산 없음 |
| 필터·정렬 | 중첩 AND/OR/루트/빈 그룹, ANY/ALL/empty, false/0/null, 다중 정렬, tie | 논리표와 전역 순서 일치, page-before-filter 금지 |
| TABLE/LIST/GALLERY | 열 순서·숨김/중복 binding·BODY/IMAGE/이미지 실패·group occurrence | View 표시 설정 적용, 다중값/배열 보존, 기존 UX 회귀 없음 |
| KANBAN | 빈 단계·미지정·숨김·접힘·열별 cursor·RECORD/LIST_ENTRY 기준 | 전체 count 정확, 잘못된 단계/원본 수정 없음, 임의 SUM 없음 |
| 기간형 | start-before-window, end 경계, start=end, 끝 없음, 역전, DST, page | 제안 확정 후 날짜 의미 일치, 11월 mock9, 누락 원본 접근 가능 |
| GANTT | Record/Entry endpoint, 다중 대응, page 밖 관계, 순환, 0/50/100/잘못된 progress | 잘못된 선/자동 날짜 이동 없음, 소속·필터 보호 |
| 집계 | Record 동일금액, JOIN 증식, AVG, COUNT, allnull/0/empty, 다중 그룹/통화 | source grain·정밀도·합계 일치, 4/950000 mock 검증 |
| PIVOT | 동일 이름 다른 회사, sparse cell, 축 한도, 다중 계층, 합계 표시 | ID 기반 축, null/0/no-cell 구분, 초과는 명시 오류 |
| MAP | 0,0/주소만/잘못된 좌표/다중 좌표/날짜변경선/marker·list page/선택 | 전역 bounds·동기화 정확, 미위치 보존, page 일부로 전체인 척하지 않음 |
| Dashboard | 원본 실패·삭제·다른 Workspace·반복·cycle·layout 오류 | 개별 상태, ID 누출 없음, 정상 위젯 유지, 무한 query 없음 |
| FE 비동기 | 빠른 타입 전환·사용자 전환·늦은 응답·abort·409·임시 메뉴 | 캐시 격리, 현재 선택/적용 조건과 화면 일치 |
| 성능·일관성 | 상한 부근·초과, 여러 읽기 중 변경, 장기 scan, 쿼리 수/메모리 | 확정된 P05 예산 충족, bounded snapshot, timeout/한도에서 부분 합계 성공 없음 |
| 컨벤션·로그 | controller/use case/port/adapter, export/import, 주석/오류 mapper | module 경계, 역할/API/기능·번호 주석, PII/원문 로그 없음 |

## 6. 완료 상태 기록 규칙

문서 검사, BE 단위·통합, FE 단위·브라우저, 실제 DB 통합, 배포 검증을 각각 기록한다. 실행하지 않은 항목은 ‘미실행’으로 유지한다. 이번 문서 작업에서 BE/FE typecheck/lint/test/build나 신규 HTTP API 호출을 했다고 보고하지 않는다.
