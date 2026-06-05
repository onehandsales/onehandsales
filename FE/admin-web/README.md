# admin-web

운영자를 위한 Admin Web 앱이다.

## 초기 범위

- 사용자 목록과 상세
- 전체 딜 목록
- 전체 회사 목록
- 전체 거래처(담당자) 목록
- 전체 제품 목록
- 사용자별 딜/회사/거래처(담당자)/제품 조회
- 후속 범위: 수동 계좌이체 결제 상태 관리

Admin API는 `/admin/api/*`를 사용한다.

## 로컬 실행

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
pnpm run dev
```

로컬 URL: `http://localhost:5174`

Vercel 프로젝트 root: `FE/admin-web`
