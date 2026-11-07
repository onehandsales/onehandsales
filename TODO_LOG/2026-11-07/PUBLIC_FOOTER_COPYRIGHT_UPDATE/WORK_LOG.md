# 공개 사이트 저작권 문구 변경

- 작업 일자: 2026-11-07
- 상태: 완료
- 요청: 공개 사이트 하단의 회사명을 `OneHand CRM Labs`로 변경한다.
- 관련 규칙: `AGENTS.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- 관련 계획: 별도 goal 없이 사용자 요청에 따른 문구 수정.

## 예정 범위와 진행 기록

- 작업 전 Git 변경 상태를 확인했으며 기존 `TODO_LOG/2026-11-07/` 내용을 보존한다.
- 공통 Footer가 사용하는 한국어 및 영어 저작권 문구 두 곳을 확인했다.
- `©` 기호와 연도, 화면 스타일을 유지하고 회사명을 변경한다.

## 변경 파일

- `FE/user-web/src/features/public-site/i18n/public-site-language.tsx`

## 검증과 검토

- 한국어 및 영어 공통 문구를 `© 2026 OneHand CRM Labs`로 변경했다.
- `rg` 검색으로 변경 문구 두 곳을 확인했고 User Web 소스에 이전 문구가 남아 있지 않음을 확인했다.
- `git diff --check` 통과. 소스 변경은 저작권 문자열 두 줄로 한정됨을 Git diff로 확인했다.
- 단순 표시 문구 수정이므로 테스트 추가 및 빌드, 브라우저 검증은 실행하지 않았다.

## 완료 현황과 다음 작업

- 요청 범위 완료. 남은 구현 작업 및 확인된 리스크 없음.
- 추가 권장 작업 없음.
