# G04 Deal Activity User Web

상태: Ready
목표: 딜 상세 activity timeline UX 구현

## 1. 목적

딜 상세에서 `딜 활동` timeline을 볼 수 있게 한다. 사용자는 수동 활동을 추가하고 수정할 수 있다.

## 2. 선행 조건

- G03 완료

## 3. 포함 범위

- deal activity API client/type/query key
- `COMMON/USER-FLOW.md` 기준의 딜 상세 확인/생성/수정 흐름
- `useDealActivities`
- 수동 activity create/update mutation
- 딜 상세 `딜 활동` section
- activity item component
- 수동 activity form/dialog
- loading/empty/error/success 상태
- mobile 390px/360px layout

## 4. 제외 범위

- 수동 activity 삭제 UI
- 목록 summary UI
- 메모 섹션 제거
- follow-up 상세 본문 timeline 직접 노출

## 5. UX 기준

- Notion식 detail page section으로 배치한다.
- Attio식 activity timeline처럼 시간, 유형, 연결 record가 분명해야 한다.
- 버튼 문구는 짧게 쓴다: `활동 추가`, `저장`, `닫기`.
- Empty state는 `활동을 남기면 딜 진행 흐름을 여기에서 볼 수 있어요.`를 기준으로 한다.
- 자동 activity에는 수정 action을 노출하지 않는다.
- 수동 activity만 수정 action을 노출한다.

## 6. FE 구조

- API: `FE/user-web/src/features/deal/api/deal-api.ts`
- Query key: `deal-query-keys.ts`
- Types: `features/deal/types/deal.ts`
- Components: `features/deal/components`
- Schema: `features/deal/schemas/deal-schema.ts`

## 7. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

필요하면 딜 상세 전용 Playwright smoke를 추가한다.

## 8. 완료 기준

- 딜 상세에서 timeline이 보인다.
- 수동 activity 생성/수정이 동작한다.
- mutation 후 timeline이 갱신된다.
- API 응답 없는 summary를 FE가 만들지 않는다.
- 모바일에서 텍스트와 버튼이 겹치지 않는다.
