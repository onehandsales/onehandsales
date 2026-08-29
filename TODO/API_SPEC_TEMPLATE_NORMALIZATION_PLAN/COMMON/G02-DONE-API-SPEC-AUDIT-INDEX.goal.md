# G02 완료 보관 API-SPEC 감사 인덱스 작성

상태: Ready after G01
성격: 문서 감사
우선순위: P2

## 1. 목적

`TODO/DONE` 아래 보관된 API-SPEC 문서를 직접 대량 수정하기 전에 current production API 관련성, 템플릿 누락 정도, 제외 여부를 감사 인덱스로 분류한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\README.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\API_SPEC_AUDIT_RESULT.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`
- `AGENT\PM_AGENT\DECISIONS\018_todo_common_contract_structure.md`
- `AGENT\PM_AGENT\DECISIONS\020_todo_execution_plan_standard.md`
- `AGENT\PM_AGENT\DECISIONS\022_goal_completion_review_todo_log.md`

## 3. 포함 범위

- `TODO/DONE/**/COMMON/API-SPEC/*.md` 목록 전수 확인
- README/index 문서와 no-api 문서 제외 분류
- current production API 관련 문서 우선순위 분류
- 필요 시 후속 goal 분리

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- 완료 보관 API-SPEC 본문 대량 수정

## 5. 실행 지시

1. 아래 명령으로 보관 API-SPEC 목록을 다시 확인한다.

```powershell
cd D:\workspace_repository\onehandsales
rg --files TODO\DONE | rg "COMMON[\\/]+API-SPEC[\\/]+.*\.md$"
```

2. 문서를 아래 상태 중 하나로 분류한다.
   - `normalize-now-candidate`: 현재 production API와 직접 연결되고 템플릿 누락이 큰 문서
   - `index-only`: README/index 문서
   - `no-api-contract`: API 변경 없음 또는 신규 API 없음 문서
   - `archive-reference-only`: 과거 구현 이력으로만 참고할 문서
   - `needs-manual-review`: 자동 검색만으로 판단할 수 없는 문서
3. 분류 결과는 `COMMON/API_SPEC_AUDIT_RESULT.md` 또는 별도 감사 인덱스 문서에 기록한다.
4. 대량 보강이 필요하면 도메인별 follow-up goal을 추가한다.
5. 이번 Goal에서는 완료 보관 API-SPEC 본문을 직접 고치지 않는다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg --files TODO\DONE | rg "COMMON[\\/]+API-SPEC[\\/]+.*\.md$"
git diff -- TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN
git diff -- BE FE
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G02_DONE_API_SPEC_AUDIT_INDEX\WORK_LOG.md
```

## 8. 완료 기준

- 보관 API-SPEC 문서가 수정 대상, 제외 대상, 수동 검토 대상으로 분류되어 있다.
- 완료 보관 API-SPEC 본문 대량 수정이 없다.
- BE/FE 코드 diff가 없다.
- 결과와 남은 리스크가 TODO_LOG에 기록되어 있다.
