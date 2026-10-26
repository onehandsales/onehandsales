# 실제 검증·Front 규칙 검토

기준: [Front 검토 체크리스트](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md), [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [작업 로그](../../../../TODO_LOG/2026-10-26/VIEW_FAVORITE_FRONTEND_INTEGRATION/WORK_LOG.md).

## 검증 결과

| 검사 | 실제 결과 |
| --- | --- |
| Node 24.21.0 `pnpm -C FE/user-web typecheck` | 통과 |
| `pnpm -C FE/user-web lint` | 통과 |
| `pnpm -C FE/user-web test` | 13 files / 58 tests 통과, 신규 17건 |
| `pnpm -C FE/user-web build` | 통과. 기존 번들 크기 안내 유지 |
| Chromium Playwright | 최종 33건 통과, 신규 즐겨찾기 13건·기존 헤더/사이드바/핵심 화면 20건 |
| 반응형·키보드 | 360/390/1024/1440px, Space/Enter·focus, 38px 헤더·오류 안내 viewport 검사 통과 |
| 실제 사용자 서버 | Front 5173 / Admin 5174 / Backend health 3000 모두 200, 프로세스 변경 없음 |

Playwright는 기존 5175 Vite 테스트 서버와 mock API를 사용했다. 작업별 임시 설정·보고서·스크린샷은 `/tmp/onehandsales-favorite-front.ulxslb4o/`의 `playwright-results.json`, `playwright-final.log`, `final-results/`, `vitest-final.log`, `typecheck.log`, `lint.log`, `build-final.log`에 있다. 임시 파일의 수명과 별개로 실제 수치는 이 문서와 작업 로그에 남긴다.

첫 브라우저 검증은 32건 중 30건 통과/2건 실패였다. 정확한 계정 메뉴 이름을 기대하지 못한 선택자와 credentials refresh 요청에 CORS `*`를 반환한 기존 mock 문제를 수정했다. 실패 두 건을 재검증한 뒤 최종 33건을 모두 통과했다. 최초 typecheck의 중복 번역 키는 기존 등록/해제 키를 재사용해 수정했다.

## G99 결과

- API client·응답 타입은 view-favorite, 헤더/개인 목록 갱신 조합은 crm-view에 두고 공개 index로 협력한다. AppShell의 단일 모델을 두 헤더가 공유한다. User/Admin 코드 공유나 Backend 변경 없음.
- 현재 View ID만 경로로 전송한다. 소유자·Actor·sortOrder·가짜 Favorite PK를 만들지 않는다. 공통 apiClient의 Bearer/401 refresh와 201/200 응답을 그대로 사용한다.
- 요청 전 기존 GET 취소, 성공 응답의 범위 제한 적용, 성공/실패 후 개인 목록·헤더 invalidate, 404 목록 invalidate를 확인했다. 사용자/Workspace/View와 UUID 표기·후속 GET 시각으로 캐시를 구분한다. 현재 선택과 서버 순서는 유지한다.
- 처리 중 중복 차단·빈/미확인·403/404·실패 안내/닫기·키보드·aria-pressed/aria-busy·양쪽 반응형 상태를 검증했다. 낙관적 변경과 자동 mutation 재시도 없음. 불확실한 실패는 GET으로 재확인한다.
- 새 함수·hook·handler·client·test helper의 한국어 기능 주석과 주요 상태/캐시 흐름의 번호 주석, strict/no any·공개 feature 경계·직접 console/민감 로그 없음·현지화 문구를 확인했다.
- API는 Backend의 구현된 단일 정본을 참조한다. 문서와 현재 동작·제외 범위를 맞추고 DONE 보관했다. 환경 파일·업무 DB·사용자 서버·Admin Web은 변경하지 않았다. 커밋은 후속 사용자 명시 요청에 따라 진행한다. 완료를 막는 잔여 결함을 발견하지 않았다.

추가적인 실제 업무 DB 쓰기나 배포 검증은 이번 범위에서 수행하지 않았다. 즐겨찾기 행 클릭 이동·순서 변경·보기 생성/저장·타입별 본문은 후속 요청에서 별도 계획으로 진행한다.
