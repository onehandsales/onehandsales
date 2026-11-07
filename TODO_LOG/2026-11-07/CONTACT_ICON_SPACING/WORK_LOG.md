# 문의 화면 아이콘 주변 간격 축소

- 작업 일자: 2026-11-07
- 상태: 완료
- 요청: 상단 아이콘 주변 여백의 현재 크기를 확인하고 줄인다.
- 관련 규칙: `AGENTS.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- 변경 파일: `FE/user-web/src/pages/contact/index.tsx`

## 확인 및 변경 범위

- 아이콘 자체 CSS padding은 0px이다.
- 아이콘과 아래 내용 사이 간격은 기본 `gap-8`(32px), sm 이상 `gap-10`(40px)이다.
- 공통 간격을 `gap-4`(16px)로 변경한다.
- 원형 60×60px, 내부 아이콘 30×30px와 기존 사용자 변경을 보존한다.

## 검증 결과

- Chrome/Playwright 1440px·390px에서 계산된 gap 및 실제 두 요소 사이 간격이 모두 16px임을 확인했다.
- 원형 padding 0px, 원형 크기 60×60px, 내부 아이콘 30×30px 유지 및 가로 넘침 없음을 확인했다.
- 변경 파일 `git diff --check` 통과.
- 공통 레이아웃 간격 클래스만 변경한 작업이므로 타입 검사·전체 테스트를 반복하지 않았다.

## 완료 현황과 다음 작업

- 요청 범위 완료. 추가 필수 작업 및 확인된 미해결 문제 없음.
