# G26 Export User Web 화면

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- Export 대상 선택 UI를 구현한다.
- 파일 형식 선택 UI를 구현한다.
- 민감 데이터 포함 여부 선택 UI를 구현한다.
- 민감 데이터 포함 시 경고 dialog 확인 전에는 Export가 실행되지 않게 한다.
- Export job 상태를 표시하고 processing 상태 polling을 제공한다.
- 다운로드 버튼과 다운로드 실패 시 재시도 흐름을 제공한다.

## 제외 범위
- 복잡한 템플릿 편집
- Import 화면 변경

## 작업 로그
- G26 기준 문서와 Export API 계약을 확인했다.
- 현재 `/export` 페이지가 placeholder임을 확인했다.
- G25에서 구현한 Export API response 형태를 기준으로 FE 타입과 화면 흐름을 확장하기로 했다.
- Export 대상/파일 형식/민감정보 포함 옵션 타입과 선택 옵션을 추가했다.
- Export job 생성, job 상세 조회 polling, 다운로드 링크 요청 훅을 추가했다.
- `/export` 페이지를 실제 Export 화면으로 교체하고 사이드바에 내보내기 메뉴를 추가했다.
- 민감정보 포함 시 경고 dialog에서 확인해야만 Export 생성 요청이 나가도록 구현했다.

## 검토
- 민감정보는 기본적으로 제외되며, 포함 체크 시 `sensitiveConfirm: true` 확인 경로를 거쳐야 한다.
- Export job이 `PENDING` 또는 `PROCESSING` 상태이면 상세 조회를 polling하고, 완료 후 다운로드 버튼을 활성화한다.
- 다운로드 요청 실패 시 같은 다운로드 버튼으로 재시도할 수 있고, 성공 시 `downloadUrl` 링크와 만료 시간을 표시한다.
- G26 제외 범위인 복잡한 템플릿 편집은 추가하지 않았다.

## 검증
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright mock API smoke: `/export` 접속, 거래처 Excel 선택, 민감정보 포함 dialog 확인, Export 생성, 다운로드 링크 표시 확인
- 스크린샷 확인: `/tmp/g26-export-desktop.png`, `/tmp/g26-export-mobile.png`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G26 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
