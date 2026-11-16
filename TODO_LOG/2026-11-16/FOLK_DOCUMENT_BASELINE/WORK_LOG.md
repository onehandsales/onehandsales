# folk 문서 기준과 전환 순서 정리

- 작업일: 2026-11-16
- 상태: 완료 — 문서 정리 및 진행 순서 안내 범위
- 요청: 제품·UX 문서의 참고 제품을 folk로 통일하고 화면 조사부터 DB 재설계까지의 순서를 명확히 한다.
- 기준: AGENTS.md, PM 036, UX 025, TODO/FOLK_TRANSITION_PLAN.md, FOLK_SCHEMA_PLAN.md, PM 022.

## 범위

AGENT, BE, FE의 프로젝트 문서와 루트 AGENTS.md/prompt.md/README.md, TODO/README.md 및 TODO/FOLK_TRANSITION_PLAN.md를 대상으로 한다. 과거 UX 참고 기준의 본문·파일명·링크를 정리하고, Workspace 기반 보존 검토 및 기존 CRM 모델 교체 의향을 반영한다. 기존 TODO 하위 계획·과거 로그의 일괄 정리는 포함하지 않는다.

## 진행 기록

- 시작 시 Git 변경 없음 확인.
- 대상 문서에서 이전 참고 제품 표기가 남은 파일 18개 확인.
- 현재 도구 목록에는 Nicelydone MCP 도구가 노출되지 않음. 플러그인 검색 결과도 비어 있음. 공식 MCP 안내의 원격 서버·OAuth·유료 접근 조건을 확인했으나 실제 연결과 folk 화면 조회는 미수행.
- 실행 코드·schema·migration·DB·환경·서버 변경은 이번 작업에 포함하지 않음.

## 적용 결과

- 이전 참고 제품 표기가 있던 18개 문서의 본문·참조를 정리했다. UX 006과 UX 020은 이전 기준 종료 기록으로 정리하고, UX 020 파일명을 변경했다. 과거 본문은 Git 이력에 남는다.
- 제품·UX의 유일한 참고 기준을 folk로 명시했다. 과거 제품의 UX를 folk에서 확인한 사실로 바꾸지 않았다.
- TODO README의 오래된 구현 상태·우선순위·UX 참조 및 존재하지 않는 AGENT 문서 경로를 수정했다.
- PM 036, 루트 README, 단일 전환 계획, DB 설계안, 전환 의존 문서에 Workspace 기반 유지 검토와 기존 CRM 정의·값·관계·보기 테이블의 전면 교체 검토를 연결했다.
- 제거 목록·데이터 이전 여부·실행 환경은 미확정으로 유지했다. 화면 조사·작은 mock UX·데이터 및 API 계약 이후 물리 DB를 설계한다.
- 공식 MCP 안내, folk 데이터 모델, Custom objects 원문을 재확인했다. 확장자 없는 Custom objects URL 조회 실패 후 Markdown 원문으로 확인했다.

## 검증 및 남은 작업

- 원래 문서 범위 183개와 이 로그를 포함한 184개를 검사했다. 이전 표기·파일명 잔존 0건, 범위 내 상대 링크 659개 누락 0건, 미닫힌 코드 fence 0건이다. 범위 밖 링크 49개는 읽거나 검증하지 않았다.
- 최초 링크 검사에서 Windows PowerShell의 .NET에 GetRelativePath가 없어 검사 스크립트가 실패했다. 호환되는 경로 계산과 즉시 오류 중단으로 수정한 재검사는 exit 0으로 완료했다. 최초 결과는 통과 근거로 사용하지 않는다.
- git diff --check 통과. 변경 파일은 Markdown 문서뿐이다. 실행 코드·schema·migration 변경이 없어 runtime 테스트·빌드·DB 검증은 수행하지 않았다. 커밋하지 않았다.
- MCP 실제 화면 조회와 folk 계정 관찰은 미수행이다.
- 다음 작업은 Nicelydone 연결 및 folk 첫 화면 조회 확인이다.

문서 정리는 완료됐으며 G00은 연결·조회 대기, G01~G09는 조사·설계·구현 대기다. 이번 결과를 folk UX 또는 DB 전환 완료로 표시하지 않는다.
