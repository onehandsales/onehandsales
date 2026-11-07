# 공개 사이트 CTA·푸터·제품 메뉴 서비스명 변경

- 작업 일자: 2026-11-07
- 상태: 구현·검증 및 커밋 준비 완료
- 요청: 가입 버튼의 `Get OneHand`를 `Get OneHand CRM`으로, 푸터와 Products 메뉴 내부 서비스명을 `OneHand CRM`으로 변경하고 Git 커밋한다.
- 관련 규칙: `AGENTS.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 범위와 진행 기록

- 변경 상태를 확인했다. 직전 Pricing 링크 주석 처리 변경과 해당 작업 로그가 남아 있고 스테이징된 파일은 없다.
- 이전 요청이 중단된 뒤 실제 문구 변경은 아직 적용되지 않았음을 확인했다.
- 헤더·랜딩 CTA의 영어 공통 문구, 푸터 서비스명, 제품 메뉴 내부 서비스명을 수정한다.
- Pricing 링크 주석 처리 및 두 작업 로그를 함께 커밋한다. ENV는 수정하지 않는다.
- 최초 브라우저 확인에서 홈 하단 CTA에 기존 문구가 남아 있는 것을 발견했다. `auth-landing-page.tsx`가 공통 문구를 재정의하고 있어 해당 문자열도 변경했다.

## 변경 파일

- `FE/user-web/src/features/public-site/i18n/public-site-language.tsx`
- `FE/user-web/src/features/public-site/components/public-site-footer.tsx`
- `FE/user-web/src/features/auth/components/auth-landing-page.tsx`
- 직전 Pricing 숨김의 `public-site-header.tsx` 변경과 작업 로그도 커밋에 포함한다.

## 검증 결과

- `fnm exec --using=24.21.0 pnpm typecheck`: 최종 수정 후 통과.
- 변경한 4개 TSX 파일의 ESLint 및 `git diff --check`: 통과.
- Chrome/Playwright에서 한국어·미국 영어·캐나다 영어의 데스크톱 1440px·모바일 390px, 총 6개 조합을 검증했다.
- 영어 헤더·홈 하단·모바일 메뉴 CTA가 `Get OneHand CRM`이며, 공통 푸터 이름이 `OneHand CRM`임을 확인했다.
- Products 드롭다운 및 모바일 제품 메뉴의 `OneHand CRM?` / `OneHand CRM이란?` 문구와 기존 소개 페이지 경로를 확인했다.
- Pricing 링크 숨김, 푸터의 제품 소개·주요 기능·다운로드 경로 매핑, 가로 넘침 및 페이지 실행 오류 없음을 확인했다.
- 최초 홈 CTA 검증 실패는 개별 문구 재정의가 원인이었으며 이를 수정한 뒤 전체 검증을 통과했다.

## 커밋 및 남은 범위

- 요청한 문구 변경과 이전 Pricing 숨김 변경, 관련 작업 로그를 함께 커밋한다. 커밋 식별자와 결과는 이 로그를 포함하는 Git 이력 및 사용자 보고에 남긴다.
- 구현·검증 완료. 확인된 미해결 문제 없음. ENV 변경이나 원격 푸시는 수행하지 않는다.
