# Company Backend TODO Archive

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 현재 Backend 범위

- 회사 목록, 상세, 생성, 수정
- 회사 분야 목록, 생성, 삭제
- 회사 지역 목록, 생성, 삭제
- 회사 목록 xlsx export
- 모든 회사/옵션 조회와 변경의 current user ownership 검증

## 현재 검증 기준

- `pnpm --dir BE run prisma:validate`
- `pnpm --dir BE run prisma:generate`
- `pnpm --dir BE run typecheck`
- `pnpm --dir BE run lint`
- `pnpm --dir BE test`
- `pnpm --dir BE run build`
