# G07 QA Review Closeout

상태: Ready
목표: 06 구현 검증과 문서 closeout

## 1. 목적

G02~G06 구현 결과가 API/DB/FE/UX/보안 기준과 일치하는지 검토한다.

## 2. 포함 범위

- Backend 검증 명령 실행
- User Web 검증 명령 실행
- ownership/security/redaction 확인
- transaction 확인
- mobile/desktop UX 확인
- 문서 상태 갱신
- `COMMON/REVIEW-CHECKLIST.md` closeout

## 3. Backend 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## 4. User Web 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

필요하면 mobile E2E 또는 수동 QA:

```powershell
cd FE/user-web
pnpm run test:e2e:mobile
```

## 5. Closeout 확인

- API-SPEC이 구현 결과와 일치한다.
- DB-SCHEMA가 구현 결과와 일치한다.
- FE-TODO가 구현 결과와 일치한다.
- README와 GOAL-COMPLETION-CHECKLIST를 갱신했다.
- 실제 실행하지 못한 검증은 사유를 남겼다.

## 6. 완료 기준

- S0/S1 blocker가 없다.
- private memo/provider raw/follow-up body 전체/meeting note raw text가 timeline summary/log에 노출되지 않는다.
- User Web이 `/admin/api/*`를 호출하지 않는다.
- G07 work log를 남길 준비가 됐다.
