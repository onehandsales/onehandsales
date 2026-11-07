# 공개 사이트 Pricing 링크 임시 숨김

- 작업 일자: 2026-11-07
- 상태: 완료
- 요청: 사용자 확보 후 가격을 결정할 예정이므로 헤더와 푸터의 Pricing 링크를 삭제 대신 주석 처리한다.
- 관련 규칙: `AGENTS.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 범위와 진행 기록

- 시작 시 작업 트리가 깨끗함을 확인했다.
- 헤더의 데스크톱 및 모바일 Pricing 링크를 JSX 주석으로 보존했다.
- 푸터는 문구와 경로를 같은 순서로 매핑하므로 한국어·영어 Pricing 문구와 대응 경로를 함께 주석 처리했다.
- 가격 페이지와 라우트는 유지한다. ENV 및 다른 서비스 기능은 변경하지 않는다.

## 변경 파일

- `FE/user-web/src/features/public-site/components/public-site-header.tsx`
- `FE/user-web/src/features/public-site/components/public-site-footer.tsx`
- `FE/user-web/src/features/public-site/i18n/public-site-language.tsx`

## 검증 및 남은 작업

- 타입 검사, 변경 파일 ESLint, `git diff --check` 통과.
- 최초 브라우저 검증에서 문의 링크 선택자가 드롭다운 링크까지 포함해 두 요소와 일치했다. 직접 표시되는 내비게이션 링크로 검사 선택자를 한정해 재검증을 통과했다. 제품 코드 오류는 아니다.
- Chrome/Playwright로 한국어·미국 영어·캐나다 영어 각각 데스크톱 1440px·모바일 390px, 총 6개 조합을 확인했다.
- 헤더·푸터 및 열린 모바일 메뉴에서 Pricing 링크가 렌더링되지 않음을 확인했다.
- 푸터 제품 소개·주요 기능·다운로드의 문구와 경로 연결, 헤더 문의 링크 표시 및 페이지 실행 오류 없음을 확인했다.
- 커밋은 이번 요청에 포함하지 않는다.
- 요청 범위 완료. 확인된 미해결 문제 및 추가 필수 작업 없음. 가격 결정 후 주석 처리한 링크와 푸터 문구·경로를 함께 복원하면 된다.
