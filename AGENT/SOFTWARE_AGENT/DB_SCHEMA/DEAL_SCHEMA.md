# Deal DB Schema

현재 비활성 문서다.

2026-09-10 기준 `BE/prisma/schema.prisma`에는 Deal 계열 모델이 남아 있지 않다.

- `Deal`
- `DealCompany`
- `DealContact`
- `DealProduct`
- `DealFollowingActionLog`
- `DealMemoLog`
- `DealActivity`

`BE/src/modules/deal`에는 런타임 TypeScript 코드가 없고 `/api/deals` API도 제공하지 않는다. 과거 딜 도메인 구현 맥락이 필요할 때만 git history 또는 archived TODO 문서를 확인한다.
