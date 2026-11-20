# TODO

갱신: 2026-11-20 KST · 제품·UX 기준: **Bonsai**

**현재는 프론트 UX/UI만 작업한다. 인증을 포함한 모든 실제 API 연결과 Backend·DB 설계는 현재 범위에서 제외한다.** [UX/UI 재현 기준](BONSAI_FE_MOCK_PLAN/COMMON/UXUI-REPLICATION.md)을 모든 Goal에 적용한다.

현재 계획은 [Bonsai FE 목 개발 계획](BONSAI_FE_MOCK_PLAN/README.md)이다. 로그인 전 공개 웹부터 가입·로그인, 내부 업무와 외부 고객 화면까지 먼저 독립적인 목으로 구현하고, 검증된 UX/UI·Bonsai 공식 도움말·공식 REST API 자료를 바탕으로 후속 API/DB 계약을 설계한다.

## 시작 위치

- [사용자 흐름](BONSAI_FE_MOCK_PLAN/COMMON/USER-FLOW.md): 방문자·멤버·외부 고객의 진입과 복귀.
- [로그인 전 화면](BONSAI_FE_MOCK_PLAN/COMMON/PUBLIC-WEB.md): 랜딩·제품 소개·가격·템플릿·도움말과 인증 연결.
- [Goal 실행 순서](BONSAI_FE_MOCK_PLAN/COMMON/GOAL-WORK-ORDER.md): 공통·구현·검증 85개와 추가 분석 22개.
- [추가 분석 목록](BONSAI_FE_MOCK_PLAN/COMMON/RESEARCH-GOALS/README.md): 해당 기능 착수 전 확인할 질문과 산출물.
- [기획 검토](BONSAI_FE_MOCK_PLAN/COMMON/PLANNING-REVIEW.md): 실행 가능한 범위와 보류 조건.

## 운영 규칙

1. 사용자 요청 범위와 현재 Git 변경을 먼저 확인한다. 이번 요청은 TODO 문서 작성이며 구현이나 커밋 완료를 뜻하지 않는다.
2. [PM 제품 결정](../AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), [UX 기준](../AGENT/UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md), [FRONT_AGENT](../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md)를 읽는다. 현재 사용자 지시에 따라 Backend 문서·계약 검토는 FE 착수 조건으로 적용하지 않는다.
3. [시작 체크리스트](BONSAI_FE_MOCK_PLAN/COMMON/START-CHECKLIST.md)를 거쳐 한 번에 하나의 Goal을 실행한다. 선행 분석 결과와 구현 의존성을 확인한다.
4. 관찰·문서 근거·목 가정·실제 계정 검증을 구분한다. 정적 화면이나 목 검증만으로 Bonsai 전체 기능·실서버 연동 완료를 선언하지 않는다.
5. 구현 중 새 결정은 해당 AGENT 정본과 TODO 명세에 함께 남긴다. 새 기능은 명세·순서·선행 조건·검증 담당을 배정한다.
6. 실제 API 구현은 계약 확정 후 별도 단계로 진행한다. 현재 계획에서 BE·DB·환경을 변경하거나 기존 테이블을 삭제하지 않는다.
7. 완료는 요구 범위·검증·검토 결과가 기록됐을 때만 표시한다. 미해결 항목은 담당 Goal과 영향 행동을 남긴다. 후순위는 전체 목표에서 제외한다는 뜻이 아니다.

현재 계획은 `README.md`, `COMMON`의 흐름·순서·화면 명세·검토, `FE-TODO`로 관리한다. 이번 요청으로 TODO 접근을 허용하며, 별도 제외 경로인 TODO_LOG는 접근하지 않고 [현재 문서화 기록](BONSAI_FE_MOCK_PLAN/COMMON/DOCUMENTATION-WORK-LOG.md)을 사용한다.
