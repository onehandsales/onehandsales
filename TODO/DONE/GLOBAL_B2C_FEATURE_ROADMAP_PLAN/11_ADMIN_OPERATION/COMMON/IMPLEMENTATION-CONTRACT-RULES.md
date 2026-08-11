# Implementation Contract Rules

상태: Confirmed

## 1. 구현 전

각 `/goal` 시작 전에 아래를 확인한다.

- 해당 goal spec의 상태가 `Confirmed`인지 확인한다.
- 관련 `COMMON/API-SPEC/*` 계약을 읽는다.
- `AGENT/UXUI_AGENT`를 읽고 Admin UI 방향을 확인한다.
- `AGENT/SOFTWARE_AGENT`의 Backend/Frontend/DB 컨벤션을 확인한다.
- `BE/prisma/schema.prisma`와 현재 migration 목록을 확인한다.
- 다른 터미널에서 작업 중인 10번 Mobile/PWA 파일과 충돌하지 않는다.

## 2. API 문서 기준

새 endpoint 또는 request/response 변경이 있으면:

- `COMMON/API-SPEC` 문서를 먼저 갱신한다.
- request DTO 이름을 적는다.
- response DTO 이름을 적는다.
- transaction 계약을 적는다.
- observability/audit/redaction 계약을 적는다.
- error code와 FE 처리를 적는다.

## 3. DB 문서 기준

DB 변경이 있으면:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/BE-TODO/DB-SCHEMA.md`를 갱신한다.
- Prisma schema 신규 model/field/enum에 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에 `COMMENT ON TABLE`, `COMMENT ON COLUMN`, `COMMENT ON INDEX` 또는 `-- 기능 : ...` 주석을 추가한다.
- `BE/prisma/seed.ts` 영향 여부를 명시한다.
- 공유/운영 DB migrate/seed 실행 여부를 검증 기록에 남긴다.

## 4. 주석 기준

Backend:

- class 역할: `// 역할 : ...`
- API method: `// API : ...`
- 주요 business method: `// 기능 : ...`

Frontend:

- 복잡한 page/data hook/component에는 `// 기능 : ...` 주석을 사용한다.
- 단순 JSX 반복 설명 주석은 쓰지 않는다.

DB:

- Prisma schema에는 `/// 기능 : ...`
- migration SQL에는 `COMMENT ON ...` 또는 `-- 기능 : ...`

## 5. 검증 기록

각 goal 완료 시 goal 문서의 체크리스트와 완료 기록을 갱신한다.

필수 기록:

- 실행한 command
- 통과/실패 결과
- 실행하지 못한 검증과 이유
- DB migration 여부
- User Web/Admin Web 영향
- audit/redaction 검토 결과
