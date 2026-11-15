# Frontend

- [x] 업무 목록 +와 생성 모달 연결
- [x] 이름·기준 관리 항목·제목·설명·보기 선택, 보기별 목록 기본 아이콘 자동 적용
- [x] 기존 상태/목록 전용 단계 보드 분기
- [x] 사용자/Workspace cache 무효화와 새 View 이동, 늦은 응답·중복 제출 방어
- [x] loading/error/empty와 ko-KR/en, typecheck/lint/test/build/browser 검증

## 검증 기록 (2026-11-07, Node 24.21.0)

- typecheck/lint/build 통과. 기존 Vite 대형 chunk 경고 유지.
- Vitest 17 files/94 tests 통과.
- 기존 localhost:5173과 설치된 Chrome으로 Playwright 11개 통과.
  업무 목록 생성 8개 + 관리 항목 생성 회귀 3개. 서버를 새로 시작하거나 재시작하지 않았다.
- 모든 브라우저 API는 mock: 실제 사용자 DB에 목록이나 기록을 생성하지 않았다.
- TABLE 기본 선택, 기존 상태/새 단계 KANBAN, LIST 전환 시 보드 입력 제외,
  같은 tick 연속 클릭, 생성 후 사이드바 갱신/이동/새로고침, 중복 이름 오류 재시도,
  닫기/재열기 후 늦은 응답, 관리 항목이 없는 상태, 속성 조회 실패 재시도를 확인했다.
- 실행 중 찾아낸 선택란 label/설명 분리와 radio 카드의 클릭 영역을 수정했다.
- 로케일 ko-KR/en 문구를 제공하며 자동 브라우저 검증은 한국어 데스크톱 기준이다.

## 생성 아이콘 변경 (2026-11-08)

- 생성 화면의 아이콘 선택기·별도 상태·미사용 ko-KR/en 문구를 제거했다.
- 요청의 `icon`을 생략하고 최종 `viewType`으로 서버가 기본 아이콘을 결정한다.
- 사이드바와 헤더는 기존처럼 조회 응답의 목록 아이콘을 표시한다.
- 사용자가 요청한 보기 카드 제목/설명 10px와 설명 placeholder 문구를 보존했다.
- 보기 카드의 세 아이콘을 `#9CA3AF`로 통일하고 관리 항목 선택 아래 안내 문구와
  연결된 `aria-describedby`, 미사용 ko-KR/en 문구를 제거했다.
- 검증: typecheck/lint/build, Vitest 17 files/94 tests, 목록 생성 Playwright 8개 통과.
  기존 localhost:5173과 설치된 Chrome을 사용했으며 모든 API는 mock했다.
- 세 보기 모두 요청에서 `icon`을 생략하고 조회 응답의 기본 아이콘을 sidebar/header에
  표시하는 것을 확인했다. TABLE은 새로고침 이후 표시도 검증했다.
- 기존 Vite 대형 chunk 경고와 Browserslist 데이터 갱신 안내는 유지된다.
- 최종 색상·안내 문구 변경 후 typecheck/lint와 TABLE 생성·중복 제출 차단·사이드바
  갱신·새로고침 복원 브라우저 테스트 1개를 다시 실행해 통과했다.
