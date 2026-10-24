# 업무 목록 API 기획 검토

- 일자: 2026-10-24
- 판정: 통과 — 구현 착수 가능
- 대상: 계획 README, API 계약, BE-TODO, 기존 관리 항목 API, Prisma schema
- 기준: PM 기획 검토 체크리스트와 Backend 엔지니어링 리뷰 체크리스트

## 1. 요청과 구조 검토

사용자가 합의한 Workspace별 List 조회·생성순·Backend 전용 범위를 유지한다. 사이드바 List 목록과 개별 ListEntry/View 조회를 구분한다.

Controller는 UseCase만 호출한다. application의 멤버십 확인은 Workspace 공개 Port를 사용하며 Prisma 접근은 새 모듈의 infrastructure에 제한한다. 요청·응답·빈 목록·오류·정렬·페이지네이션 없음이 계약에 명시됐다.

읽기 전용으로 transaction/idempotency/outbox가 필요 없는 이유와 기존 request id 추적·민감정보 로그 제외를 명시했다. 기존 DB를 사용해 List 참여/중복 등 미정 정책 결정이 필요 없다. Frontend 작업과 별도인 단일 구현 작업으로 진행한다.

## 2. 충돌 처리

일부 오래된 Backend overview/초안의 CRM 미구현 설명보다 실제 Object/Workspace 코드와 2026-10-17 DB 문서를 구현 사실 기준으로 삼는다. 계층·module boundary 규칙은 유지한다.

작업 로그는 최신 결정 022_goal_completion_review_todo_log.md에 따라 시작부터 기록한다. 사전 범위 합의와 현재 구현 요청에 따라 추가 결정 질문은 없다.

## 3. 구현 완료 검토

- 판정: 통과
- API 계약과 실제 path·응답·오류·정렬·Workspace 접근 조건이 일치한다.
- 새 모듈에 계층·Port 경계가 유지되며, 기존 Workspace/Auth 모듈의 내부 Repository를 참조하지 않는다.
- 실제 AuthGuard와 전역 오류 변환을 사용하는 HTTP 테스트로 인증·UUID·404 응답을 확인했다.
- 전체 45개 suite·221개 테스트와 typecheck/lint/build/Prisma validate가 통과했다.
- Frontend, schema/migration과 의존성 파일 변경은 없다. 최초 구현 완료 당시에는 커밋하지 않았다.
- 별도 신규 이슈는 없고 기존 Prisma SetNull 경고 4건이 유지된다.

## 4. 사용자 요청에 따른 완료 범위 재검토

- 요청 일자: 2026-10-24
- 판정: 통과. 계획된 Backend 범위의 누락이나 수정이 필요한 오류를 발견하지 못했다.
- 재검토 방법: 계획 4단계와 실제 신규 파일·기존 코드 변경·검증 기록을 대조했다. 기능 추가나 API 계약 변경은 하지 않았다.

| 계획 완료 기준 | 확인 근거 | 판정 |
| --- | --- | --- |
| API 계약·기획 검토 확정 | 공통 계약의 path/request/response/error/DB/transaction/observability와 사전 확정 기록 | 완료 |
| 모듈 구현·AppModule 등록 | ListDefinitionModule과 4계층 파일, AppModule imports, Auth/Workspace의 공개 Port export | 완료 |
| 정상·빈 목록·인증·UUID·접근 차단 | UseCase 3개·Controller 6개 테스트, 실제 AuthGuard와 전역 오류 변환 사용 | 완료 |
| 검증·범위 검토 결과 기록 | 동일 구현의 typecheck/lint/build/Prisma validate 및 전체 45개 suite·221개 테스트 통과 기록 | 완료 |

Repository의 `workspaceId` 조건·`createdAt ASC`, `id ASC` 정렬·`id/icon/name` select를 기존 관리 항목 조회와 비교했다. Workspace 접근 불가 시 목록 조회를 실행하지 않고 404로 변환하는 경계를 확인했다. Frontend/DB schema/migration/의존성 변경이 없음을 Git 변경 목록으로 확인했다.

검증 한계: 이 API의 실제 DB 응답에 대한 별도 smoke 호출은 하지 않았다. Repository 조회 조건은 코드 검토했고 HTTP 테스트는 인증 해석과 UseCase 결과를 대체한다. 사전 계획의 완료 기준에는 실제 DB smoke가 포함되지 않았으며 미실행 사실을 작업 로그에 유지한다.

사용자가 Git 커밋을 명시적으로 요청했다. 재검토를 마친 이번 Backend API·계약·검토·작업 로그 변경만 커밋 대상으로 한다.
