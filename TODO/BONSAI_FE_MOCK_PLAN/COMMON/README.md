# 공통 문서

현재 동작·검증 갱신: [G01~G15 감사 후 재점검](../RESULTS/G01_G15_RECHECK_RESULT.md). 기존 원본/시각/환경 대기는 유지한다.

현재 범위는 [UX/UI 재현 기준](UXUI-REPLICATION.md)을 따른다. 화면과 로컬 목만 구현하며 API/Backend/DB 작업은 포함하지 않는다.

- [사용자 흐름](USER-FLOW.md): 행위자·시작·정상 종료·복귀와 객체 연결.
- [로그인 전 웹](PUBLIC-WEB.md): 공개 화면 범위와 CTA 인계.
- [실행 순서](GOAL-WORK-ORDER.md): G/R을 함께 읽는 순서와 의존성.
- [착수 체크](START-CHECKLIST.md): 해당 기능의 추가 분석을 잊지 않기 위한 필수 절차.
- [G 명세](GOAL-SPECS/README.md) · [R 명세](RESEARCH-GOALS/README.md).
- [플로우 대응표](FLOW-GOAL-MATRIX.md) · [추가 구현 대기표](EXPANSION-BACKLOG.md).
- [로컬 목 화면 상태](MOCK-UI-STATE.md) · [기획 검토](PLANNING-REVIEW.md) · [문서화 기록](DOCUMENTATION-WORK-LOG.md).
- [기계용 색인](PLAN-INDEX.json): 번호·출처·단계 소유·선행 조건·R 소비 관계. 원본 분석 자체를 대체하지 않는다.

상태는 문서 작성, 조사, FE 코드 반영, 목 검증, 실제 연동 검증을 따로 기록한다. R 결과나 기능 범위를 변경하면 명세·순서표·대응표·색인을 함께 갱신한다.
