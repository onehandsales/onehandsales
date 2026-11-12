# 회사 중심 검증용 데이터 전환

> 후속 요청 반영 완료: 아래 최초 6개 회사 구성은 3개 회사로 축소했다. 문서 마지막의 후속 작업을 최신 상태로 확인한다.

- 작업일: 2026-11-12
- 상태: 완료
- 사용자 요청: Supabase의 관리 항목에서 영업을 제거하고 회사만 남긴다. 회사를 직접 참조하는 업무 목록과 실제 입력 형태의 샘플을 준비해 컬럼 생성·수정과 기록 저장을 확인한다.

## 예정 범위

- 현재 Workspace의 영업 Object, 관련 Record/속성/관계/표시 설정을 백업 후 정리한다.
- 회사 Object와 기존 회사 Record의 신원을 유지하고 회사 기반 ListEntry와 View를 구성한다.
- 샘플 규모와 업무 목록 선호를 비동기로 문의했다. 답변 전에는 현황 조사와 복구·검증 도구를 준비한다.
- schema/migration/인증 계정은 변경하지 않는다. 사용자 편집 중인 `FE/user-web/src/components/layout/view-header-toolbar.tsx`를 보존한다.
- 실제 DB 전환을 transaction에서 리허설하고 rollback을 확인한 뒤 적용한다. 변경 전 업무 데이터는 Git 제외 TEMP에 보관한다.
- 실제 Backend 조회 구현으로 TABLE/KANBAN/LIST를 검증하고, 가능한 범위에서 컬럼·기록 쓰기를 transaction rollback으로 검증한다.

## 관련 기준

- 루트 및 BE/AGENTS.md
- AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION, ARCHITECTURE, DECISIONS
- AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md
- AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md
- TODO/RECORD_WRITE_PLAN/COMMON/API-SPEC/RECORD_WRITE_API.md

## 진행 기록

- 기존 사용자 FE 변경을 확인했다. 이번 작업은 DB 샘플 유지보수이며 해당 파일을 편집하지 않는다.
- 직전 읽기 전용 조사 기준 회사 4건(빈 기록 1건 포함), 영업 9건, 영업 파이프라인 참여 6건, View 3개를 확인했다. 실제 쓰기 전 최신 snapshot을 다시 확인한다.
- 별도 선호 응답이 없어 사전 안내한 회사 6곳 + 업무 목록 2개로 진행한다. 기존 회사 3건의 값과 ID를 보존한다. 빈 회사 1건을 가상 회사로 채우고 가상 회사 2건을 추가한다. OpenAI 도메인 `asd`도 기존 사용자 입력으로 보존한다.
- `BE/prisma/reshape-company-sample.mjs`에 plan/rehearse/apply/verify 유지보수 도구를 작성했다. 계획과 다른 편집이 있으면 중단하고, 추가·수정·삭제를 FK 순서에 맞춰 단일 transaction에서 수행한다.
- 백업/계획: `TEMP/company-sample-2026-11-12T11-01-26.531Z/plan.json`(디렉터리 700, 파일 600). 인증정보 없이 해당 Workspace의 변경 전후 업무 행을 보관한다.
- 실제 Supabase 리허설 통과: 회사 TABLE 6건, 회사 기반 파이프라인 KANBAN 6건, 온보딩 LIST 3건 모두 READY. 다른 기반 데이터와 migration 이력의 digest 보존을 확인했다.
- 실제 application/Prisma adapter로 컬럼 생성 및 기존 6개 Record의 빈 셀 생성, 컬럼 생성 재시도, 원본 속성명 수정, View 별칭 수정, 초기값 포함 기록 생성/동일 생성 ID 재시도, 기록값 수정 및 View 재조회를 검증했다. savepoint rollback으로 검증 행은 0건 남겼다. HTTP 인증과 브라우저 조작을 통과했다는 의미는 아니다.
- 같은 transaction 안에서 역방향 복구도 실행해 원본 snapshot 일치를 확인하고 전체 rollback했다. transaction 밖에서 원본 재조회도 일치한다.
- 실제 apply 완료 후 별도 READ ONLY / RepeatableRead verify를 통과했다. 업무 데이터 전체가 계획의 after snapshot과 일치한다. 회사 TABLE 6건, 파이프라인 KANBAN 6건, 온보딩 LIST 3건 모두 READY이고 손상/접근 불가 셀이 없다.

## 실제 적용 결과

- 관리 항목: 회사 1개. 기존 영업 Object 1개, 영업 Record 9건, 영업 속성 9개, 회사의 연결 영업 속성과 양방향 관계를 백업 후 정리했다.
- 회사 Record 6건: 기존 OpenAI/SAMSUNG/SK HYNIX 3건의 신원·값을 보존했다. 빈 Record를 정담솔루션으로 채우고 새봄교육/다온리테일을 추가했다. 새 회사 3곳은 가상이며 `.example` 도메인을 사용한다.
- 회사 속성 10개: 기존 이름/도메인/고객 구분/담당자/중요/등록일/메모와 대표 이메일/대표 전화/직원 수. 기존 표시용 `가상` 접두사는 속성 제목에서 정리했다. 직원 수 0과 미입력, checkbox false와 미입력을 구분할 수 있게 구성했다.
- 영업 파이프라인은 회사 6건을 직접 참조한다. 진행 단계, 다음 연락일, 집중관리, 검토 담당자, 검토 메모, 예상 금액, 우선순위 7개 속성을 가진다. 금액 0과 null, 단계 미지정도 포함한다.
- 고객 온보딩은 회사 3건을 참조한다. 온보딩 단계, 시작일, 목표 완료일, 담당자, 자료 수령, 메모 6개 속성을 가진다. 같은 회사가 두 목록에 참여하되 목록 값은 독립적이다.
- 회사 Object와 3개 View/즐겨찾기 ID를 유지했다. 기존 영업 LIST View를 온보딩 현황으로 전환했고 파이프라인 KANBAN의 제목·표시 속성을 회사 기준으로 재연결했다.
- 최종: Object 1, List 2, Attribute 23, Record 6/값 60, ListEntry 9/값 60, View 3/표시 설정 28, SelectOption 6, StatusOption 11, Relationship 0.
- Workspace/멤버/Actor/계정/인증/지원 테이블, 다른 Workspace 데이터, migration 76행 및 ENV를 보존했다. schema와 애플리케이션 소스는 변경하지 않았다.

## 검증·검토 결과

- Node 구문 검사 및 git diff --check 통과.
- Prisma validate 통과. 기존 복합 FK SetNull 경고 4개는 유지되며 이번 schema 변경은 없다.
- 리허설·쓰기 검증·원본 복구·전체 rollback·실제 apply·별도 readonly verify 통과.
- 실행: `node prisma/reshape-company-sample.mjs plan <workspaceId>` 이후 `rehearse`, `apply`, `verify`에 위 TEMP 계획 폴더를 전달했다. 테스트·복구 검증 보고서도 같은 폴더에 저장했다.
- 새 소스와 작업 로그만 작성했다. 사용자가 작업 중인 FE 파일은 보존했으며 이 단계에서는 git commit을 수행하지 않았다.

## 검토 및 다음 사용

- 요청한 DB 데이터 전환은 완료했다. 앱을 새로고침하면 회사 관리 항목과 회사 기반 두 업무 목록을 확인할 수 있다.
- 회사 TABLE에서 컬럼 추가/표시명 수정/기록 추가/셀 값을 변경하고, 같은 회사가 표시된 목록에서 원본 값의 반영을 확인할 수 있다.
- 현재 FE의 ListEntry 전용 속성 수정·목록 참여 추가·칸반 드래그 이동은 미구현이다. 이번 데이터 전환으로 그 기능까지 구현한 것은 아니다.
- 이번 쓰기 검증은 실제 application과 Prisma adapter를 동일 transaction에 조립한 검증이다. HTTP 인증·브라우저 입력 검증은 별도다.
- 데이터 편집 후 snapshot 전용 verify/apply는 차이를 감지해 중단한다. 이를 초기화 도구로 재실행하거나 기존 3사 영업 seed로 덮어쓰지 않는다.
- 복구 원본은 `plan.json`의 before, 적용본은 after에 보관했다. 역방향 복구 로직은 리허설에서 검증했다. 실제 복구는 후속 사용자 변경과 현재 상태를 먼저 대조하고 필요한 범위만 수행한다.

## 후속 요청: 회사 Record 3개로 축소

- 상태: 완료.
- 사용자 요청: 관리 항목 데이터를 3개로 줄인다.
- OpenAI/SAMSUNG/SK HYNIX를 유지하고 추가한 가상 회사 3건(정담솔루션/새봄교육/다온리테일)과 해당 회사들의 ListEntry/값만 백업 후 정리한다.
- 현재 회사 6건, Record 값 60건, ListEntry 9건/값 60건을 재확인했다. 축소 후 회사 3건, 파이프라인 참여 3건, 온보딩 참여 1건을 예상한다.
- Object/Attribute/List/View/옵션/즐겨찾기와 유지 회사의 입력값은 보존한다. 최초 6건 전환 계획은 이력이며 재적용하지 않는다.
- 백업: `TEMP/company-sample-reduce-three-2026-11-12T11-11-27.552Z/before.json`. 삭제 대상 Record 3건/값 30건, ListEntry 5건/값 33건을 보관했다.
- 동일 transaction 안에서 지정한 가상 회사 ID·이름과 외부 참조 부재를 확인하고 회사 3건을 삭제했다. 연결된 참여/값은 FK cascade로 정리했으며, 삭제 대상 외 전체 모델과 migration 이력의 digest가 동일함을 확인했다.
- 별도 읽기 전용 조회 확인: 회사 OpenAI/SAMSUNG/SK HYNIX 3건, Record 값 30건, 영업 파이프라인 3건, 고객 온보딩 1건, ListEntry 값 27건, View 3개. 유지 회사의 값/감사 정보와 목록·View 설정은 변경하지 않았다.
- 후속 요청 완료. 화면 새로고침 후 회사 3건을 기준으로 입력·편집 검증을 계속할 수 있다.

## 후속 요청: Git 커밋

- 사용자 명시 요청에 따라 전환 스크립트와 이 작업 기록 2개 파일을 커밋 대상으로 확인했다.
- 커밋 전 Node 구문 검사와 `pnpm -C BE prisma:validate`를 다시 통과했다. 실행 환경 Node 22에 대한 프로젝트 요구 버전(Node 24) 경고와 기존 SetNull 경고 4개가 출력됐다.
- DB 백업·계획·검증 결과가 저장된 TEMP 경로는 Git 제외 상태를 확인했다. 이미 적용한 DB 전환과 회사 3개 축소를 재실행하지 않았다.
