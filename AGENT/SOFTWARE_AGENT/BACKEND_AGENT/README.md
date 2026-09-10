# Backend Agent

Backend Agent는 NestJS, Prisma, Supabase Auth 연동, 핵심 CRM API, 제품 분석, 지원 접수, 관리자 권한 확인을 담당한다.

## 활성 모듈

- `auth`
- `user`
- `company`
- `contact`
- `product`
- `deal`
- `search`
- `trash`
- `analytics`
- `error-report`
- `support-request`
- `public-contact-request`
- `health`
- `admin`

## 검증

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
