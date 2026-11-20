# 웹 프론트엔드 테스트와 검증

기준일: 2026-11-20 KST. 명령은 저장소 루트에서 Windows PowerShell로 실행하는 형태다. 아래 목록은 실행 가능한 script 안내이며 이번 문서 개정에서 실행했다는 기록이 아니다.

## 1. 변경에 맞는 검증 선택

아래 표는 로컬 작업 검증의 기준이다. CI와 운영 배포의 추가 gate는 7절을 따른다.

| 변경 | 기본 검증 | 추가 검증을 선택할 조건 |
| --- | --- | --- |
| 문서만 변경 | diff·링크·규칙·실제 script 정합성 | 실행 가능한 예제가 있으면 타입·내용 확인 |
| 단순 문구·스타일 | 해당 앱 typecheck·lint, 실제 화면 확인 | 레이아웃·접근성·공통 UI에 영향 시 관련 시나리오 |
| 상태·계산·query·adapter | typecheck·lint, 중요한 경계의 unit test | 화면 간 전파·경쟁 조건·실패 복구 E2E |
| route·폼·모달·업무 흐름 | typecheck·lint, 관련 E2E와 수동 웹 확인 | 공통 shell·auth·workspace 영향 시 회귀 확대 |
| 의존성·번들·빌드·배포 설정 | typecheck·lint·build, 영향 기능 smoke | 실제 연동·배포 전 전체 release gate |

가역적인 작은 수정에 구현을 복제하는 테스트를 억지로 추가하지 않는다. 버그를 막는 경계·상태 전환·사용자 결과를 검증한다. 필요한 검증이 통과하면 새로운 변경이나 실패 근거 없이 반복 실행하지 않는다.

## 2. 현재 package script

| 목적 | User Web | Admin Web |
| --- | --- | --- |
| 타입 | `pnpm.cmd -C FE/user-web run typecheck` | `pnpm.cmd -C FE/admin-web run typecheck` |
| lint | `pnpm.cmd -C FE/user-web run lint` | `pnpm.cmd -C FE/admin-web run lint` |
| unit | `pnpm.cmd -C FE/user-web run test` | 현재 unit test script 없음 |
| build | `pnpm.cmd -C FE/user-web run build` | `pnpm.cmd -C FE/admin-web run build` |
| E2E | `pnpm.cmd -C FE/user-web run test:e2e` | `pnpm.cmd -C FE/admin-web run test:e2e` |
| 모바일 QA | `pnpm.cmd -C FE/user-web run test:e2e:mobile` | 별도 script 없음 |
| 브라우저 QA | `pnpm.cmd -C FE/user-web run test:e2e:browsers` | 별도 script 없음 |

단일 unit 파일은 `pnpm.cmd -C FE/user-web exec vitest run <실제-test-파일>`, 단일 E2E는 해당 앱의 `exec playwright test <실제-spec-파일>`로 좁힌다. 꺾쇠 부분은 placeholder이며 실제 존재하는 파일로 바꾼다.

User Web build에는 정적 SEO 페이지 생성이 포함된다. Admin에는 User Web의 Vitest·form·query 라이브러리 설치를 가정하지 않는다. 실제 script의 정본은 각 앱 package.json이다.

## 3. 의미 있는 테스트

- 순수 계산: 유효한 0·null·경계 날짜·정렬·합계·잘못된 입력 등 계약상 다른 결과를 확인한다.
- mock/adapter: 생성한 ID의 상세 조회, 변경 전파, 없는 ID, reset, 취소, 오류 변환을 확인한다.
- 상태 경합: A 조회 중 B 이동, 저장 중 workspace 전환, 실패 후 재시도, 늦은 callback의 화면 오염을 확인한다.
- 폼: 검증 오류, IME 입력, 중복 제출, dirty 초안, 저장 후 목록 반영, 취소·재진입을 확인한다.
- E2E: 버튼 노출뿐 아니라 사용자 행동 후 보이는 데이터와 종료 상태를 확인한다.
- auth: 기존 실제 경로를 변경할 때 로그인·만료·복구·권한 차단을 검증한다. mock role 테스트를 서버 권한 검증으로 보고하지 않는다.

## 4. mock 검증의 기본 시나리오

1. seed를 초기화하고 사용할 데이터 모드·인증 방식을 고정한다.
2. 목록 → 생성 → 상세 → 편집 → 목록 재진입에서 같은 ID와 변경 값을 확인한다.
3. 검색·필터·정렬 후 URL·reload·뒤로가기가 명시한 상태를 복원하는지 확인한다.
4. 빈 결과·지연·오류·재시도·취소를 각각 재현한다.
5. 허용한 인증·정적 리소스 외의 업무 네트워크 요청이 없는지 확인한다.
6. 기록된 저장 수명에 맞게 reload/reset 후 결과가 유지되거나 초기화되는지 확인한다.

모든 기능에 생성·삭제가 있어야 한다는 뜻은 아니다. 실제 구현한 행동과 수용 기준에 맞게 선택한다.

## 5. 브라우저와 접근성

2026-11-20 설정 확인 범위:

- User Web 기본 Playwright는 Chromium, viewport 1440×1000이다.
- release QA는 Chrome과 조건부 Edge, 데스크톱 1440×1000 및 모바일 360×740·390×844 구성을 포함한다.
- 이 설정만으로 Firefox·WebKit·실제 Safari·실기기 검증을 완료했다고 쓰지 않는다. 모바일 viewport는 실제 모바일 브라우저 실행과 다르다.
- 지원 브라우저 확대나 해당 엔진의 회귀 위험이 있으면 별도 실행 환경·프로젝트와 검증 범위를 정한다.

키보드만으로 완료, 포커스 복귀, 긴 텍스트, 확대, 표·패널 스크롤을 수동 확인한다. 스크린리더 검증을 했다면 도구·브라우저·범위를 적는다. 자동 접근성 검사만으로 전체 준수를 선언하지 않는다.

## 6. 테스트 안정성과 시각 비교

사용자에게 보이는 역할·이름 기반 locator와 자동 재시도 assertion을 우선한다. 각 테스트의 저장소·seed·시간을 격리하고 고정 sleep이나 다른 테스트의 실행 결과에 의존하지 않는다. [Playwright 공식 권장 사항](https://playwright.dev/docs/best-practices)

- 배치용 CSS class나 DOM index보다 `getByRole`, label 등을 우선한다. 의미 있는 대상을 찾기 어려울 때 안정적인 test ID를 사용한다.
- 시각 비교는 viewport·데이터·locale·기준 시각·폰트 로딩을 맞춘다. 원본 캡처와 실제 브라우저 크기를 기록한다.
- screenshot baseline을 변경 결과 확인 없이 일괄 갱신하지 않는다. 차이가 의도한 것인지 먼저 판단한다.
- 외부 서비스는 경계에서 mock하고 테스트 중 실제 발송·결제를 일으키지 않는다.
- 기존 실행 중인 서버를 재사용한다면 코드 버전·모드·포트를 확인한다. 설정 파일 존재를 테스트 성공 증거로 사용하지 않는다.

## 7. CI·배포·결과 기록

실행 시점 정책은 [결정 003](../DECISIONS/003_frontend_testing.md), 배포 gate는 [배포 기준](DEPLOYMENT.md)을 따른다. 이 정책 문서가 현재 CI에 모두 구성되어 있다는 뜻은 아니다.

결과는 변경 범위, 명령, 성공/실패, mock/live, 브라우저·viewport, 미실행 사유, 남은 검증으로 기록한다. 예: “목록·상세 mock E2E 통과, 실제 서버 저장과 Safari는 미검증.” 문서만 변경한 작업에 실제 화면·서버 검증 결과를 만들어 적지 않는다.
