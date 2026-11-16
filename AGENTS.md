# OneHandSales Agent Instructions

이 저장소에서 작업하는 Codex/에이전트는 아래 규칙을 따른다.

## 공통

- 사용자가 요청하지 않은 도메인 제약을 임의로 확정하지 않는다.
- 작업 전 현재 변경 상태를 확인하고, 기존 사용자 변경을 보존한다.
- 파일 검색은 우선 `rg` / `rg --files`를 사용한다.
- 파일 수정은 가능하면 `apply_patch`를 사용한다.
- 파괴적 명령은 사용자가 명시하지 않으면 실행하지 않는다.

## 제품·UX 전환 기준

- 제품·UX의 유일한 참고 기준은 folk다. 본문·제목·파일명·참조 링크에 이전 참고 제품 기준을 남기지 않는다.
- 먼저 `AGENT/PM_AGENT/DECISIONS/036_folk_benchmark_transition.md`와 `AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md`를 확인한다.
- Nicelydone MCP 화면, folk 공식 문서, 실제 계정 관찰을 구분해 기록한다. 연결·조회하지 않은 자료를 확인했다고 쓰지 않는다.
- 과거 Kit·이전 참고 결정은 역사 자료다. 현재 구현과 목표 설계를 구분한다.
- DB 제거는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/FOLK_SCHEMA_PLAN.md`의 후보와 API·FE 의존을 먼저 검토한다. 문서 변경을 DB 초기화 실행으로 확대하지 않는다.
- 사용자가 제외한 폴더는 링크 대상으로도 읽거나 수정하지 않는다.

## Backend 작업

`BE` 아래 코드를 수정하거나 백엔드 구조/DB/API/트랜잭션을 다루는 작업이면 먼저 다음을 읽고 따른다.

- `BE/AGENTS.md`
- `AGENT/SOFTWARE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/`
- 관련 DB 작업이면 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/`

백엔드 작업은 현재 구조를 “실제 MSA”가 아니라 “MSA 분리를 염두에 둔 modular monolith + Clean Architecture 계층 구조”로 본다.

## Commit

- 커밋은 사용자가 명시적으로 요청했을 때만 수행한다.
- 커밋 전에는 가능한 범위에서 관련 검증을 실행하고 결과를 보고한다.
