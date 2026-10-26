# 검증·G99 규칙 검토

기준: [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [Backend 체크리스트](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md).

완료: 단위 테스트(접근·Actor·반복·순서·transaction·commit 로그·요청 ID), 실제 모듈 HTTP/DI(Guard·UUID·빈 DTO/배열·status·응답·404/500·요청 ID 생성/정규화/대체·로그 추적), 격리 PostgreSQL(멤버/Workspace 격리·중복·동시 요청·생성/삭제 rollback·READ COMMITTED·기존 GET 회귀).

실행 게이트: Node 24, typecheck/lint/전체 test/Prisma validate·generate/build/diff 검사. 업무 DB·환경·사용자 서버를 변경하지 않는다. 실제 결과와 실패는 작업 로그에 기록한다.

## 실제 실행 결과

| 검증 | 결과 |
| --- | --- |
| Node 24.21.0 typecheck / lint / build | 통과 |
| Prisma validate / generate | 통과. 기존 SetNull 관련 warning 4건 유지, schema 변경 없음 |
| PostgreSQL 17.10 전체 Jest | 61 suites / 400 tests 통과, 실패·skip 0 |
| 신규 검증 | 3 suites / 59 tests 통과 |
| 정리·SQL 제약 | Workspace/View/Favorite 잔여 0, 기존 SQL 전용 FK 5개 복원하여 검증 |
| 실행 서버 smoke | health 200, 신규 POST/DELETE 무인증 401 |
| 변경 공백·금지 의존성·주석 | diff 검사, 신규 선언 역할 주석, 계층/모듈 경계 검사 통과 |

전체 결과: `/tmp/onehandsales-favorite-review.n4mgy5fq/summary.json`, `jest-results.json`, `verification.log` (커밋 전 재검토). 최초 검증은 `/tmp/onehandsales-view-favorite.fxm6rztf/`에 있다. 임시 경로는 영구 보관물이 아니며 결과 요약과 실패 수정 이력은 [작업 로그](../../../../TODO_LOG/2026-10-26/VIEW_FAVORITE_MUTATION_API/WORK_LOG.md)에 남긴다.

## G99 검토 결과

- Controller는 HTTP/검증/상태 변환, application은 멤버 접근·transaction orchestration, adapter는 Prisma와 raw 잠금을 담당한다. 다른 모듈 persistence 직접 import 없음.
- 모든 쓰기·잠금은 동일 TransactionContext다. transaction advisory lock은 개인 Workspace·멤버 단위이며 FOR SHARE로 View 소속을 보호한다. 지원 isolation을 검증했다.
- 기존 등록은 무변경·200, 신규 201, 해제/이미 없음 200. 과거 중복은 본인 해당 View 해제 때만 제거한다. 남은 순서 보존과 신규 Actor 감사 필드를 확인했다.
- 계약은 구현 전 confirmed, 완료 후 implemented다. 오류/요청/공개 응답과 실제 HTTP 테스트가 일치한다. 로그는 안전한 ID만 쓰고 성공은 commit 뒤, 실패는 원문 없이 기록한다. 기존 middleware 요청 ID를 순수 string으로 전달하며 응답 header·성공/실패 로그의 연계를 검증했다. 역할/API/기능/주요 순서 주석을 TypeScript AST로 확인했다.
- API 밖 직접 쓰기와 과거 데이터 전역 정합성·추가 index는 보장 범위 밖으로 계약에 명시했다. schema·migration·업무 DB·환경 파일·사용자 서버·FE 변경 없음. 커밋은 후속 사용자 명시 요청에 따라 재검토·검증 후 진행한다.
- 기존 조회 계약 회귀와 실제 DB concurrency/rollback을 확인했다. 발견한 테스트 설정/빈 배열 검증 문제는 수정 후 전체 검증을 재통과했다. 완료를 막는 잔여 결함은 발견하지 않았다.
