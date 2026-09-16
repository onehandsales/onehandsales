# OneHandSales Agent Instructions

이 저장소에서 작업하는 Codex/에이전트는 아래 규칙을 따른다.

## 공통

- 사용자가 요청하지 않은 도메인 제약을 임의로 확정하지 않는다.
- 작업 전 현재 변경 상태를 확인하고, 기존 사용자 변경을 보존한다.
- 파일 검색은 우선 `rg` / `rg --files`를 사용한다.
- 파일 수정은 가능하면 `apply_patch`를 사용한다.
- 파괴적 명령은 사용자가 명시하지 않으면 실행하지 않는다.

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
