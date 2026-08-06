# G05 Deal Record Summary Backend

상태: Completed
목표: 목록 summary Backend 구현
완료일: 2026-07-26
최종 업데이트: 2026-08-06

## 1. 목적

`COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md` 기준으로 딜/담당자 목록 summary를 Backend에 반영한다.

상위 backlog 기준으로는 `NBA-001`, `NBA-002`, `NBA-008`, `NBA-003`의 Deal latest activity subset만 구현한다.

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 G05 후속으로 계약화/구현하지 않는다.

## 2. 선행 조건

- G04 완료

## 3. 포함 범위

- `GET /api/deals` item `products` 추가
- `GET /api/deals` item `latestActivity` 추가
- `GET /api/contacts` item `dealCount` 추가
- page size 15 Backend/API/test 정리
- ownership/soft delete aggregation test

## 4. 제외 범위

- 회사/제품 latest activity summary
- Contact latest activity summary
- latest memo summary
- next action summary 신규 계산
- 고급 검색/필터
- 딜 가능성/확률
- generic summary endpoint
- record별 상세 activity timeline

## 5. Backend 기준

- current page deal IDs/contact IDs 기준으로 aggregation한다.
- 다른 사용자 record를 포함하지 않는다.
- soft-deleted deal은 count/latest summary에서 제외한다.
- latest activity summary에는 safe title/summary만 포함한다.

## 6. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- deal
pnpm run test -- contact
pnpm run build
```

추가 검증:

```powershell
cd BE
pnpm run test -- ownership-isolation
```

## 7. 완료 기준

- API spec과 response DTO가 일치한다.
- 기존 FE가 깨지지 않는다.
- aggregation ownership test가 있다.
- page size 15 계약이 확인됐다.

## 8. 완료 기록

- `GET /api/deals` item에 `products` summary와 `latestActivity` summary를 추가했다.
- `GET /api/contacts` item에 현재 사용자 소유 active deal 기준 `dealCount`를 추가했다.
- 딜/담당자 목록 모두 Backend service page size 15 응답 계약을 테스트로 확인했다.
- products/latest activity/dealCount aggregation은 현재 page ID 기준으로 조회하며 ownership과 soft-deleted deal 제외 조건을 포함한다.
- latest activity summary는 `body`, `metadataJson`, `linkedRecordsJson` 없이 안전한 `title`, `summary`, `occurredAt`만 응답한다.

검증 통과:

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- deal
pnpm run test -- contact
pnpm run build
```
