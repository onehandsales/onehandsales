# Service QA Common

## 1. 목적

이 폴더는 실제 QA 실행자가 공통으로 보는 QA 범위, 실행 순서, 결과 기록, 이슈 기록 기준을 관리한다.

## 2. 문서 목록

- `SCOPE.md`: QA 포함/제외 범위, severity, 상태 정의
- `SOLO-QA-RUNBOOK.md`: 1인 실사용 QA와 즉시 보수 기준
- `GOAL-WORK-ORDER.md`: QA 실행 순서와 완료 기준
- `PLAYWRIGHT-RUNBOOK.md`: 기존 Playwright 실행 방법과 해석 기준
- `QA-RESULTS.md`: 실제 실행 결과 기록지
- `ISSUE-LOG.md`: 발견 이슈 기록지
- `../SERVICE-QA-CHECKLIST.csv`: 혼자 QA할 때 Excel/Sheets에서 바로 채우는 통합 체크리스트
- `../FE-TODO/PAGE-API-QA-MATRIX.md`: FE route 기준 페이지별 API와 QA 항목

## 3. 공통 판단 기준

- QA는 문서 확인이 아니라 실제 동작 확인이다.
- 1인 QA에서는 기능 QA와 UX/UI QA를 같은 사용 흐름에서 함께 발견한다.
- 자동화 QA와 수동 QA 결과는 서로 대체하지 않는다.
- mock 기반 Playwright 통과는 실제 BE/DB 통합 통과를 의미하지 않는다.
- 실제 BE 통합 QA에서 실패한 항목은 FE 화면이 정상이어도 서비스 결함으로 기록한다.
- 보안/권한/개인정보 노출은 재현 범위가 작아도 S1 이상으로 우선 검토한다.
- 작고 명확한 문제는 즉시 수정할 수 있지만, 큰 구조 변경과 새 기능은 `ISSUE-LOG.md`에 기록한 뒤 묶어서 처리한다.

## 4. 기록 규칙

모든 실행 결과는 다음 중 하나로 기록한다.

- `PASS`: 기대한 대로 동작함
- `FAIL`: 기대 결과와 다르게 동작함
- `BLOCKED`: 환경, 계정, provider, DB 상태 때문에 확인 불가
- `N/A`: 현재 제품 범위 또는 이번 QA 범위가 아님
- `NEEDS CHECK`: 기획/계약/환경 확인이 더 필요함

버그는 `COMMON/ISSUE-LOG.md`에 기록하고, 명령 실행 결과는 `COMMON/QA-RESULTS.md`에 기록한다.

기능 판단은 다음 값으로 함께 기록한다.

- `KEEP`: 유지
- `FIX`: 깨진 기능 수정
- `IMPROVE`: 유지하되 개선
- `REMOVE`: 제거
- `HIDE`: 지금은 숨김
- `DEFER`: 나중으로 미룸
- `RETHINK`: 방향 재검토
