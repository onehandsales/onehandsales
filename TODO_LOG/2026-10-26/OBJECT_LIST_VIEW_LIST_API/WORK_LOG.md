# Object/List 소속 View 목록 API 구현·검토

- 일자: 2026-10-26
- 상태: Backend 구현·실행 검증·G99 규칙 검토·완료 보관 완료
- 관련 계획: [OBJECT_LIST_VIEW_LIST_API_PLAN](../../../TODO/DONE/OBJECT_LIST_VIEW_LIST_API_PLAN/README.md)
- 적용 기준: [Backend Agent](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md), [체크리스트](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md), [로그 결정](../../../AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md)

## 요청과 예정 범위

사용자가 합의한 ① Object 소속 View 목록 GET과 ② List 소속 View 목록 GET을 구현하고 검토한다. 각 Controller·UseCase·Query Port·Repository를 분리하며 기존 헤더 API의 응답 ID로 드롭다운 클릭 시 조회한다.

workspaceId와 대상 ID로 목록을 제한하고 sortOrder/createdAt/id 오름차순으로 반환한다. 선택적 viewId는 isSelected 계산에만 사용한다. View 없음은 빈 목록, 선택 ID 누락·불일치는 모두 미선택이다. Object/List는 소유 모듈의 공개 Summary Port를 재사용한다.

Frontend·View 생성/저장·즐겨찾기 쓰기·schema/migration/seed·환경 파일·사용자 서버·커밋은 이번 요청 범위에 없다.

## 진행 기록

- 시작 시 git status가 비어 있음을 확인했다.
- Backend 규칙과 기존 헤더·소유 모듈의 공개 Port 및 실제 DB 검증 방법을 확인한다.
- 구현 전 API 계약을 confirmed로 작성하고 코드·단위/HTTP/실제 DB 검증과 최종 규칙 검토를 순서대로 진행한다.
- 두 계약을 confirmed로 작성한 후 각 Controller·Query DTO·UseCase·Query Port·Prisma Repository를 view-definition에 분리 추가했다. Module에 각각 provider/controller를 등록하고 조회별 Workspace/대상 NotFound 오류 4개를 추가했다.
- Workspace는 hasWorkspaceMembership 1회, 대상은 기존 공개 Summary Port를 사용한다. View select는 id/name/icon/type이며 Favorite·원문 설정·반대쪽 소속을 읽거나 조건으로 추가하지 않는다.
- 선택 UUID는 대소문자 무관하게 비교하며 목록 범위와 정렬을 바꾸지 않는다. 생략·목록 밖 선택과 빈 목록을 명시적으로 검증했다.

## 검증·검토

- Node 24.21.0 / pnpm 8.14.1의 typecheck·lint·build 통과.
- 신규 UseCase·실제 Module/Guard/DTO/Filter/Query HTTP 검증 3 suites/72 tests 통과. 대상별 실제 PG Repository 2 suites/2 tests를 포함해 신규 5 suites/74 tests다.
- 임시 PostgreSQL 17.10에서 전체 58 suites/341 tests 통과. 실패 0, skip 0. 실제 Object/List·Workspace 범위, sortOrder/createdAt/id 동률·11종 type·두 소속 View·최소 필드·빈 목록·rollback을 확인했다.
- 이전 작업의 임시 embedded-postgres 설치를 재사용해 새 작업 전용 클러스터를 구동했다. 저장소 의존성·lockfile·환경 파일·업무 DB·사용자 서버는 변경하지 않았다.
- 최종 harness: /tmp/onehandsales-view-lists.88d01oaw/verify.mjs. DATABASE_URL/DIRECT_URL/TEST_DATABASE_URL은 테스트 자식 프로세스에만 격리 DB로 전달했다.
- 현재 Prisma schema의 from-empty SQL과 기존 migration SQL 전용 List FK 5개·CHECK 2개를 적용했다. Prisma validate/generate 통과. 기존 SetNull 경고 4개는 유지했다.
- 최초 시스템 임시 경로의 클러스터 준비는 undefined 출력과 결과 파일 부재로 끝났다. 해당 시도는 성공으로 집계하지 않았다. 짧은 /tmp의 새 경로에서 재시도해 전체 검증을 완료했다. 최초 실패의 구체 원인은 확정하지 않았다.
- fixture rollback 후 최종 테스트 DB Workspace/View 0건, 두 시도의 작업 소유 PostgreSQL 프로세스 0개를 확인했다.
- 실행 중인 localhost:3000의 Object/List 신규 경로에서 인증 없는 요청 각각 401을 확인했다. 사용자 서버를 재시작/종료하지 않았다.
- 최종 규칙 정적 검사: 생산 코드 12개 파일·선언 49개의 계층/타 모듈 persistence import·역할/API/기능 주석 확인 통과.
- [검토 결과](../../../TODO/DONE/OBJECT_LIST_VIEW_LIST_API_PLAN/BE-TODO/TEST-AND-REVIEW.md)에 실행 명령과 규칙별 근거를 기록했다.
- 문서 검토에서 404 메시지의 대소문자를 실제 오류와 일치하도록 수정하고 View 타입 11개를 계약에 명시했다. 기능 코드 추가 수정은 없었다.
- 완료 보관 후 문서 8개·상대 링크 45개·JSON 예시 2개·View 타입 11개와 경로/응답/오류 메시지·전체 변경 파일 공백·변경 범위를 확인했다. git diff --check 통과. FE·schema/migration·환경·package/lockfile 변경은 없다.

## 완료와 후속 범위

③ 헤더에 이어 ① Object View 목록과 ② List View 목록 Backend 구현·검증·검토를 완료했다. 완료 계획은 TODO/DONE에 보관한다. Frontend의 헤더/드롭다운 연결·본문·View 생성/저장·즐겨찾기 쓰기는 후속 요청 범위다. 커밋은 수행하지 않는다.

## 추가 요청: 검토 후 Git 커밋

- 사용자가 검토 후 이상이 없으면 커밋하도록 명시적으로 요청했다. 앞선 구현 단계의 커밋 제외 범위는 이번 요청으로 변경됐다.
- 현재 변경 상태와 두 API의 인증·멤버십·대상 소속·정렬·선택 표시·정상 빈 목록·오류·공개 Port/DI·명세를 다시 검토했다. 수정이 필요한 문제는 발견하지 못했다.
- 커밋 전 Node 24.21.0에서 UseCase·실제 Module/HTTP 검증을 재실행해 3 suites/72 tests가 통과했다. 기존 전체 58 suites/341 tests와 typecheck·lint·build·Prisma 검증 결과를 확인했고, 전체 테스트 이후 실행 코드가 수정되지 않았음을 확인했다.
- 문서 8개·상대 링크 45개·JSON 예시 2개·경로/응답/오류 메시지·전체 변경 파일의 공백·범위를 재확인했다. git diff --check 통과.
- 커밋 대상은 두 API의 코드·테스트, DB 현황 문서, 완료 보관 계획·목차와 작업 로그 30개 파일이다.
