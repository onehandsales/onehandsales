# Implementation Status

## 현재 활성 범위

- Backend: Auth/User, Company, Contact, Product, Deal, Search, Trash, Product Analytics, Error Report, Support Request, Public Contact Request, Health, `GET /admin/api/me`
- Frontend User Web: `/app` 홈, 회사, 담당자, 제품, 딜, 검색, 휴지통, 더보기/계정 모달, 도움말 접수
- Frontend Admin Web: access token 입력 후 관리자 권한 확인
- Prisma: 현재 활성 도메인 모델만 유지

## 검증 기준

- BE typecheck/lint/test/build
- FE/user-web typecheck/lint/test/build/e2e
- FE/admin-web typecheck/lint/build/e2e
- Prisma validate/generate

## 문서 기준

문서는 현재 코드에 남아 있는 기능만 활성 범위로 설명한다. 제거된 도메인은 전용 문서 파일을 삭제하지 않고 비활성 문서로만 남긴다.
