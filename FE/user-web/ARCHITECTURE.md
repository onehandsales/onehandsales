# User Web 구조

2026-11-20 G02 기준. 기존 실제 인증·범용 CRM·SEO 생성 소스는 제거했고 Git 이력으로 확인한다. [G01 기반](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G01_RESULT.md)과 [G02 공개 웹](../../TODO/BONSAI_FE_MOCK_PLAN/RESULTS/G02_RESULT.md)의 실행 결과·검토·대기 항목을 구분한다.

## 책임과 의존

~~~text
main → app/providers + router + layouts
       → pages → feature 공개 export → hooks → data-source interface
                                  → 공통 UI       ↑
                       app에서 주입한 메모리 runtime
~~~

| 경로 | 책임 |
| --- | --- |
| app | runtime 생성, scope별 QueryClient, 실제 Router, 화면 경계 조합 |
| pages | route 해석·feature 조합·페이지 레이아웃 |
| features/public-web | 공개 메뉴·랜딩·로컬 목적지·이메일 인계. provider가 초안, hook이 메뉴, 각 섹션이 선택 상태를 소유 |
| features/preview/components | 가상 세션·편집 폼·개발 도구 |
| features/preview/hooks | 조회·초안·변경 snapshot·취소·재시도 |
| features/preview/data·model | FE 내부 공급자 타입·scope·query key·표시 타입 |
| mocks | 단일 원본 store·고정 seed/clock·실패·지연·초기화 |
| components/ui | 업무 중립 Button·Field·Dialog·상태 표시 |
| styles | 원본 관찰값과 추정값을 구분한 공통 token |

공통 UI는 feature/page를 참조하지 않는다. feature UI는 seed나 구체 저장소를 선택하지 않는다. app/layouts는 feature와 공통 UI를 조합한다. 미래 기능용 빈 폴더·HTTP adapter·범용 저장소 framework는 만들지 않는다.

## 상태 수명

store가 저장값, Query가 조회 캐시, editor hook이 초안을 소유한다. scope는 actor/workspace/revision/memory 모드를 포함한다. scope 변경은 QueryClient·진행 작업·초안을 폐기하며 저장 직전에 다시 scope를 확인한다.

전체 새로고침은 메모리를 초기화한다. 같은 탭 재로그인은 저장값을 유지하고 화면 초안을 폐기한다. Reset은 seed와 세션·시각·장애까지 초기화한다. 읽기 결과는 복사본이며 실패 저장은 일부 값을 반영하지 않는다.

정상180ms·slow1500ms와 한 번 실패 후 재시도는 UX 검증을 위한 임시 정책이다. Bonsai 서버 정책이 아니다. 공개 공유 샘플은 내부 store와 별도이며 실제 공유 권한 규칙을 정의하지 않는다.

## 실행 경계와 검증

공개 /, 가상 인증 /login, 내부 /app, 외부 읽기 /share, 표본 /components를 실제 라우터로 분리했다. 주소를 보호한다는 것은 가상 UI 검증이며 보안 인증이 아니다.

실제 인증 provider·Supabase·HTTP client·API env 연결은 없다. 개발 서버는 정적 리소스와 HMR, production은 정적 리소스만 요청한다. 테스트에서 요청을 가로채어 미연결을 주장하지 않는다.

G02의 RouteFrame이 공개·기반 경계의 초점/스크롤을 조정한다. PublicLayout은 Gellix/CSS·공통 메뉴/푸터를 조합하고 PreviewFrame은 G01 개발 도구를 유지한다. PublicProvider의 메모리 이메일·CTA는 가상 scope revision에 따라 폐기한다. 공개 페이지에 업무 Query나 HTTP adapter를 도입하지 않았다. sourceHref와 local path/Goal은 목적지 색인에서 구분한다.

Vitest는 저장소 수명·scope·취소·경합을, Playwright는 실제 navigation·폼·실패·초점·네트워크를 검증한다. 자세한 명령과 현재 범위는 [README](README.md)에 기록한다.
