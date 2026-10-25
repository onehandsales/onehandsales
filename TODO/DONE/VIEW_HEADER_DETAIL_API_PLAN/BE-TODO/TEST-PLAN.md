# View 헤더 Backend 검증 계획·결과

기준: [API 정본](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md), [G01](G01-BE-VIEW-HEADER-DETAIL.goal.md), [G99](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md). 실행일: 2026-10-25.

## 1. 검증 범위

| 계층 | 확인 내용 | 결과 |
| --- | --- | --- |
| UseCase | 서버 멤버 ID·Actor 없는 읽기, Object/List 분기, 없는 대상 차단, 정상 View 없음, false Favorite, DB 오류 전파 | 통과 |
| HTTP | 실제 AuthGuard·ValidationPipe·Filter, OBJECT/LIST·빈 View 200, 인증 401/403, UUID·Query 400, 404 3종·안전한 500 | 통과 |
| Query 입력 | 사전 View ID 불필요, targetType/targetId 필수, 배열·중복·추가 멤버/View query 거부 | 통과 |
| Module | 실제 View/Object/List/Workspace 모듈과 공개 Port/provider/export 조립, 외부 인증과 Prisma delegate만 테스트 대체 | 통과 |
| Object/List Repository | 실제 PostgreSQL에서 대상+Workspace 격리, 최소 select·nullable icon, 없는 ID·다른 Workspace null | 통과 |
| View Repository | sortOrder/createdAt/id 동률, Object/List 대상 분리, View 없음, 다른 Workspace 제외, 개인 Favorite/중복 격리 | 통과 |
| 기존 제약 보존 | View 두 소속을 임의 XOR로 제외하지 않음, 빈 대상 조회 시 View 생성 없음 | 통과 |
| 회귀 | 기존 Auth/Workspace/Object/List/Attribute/Record/지원·문의·보안·Sidebar 전체 | 통과 |
| 정리 | fixture transaction rollback 후 신규 DB 테스트의 데이터 0건, 임시 클러스터 종료 | 통과 |

## 2. 실제 환경과 명령

Node v24.21.0, pnpm 8.14.1, 별도 임시 PostgreSQL 17.10을 사용했다. 기존 TEST_DATABASE_URL은 없었다. 임시 경로에 embedded-postgres@17.10.0-beta.17을 설치하고 loopback의 비어 있는 포트에 작업 전용 클러스터를 실행했다. 저장소 의존성·lockfile·환경 파일·업무 DB·사용자 서버는 변경하지 않았다.

테스트 자식 프로세스에만 DATABASE_URL/DIRECT_URL/TEST_DATABASE_URL을 전달했다. 임시 DB는 Prisma 현재 스키마의 from-empty SQL로 만들고, 기존 migration SQL의 컬럼 지정 SET NULL 4개·지연 FK 1개·Attribute 소속 CHECK·Record/Object 참조 쌍 CHECK를 적용했다. 실제 업무 DB에 migrate/seed/fixture를 실행하지 않았다.

실행 harness: /tmp/onehandsales-view-header.obw5tW/verify.mjs. Node 자식 명령은 BE 디렉터리에서 다음과 동등하게 실행했다.

~~~sh
node node_modules/prisma/build/index.js validate
node node_modules/prisma/build/index.js generate
node node_modules/jest/bin/jest.js --runInBand --json --outputFile /tmp/onehandsales-view-header.obw5tW/jest-results.json
~~~

| 검증 | 실제 명령·근거 | 결과 |
| --- | --- | --- |
| 신규 UseCase·HTTP·DI | fnm exec --using=24.21.0 pnpm -C BE test -- --runInBand get-workspace-view-header.use-case.spec.ts user-workspace-view-header.controller.spec.ts | 2 suites / 32 tests 통과 |
| 타입 | fnm exec --using=24.21.0 pnpm -C BE typecheck | 통과 |
| 린트 | fnm exec --using=24.21.0 pnpm -C BE lint | 통과 |
| 빌드 | fnm exec --using=24.21.0 pnpm -C BE build | 통과 |
| Prisma validate/generate | 위 임시 DB harness의 실제 명령 | 통과. 기존 SetNull 경고 4개 유지 |
| 전체 Jest·실제 DB | fnm exec --using=24.21.0 node /tmp/onehandsales-view-header.obw5tW/verify.mjs | 53 suites / 267 tests, 실패 0·skip 0 |
| 새 범위 검증 | 신규 5 suites(UseCase·HTTP/DI·Repository 3개) | 신규 35 tests 통과 |
| 실행 서버 smoke | localhost:3000의 새 GET에 인증 없이 요청 | 401. 새 경로의 Guard 적용 확인 |
| diff·문서·경계 | 최종 검사와 G99 | 결과는 작업 로그에 기록 |

## 3. 실패와 수정

- 최초 타입 검사는 기본 shell Node 22에서 엔진 경고와 함께 통과했다. 이후 프로젝트 규칙에 맞춰 모든 공식 검증을 Node 24.21.0으로 실행했다.
- 최초 임시 PostgreSQL 초기화는 상속 로케일 문제로 실패했다. 작업 전용 initdb 옵션에 locale=C, encoding=UTF8을 지정한 새 임시 데이터 디렉터리로 실행했고 성공했다. 사용자 환경 파일이나 서버 설정은 변경하지 않았다.
- 임시 npm의 postinstall 자동 실행 제한은 패키지의 symlink 복원 스크립트를 해당 임시 패키지 디렉터리에서 직접 실행해 해결했다.
- 최종 테스트 결과: 실패·skip 없음. 신규 fixture rollback과 임시 DB의 Workspace/View 0건을 확인했다.

실제 DB 검증 결과를 mock 테스트로 대체하지 않았으며, 위 실행은 임시 PostgreSQL의 현재 스키마 검증이다. 실제 Supabase RLS/배포 환경 검증이나 Frontend 연결 완료를 뜻하지 않는다.
