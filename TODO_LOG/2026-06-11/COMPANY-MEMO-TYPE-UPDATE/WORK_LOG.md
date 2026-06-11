# Company Memo Type Update Work Log

## 요청

- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`에서 `memo`뿐 아니라 `memoType`도 수정되게 변경한다.

## 변경

- `UpdateCompanyMemoLogDto`가 `memoType`, `memo`를 모두 필수 문자열로 받도록 변경했다.
- Company controller가 메모 수정 request body 전체를 application service로 전달하도록 변경했다.
- Company application service가 `memoType`, `memo`를 각각 trim 및 필수값 검증 후 repository에 전달하도록 변경했다.
- Prisma company repository가 `CompanyMemoLog.memoType`, `CompanyMemoLog.memo`를 함께 업데이트하도록 변경했다.
- Company API 명세와 FE/BE TODO 기준을 `memoType`, `memo` 동시 수정으로 갱신했다.

## 검증

- `pnpm.cmd typecheck` 통과
- `pnpm.cmd lint` 통과
- 검증 중 로컬 Node 버전이 `v20.11.0`이라 repo 요구 조건 `>=24 <25` 경고가 출력됐다.
