# 검증·G99 Backend 규칙 검토

- 상태: 완료
- 일자: 2026-10-26
- 기준: [Backend 체크리스트](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md), [API ①](../COMMON/API-SPEC/OBJECT_VIEW_LIST_API.md), [API ②](../COMMON/API-SPEC/LIST_VIEW_LIST_API.md), [작업 로그](../../../../TODO_LOG/2026-10-26/OBJECT_LIST_VIEW_LIST_API/WORK_LOG.md)

## 1. 실제 실행 결과

Node 24.21.0 / pnpm 8.14.1에서 실행했다. 기존 임시 embedded-postgres 설치를 재사용하고 새 PostgreSQL 17.10 클러스터를 작업 전용으로 실행했다. 환경 파일·Docker·업무 DB·사용자 서버·저장소 의존성/lockfile은 변경하지 않았다.

| 검증 | 명령·근거 | 결과 |
| --- | --- | --- |
| 타입 | fnm exec --using=24.21.0 pnpm -C BE typecheck | 통과 |
| 린트 | fnm exec --using=24.21.0 pnpm -C BE lint | 통과 |
| 빌드 | fnm exec --using=24.21.0 pnpm -C BE build | 통과 |
| UseCase·HTTP/DI | fnm exec --using=24.21.0 pnpm -C BE test -- --runInBand list-workspace-object-views.use-case.spec.ts list-workspace-list-views.use-case.spec.ts user-workspace-view-lists.controller.spec.ts | 3 suites / 72 tests 통과 |
| Prisma validate/generate·전체 Jest/PG | fnm exec --using=24.21.0 node /tmp/onehandsales-view-lists.88d01oaw/verify.mjs | 58 suites / 341 tests, 실패·skip 0 |
| 신규 검증 | UseCase 2·HTTP 1·Repository 2 suites | 총 5 suites / 74 tests 통과 |
| 실행 서버 smoke | localhost:3000의 두 새 경로에 인증 없이 GET | 각각 401 |
| 계층·주석 | TypeScript AST 정적 검토 | 생산 코드 12개·선언 49개 통과 |

Prisma 검증과 Jest는 BE에서 node node_modules/prisma/build/index.js validate/generate 및 node node_modules/jest/bin/jest.js --runInBand --json으로 실행했다. 결과는 harness 디렉터리의 jest-results.json·summary.json에 남겼다.

테스트 자식 프로세스에만 DATABASE_URL/DIRECT_URL/TEST_DATABASE_URL을 전달했다. 현재 schema의 from-empty SQL을 적용하고 기존 List 컬럼 지정 SET NULL FK 4개·지연 FK 1개·Attribute 소속 CHECK·Record/Object 참조 쌍 CHECK를 보존했다. fixture rollback 후 Workspace/View 0건과 작업 소유 PostgreSQL 프로세스 0개를 확인했다.

최초 macOS 시스템 임시 경로의 클러스터 준비는 undefined 출력과 결과 파일 부재로 중단됐다. 이 시도는 검증 성공으로 집계하지 않았다. 짧은 /tmp의 새로운 경로에서 최종 검증을 통과했다. 최초 원인은 확정하지 않았다. 기존 Prisma List SetNull 경고 4개는 이번에도 유지했다.

## 2. 규칙별 검토

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| 사용자 범위·Controller 책임 | 준수 | 두 /api GET·AuthGuard·UUID/DTO 검증 후 전용 UseCase 호출 |
| API 분리·순수 타입 | 준수 | 각 Controller/UseCase/Query Port/Repository, 순수 View 타입·응답 계약 |
| 모듈 경계 | 준수 | Workspace 공개 membership과 Object/List 공개 Summary Port 재사용, 타 persistence 직접 import 없음 |
| 멤버십·조회 순서 | 준수 | 서버 사용자 ID로 1회 확인 후 대상→목록. 비멤버·없는 대상에서 후속 조회 중단 검증 |
| 대상·Workspace 격리 | 준수 | Summary와 View에 각각 workspaceId+대상 ID. 실제 PG의 다른 대상/Workspace·종류 제외 검증 |
| 정렬·전체 목록 | 준수 | sortOrder/createdAt/id 정렬·동률·전체 항목 DB 검증, 페이지네이션/숨은 제한 없음 |
| 선택 표시 | 준수 | 선택 중간 항목 순서 보존, 생략·불일치 미선택, UUID 대소문자 정규화, DB 필터로 미사용 |
| 정상 빈 상태·오류 | 준수 | 빈 목록 200과 대상 404 구분. DB 실패는 빈 목록으로 바꾸지 않고 안전한 500 |
| DTO·인증 계약 | 준수 | 필수 path·선택 query, 추가/중복/배열/빈/null 문자열 400, 인증 401/403, 실제 HTTP 검증 |
| 최소 select·소속 정책 | 준수 | id/name/icon/type만 조회, 11종 타입·nullable icon, 두 소속 View를 임의 XOR로 제외하지 않음 |
| transaction·idempotency/outbox | 해당 없음 | 순수 조회, 동일시점 snapshot·mutation·외부 부수 효과 없음. 계약에 명시 |
| 로그·시간 | 준수 | 신규 로그·시간 응답 없음. 기존 request id/안전한 오류 사용, 민감 원문 기록 없음 |
| 주석·이름 | 준수 | 역할/API/기능·주요 번호 주석, 책임이 드러나는 이름. 정적 검토 통과 |
| 실제 DI·회귀 | 준수 | Auth adapter/Prisma delegate만 대체한 실제 Module HTTP 검증, 기존 헤더·즐겨찾기 포함 전체 회귀 통과 |
| 범위 보존 | 준수 | FE·schema/migration/seed·환경·package/lockfile·사용자 프로세스·커밋 변경 없음 |
| 문서·계약 선행 | 준수 | 두 API 계약 confirmed 후 구현, 완료 상태·DB 현황·로그·완료 보관 참조 정리 |

## 3. 검토 결과와 한계

수정이 필요한 기능 결함이나 규칙 위반은 발견하지 못했다. 문서의 404 메시지 대소문자를 실제 오류에 맞춰 수정하고 응답 View 타입 11개를 명시했다. 최종 문서 8개·상대 링크 45개·JSON 예시 2개·경로/응답/오류 계약·변경 범위와 git diff --check를 확인했다. 필수 구현 검증의 미확인 항목은 없다. 실제 Supabase RLS/배포 Provider와 FE 연결은 이번 실행 범위가 아니다. 이 문서는 Backend 완료 이력이며 후속 FE·저장·생성 작업은 새 활성 계획에서 진행한다.
