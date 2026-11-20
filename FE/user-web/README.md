# User Web — Bonsai UX/UI 목 기반

2026-11-20 KST. 기본 진입점부터 로컬 목 프론트다. [G00 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G00_RESULT.md) · [G01 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md) · [R01 분석](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/R01_RESULT.md) · [G02 구현·검토 결과](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md).

기본 `/`는 Bonsai 랜딩·공통 메뉴다. 공개 웹은 확인한 Gellix WOFF와 로컬 원본 자산을 사용한다. G01 검증 경로는 별도로 유지한다. 원본 비교 후 일부 이미지·색·문자 배치 차이가 남아 **G02 시각 동일성은 대기**다. G03 이후 페이지와 실제 인증·업무 API·Backend·DB 연결은 없다.

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
| / | Bonsai hero·11단계 랜딩·메가메뉴·이메일·후기·푸터 |
| /signup | G10 미구현 인계, CTA source/이메일·취소·복귀 |
| /crm, /pricing, /templates 등 | 담당 Goal을 표시하는 미구현 공개 목적지 |
| /login | G01 가상 Alex/Blair 선택. Bonsai 로그인 전체는 G11 대기 |
| /app | 같은 목 ID의 목록 |
| /app/items/sample-001 | 상세·이름 편집·실패/재시도 |
| /share/sample | 내부 데이터와 분리된 읽기 샘플 |
| /components | Bonsai Button·Field·Dialog 공통 요소 비교 |
| 기타 | 미지원 주소·공개 복귀 |

`/components`·`/app` 등 기반 경로의 Preview controls에서 workspace·지연·다음 조회/저장 1회 실패·빈 상태·제한·초기화를 선택한다. 공개 랜딩에는 개발 도구를 표시하지 않는다.

## 목 데이터 수명

- 브라우저 메모리만 사용한다. 전체 새로고침·새 탭은 가상 세션과 데이터를 초기화한다.
- 같은 탭의 route 이동·가상 로그아웃/재로그인은 저장된 항목을 유지하며 초안과 조회 캐시는 폐기한다.
- Reset preview는 세션·데이터·시각·장애를 초기화하고 `/components`로 돌아간다.
- 공개 이메일/CTA는 같은 탭의 뒤로 복귀에서 유지한다. 취소·Reset·사용자/workspace/시나리오 변경·새로고침·새 탭에서 삭제한다. 이메일은 URL·로그·storage에 저장하지 않는다.
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

5173 미리보기 실행 중 `FE/user-web`에서 `node scripts/capture-landing.mjs`, `python -X utf8 scripts/compare-landing.py`로 현재 캡처와 비교 이미지를 생성한다. Python/Pillow가 필요하다. `node scripts/capture-foundation.mjs`는 G01 회귀를 `evidence/g02-foundation-regression`에 별도 기록한다. 캡처/비교 결과는 계획의 RESULTS/evidence/g02에 저장한다. E2E dev/production 출력 폴더를 분리하여 다른 실행의 보고서를 삭제하지 않는다.

## 규칙과 다음 작업

[현재 구조](ARCHITECTURE.md), [FRONT_AGENT](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md), [결정 006](../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/DECISIONS/006_bonsai_uxui_only_phase.md)을 따른다. 컴포넌트·hook·함수에 한 줄 한글 책임 주석을 작성한다.

G02의 시각 차이·원본 모바일/자동 전환·자산 사용 조건은 결과 문서의 대기 항목이다. G03은 공개 메뉴·폰트·로컬 인계 기반을 소비한다. 내부 앱 Outfit의 원본 동일성은 미확인이다. 후속 Goal 자동 착수·커밋·배포는 하지 않는다.
