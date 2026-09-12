# UX/UI Search Decision

## 결정

현재 비활성 결정이다.

고정형 고객사 검색 API와 화면은 현재 런타임 범위에서 제거됐다.

## 이유

현재 앱에는 검색 대상 record가 없다. 후속 CRM 코어에서 record와 view가 확정되면 통합검색과 화면별 검색/필터를 다시 설계한다.

## 규칙

- 현재 통합검색 API를 만들지 않는다.
- 삭제된 고정형 도메인을 검색 결과처럼 노출하지 않는다.
- 후속 검색 결과는 확정된 record 유형별로 묶는다.
- 화면별 검색/필터는 현재 화면 목록만 제어한다.
- 모바일 통합검색은 전체 화면 검색 시트로 열 수 있다.
- 모바일 필터는 필터 시트로 열 수 있다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
