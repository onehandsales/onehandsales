# 사이드바 순서 API Backend 재검토

2026-11-11 사용자 요청: 백엔드 규칙을 확실히 준수했는지 코드 기준으로 재검토.

## 범위와 결론

새 순서 변경 API 3개, 이를 위해 변경한 Object/List 생성·사이드바 GET, shared helper/pipe/filter, Prisma migration, 테스트와 계약을 다시 대조했다. 기존 수정 파일을 보존하고 Backend/DB 규칙 문서를 다시 읽었다. 이전 검토의 일괄 '준수' 판정은 생성 정책 위치·권한 실패 관측·계약 문서 세부 항목을 충분히 구분하지 못했다.

| 발견 | 근거 규칙 | 조치 |
| --- | --- | --- |
| Object/List의 마지막 순서 다음에 배치하는 계산이 persistence에 위치 | application의 business orchestration, adapter는 DB 접근 구현 | 포트에 `lockAndGetLastSortOrder(workspaceId, context)` 추가. adapter는 잠금과 최대값 조회만, application은 `MAX+1` 또는 첫 순서 0 결정 후 생성 포트에 전달 |
| 재정렬 입력 정규화·멤버십 조회가 try 밖에 있어 권한 거부와 접근 조회 실패가 로그에서 누락 | OBSERVABILITY: 권한 실패와 DB 실패 추적, request/user 문맥 | 세 use case의 검증·접근 조회를 오류 기록 범위에 포함. 404/WARN과 500/ERROR 구분, requestId 보존, 토큰·원본 DB 오류·전체 ID 배열 제외 |
| 계약 상태 confirmed 유지, 정확한 404 코드·오류 envelope·로그 수준·transaction 표기와 BE-TODO 내부 설명 부족 | API_CONTRACT/TRANSACTION의 필수 항목과 문서 위치 | implemented 갱신. 실제 Filter/DTO/Guard 흐름을 대조해 계약 보완. 본 BE-TODO에 내부 구조/transaction/경계 근거 기록 |

API 경로, request/response 필드, 권한 정책, 기존 저장 순서 의미는 그대로다. 재검토 중 실제 Supabase나 schema/migration, FE 코드는 수정하지 않는다.

## 내부 책임과 transaction

- `object-definition`: ObjectDefinition의 생성/공통 순서/조회.
- `list-definition`: ListDefinition의 생성/공통 순서/조회.
- `view-definition`: ViewFavoriteDefinition의 개인 순서/등록/해제/조회. ViewDefinition 읽기는 같은 모듈 소유이며 상단 View 정렬은 수정하지 않음.
- Workspace 멤버/Actor는 WorkspaceAccessQuery 공개 포트로 확인. 다른 모듈 persistence 직접 import/inject 없음. 테스트에서 여러 adapter를 구성하는 것은 운영 의존성과 구분.
- transaction: **필요**. application의 TransactionManager가 시작/commit/rollback. 입력·멤버십 사전 검증 후 잠금·현재 집합 비교·변경 행 저장을 같은 context로 수행.
- 신규 Object/List 생성: application이 동일 transaction에서 잠금/최대값 조회→다음 순서 계산→원장 생성→기존 Attribute/View 공개 생성 port 순으로 조율. 기존 생성 성공 응답과 기본 View 생성 범위 유지.
- 실패 시 모든 순서와 audit 변경을 rollback. 동일 순서 no-op은 audit 갱신 없음. 운영 성공 로그는 commit 후이며 DB 이력 row를 별도로 생성하지 않음.
- Object/List advisory key는 동일 Workspace 생성·재정렬이 공유. Favorite는 기존 Workspace/member 잠금 공유. row lock은 조회 후 삭제/소속 이동을 보호. SQL 파라미터 바인딩과 갱신 행 수 검증 유지.
- idempotency: 전체 최종 상태 지정, 별도 key 없음. 순서가 같으면 no-op. 요청 집합이 바뀌면 409. 순서만 바뀐 동시 요청은 마지막 commit 우선이라는 기존 확정 계약 유지.
- outbox: **없음**. 외부 provider·이벤트·후속 부수 작업 없음. 향후 모듈 분리 시에도 소유 서비스 내부 mutation과 Workspace 공개 접근 포트를 경계로 사용.

## 공통 코드와 DB 검토

`shared/application/ordering`은 특정 테이블을 모르는 순수 UUID·집합·순서 계산과 공통 오류/결과형이다. `StrictOrderBodyPipe`는 세 모듈이 공유하는 HTTP body 계약의 허용 키를 검사하고 각 모듈 DTO의 class-validator를 실행한다. 소속·저장 가능 여부는 application/소유 repository에 남겨 두었다. Guard/Filter/DTO/HTTP 타입 또는 Prisma/Supabase 구현을 application 공개 계약에 새로 노출하지 않았다.

기존 CHECK/복합 FK/컬럼 지정 SET NULL/DEFERRABLE/RLS를 보존하는 SQL은 변경하지 않았다. 이번 재검토는 이전 실제 DB 적용을 반복하지 않는다. 이전 실DB 카탈로그·checksum 증거는 상위 검토 문서를 참조한다. 새 unit/HTTP/DB 검증은 격리 PostgreSQL에서 실행한다.

## 기존 공통 코드에서 별도로 확인한 관측 공백

`BE/src/shared/presentation/guards/auth.guard.ts`와 `auth/application/use-cases/resolve-current-user.use-case.ts`는 헤더/토큰/세션 인증 실패를 던지지만 구조화 실패 로그를 남기지 않는다. 따라서 OBSERVABILITY의 '인증 실패와 권한 실패를 구분해 기록'을 **백엔드 전체가 완전히 충족한다고 판정할 수 없다**.

이번 재검토에서는 신규 순서 기능의 권한·업무 실패 관측을 보완했다. 공통 Guard 변경은 모든 인증 endpoint와 DI/로그 정책에 영향을 주므로 이번 순서 기능의 보완에 섞지 않았으며, 완료한 것으로 표시하지 않는다. 인증 거부 자체는 기존 Guard/HTTP 테스트로 확인되고 이 항목은 인증 우회나 저장 권한 누락이 아닌 운영 로그의 공백이다.

## 검증

- HTTP: RequestIdMiddleware + AuthGuard + 전역 ValidationPipe + 실제 controller/use case를 조립. 404 권한 거부, 접근 조회 500, commit 이후 성공 로그의 requestId/안전 필드 검증 추가.
- Application/module: Object 첫 순서/마지막 다음 순서, List 마지막 순서와 잠금→조회→생성 호출 순서 검증 추가.
- PostgreSQL: 기존 순서 API의 소속 분리·실제 GET 재조회·no-op·rollback·동시 재정렬·동시 생성·migration 검증 유지.
- 전체 76 suites / 802 tests 통과: HTTP 69개와 실제 격리 PostgreSQL 통합 14개 포함. typecheck/lint 통과. 변경 운영 TS 32개 파일을 TypeScript AST로 점검해 application/domain 금지 import, cross-module persistence 직접 참조, application 직접 SQL/transaction 호출을 발견하지 못했다.
- build·Prisma validate도 통과했다. 기존 복합 FK SetNull 경고 4개는 SQL의 컬럼 지정 SET NULL 보존과 관련된 기존 경고다. schema가 바뀌지 않아 Prisma client 재생성과 실DB migration 재적용은 하지 않았다.
- 결과 파일은 로컬 `TEMP/sidebar-reorder-tools/backend-rereview.json`, `boundary-rereview.json`에 보관한다. 테스트 전용 PostgreSQL은 검증 후 정상 종료했다. 배포·환경 파일 변경은 수행하지 않았으며, 커밋은 이후 사용자의 명시적 요청에 따라 진행한다.
