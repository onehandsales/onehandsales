# View 헤더 Backend 검증 계획

기준: [API 정본](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md), [G01](G01-BE-VIEW-HEADER-DETAIL.goal.md), [최종 규칙 검토](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md).

현재는 계획이며 실제 API/DB 검증을 실행하지 않았다.

## 1. 필수 시나리오

| 계층 | 확인할 내용 |
| --- | --- |
| UseCase | 인증 사용자로 getWorkspaceMemberAccess 호출, 서버 멤버 ID 전달, actorId=null 허용, 비멤버 시 다음 조회 차단 |
| UseCase | View null → 404, Object/List 각각의 성공·null 참조·다른 Workspace 조회 실패, 두 소속 모두 null/모두 존재, nullable icon 보존 |
| UseCase | isFavorite=false도 200, View 조회 결과의 부모 ID만 사용, Object singularName → name 매핑, 응답에 불필요한 필드 미포함 |
| HTTP | 실제 AuthGuard/전역 Filter를 사용한 정상 응답, 인증 누락·실패 401, 기존 InactiveUser 403, Workspace/View UUID 각각 400, 새 404 코드 4개 |
| HTTP | 인증 사용자와 두 path만 UseCase에 전달. client userId/workspaceMemberId/부모 ID 입력이 소유권에 영향을 주지 않음 |
| View Repository 통합 | View ID + Workspace 경계, 다른 멤버/다른 Workspace Favorite 제외, 본인 중복 Favorite가 있어도 true, Favorite 없음 false, 최소 select·nullable 결과 |
| Object/List Repository 통합 | 올바른 ID라도 다른 Workspace 요청에는 null, 저장 필드와 요약 매핑, nullable icon |
| Module/아키텍처 | 세 모듈의 provider/export 및 AuthGuard 의존성 해석 가능, 다른 모듈 persistence import 없음, application/domain Prisma·Supabase·Express·ConfigService·구체 logger 의존 없음 |
| 회귀 | 기존 즐겨찾기·Object/List 사이드바, Attribute 단건/목록, Record 조회·생성 관련 테스트와 공개 Port 계약 유지 |

실제 DB 테스트는 명시된 `TEST_DATABASE_URL`만 사용한다. fixture는 테스트 DB의 transaction 안에서 만들고 성공해도 rollback하며 데이터 잔존을 확인한다. 테스트 DB 미지정은 명시적 skip, 지정됐지만 연결/스키마가 잘못된 경우는 실패로 남긴다. 연결 실패를 catch한 뒤 조용히 return하지 않는다. 실제 업무 DB나 기본 DATABASE_URL로 대체하지 않는다.

직전 즐겨찾기 작업에서는 로컬 테스트 DB 미가동이 있었다. 현재 상태는 구현 시 다시 확인하고, 과거 결과를 새 API의 실제 DB 검증 성공으로 재사용하지 않는다. 기존 개발 서버를 임의로 종료하거나 환경 파일을 수정하지 않는다.

## 2. 구현 후 명령

저장소의 Node 24 / pnpm 8.14.1 기준으로 BE에서 실행한다.

```sh
pnpm -C BE prisma:validate
pnpm -C BE prisma:generate
pnpm -C BE typecheck
pnpm -C BE lint
pnpm -C BE test -- --runInBand
pnpm -C BE build
git diff --check
```

필요하면 명시한 테스트 DB로 신규 Repository 통합 suite를 별도 실행한다. 테스트 DB 비활성화 실행은 단위·HTTP 회귀 결과로만 기록하며 DB 통합 성공을 대신하지 않는다. Prisma generate는 client 생성이며 migrate/seed 명령은 실행하지 않는다. 파일 잠금 등 실패는 사용자 프로세스를 임의 종료하지 않고 원인과 다음 조치를 기록한다.

이번 문서 작성 단계에는 실행 코드 변경이 없으므로 위 API 검증을 실행하거나 통과로 표시하지 않는다. 문서 자체는 경로·계약 항목·스키마·기존 구현·상대 링크·공백을 확인한다.

## 3. 검증 결과 기록

| 검증 | 실제 명령 | 결과·통과/실패/skip 수 | 실패 원인·수정·재실행 근거 |
| --- | --- | --- | --- |
| Prisma validate/generate | 구현 후 기록 | 미실행 | 해당 없음 |
| typecheck/lint/build | 구현 후 기록 | 미실행 | 해당 없음 |
| UseCase/HTTP/회귀 | 구현 후 기록 | 미실행 | 해당 없음 |
| 실제 DB Repository 통합 | 구현 후 기록 | 미실행 | 해당 없음 |
| DI/모듈 경계 정적 검토 | 구현 후 기록 | 미실행 | 해당 없음 |
| diff/문서 링크 | 구현 후 기록 | 미실행 | 문서 작성 시 검사와 실제 구현 후 검증을 구분 |

이 결과가 [G99](G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)의 검토 근거다. DB 통합 검증이 미확인이면 원인·환경·다음 조치를 기록하고 API 계약은 confirmed로 유지한다.
