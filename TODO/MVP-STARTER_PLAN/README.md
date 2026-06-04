# MVP Starter Plan

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales` MVP 구현을 시작하기 위한 실행 계획을 정리한다.

제품 정본은 `AGENT` 문서에 있고, 이 폴더는 실제 구현자가 Frontend와 Backend 작업을 어떤 순서로 진행해야 하는지 확인하기 위한 작업 문서다.

## 2. 폴더 구조

```text
MVP-STARTER_PLAN/
  README.md
  USER-FLOW.md
  GOAL-WORK-ORDER.md
  FE-TODO/
    README.md
    USER-WEB-TODO.md
    ADMIN-WEB-TODO.md
  BE-TODO/
    README.md
    API-TODO.md
    DB-SCHEMA.md
```

## 3. 작성 원칙

- 모든 문서는 한국어로 작성한다.
- 기획자 관점에서 사용자 흐름, 포함 범위, 제외 범위, 완료 기준을 함께 적는다.
- FE와 BE는 같은 계획 폴더 안에서 나누어 관리한다.
- 실제 구현은 `GOAL-WORK-ORDER.md`의 작업 단위 순서대로 나누어 진행한다.
- 한 번의 `/goal`에는 하나의 작업 단위만 넣는다.
- API 명세와 DB 스키마는 `BE-TODO`에 둔다.
- 화면, 컴포넌트, 상태 관리, E2E 작업은 `FE-TODO`에 둔다.

## 4. 구현 우선순위

상세 작업 단위는 `GOAL-WORK-ORDER.md`를 따른다.

1. 프로젝트 스캐폴딩
2. DB 스키마와 Prisma 설정
3. 인증과 사용자 데이터 분리
4. 회사/거래처(담당자)/제품 CRUD
5. 딜 CRUD와 딜 활동 로그
6. 일정 CRUD와 주간 일정 보고서
7. 회의록 저장과 딜 연결
8. 명함 OCR, Import/Export, 알림
9. Admin Web 기본 조회와 민감정보 감사 흐름
10. Playwright E2E와 Backend 위험 흐름 테스트

## 5. 관련 정본 문서

- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`

## 6. 관련 TODO 문서

- `TODO/MVP-STARTER_PLAN/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/README.md`


