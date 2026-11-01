# 현재 구현 검토

기준일: 2026-11-01. 상태: 구현·격리 PostgreSQL 포함 검증 완료. 현재 범위는 TABLE/KANBAN/LIST Backend GET 하나다. [API 계약](API-SPEC/VIEW_MAIN_CONTENT_API.md)이 과거 11타입 초안보다 우선한다. 사용자 추가 요청으로 Backend 규칙을 다시 검토해 누락을 보완했고, [규칙별 근거](../BE-TODO/BACKEND_RULE_COMPLIANCE_REVIEW.md)에 기록했다.

## 구현과 경계

- 경로: GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data.
- Controller → GetWorkspaceViewMainContentUseCase → ViewDataLoader → 공통 필터·정렬·값 해석 → 타입별 reader 흐름이다.
- View는 설정만 소유한다. Record/Entry/속성/관계/Workspace 값은 각 소유 모듈의 공개 application query Port로 읽는다. application에 Prisma/ConfigService/Express 의존성을 추가하지 않았다.
- application이 ReadSnapshotRunner를 시작하고 같은 context로 멤버십·설정·업무값을 읽는다. infrastructure만 Prisma RepeatableRead/read-only/timeout을 적용한다. 기존 쓰기 TransactionManager의 기본 동작은 유지한다.
- 기존 메타데이터·Object summary Port에는 선택 context 인자를 추가했다. 기존 헤더 호출에는 context가 없어 기존 조회 동작이 유지된다. 기존 endpoint·schema·migration·FE·패키지는 변경하지 않았다.
- 과거 11타입 구현의 query 기반을 검토해 재사용했다. 실행 enum/reader/DTO/설정 계약은 세 타입으로 좁혔으며 위젯·다른 타입 실행기는 추가하지 않았다.

## 요구사항 확인

| 요구사항 | 적용 내용 |
| --- | --- |
| Object/ List 원본 | Record 또는 Entry. 원본 itemKey와 occurrenceKey를 구분한다 |
| 같은 Record의 Entry 여러 개 | Entry마다 별도 item, LIST_ENTRY scope 값과 출처를 유지한다 |
| 저장된 표시·필터·정렬·그룹 | 소속·경로·구조 검증 후 실행. 숨긴 cell 제외, 그룹 표시명·순서·숨김·접힘 보존 |
| 페이지 이전 전체 평가 | 제한된 전체 원본을 읽고 필터·검색·정렬·그룹 후 페이지 처리한다 |
| TABLE/LIST | 열 metadata 또는 제목·표시 cell, 최대3단계 그룹과 occurrence 페이지 |
| KANBAN | Status/Select 단계별 count·카드, 각 열의 GROUP_ITEMS token/cursor. 접힌 열은 별도 확장 조회 |
| 다중값·표시 정보 | 값 행 ID·sourceEntity 보존, 옵션 이름/색상, Actor snapshot 이름, Record 직접 TITLE 복원 |
| 숫자/날짜/빈 값 | Decimal 고정소수 BigInt 비교, UTC Timestamp, false/0 보존, 빈 복합값도 EMPTY 처리 |
| 인증·격리 | 기존 Guard, snapshot 전/후 멤버십, View/소속/속성/참조의 Workspace 제한 |
| 오류 | 빈 결과는 READY, 설정 부족은 NEEDS_CONFIGURATION, 손상500·미지원422·stale409·timeout503 |
| 읽기 외 동작 | 업무값/Actor/View 생성·기본 설정 저장·조회 이력 삽입 없음. 로그는 기존 application logger 사용 |

## 검증

Node24.21.0을 명령 범위에서 사용했다. 프로젝트 설치 패키지/환경 파일은 변경하지 않았다. 격리 PostgreSQL 패키지는 프로젝트 밖 /tmp에만 설치했다. 최종 명령 결과는 [작업 로그](../../../TODO_LOG/2026-11-01/VIEW_THREE_TYPE_MAIN_QUERY/WORK_LOG.md)에 함께 기록한다.

| 최종 검사 | 결과 |
| --- | --- |
| pnpm -C BE typecheck | 통과 |
| pnpm -C BE lint | 통과 |
| pnpm -C BE build | 통과 |
| pnpm -C BE prisma:generate | 통과 |
| pnpm -C BE prisma:validate | 통과, 기존 경고4개 |
| 격리 PostgreSQL17.10에서 pnpm -C BE exec jest --runInBand | 69 suites/551 tests 통과, 실패0·skip0 |
| 이번 API 관련 새 테스트 | 5 suites/80 tests 통과(전체 통과 수에 포함) |

최초 작업에서는 로컬 테스트 DB 접속 실패 후 DB 의존 테스트를 제외해519개 통과/28개 미실행으로 보고했다. 이번 재검토에서는 임시 PostgreSQL을 준비해 해당 미실행을 해소하고 새 DB 통합 테스트4개까지 실행했다. DATABASE_URL/DIRECT_URL/TEST_DATABASE_URL은 테스트 자식 프로세스에만 임시 DB로 지정했다. 최종 결과는 /tmp/onehandsales-backend-rule-review.ytRX83/jest-all.json이다.

- 실행기 테스트: 41개. 세 타입·Object/Entry grain·전체 평가 후 페이지·정밀도·다중값·빈 값·상태 alias·그룹·숨김·접힘·cursor 맥락/변조/만료·미지원8타입을 검증한다.
- Loader 공개 Port 테스트: 5개. 동일 context·두 scope·중복 Entry·필터 비교 대상의 참조 라벨/경로·잘못된 소속·조회 상한을 검증한다.
- 실제 ViewDefinitionModule HTTP 테스트: 24개. Guard/DTO/Controller/UseCase/reader/오류 envelope를 통과한다. 외부 인증 resolver, DB Port/loader, snapshot은 대체하므로 실제 PostgreSQL E2E로 보지 않는다.
- ReadSnapshotRunner 테스트: 6개. readonly/statement 제한을 먼저 설정하는 순서, isolation/시간 제한, unknown context 거부, DB timeout 매핑을 검증한다. DB 연결을 모의하므로 PostgreSQL에서 직접 실행한 증거는 아니다.
- PostgreSQL 통합 테스트: 4개. 실제 모듈·소유 Port·Prisma adapter로 세 타입 본문·중복 Entry·두 scope·Decimal 다중값·참조/Actor 라벨·전역 필터/정렬 후 페이지·칸반 열 페이지·격리를 검증했다. 실제 readonly/RepeatableRead와 동시 writer 이후 snapshot 유지도 확인했다.
- Prisma validate 통과. 기존 SetNull/required relation 경고4개는 이번 변경 전부터 있는 스키마 경고다.

5000개 Entry를 넣은 단순 fixture의 계산기만 별도 측정했다: TABLE7.77ms/84011bytes, KANBAN41.74ms/185792bytes, LIST3.18ms/83911bytes(limit100). DB·소유 Port·SQL·네트워크를 제외한 단일 실행값이다. 응답 구조/상한의 간단한 점검이며 성능 SLA나 실데이터 처리량 검증이 아니다.

## 남은 제한과 후속

1. 격리 PostgreSQL에서 실제 SQL과 readonly/RepeatableRead·단일 동시 writer를 검증했다. 실데이터 규모의 EXPLAIN·많은 batch·다수 사용자 부하 검증은 아직 수행하지 않았다. 실제 업무 DB로 대체하지 않았다.
2. 초기 구현은 원본 최대5000개·값100000개 등을 메모리에서 평가한다. 상한 초과는422이며 limit을 줄여도 원본 스캔 상한은 그대로다. 큰 Workspace의 TITLE 후보도 별도500개 상한에 포함된다. 세부 상한은 API 계약을 따른다.
3. 칸반은 단일 Status/Select 단계만 지원한다. 다중 단계값·집계, 수치 구간, 동적 필터 토큰 등 미지원 저장 설정은 명시 안내한다. 나머지8타입은422다.
4. Actor 이름은 displayNameSnapshot, Record 이름은 모호하지 않은 직접 TITLE에 의존한다. 이름 부재·모호함은 null이며 별도 임의 속성을 제목으로 선택하지 않는다.
5. cursor는 조회 맥락·설정·마지막 anchor를 검증한다. 여러 HTTP 요청 사이 업무 데이터 snapshot은 유지하지 않는다. anchor가 바뀌면409로 재시작한다.
6. FE 본문, 후보 API, View 생성/저장, 기록 생성/수정, 카드 이동 저장, 임시 조건 실행은 후속이다.

세 타입 예제 JSON은 단위 fixture로 생성했다. 나머지8타입 문서/예제에는 후속 자료라는 우선순위를 명시했다. 사용자 변경·업무 데이터 보존, schema/FE 변경 없음, 커밋 없음은 최종 diff로 확인한다.
