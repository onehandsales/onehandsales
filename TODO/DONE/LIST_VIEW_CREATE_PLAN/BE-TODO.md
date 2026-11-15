# Backend

- [x] 생성 DTO/controller와 오류 계약
- [x] 멤버십·Object/Attribute 소속 확인, List/View transaction orchestration
- [x] Attribute/Status와 View 생성을 각 소유 모듈 공개 port로 연결
- [x] 단위·HTTP·실제 module wiring 검증, typecheck/lint/test/build/prisma validate

모든 생성 row를 하나의 TransactionContext에 묶고 실패 시 전부 rollback한다.
외부 provider/outbox 없음, workspaceId+apiSlug unique 충돌409, 로그 원문 제외.

## 검증 기록 (2026-11-07, Node 24.21.0)

- typecheck/lint/build/prisma validate 통과. 기존 복합 FK SET NULL 경고 4개 유지.
- 최종 전체 Jest 재검증: 61 suites/623 tests 통과, DB 테스트 12 suites/32 tests 제외.
- 신규 검증 59개: 실제 module wiring/transaction adapter 32개, HTTP/DTO/filter 23개,
  빈 TABLE/LIST 및 RECORD/LIST_ENTRY 상태 기반 빈 보드 조회 4개.
- module wiring 검증은 DB client를 mock한다. 여섯 저장 단계의 오류가 같은 transaction을
  reject하고 성공 이벤트를 남기지 않는지 확인했다. 실제 DB rollback 검증과 구분한다.
- `TEST_DATABASE_URL=''`로 외부 DB 테스트를 명시적으로 제외한다. 기존 DB 통합 테스트
  12 suites/32 tests는 실행하지 않았다. DB 생성·migration·seed·Docker는 실행하지 않았다.
- 중간 전체 실행에서 기존 즐겨찾기 HTTP 테스트 한 건이 예상500 대신401을 반환했다.
  해당 파일의 39개 테스트는 코드 변경 없이 단독 재실행에서 통과했고 최종 전체 재실행도 통과했다.

## 규칙·비즈니스 로직 재검토

추가 필드 검증의 예약 키 누락과 transaction 전 실패 로그 누락을 보완했다.
기존 정상 요청 계약과 List/View/단계 저장 로직을 유지한다.
소속 검증과 경계 사례13개를 추가했으며 상세 근거는 [재검토 기록](BE-REVIEW.md)을 따른다.
재검토 후 전체61 suites/636 tests, typecheck/lint/build/prisma validate 통과. DB 테스트32개 미실행.

## 생성 아이콘 변경 (2026-11-08)

- 생성 application에서 `icon`이 생략된 경우에만 첫 `viewType`에 맞는 기본 아이콘을 결정한다.
- TABLE=`lucide:table-2`, LIST=`lucide:list`, KANBAN=`lucide:columns-3`.
- 기존 `ListDefinition.icon` 쓰기에 포함하며 List/View transaction 범위를 유지한다.
- 명시적 아이콘/이모지는 보존하고 null/빈 문자열은 기존처럼 null로 저장한다.
- endpoint/응답/schema 변경과 기존 데이터 보정은 없다. 아이콘 편집 API는 후속 범위다.
- 검증: 전체 Jest 61 suites/640 tests 통과, 외부 DB 테스트 12 suites/32 tests 제외.
  typecheck/lint/build/prisma validate 통과. 기존 복합 FK SET NULL 경고 4개 유지.
- 실제 module wiring에서 세 보기의 기본 아이콘과 명시적 아이콘/이모지/null/빈 문자열
  저장을 확인했다. DB client는 mock이며 실제 Supabase 쓰기나 migration은 실행하지 않았다.
