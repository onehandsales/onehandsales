# 문의 인원 선택 제목 서비스명 변경

- 작업 일자: 2026-11-07
- 상태: 완료
- 요청 및 범위: 영문 인원 선택 제목을 `How many people will use OneHand CRM?`으로 변경한다.
- 관련 규칙: `AGENTS.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- 변경 파일: `FE/user-web/src/pages/contact/index.tsx`

## 진행 기록

- 현재 변경 상태를 확인했고, 제목의 영문 문자열 위치를 확인했다.
- 기존 사용자 변경을 보존하며 해당 문구만 수정했다.

## 검증 및 남은 작업

- `rg`로 변경 문구 및 제목 연결을 확인했다. 변경 코드의 `git diff --check` 통과.
- 한 줄 문구 변경으로 별도 테스트 작성이나 전체 테스트는 수행하지 않는다.
- 요청 범위 완료. 확인된 미해결 문제 및 추가 필수 작업 없음.
