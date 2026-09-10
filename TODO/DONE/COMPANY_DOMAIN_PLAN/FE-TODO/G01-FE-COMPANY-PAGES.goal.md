# G01 FE Company Pages

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 현재 완료 기준

- 회사 목록에서 검색, 분야/지역 필터, 페이지네이션을 사용할 수 있다.
- 회사 생성은 목록 맥락과 전체 화면 진입을 모두 지원한다.
- 회사 생성/수정/옵션 생성 성공 시 빈 body 응답을 성공으로 처리한다.
- 회사 목록 xlsx 다운로드는 파일명을 response header에서 우선 읽는다.
- 현재 활성 범위가 아닌 페이지는 `/app`으로 이동한다.

## 검증 기준

- `pnpm --dir FE/user-web run typecheck`
- `pnpm --dir FE/user-web run lint`
- `pnpm --dir FE/user-web run test`
- `pnpm --dir FE/user-web run build`
