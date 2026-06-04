# TODO

## 1. 목적

이 폴더는 `한손에 영업 / onehand.sales`의 구현 계획별 실행 작업 목록을 정리한다.

`AGENT` 문서가 제품과 아키텍처의 정본이라면, `TODO` 문서는 특정 기획 또는 구현 계획을 실제 작업 단위로 쪼개는 실행 문서다. 구현 중 새로운 결정이 생기면 먼저 관련 역할의 `DECISIONS`에 확정 내용을 남기고, 그 결과를 해당 계획 폴더의 TODO 문서에 반영한다.

## 2. 폴더 구조

```text
TODO/
  README.md
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

`TODO` 바로 아래에는 기획 또는 구현 계획 단위의 폴더를 만든다. 그 계획 폴더 안에서 `FE-TODO`, `BE-TODO`처럼 작업 영역을 나눈다.

예:

- `MVP-STARTER_PLAN`: MVP 구현 시작을 위한 전체 작업 계획
- `IMPORT_EXPORT_PLAN`: Import/Export 기능 상세 구현 계획
- `PAYMENT_MANUAL_PLAN`: 계좌이체 수동 결제 관리 구현 계획

## 3. 작업 기준

- 모든 문서는 한국어로 작성한다.
- `TODO` 바로 아래에는 작업 주제별 계획 폴더를 만든다.
- 각 계획 폴더 안에는 필요한 경우 `FE-TODO`, `BE-TODO`, `USER-FLOW.md`, `README.md`를 둔다.
- 구현 순서는 MVP 핵심 루프를 우선한다.
- 외부 Provider 연동은 처음부터 직접 호출하지 않고, Backend port/interface 뒤에 숨긴다.
- User Web과 Admin Web은 코드를 공유하지 않는다.
- 루트에는 `package.json`과 workspace 설정을 만들지 않는다.
- Backend는 하나의 NestJS 서버로 시작하되 User API와 Admin API를 분리한다.

## 4. 구현 우선순위

현재 계획:

- `MVP-STARTER_PLAN`

MVP 시작 계획의 구현 우선순위:

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
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`


