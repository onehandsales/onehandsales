# SOFTWARE_AGENT Front/Backend 분리 결정

## 1. 결정

`AGENT/SOFTWARE_AGENT`의 직접 하위 구조는 다음 세 폴더만 둔다.

```text
SOFTWARE_AGENT/
  FRONT_AGENT/
  BACKEND_AGENT/
  DB_SCHEMA/
```

`FRONT_AGENT`는 User Web과 Admin Web의 Frontend 구현 기준을 관리한다.

`BACKEND_AGENT`는 Backend 구현 기준을 관리한다.

`DB_SCHEMA`는 DB schema와 테이블 설명을 관리한다.

## 2. 이유

기존 `SOFTWARE_AGENT/ARCHITECTURE`, `SOFTWARE_AGENT/CONVENTION`, `SOFTWARE_AGENT/DECISIONS` 구조는 한 문서나 한 폴더 안에 Backend, User Web, Admin Web 기준이 섞일 수 있었다.

Frontend와 Backend는 같은 제품 요구사항을 구현하지만 책임과 검토 기준이 다르다. Backend는 API, transaction, ownership, Prisma, provider adapter, audit log가 중심이고, Frontend는 화면, 상태 관리, form validation, API client, E2E, Vercel 배포가 중심이다.

따라서 Software 문서는 기술 성격별 폴더가 아니라 구현 책임별 Agent 폴더로 분리한다.

## 3. 적용 규칙

- `SOFTWARE_AGENT` 직하에는 `FRONT_AGENT`, `BACKEND_AGENT`, `DB_SCHEMA` 외의 폴더나 문서를 두지 않는다.
- Backend 관련 문서는 `SOFTWARE_AGENT/BACKEND_AGENT` 아래에 둔다.
- User Web/Admin Web 관련 문서는 `SOFTWARE_AGENT/FRONT_AGENT` 아래에 둔다.
- DB schema 관련 문서는 `SOFTWARE_AGENT/DB_SCHEMA` 아래에 둔다.
- Backend와 Frontend에 모두 영향을 주는 결정은 PM 결정 문서에 최종 기록하고, 각 Agent 문서에는 자기 역할에 필요한 내용만 반영한다.

## 4. 관련 문서

- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
