# User Web — Bonsai UX/UI 목 기반

2026-11-20 KST. 기본 진입점부터 새 프론트다. G00 조사·G01 기반 구현과 검토를 진행했다. [G00 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G00_RESULT.md) · [G01 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md).

현재 화면은 기반 검증용이다. 랜딩·고객·프로젝트 등 전체 Bonsai 화면은 아직 구현하지 않았다. 원본 폰트와 아이콘의 정확한 자산은 확인 대기다. 실제 인증·업무 API·Backend·DB 연결은 없다.

## 실행

Node 24.x, pnpm 8.14.1. 저장소 루트에서 실행한다.

~~~powershell
pnpm.cmd -C FE/user-web install --offline --ignore-scripts
pnpm.cmd -C FE/user-web dev --host 127.0.0.1 --strictPort
~~~

미리보기: http://127.0.0.1:5173. 포트가 사용 중이면 해당 프로세스를 종료하지 말고 별도 포트를 명시한다. 오프라인 설치는 기존 패키지 캐시가 있을 때 가능하다.

## 현재 경로

| 경로 | 용도 |
| --- | --- |
| / | 공개 경계·기반 검증 링크 |
| /login | 가상 Alex/Blair 세션 선택과 취소 |
| /app | 같은 목 ID의 목록 |
| /app/items/sample-001 | 상세·이름 편집·실패/재시도 |
| /share/sample | 내부 데이터와 분리된 읽기 샘플 |
| /components | Bonsai Button·Field·Dialog 공통 요소 비교 |
| 기타 | 미지원 주소·공개 복귀 |

Preview controls에서 workspace·지연·다음 조회/저장 1회 실패·빈 상태·제한·초기화를 선택한다. 이 도구와 기반 탐색 메뉴는 개발 검증용이며 Bonsai 제품 화면으로 간주하지 않는다.

## 목 데이터 수명

- 브라우저 메모리만 사용한다. 전체 새로고침·새 탭은 가상 세션과 데이터를 초기화한다.
- 같은 탭의 route 이동·가상 로그아웃/재로그인은 저장된 항목을 유지하며 초안과 조회 캐시는 폐기한다.
- Reset preview는 세션·데이터·시각·장애를 초기화하고 공개 경계로 돌아간다.
- 사용자·workspace·revision으로 조회와 변경을 격리하고 늦은 저장을 차단한다.
- ScrollRestoration은 sessionStorage에 스크롤 위치만 저장한다. 실제 인증 storage나 .env를 읽어 live 모드로 전환하지 않는다.
- 로컬 Promise 공급자는 FE 내부 타입이다. API 명세·HTTP adapter·DB 모델이 아니다.

## 검증

~~~powershell
pnpm.cmd -C FE/user-web run typecheck
pnpm.cmd -C FE/user-web run lint
pnpm.cmd -C FE/user-web run test
pnpm.cmd -C FE/user-web run test:e2e
pnpm.cmd -C FE/user-web run build
pnpm.cmd -C FE/user-web run test:e2e:preview
~~~

E2E는 별도 dev5175·preview4175 서버를 사용한다. 실행 중인 다른 서버를 재사용하거나 종료하지 않는다. Chromium 설치가 필요한 새 환경은 Playwright 브라우저를 준비한다. 네트워크를 가로채지 않고 실제 요청을 관찰하여 API·외부 요청·console 오류 0건을 검사한다.

5173 미리보기 실행 중 FE/user-web에서 node scripts/capture-foundation.mjs로 비교 캡처를 재생성할 수 있다. 결과는 TODO 계획의 RESULTS/evidence에 저장한다.

## 규칙과 다음 작업

[현재 구조](ARCHITECTURE.md), [FRONT_AGENT](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [결정 006](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/006_bonsai_uxui_only_phase.md)을 따른다. 컴포넌트·hook·함수에 한 줄 한글 책임 주석을 작성한다.

후속 R01/G02는 공개 웹 원본을 확인하고 현재 공개 표본을 실제 랜딩으로 대체한다. 현재 임시 Outfit을 원본 폰트로 확정하지 말고 출처·버전·자산을 다시 확인한다. 후속 Goal 자동 착수·커밋·배포는 하지 않는다.
