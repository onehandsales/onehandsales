# FE 작업 시작점

대상은 `FE/user-web`의 Bonsai 공개 웹·인증·업무 앱·외부 수신자 화면이다. 실제 코드 변경은 후속 Goal 실행에서 진행한다. 기존 Admin Web은 별도 제품 운영 도구이며 고객 포털로 바꾸지 않는다. User Web과 Admin Web 코드를 공유하지 않는다.

- [웹 구현 기준](USER-WEB-TODO.md)
- [사용자 흐름](../COMMON/USER-FLOW.md)
- [로그인 전 공개 웹](../COMMON/PUBLIC-WEB.md)
- [Goal 순서](../COMMON/GOAL-WORK-ORDER.md)
- [추가 분석](../COMMON/RESEARCH-GOALS/README.md)

현재 모든 FE Goal은 미착수다. 기존 코드의 일부 재사용 가능성은 G00/G01에서 실제 구조를 확인한 후 판단한다.

## G02 재점검 상태 — 2026-11-20

[이번 결과](../RESULTS/G02_RECHECK_RESULT.md): 모바일 메뉴/초점·중복 제출·시각 치수 보완 및2차 검토. typecheck/lint/build, unit9/9, dev/build Chromium E2E 각15/15 통과.17상태 비교 수행, 잔여 시각 차이·원본 동작·추가 환경 검증 대기. G02 전체 완료는 보류하고 G03은 시작하지 않았다.
