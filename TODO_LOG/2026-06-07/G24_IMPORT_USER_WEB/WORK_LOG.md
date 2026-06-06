# G24 Import User Web 화면

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
- 대상 선택: 회사, 거래처, 제품, 딜
- Excel/CSV 파일 업로드
- 업로드 후 preview table 표시
- AI 컬럼 매핑 결과 표시
- 매핑 수정 UI
- row별 validation error 표시
- 오류 row가 있으면 Import 확정 버튼 비활성화
- Import 확정 전 경고 dialog
- Import 확정 및 row별 결과 표시
- 실행 실패 시 실패 row number와 error reason 표시

## 제외 범위
- 대량 데이터 고성능 처리
- 일정/회의록 import
- Export 화면

## 작업 로그
- G24 기준 문서와 Import API 계약을 확인했다.
- 현재 `/import` 페이지가 placeholder임을 확인했다.
- `features/import-export`는 index와 빈 하위 폴더만 있는 상태임을 확인했다.
- G23에서 구현한 Import API response 형태를 기준으로 FE 타입과 화면 흐름을 설계하기로 했다.
- Import API client, query key, React Query query/mutation hook, FE 타입, 파일 검증/target field schema를 추가했다.
- `/import` 페이지를 placeholder에서 실제 Import 화면으로 교체했다.
- 사이드바에 `가져오기` 진입점을 추가했다.
- 대상 선택, CSV/XLS/XLSX 파일 업로드, client 파일 형식/크기 검증, preview job 생성 UI를 구현했다.
- AI 매핑 요청, AI 신뢰도 표시, 필드별 source column select 기반 매핑 수정 UI를 구현했다.
- mapping 저장 후 row별 validation 상태와 error reason을 preview table에 표시하도록 했다.
- 오류 행이 있거나 mapping이 저장되지 않은 경우 가져오기 실행 버튼을 비활성화하도록 했다.
- 확정 전 warning dialog와 confirm API 호출, 실행 결과 요약과 실패 행 표시 UI를 구현했다.
- Playwright smoke 중 desktop 화면의 매핑 패널 여백 문제를 확인하고 grid content alignment를 조정했다.

## 검토
- G24 요구사항의 대상 선택, 파일 업로드, preview table, AI 매핑, 매핑 수정, row별 오류 표시, 확정 실행, 확정 전 dialog를 모두 반영했다.
- Import 실행은 mapping 저장 이후에만 가능하고, `invalidRowCount > 0`이면 실행 버튼이 비활성화된다.
- 실행 실패 row number와 reason은 `result.errors`와 job/row error를 통해 표시할 수 있도록 구성했다.
- 화면은 `/import` route와 `features/import-export` 내부로 범위를 제한했고 Export 화면은 건드리지 않았다.
- 데스크톱/모바일 스크린샷을 확인해 주요 UI가 겹치지 않고 조작 가능한 상태임을 확인했다.

## 검증
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright smoke: `/import`에서 파일 업로드, preview 표시, AI 매핑 요청, 매핑 저장, 확정 dialog, 가져오기 실행 완료 확인
- Playwright mobile smoke: `/import` 모바일 viewport 기본 화면 확인
- 스크린샷: `/tmp/g24-import-desktop.png`, `/tmp/g24-import-mobile.png`
