# G02 response mapper read model boundary

상태: Completed
완료일: 2026-08-30
TODO_LOG: `TODO_LOG\2026-08-30\PRESENTATION_CONTRACT_TYPE_BOUNDARY\G02_RESPONSE_MAPPER_READ_MODEL_BOUNDARY\WORK_LOG.md`
성격: Backend 코드 수정
우선순위: P3

## 1. 목적

response mapper가 repository projection record를 입력 타입으로 직접 받는 패턴을 application service 출력/read model 계약으로 분리한다. presentation은 repository port 파일이 아니라 application 계층의 non-repository output/read model contract를 참조해야 한다.

## 2. 선행 문서

- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`
- `TODO\PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN\COMMON\G01-DTO-VALIDATION-CONTRACT-BOUNDARY.goal.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\ARCHITECTURE\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\BACKEND.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\COMMENT_AND_LOGGING.md`

## 3. 포함 범위

- `COMMON/PRESENTATION_REPOSITORY_IMPORT_AUDIT.md`의 response mapper projection 경계 대상 파일
- account-request response mapper 입력 타입 정리
- admin-operation response mapper 입력/read model 타입 정리
- application service 반환 타입과 repository port projection 타입 소유권 분리
- 관련 테스트 보정

## 4. 제외 범위

- API response field 이름/타입/nullable 의미 변경
- repository 구현체 DB 조회 동작 변경
- DTO validation contract 분리
- FE 코드 변경

## 5. 실행 지시

1. G01 완료 후 남은 presentation repository port import를 재확인한다.
2. mapper가 받는 값이 application service output이면 application non-repository contract 파일로 이동한다.
3. repository 구현체에서만 필요한 persistence projection은 repository port에 남기되 presentation이 직접 보지 않게 한다.
4. 단순 type alias로 response type을 repository record에 재노출하는 패턴은 명시적 response interface로 바꾸는 것을 우선 검토한다.
5. 응답 shape가 달라질 가능성이 있으면 변경을 중단하고 API-SPEC 갱신 후속으로 분리한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd test -- --runInBand
rg -n "application/ports/.+repository|application\\ports\\.+repository" src\modules -g "*.ts" -g "!*.spec.ts" | rg "\\presentation\\"
```

## 7. 완료 기준

- response mapper의 repository port projection type import가 제거되었거나 예외 사유가 TODO_LOG에 기록되어 있다.
- repository token/interface 직접 사용이 계속 0건이다.
- API response shape가 변경되지 않았다.
- Backend typecheck/lint/test가 통과한다.
- 수정한 class/interface/type/helper에 한글 주석 규칙이 반영되어 있다.

## 8. 완료 결과

- response mapper 경계 대상 9 files의 `application/ports/*repository*` import를 제거했다.
- mapper 입력 타입은 `application/ports/*-read-model.types.ts` 계열 non-repository contract를 참조하도록 분리했다.
- account-request와 admin-operation application service 공개 반환 타입도 read-model contract를 참조하도록 보정했다.
- repository port 파일은 token/interface/input/audit 계약을 유지하고, output/page/detail/read-model 타입은 non-repository contract 파일에서 소유하도록 정리했다.
- `AdminOperationCheckItemsResponse`, `AdminAnalytics*Response`, `AdminTrashSummaryResponse`의 repository record 단순 alias 패턴은 명시적 response interface로 보정했다.
- API response field 이름, 타입, nullable 의미, DB 조회 로직, FE 코드는 변경하지 않았다.
- 2026-08-30 검증 결과 `pnpm run typecheck`, `pnpm run lint`, `pnpm test -- --runInBand`가 통과했다.
- `rg -n 'application/ports/.+repository|application\\ports\\.+repository' src/modules -g '*.ts' -g '!*.spec.ts' | rg 'presentation'` 결과는 출력 없음이다.
- `rg -n '@Inject\(|REPOSITORY|Repository' src/modules/*/presentation -g '*.ts' -g '!*.spec.ts'` 결과는 출력 없음이다.

## 9. 추가 재검토 결과

2026-08-30 추가 재검토에서 G02 완료 기준 누락은 발견하지 못했다.

- presentation 전체의 `application/ports/*repository*` import 검색 결과는 출력 없음이다.
- presentation 직접 repository token/interface 사용 검색 결과는 출력 없음이다.
- response mapper의 repository record 단순 alias response 패턴 검색 결과는 출력 없음이다.
- application service 공개 반환 타입은 repository record/page 타입이 아니라 `*-read-model.types.ts` 계열 contract를 참조한다.
- spec import 중 불필요하게 줄바꿈된 repository type import 형태만 `import type { ... }`로 정리했고 동작 변경은 없다.
- 추가 재검토 후 `pnpm run typecheck`, `pnpm run lint`, `pnpm test -- --runInBand`가 모두 통과했다.
