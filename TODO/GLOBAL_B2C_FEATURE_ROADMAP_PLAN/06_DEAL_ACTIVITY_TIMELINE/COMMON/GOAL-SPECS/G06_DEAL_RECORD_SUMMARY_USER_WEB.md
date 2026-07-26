# G06 Deal Record Summary User Web

상태: Completed
목표: 목록 summary User Web 구현
완료일: 2026-07-26

## 1. 목적

G05 Backend summary를 User Web 목록에 반영한다.

FE는 `COMMON/SOURCE-PLAN-COVERAGE.md` 기준으로 06에 승격된 summary만 표시한다.

## 2. 선행 조건

- G05 완료

## 3. 포함 범위

- Deal list type/client 업데이트
- Contact list type/client 업데이트
- 딜 목록 products summary 표시
- 딜 목록 latest activity 표시
- 담당자 목록 dealCount 표시
- desktop/mobile list layout 점검

## 4. 제외 범위

- 회사/제품 latest activity summary
- Contact latest activity summary
- latest memo summary
- next action summary 신규 표시
- 고급 필터 UI
- page size 변경
- 목록 전체 redesign

## 5. UX 기준

- 딜 목록에서는 제품과 최신 활동을 짧게 표시한다.
- 담당자 목록에서는 연결 딜 수를 업무 판단 정보로 표시한다.
- desktop은 48px 수준 row density를 유지한다.
- mobile은 card/list에 summary를 접지 않고 읽을 수 있게 배치한다.
- 응답이 null이면 표시하지 않고 FE에서 추정하지 않는다.

## 6. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 완료 기준

- 딜 목록 summary가 API 응답 기준으로 표시된다.
- 담당자 dealCount가 API 응답 기준으로 표시된다.
- 긴 제품명/activity title이 layout을 깨지 않는다.
- 모바일에서 목록 카드가 겹치지 않는다.

## 8. 구현 기록

- Deal list item type에 `products`, `latestActivity` summary를 추가했다.
- Contact list item type에 `dealCount`를 추가했다.
- `/app/deals` desktop record table에 `제품`, `최근 활동` 열을 추가했다.
- `/app/deals` mobile card에 제품과 최신 활동 summary를 줄바꿈 가능한 행으로 표시했다.
- `/app/contacts` desktop/mobile 목록에 API 응답의 `dealCount`만 표시했다.
- FE가 `updatedAt`, `latestFollowingAction` 등으로 latest activity fallback을 만들지 않게 정리했다.
- E2E mock list response를 `pageSize: 15`, page slicing, G05 summary 응답 형태에 맞췄다.

## 9. 검증 기록

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm exec playwright test tests/e2e/deal-record-summary.spec.ts
pnpm run test:e2e
```

결과: 모두 통과.
