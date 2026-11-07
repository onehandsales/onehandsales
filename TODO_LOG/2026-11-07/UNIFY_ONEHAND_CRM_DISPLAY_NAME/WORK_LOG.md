# 전체 화면의 OneHand CRM 표기 통일

- 작업 일자: 2026-11-07
- 상태: 구현·검증 완료, 커밋 준비 완료
- 요청: 로그인 전후 페이지에서 OneHand로 표시되는 서비스명을 OneHand CRM으로 모두 통일한다.
- 관련 규칙: `AGENTS.md`, `BE/AGENTS.md`, Software Front/Backend 규칙, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 범위와 진행 기록

- 시작 시 작업 트리가 깨끗함을 확인했다.
- 공개 페이지, 인증·온보딩, CRM 화면, 관리자 화면, 접근성 이름, 브라우저 제목·SEO·공개 자산 설명, 사용자에게 전달되는 오류 문구를 조사한다.
- 기존 OneHand CRM 표기는 보존하고, 기존 OneHand Sales 표시명도 OneHand CRM으로 통일한다.
- 컴포넌트·패키지 식별자, 실제 URL·소셜 계정, ENV, DB 데이터와 과거 작업 기록은 표시명 변경 대상에서 제외한다.
- 한국어 조사는 CRM 표기에 맞춰 자연스럽게 조정한다.

## 검증 및 남은 작업

- 표시 문자열 변경 후 남은 기존 표기와 CRM 중복 표기를 확인한다.
- 변경 범위에 맞는 타입 검사·lint·빌드·관련 테스트와 브라우저 확인을 진행한다.
- 후속 사용자 요청에 따라 검증을 마친 변경과 작업 로그를 Git 커밋한다.
- Backend는 공개 문의 오류의 서비스명 문자열만 변경한다. HTTP 경로·오류 코드·상태·입력 검증 규칙·DB 계약에는 변경이 없다.
- 34개 파일에서 표시명을 변경했다. 대량 패치 출력이 잘려 최초 파싱이 실패했으나, 파일별 작은 패치로 나누어 적용했다.
- 잔존 표기 검사에서 한국어 조사가 붙은 기존 `OneHand CRM이란?` 한 곳에 CRM이 중복된 것을 발견해 원래 문구로 복원했다.

## 적용 및 정적 검증 결과

- 34개 파일의 기존 서비스명 458곳을 변경했다. Git 기준 변경 전후 비교로 서비스명과 그에 따른 한국어 조사 외 수정이 없음을 확인했다.
- 사용자·관리자 Web의 `pnpm build` 통과. 두 빌드에 포함된 TypeScript 검사도 통과했다.
- Backend `pnpm typecheck`, 변경한 29개 TS/TSX/MJS 파일의 ESLint, `git diff --check` 통과.
- 공개 문의 application/controller 기존 Jest 테스트 2개 suite, 총 6개 테스트 통과.
- 최초 `pnpm test --runInBand --runTestsByPath ...` 실행은 pnpm 옵션 해석으로 실패했다. `pnpm exec jest --runInBand --runTestsByPath ...`로 실행해 통과했다.
- FE 소스·공개 자산·HTML·정적 SEO 생성 스크립트에 기존 표시명 및 CRM 중복 표기가 남아 있지 않음을 확인했다.
- 빌드된 정적 SEO HTML 80개에서 기존 표시명 및 CRM 중복 표기 없음.
- 빌드에는 Browserslist 데이터 갱신 안내와 User Web 큰 번들 경고가 있었으나 빌드는 성공했다. 의존성 및 번들 구성은 변경하지 않았다.
- 공개 화면 39개 경우(3개 언어권 × 데스크톱 10개 경로와 모바일 3개 경로)에서 문구·제목·접근성 이름, 중복 없음 및 모바일 가로 넘침 없음을 확인했다.
- 영어·한국어 모바일 홈 캡처를 직접 확인했다. 새 서비스명이 잘리지 않고 표시된다.
- 관리자 로그인 및 모의 인증 후 홈에서 OneHand CRM admin 표기를 확인했다.
- CRM 브라우저 검증 중 기존 테스트의 워크스페이스 버튼 이름이 현재 툴팁 포함 이름과 달라 선택자를 보정했다. 로그아웃·약관·개인정보의 새 표기는 확인했다.
- 지원요청은 리소스에 서비스명 안내 문구가 있지만 현재 폼은 그 안내를 표시하지 않는다. 존재하지 않는 문구를 필수로 기대했던 검사를 실제 폼과 기존 표기 잔존 검사로 수정했다. 서비스 동작 변경은 없다.
- CRM 최종 브라우저 검증 통과: 로그아웃·이용약관·개인정보·지원요청 폼·더보기 버전 표시에서 기존 이름과 중복 표기 및 페이지 실행 오류 없음.
- CRM 및 관리자 인증은 모의 API로 검증했으며 실제 사용자 인증이나 DB 쓰기를 수행하지 않았다.

## 변경 파일 범위

- User Web: `src/pages`의 공개·인증·문의·온보딩·더보기 문구, `src/components/layout/app-shell.tsx`, `src/components/shell/desktop-app-shell.tsx`, `src/features/app-i18n/resources`, `src/features/auth`, `src/features/public-site/i18n` 및 `seo`.
- User Web 공개 자산: `index.html`, `scripts/generate-static-seo-pages.mjs`, `public/llms.txt`, `public/brand`의 SVG title 두 곳.
- Admin Web: `index.html`, 로그인·홈 페이지, `src/features/auth/protected-admin-route.tsx`.
- Backend: `src/modules/public-contact-request/application/services/public-contact-request-application.service.ts`의 오류 메시지 세 곳.

## 완료 현황과 커밋

- 요청한 표시명 통일 및 검증 완료. 확인된 미해결 구현 문제 없음.
- 구현 파일 34개와 이 로그를 함께 커밋한다. 식별자와 결과는 이 로그를 포함한 Git 이력 및 사용자 보고에서 확인한다.
- 실제 URL·소셜 계정·기술 식별자·ENV·DB와 과거 작업 기록은 유지했다. 원격 푸시는 수행하지 않는다.
