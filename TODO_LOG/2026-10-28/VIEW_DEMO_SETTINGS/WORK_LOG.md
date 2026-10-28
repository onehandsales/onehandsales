# View 더미 설정 입력

- 작업일: 2026-10-28
- 상태: 완료
- 사용자 요청: 기존 Supabase 영업 더미 데이터에 합의한 View 설정·필터·정렬·표시 형식을 입력한다. 후속 지시에 따라 위젯 `showTitle: true`도 포함한다. JSON에 버전 필드는 추가하지 않는다.

## 범위

- 기존 영업 Workspace의 View 24개 설정, 날짜·금액·진행률 표시 설정 30개, 기존 정렬 4개, 위젯 3개를 갱신한다.
- 필터 그룹 4개, 조건 4개, 정렬 4개를 추가한다.
- JSON 키와 `gte` 연산자는 화면 검증용 데이터 규격이며 아직 상세조회 API가 해석하지 않는다.
- 원본 Record/ListEntry/값, 다른 Workspace, schema/migration, ENV, 실행 중 서버는 변경하지 않는다.
- 기존 사용자 삭제 변경 3개를 보존한다. 커밋은 수행하지 않는다.

## 진행

- 루트/BE AGENTS, Backend 계층·transaction·주석·DB 지침과 기존 SALES_DEMO_DATA 작업 이력을 확인했다.
- 읽기 전용 조회에서 영업 View 24개, 표시 설정 113개, 정렬 4개, 필터 0개, 위젯 3개와 모든 대상 JSON의 미입력 상태를 재확인했다.
- 재실행 가능한 전용 seed와 fixture JSON, 값 의미/실행 방법 문서를 작성했다.
- 읽기 전용 plan에서 기존 61행 갱신·신규 12행을 확인했다.
- 실제 Supabase rollback 검증 통과: 73행 입력 후 필드/소속/원본 보존/필터 결과를 확인하고 전부 되돌렸다. 전체 CRM 23개 테이블 digest가 입력 전과 동일하다.
- 필터 기대 결과: KANBAN/CHART/PIVOT 각각 4건·950000 USD, TIMELINE 2건.
- 실제 apply 완료: 기존 61행 갱신, 신규 12행 생성. 위젯 3개의 showTitle=true 포함.
- 변경 전 백업: `TEMP/view-demo-settings-20261028/before-2026-10-28T08-37-36.218Z.json`. 변경 대상 원본 61행, 추가 12행의 ID/값, 보호 데이터 및 ENV digest를 보관한다.
- 저장 후 별도 읽기 전용 verify 및 전체 연결 audit를 수행했다. 같은 apply 재실행은 writtenRows=0이었다.
- 최초 조회에서 즐겨찾기 2건이었지만 실제 apply 직전 백업은 0건이었다. 입력 직전부터 최종 검증까지의 즐겨찾기 digest는 동일하며 이 도구에는 즐겨찾기 생성·수정·삭제가 없다. 작업 중 발생한 별도 변경을 복구하거나 덮어쓰지 않았다.

## 검증 및 결과

- Node 구문 검사, readonly plan, 실제 DB rollback 검증 통과.
- Backend typecheck/lint/Prisma validate 통과. Prisma의 기존 복합 FK SetNull 경고 4개는 유지되며 이번 schema 변경은 없다.
- 실제 저장 후: View config 24, 정렬 config 8, 표시 format 30, 위젯 config 3. 필터 그룹 4, 조건 4, 정렬 총 8.
- 저장 필드와 기존 제목·참조·배치·정렬 방향 보존 검증 통과. View/Attribute/옵션/값 소속 및 위젯·의존관계 순환 검사 통과.
- 원본 Record 54/값 557, ListEntry 56/값 173과 다른 Workspace를 포함한 23개 CRM 테이블의 변경 허용 행 외 digest가 입력 직전과 동일하다.
- ENV 3개 checksum은 작업 최초/입력 전후 동일하다. 서버 종료·재시작·Docker·migration·기존 인증 seed 실행 없음.
- 동일 apply 재실행은 pendingUpdates=0, pendingInserts=0, writtenRows=0. 중복 행 없음.
- 애플리케이션 코드를 변경하지 않아 build/전체 unit test/Frontend E2E 대신 실제 DB rollback·저장 필드·실제 필터 결과·재실행 검증을 수행했다.

## 변경 파일

- `BE/prisma/seed-view-demo-settings.mjs`: plan/rollback/apply/verify 전용 도구.
- `BE/prisma/view-demo-settings.fixture.json`: 실제 대상 ID와 입력값.
- `BE/prisma/VIEW_DEMO_SETTINGS.md`: 데이터 의미·실행·백업·검증 안내.
- 이 작업 로그. 기존 사용자 삭제 변경 3개는 유지했다.

## 관련 문서

- `BE/AGENTS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/VIEW_TWO_AREA_TEXT_UX.md`

## 검토 및 다음 작업

- 요청한 더미 설정 입력 완료. 커밋하지 않았다.
- JSON 키/gte는 검증용 데이터 규격이며 현재 View 본문 API/renderer가 이를 해석하는 기능은 없다.
- 다음 작업은 이 fixture와 기대 결과를 기준으로 View 상세조회 계약 및 읽기 로직/화면을 구현하는 것이다.
- fixture 도구는 현재 영업 샘플 snapshot 전용이다. 이후 사용자 데이터/설정이 달라지면 verify가 실패할 수 있으며 기존 값을 강제로 덮어쓰지 않는다.
