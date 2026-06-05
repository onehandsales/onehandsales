# FE

Frontend 앱은 제품 사용 면에 따라 분리한다.

## 앱

- `user-web`: 사용자가 직접 쓰는 Web MVP
- `admin-web`: 운영자를 위한 Admin Web 앱

각 앱은 자기 package dependency를 가진다. monorepo root에는 공유 frontend package를 두지 않는다.

## 로컬 실행

각 앱은 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다. 각 앱은 `.nvmrc`와 `engines` 기준을 Node 24로 맞춘다.

User Web 실행:

```bash
cd FE/user-web
pnpm install
pnpm run dev
```

Admin Web 실행:

```bash
cd FE/admin-web
pnpm install
pnpm run dev
```

로컬 포트:

- User Web: `http://localhost:5173`
- Admin Web: `http://localhost:5174`

두 frontend 앱은 Vercel에서 별도 프로젝트로 배포한다.

## 정본 규칙

User Web 정본:

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

Admin Web 정본:

- `../AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `../AGENT/SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`

공통 주석/로깅:

- `../AGENT/SOFTWARE_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
