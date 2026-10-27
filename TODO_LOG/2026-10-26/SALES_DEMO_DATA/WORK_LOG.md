# 영업 샘플 데이터 입력

## 1. 작업 상태

- 상태: 완료
- 작업일: 2026-10-26
- 목적: 기존 사용자의 새 `영업` Workspace에 관리항목 6개, 업무목록 8개, 11종 View를 포함한 영업 테스트 데이터를 입력한다.
- 사용자 승인: 대화에서 데이터 구성을 검토한 뒤 실제 입력을 요청했다.

## 2. 적용 범위

- 기존 사용자와 기존 Workspace/데이터는 유지한다.
- 새 Workspace/OWNER 멤버/사용자 Actor와 그 Workspace 소속 샘플 데이터만 생성한다.
- 회사명은 삼성전자, SK하이닉스, TSMC, CXMT, OpenAI를 사용한다.
- 담당자, 판매 제품, 프로젝트, 금액, 일정, 계약은 가상 테스트 데이터다. 판매 품목 미확정에 따라 제품은 가상 예시임을 표시한다.
- 미정인 제품별 실제 사업 정책이나 전역 도메인 제약을 추가하지 않는다.
- ENV 3개와 실행 중인 서버를 유지한다. Docker, migration, 기존 인증 seed, 서버 재시작은 수행하지 않는다.
- 단발 운영 도구는 Prisma seed 영역에 격리한다. 실행 전에 dry-run과 rollback 검증을 수행하고 실제 입력은 단일 transaction으로 처리한다.
- 신규 데이터 식별에 UUID를 사용하고 다른 Workspace의 Actor를 재사용하지 않는다.

## 3. 진행 기록

- 작업 시작 시 Git 작업 트리가 깨끗함을 확인했다.
- 루트/BE AGENTS와 Backend 계층·transaction·주석·로그·DB 규칙을 확인했다.
- 현재 Prisma 모델과 Record 값 조회/저장 계약을 대조했다. 실제 옵션 테이블명은 `SelectOption`, `StatusOption`이다.
- JSON 세부 계약이 미구현인 View 설정은 샘플 형식임을 문서화하며 API 계약으로 확정하지 않는다.
- 실제 Supabase의 사용자 UUID와 이메일 일치, 기존 Workspace 1개 및 기존 CRM 데이터 수량을 읽기 전용 조회로 확인했다. 이메일 원문은 이 로그와 seed 코드에 기록하지 않았다.
- fixture 구문 및 전체 참조 검증 후 실제 DB transaction rollback 검증을 수행했다.
- 첫 rollback 검증에서 가상 지도 좌표의 JavaScript 부동소수점과 DB JSON 왕복 값 차이를 발견했다. 해당 transaction은 rollback되었으며 좌표 소수점 정규화 후 재검증을 통과했다.
- 새 Workspace `99c91c59-04f0-4549-b1b1-956692030cb4`에 단일 transaction으로 총 1,186행을 저장하고 transaction 안/밖에서 모든 명시 필드를 대조했다.
- 저장된 데이터로 다시 읽기 검증을 수행했다. 기존 Workspace 전체 소속 테이블은 수량·digest가 동일하고 ENV 세 파일 checksum도 동일하다.
- 실행 중인 서버를 통해 기존 사용자 활성 세션의 GET API 39건을 검증했다. 인증 정보는 메모리에서만 사용했으며 출력·저장하거나 세션 데이터를 변경하지 않았다.

## 4. 변경 파일

- `BE/prisma/seed-sales-demo.mjs`: 명시한 기존 사용자와 신규 Workspace UUID를 대상으로 plan/rollback/apply/verify를 수행하는 단발 도구. API와 module 내부 구현을 변경하지 않았다.
- `BE/prisma/SALES_DEMO_DATA.md`: 실제 입력 수량, 구성, Workspace 진입 주소, 실행·재검증 방법과 한계.
- 이 작업 로그.

## 5. 검증 결과

- Node.js 24 `--check`, DB 비연결 plan: 통과.
- 실제 DB rollback: 재검증 통과. 신규 Workspace 0건으로 원복됨을 확인했다.
- 실제 apply: 통과. 1,186행의 수량·각 필드·FK·소속·타입·단일/복수값·양방향 관계를 검증했다.
- 실제 verify: 통과. 데이터 변경 없이 저장된 fixture를 다시 검증했다.
- 동일 Workspace UUID로 apply 재실행: 통과. 기존 샘플의 소속·관계를 다시 검사하고 writtenRows 0으로 중복 입력을 방지했다.
- 입력 내역: 관리항목 6, 속성 79, 선택지 26/상태 30, 관계 6, 원본 레코드 54/값 557, 업무목록 8/참여 56/값 173.
- View 내역: View 24(11종), 표시 설정 113, 정렬 4, 그룹 4/그룹 설정 30, 위젯 3, 업무 의존관계 10. 필터·즐겨찾기는 0.
- 기존 데이터: 기존 사용자 Workspace의 전체 소속 테이블 수량·digest가 입력 전후 동일하다.
- ENV/서버: ENV 세 파일 checksum 동일. 사용자 화면 5173, 관리자 5174, 백엔드 health 모두 HTTP 200. 프로세스 종료·재시작·Docker 실행 없음.
- 실제 GET API 39건 통과: Workspace/관리항목/업무목록/빈 즐겨찾기, Object 6개 및 List 8개의 헤더→기본 View 선택→View 목록, 전체 11종 View, Object별 레코드 수량과 값, 교차 Workspace 조회 404.
- typecheck/lint/Prisma validate: 통과. 최초 pnpm 실행은 기본 Node 22 엔진 경고가 있어 Node 24 바이너리로 다시 실행했다. Prisma의 기존 `SetNull` 경고 4개는 DB 문서에 기록된 기존 경고이며 schema/migration을 변경하지 않았다.
- 기존 앱 코드 변경이 없어 build·전체 unit test·Frontend E2E 재실행 대신 실제 데이터 rollback/저장 검증과 실행 중인 API 검증을 수행했다.

## 6. 검토·남은 작업

- 검토 결과: 통과. 승인한 데이터 입력 범위를 완료했다.
- 54개 원본 레코드: 회사 5, 가상 담당자 15, 가상 제품 3, 영업기회 9(진행 7/과거 수주 2), 업무 20, 계약 2.
- View 본문 renderer 구현과 즐겨찾기 클릭 이동 구현은 이번 범위에 포함하지 않는다.
- 즐겨찾기는 0건으로 시작하여 화면에서 추가·삭제를 테스트한다.
- Git 커밋은 요청받지 않았으므로 수행하지 않는다.
- 다음 진입점: 사용자 화면의 Workspace 선택에서 `영업`을 선택하고 관리항목·업무목록·헤더·View 메뉴 및 즐겨찾기 추가/삭제를 확인한다. 제품/가격/지도 위치/Dashboard JSON은 가상 샘플이며 실제 정책이나 확정 API 계약이 아니다.

## 7. 관련 문서

- `AGENTS.md`
- `BE/AGENTS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/VIEW_TWO_AREA_TEXT_UX.md`
