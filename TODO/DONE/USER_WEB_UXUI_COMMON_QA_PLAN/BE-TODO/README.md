# BE-TODO

이번 `USER_WEB_UXUI_COMMON_QA_PLAN`은 Backend 구현 계획이 아니다.

## 원칙

- 새 Backend API를 추가하지 않는다.
- Prisma schema/migration을 변경하지 않는다.
- API contract를 새로 만들지 않는다.
- User Web UX/UI에서 처리 가능한 layout, 상태, 문구, 접근성 문제는 FE에서 처리한다.
- 단, API/DB 표현이 `Notion + Attio` 기준의 고정 sales record, linked record, property/activity/Memo 구조와 충돌하면 별도 Backend/DB 계획으로 분리한다.

## Backend로 분리해야 하는 경우

아래가 발견되면 이 계획에서 임의 수정하지 않고 별도 Backend/DB 계획을 만든다.

- 다른 사용자 데이터가 노출된다.
- Search, Trash, Export ownership isolation 문제가 있다.
- 삭제된 리소스 접근 error code가 FE에서 안전하게 처리되지 않는다.
- OCR/AI/STT/Import provider failure가 내부 provider, quota, API key, stack trace를 사용자에게 노출한다.
- API validation response가 field-level error UX를 만들 수 없을 정도로 부족하다.
- Prisma generate/migration/seed 운영 정합성 문제가 확인된다.

## 관련 문서

- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/API-TODO.md`
- `TODO/USER_WEB_UXUI_COMMON_QA_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`
