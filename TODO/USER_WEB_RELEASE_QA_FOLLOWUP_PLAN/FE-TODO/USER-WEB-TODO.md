# User Web TODO

## 1. 목적

`FE/user-web`의 모바일 브라우저 QA, Chrome/Edge 호환 QA, e2e 환경 복구, S0/S1/S2 bugfix를 바로 실행 가능한 작업으로 정리한다.

## 2. P0 작업

### G01. 기본 e2e 환경 복구

- [x] `FE/user-web` Playwright browser 설치 상태 확인
- [x] `pnpm exec playwright install chromium` 실행 또는 `Blocked` 사유 기록
- [x] `pnpm run typecheck` 실행
- [x] `pnpm run lint` 실행
- [x] `pnpm run build` 실행
- [x] `pnpm run test:e2e` 실행
- [x] 실행 결과를 `COMMON/QA-RESULTS.md`에 기록

### G02. 모바일 브라우저 QA 자동화

- [x] `playwright.release-qa.config.ts` 추가
- [x] 기존 smoke spec의 API mock helper를 `tests/e2e/support`로 분리하거나 중복 없이 재사용
- [x] `mobile-browser-qa.spec.ts` 추가
- [x] Chrome 390px project 추가
- [x] Chrome 360px project 추가
- [x] Edge 390px project 추가 또는 Edge 부재 `Blocked` 처리
- [x] Edge 360px project 추가 또는 Edge 부재 `Blocked` 처리
- [x] `test:e2e:mobile` script 추가
- [x] `/app` 홈, mobile header, bottom navigation 확인
- [x] 회사/담당자/제품/딜/일정/회의록/명함/Import/Trash route 이동 확인
- [x] dialog/dropdown/toast viewport 이탈 여부 확인
- [x] page-level horizontal overflow 확인
- [x] 결과를 `COMMON/QA-RESULTS.md`와 `COMMON/ISSUE-LOG.md`에 기록

### G03. Chrome/Edge 호환 QA 자동화

- [ ] `browser-compat-qa.spec.ts` 추가
- [ ] Chrome desktop project 추가
- [ ] Edge desktop project 추가 또는 Edge 부재 `Blocked` 처리
- [ ] `test:e2e:browsers` script 추가
- [ ] reload smoke 확인
- [ ] back/forward smoke 확인
- [ ] multi-tab smoke 확인
- [ ] slow network 또는 API delay loading state 확인
- [ ] page error/console error 수집
- [ ] 결과를 `COMMON/QA-RESULTS.md`와 `COMMON/ISSUE-LOG.md`에 기록

### G04. 보안 smoke

- [ ] User Web source에서 `/admin/api/*` 호출 문자열 검색
- [ ] `src/lib/api-client.ts`의 admin path 차단 확인
- [ ] 로그아웃 후 보호 화면 재접근 차단 smoke 확인
- [ ] 다중 계정 보안 BE 테스트 결과와 FE 처리 기준 충돌 여부 확인

### G06. S0/S1/S2 수정

- [ ] 모바일/브라우저 QA에서 나온 S0/S1/S2 수정
- [ ] 수정된 화면의 viewport 재확인
- [ ] typecheck/lint/build/e2e 재실행
- [ ] `ISSUE-LOG.md` 상태 갱신

## 3. 제외 작업

- Notification 화면 노출
- Generic export route 재노출
- Admin Web 운영 화면 구현
- API response에 없는 latest activity/next action summary를 FE에서 임의 생성
- page size 숫자 FE 단독 변경

## 4. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:mobile
pnpm run test:e2e:browsers
```

`test:e2e:mobile`과 `test:e2e:browsers`는 G02/G03에서 script를 추가한 뒤 실행한다.
