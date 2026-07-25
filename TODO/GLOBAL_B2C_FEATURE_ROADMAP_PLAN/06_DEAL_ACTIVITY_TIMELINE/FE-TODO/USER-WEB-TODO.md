# User Web TODO

상태: Confirmed
확정일: 2026-07-25

## 1. 목적

06 User Web 작업은 딜 상세 activity timeline을 만들고, 이후 목록 summary를 반영한다.

정본 계약:

- `COMMON/USER-FLOW.md`
- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/API-SPEC/DEAL_ACTIVITY_API.md`
- `COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md`
- `COMMON/ARCHITECTURE-GUARDRAILS.md`

## 2. G04 Deal Activity User Web

### 화면

- `/app/deals/:dealId`
- Deal detail panel/page

### 작업

- `DealActivity` type 추가
- `listDealActivities`, `createManualDealActivity`, `updateManualDealActivity` API client 추가
- `dealQueryKeys.activities(dealId)` 추가
- `useDealActivities` hook 추가
- manual create/update mutation 추가
- `DealActivityTimelineSection` component 추가
- `DealActivityItem` component 추가
- `DealActivityFormDialog` 또는 panel 추가
- loading/empty/error/success state 추가

### UX

- section title: `딜 활동`
- CTA: `활동 추가`
- manual type label: `통화`, `미팅`, `이메일`, `방문`, `기타`
- empty: `활동을 남기면 딜 진행 흐름을 여기에서 볼 수 있어요.`
- create success: `활동을 남겼어요.`
- update success: `활동을 저장했어요.`
- future occurredAt validation: `발생 시각은 현재보다 미래로 설정할 수 없어요.`

### 금지

- 자동 activity에 수정 버튼을 노출하지 않는다.
- 수동 activity 삭제 UI를 만들지 않는다.
- follow-up 본문 전체를 timeline item에 바로 노출하지 않는다.
- API 응답에 없는 summary를 FE에서 만들지 않는다.

## 3. G06 Deal Record Summary User Web

### 화면

- `/app/deals`
- `/app/contacts`

### 작업

- Deal list item type에 `products`, `latestActivity` 반영
- Contact list item type에 `dealCount` 반영
- 딜 목록 row/card에 제품 summary 표시
- 딜 목록 row/card에 최신 activity 표시
- 담당자 목록 row/card에 연결 딜 수 표시
- 긴 텍스트 overflow 처리

### UX

- desktop은 조밀한 record table을 유지한다.
- mobile은 card/list로 표시한다.
- page size 숫자를 FE 단독으로 바꾸지 않는다.
- latest activity가 null이면 빈 값을 꾸미지 않는다.

## 4. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

필요하면:

```powershell
cd FE/user-web
pnpm run test:e2e:mobile
```

## 5. 완료 기준

- 딜 상세 timeline이 동작한다.
- 수동 activity 생성/수정이 가능하다.
- 자동 activity는 수정할 수 없다.
- 딜 목록 summary가 API 응답 기준으로 표시된다.
- 담당자 dealCount가 API 응답 기준으로 표시된다.
- 모바일에서 텍스트와 버튼이 겹치지 않는다.
