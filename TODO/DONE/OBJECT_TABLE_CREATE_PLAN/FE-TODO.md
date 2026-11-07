# 관리 항목 생성 후 첫 TABLE 이동

- [x] 기존 이름 → 아이콘/설명 두 단계 UX 유지
- [x] 생성 응답의 Object ID / View ID 타입 반영
- [x] 요청 사용자/Workspace의 Object sidebar query invalidate 후 새 View 경로 이동
- [x] 중복 클릭 방지, 실패 시 입력 보존 및 재시도
- [x] 모달 닫기·Workspace/사용자 전환 후 늦은 응답의 이동 방지
- [x] API client 테스트 및 생성·실패·지연 응답 브라우저 회귀
- [x] User Web typecheck, lint, build

기존 localhost:5173 서버에서 API 응답을 mock해 검증한다. 실제 DB 생성 요청은 보내지 않는다.
관리자 화면 및 업무 목록 생성은 이번 작업 범위에 포함하지 않는다.

검증: Vitest 17 files / 94 tests 통과. 기존 서버와 설치된 Chrome에서 Playwright 생성 관련 3 tests 통과.
생성 성공·동기 중복 클릭·sidebar 갱신·첫 TABLE 열 표시·새로고침·실패 재시도·닫힌 모달의 늦은 응답을 검증했다.
