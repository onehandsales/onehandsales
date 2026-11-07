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
