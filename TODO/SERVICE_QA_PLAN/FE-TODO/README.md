# Service QA FE TODO

## 1. 목적

User Web과 Admin Web의 QA 실행 항목을 관리한다. 이 문서는 구현 TODO가 아니라 QA 실행 TODO다.

## 2. 문서 목록

- `PAGE-API-QA-MATRIX.md`: 현재 FE route 기준 페이지별 API와 QA 항목
- `USER-WEB-QA.md`
- `ADMIN-WEB-QA.md`

## 3. FE 공통 기준

- User Web은 `/api/*`만 호출한다.
- Admin Web은 `/admin/api/*`만 호출한다.
- API 호출은 각 앱의 API client를 통해 수행한다.
- 직접 `fetch` 호출은 API client 파일에 한정한다.
- console에 token, email, phone, memo, meeting note body, admin raw reason이 노출되지 않아야 한다.
- Playwright mock 통과와 실제 BE 통합 통과를 별도로 기록한다.
- 수동 QA는 `PAGE-API-QA-MATRIX.md`의 페이지/API 단위로 진행하고 결과를 `../COMMON/QA-RESULTS.md`에 기록한다.
