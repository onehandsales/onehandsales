# G01 DTO Validation Contract Boundary 작업 로그

- 날짜: 2026-08-29
- 상태: 완료
- Goal: `TODO/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`
- 범위: presentation DTO가 `application/ports/*repository*`에서 validation enum/const/type을 import하는 의존 제거

## 1. 선행 문서 확인

- `TODO/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`
- `TODO/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- `TODO/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

## 2. 시작 상태

- `git status --short --untracked-files=all`: 출력 없음.
- G01 시작 기준 `TODO/PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`은 `Ready / Backend Follow-up / G01 Next` 상태다.
- 감사 문서 기준 DTO validation 경계 대상은 11 files다.

## 3. 작업 계획

- repository port 파일에 묶인 HTTP query/body validation 값과 타입을 non-repository contract 파일로 이동한다.
- DTO, application service, repository port, repository 구현체, 관련 테스트의 import 경로를 보정한다.
- API request field 이름과 허용 값은 변경하지 않는다.

## 4. 검증 결과

- `pnpm run typecheck`: 통과.
- `pnpm run lint`: 통과.
- `pnpm test -- --runInBand`: 통과, 103 suites / 548 tests.
- `rg -n 'application/ports/.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg '/presentation/http/dto/'`: 출력 없음.
- `rg -n '@Inject\(|REPOSITORY|Repository' src/modules/*/presentation -g '*.ts' -g '!*.spec.ts'`: 출력 없음.

## 5. 완료 메모

- DTO validation 경계 대상 11 files의 repository port import를 제거했다.
- 새 non-repository contract 파일을 추가했다.
  - `BE/src/modules/admin-operation/application/ports/admin-user-query.types.ts`
  - `BE/src/modules/business-card/application/ports/business-card-scan-log.types.ts`
  - `BE/src/modules/company/application/ports/company-query.types.ts`
  - `BE/src/modules/contact/application/ports/contact-query.types.ts`
  - `BE/src/modules/data-import/application/ports/import-template.types.ts`
  - `BE/src/modules/deal/application/ports/deal-activity.types.ts`
  - `BE/src/modules/deal/application/ports/deal-query.types.ts`
  - `BE/src/modules/meeting-note/application/ports/meeting-note.types.ts`
  - `BE/src/modules/product/application/ports/product-query.types.ts`
  - `BE/src/modules/schedule/application/ports/google-calendar.types.ts`
  - `BE/src/modules/schedule/application/ports/schedule-query.types.ts`
  - `BE/src/modules/trash/application/ports/trash.types.ts`
- DTO, application service, repository port, Prisma repository, 관련 spec import를 새 contract 경로로 보정했다.
- API request field 이름과 validation 허용 값은 변경하지 않았다.
- G01 완료 후 presentation의 repository port import 잔여는 9건이며 모두 response mapper 대상이다. 다음 실행 대상은 `G02-RESPONSE-MAPPER-READ-MODEL-BOUNDARY.goal.md`다.

## 6. 재검토 결과

2026-08-29 추가 재검토에서 누락된 G01 범위 문제는 발견하지 못했다.

- DTO 11 files의 diff는 import 경로 변경에 한정되어 request field, decorator, validation 허용 값 변경이 없다.
- DTO의 repository port import 검색: 출력 없음.
- presentation 직접 repository token/interface 사용 검색: 출력 없음.
- G01 이동 대상 enum/const/type이 `*repository.ts`에서 계속 export되는지 검색: 출력 없음.
- 전체 presentation repository port import 잔여는 9건이며 모두 G02 response mapper 대상과 일치한다.
- 재검증 `pnpm run typecheck`: 통과.
- 재검증 `pnpm run lint`: 통과.
- 재검증 `pnpm test -- --runInBand`: 통과, 103 suites / 548 tests.
- 재검증 `git diff --check`: 통과.
