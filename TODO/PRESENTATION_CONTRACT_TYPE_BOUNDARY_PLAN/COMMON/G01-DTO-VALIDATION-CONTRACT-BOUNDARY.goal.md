# G01 DTO validation contract boundary

상태: Completed
완료일: 2026-08-29
TODO_LOG: `TODO_LOG\2026-08-29\PRESENTATION_CONTRACT_TYPE_BOUNDARY\G01_DTO_VALIDATION_CONTRACT_BOUNDARY\WORK_LOG.md`
성격: Backend 코드 수정
우선순위: P3

## 1. 목적

DTO validation에 사용되는 enum/const/type이 repository port 파일에 묶여 있는 패턴을 정리한다. HTTP 요청 계약 또는 application query/input 계약에 가까운 값은 repository 파일 밖으로 이동해 presentation이 `application/ports/*repository*`를 import하지 않도록 한다.

## 2. 선행 문서

- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\GOAL-WORK-ORDER.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`

## 3. 포함 범위

- `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`의 DTO validation 경계 대상 파일
- sort/filter/status enum/const/type의 non-repository contract 분리
- application service, repository port, repository 구현체 import 경로 보정
- DTO validation decorator의 허용 값 유지
- 관련 단위 테스트 보정

## 4. 제외 범위

- API request field 이름/값 의미 변경
- response mapper projection record 분리
- Prisma schema/migration 변경
- FE 코드 변경

## 5. 실행 지시

1. 감사 문서의 DTO validation 경계 대상 11개 파일을 최신 코드 기준으로 재확인한다.
2. 값이 application input과 repository input 모두에서 쓰이면 기존 패턴을 참고해 non-repository contract 파일로 이동한다.
3. HTTP validation에만 쓰이는 값이면 presentation contract 또는 DTO local const로 유지하되 repository port import를 제거한다.
4. repository port는 영속성 계약과 repository input/output에 집중하도록 정리한다.
5. API 계약 의미가 달라질 가능성이 있으면 해당 변경은 중단하고 TODO_LOG에 별도 후속으로 남긴다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\http\\dto\\"
```

## 7. 완료 기준

- DTO 파일의 repository port import가 제거되었거나 명확한 예외 사유가 TODO_LOG에 기록되어 있다.
- API request validation 값이 기존과 동일하다.
- Backend typecheck/lint/test가 통과한다.
- 수정한 class/interface/type/helper에 한글 주석 규칙이 반영되어 있다.

## 8. 완료 결과

- DTO validation 경계 대상 11 files의 repository port import를 제거했다.
- sort/filter/status enum/const/type은 `application/ports/*.types.ts` 계열 non-repository contract 파일로 분리했다.
- API request field 이름과 허용 값은 변경하지 않았다.
- 2026-08-29 검증 결과 `pnpm run typecheck`, `pnpm run lint`, `pnpm test -- --runInBand`가 통과했다.
- `rg -n 'application/ports/.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg '/presentation/http/dto/'` 결과는 출력 없음이다.

## 9. 재검토 결과

2026-08-29 추가 재검토에서 G01 완료 기준 누락은 발견하지 못했다.

- DTO validation 대상 11 files는 import 경로만 변경됐고 API request field와 validation 허용 값은 유지됐다.
- `*repository.ts` 파일의 G01 이동 대상 enum/const/type export 잔존 검색 결과는 출력 없음이다.
- presentation DTO의 repository port import 검색 결과는 출력 없음이다.
- presentation 직접 repository token/interface 사용 검색 결과는 출력 없음이다.
- 전체 presentation repository port import 잔여 9건은 모두 G02 response mapper 대상이다.
