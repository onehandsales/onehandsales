# 관리 항목 첫 TABLE 생성

- [x] 공개 Attribute/View 생성 port 및 소유 module adapter 추가
- [x] Object 생성 use case가 TransactionManager로 네 모델을 원자적으로 생성
- [x] 기존 POST 응답에 viewDefinitionId 추가 및 requestId 전달
- [x] validation/권한/중복/하위 실패/commit 실패/HTTP 계약 테스트
- [x] Backend typecheck, lint, 단위/계약 test, build, Prisma validate

Transaction: 필요. ObjectDefinition, AttributeDefinition, ViewDefinition,
ViewAttributeSettingDefinition 전부 같은 transaction context를 사용하며 어느 단계 실패든 모두 rollback한다.
Orchestration owner: object-definition application use case.
외부 Provider 없음. 성공 로그는 commit 뒤 기록하며 DB 이력 없음.
중복은 workspaceId+apiSlug unique로 409 처리한다. 별도 idempotency key/outbox 불필요.
검증: Node 24.21.0에서 59 suites / 564 tests 통과. 새 생성 관련 23 tests 포함.
전체 테스트 최초 실행은 기존 테스트 DB의 schema 미준비로 DB 통합 12 suites / 32 tests 실패.
`TEST_DATABASE_URL='' pnpm -C BE test -- --runInBand`로 해당 통합 검증을 제외한 나머지 테스트를 검증했다.
실제 DB rollback 성공 여부는 이번 검증에 포함하지 않으며, schema/migration/기존 서버 재시작은 수행하지 않았다.
Prisma validate는 통과했고 기존 복합 FK SetNull 경고 4개는 그대로다.
