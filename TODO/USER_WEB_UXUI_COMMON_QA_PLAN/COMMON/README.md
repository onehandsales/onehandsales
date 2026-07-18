# COMMON

이 폴더는 `USER_WEB_UXUI_COMMON_QA_PLAN`의 공통 계약과 goal 실행 순서를 관리한다.

## 문서 목록

- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서와 의존성
- `UXUI-QA-SCOPE.md`: 이번 UX/UI 공통 QA의 상세 범위
- `ISSUE-LOG.md`: 발견 이슈와 처리 상태
- `API-SPEC/README.md`: 이번 계획의 API 계약 기준
- `GOAL-SPECS/*`: 개별 `/goal` 작업 명세

## 공통 원칙

- 이번 계획은 FE/user-web UX/UI 공통 QA다.
- 전역 UX/UI reference는 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`다.
- 모든 goal은 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 먼저 읽고, workspace/page/database/detail과 CRM record/linked record/activity 기준을 함께 적용한다.
- 새 Backend API나 DB schema 변경은 기본 범위가 아니다.
- 기능을 새로 만들기보다 이미 구현된 핵심 기능의 화면 품질, 상태, 문구, 접근성을 정리한다.
- 390px/360px 모바일 브라우저 전용 QA는 후속 계획으로 분리한다.
- 발견 이슈는 S0/S1/S2/S3/S4로 분류한다.
- Notion/Attio의 브랜드, 문구, 고유 화면, visual asset, pixel-level layout은 복제하지 않는다.
