# G05 Deal Record Summary Backend

상태: Ready
목표: 목록 summary Backend 구현

## 1. 목적

`COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md` 기준으로 딜/담당자 목록 summary를 Backend에 반영한다.

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
- 고급 검색/필터
- 딜 가능성/확률
- generic summary endpoint

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

## 7. 완료 기준

- API spec과 response DTO가 일치한다.
- 기존 FE가 깨지지 않는다.
- aggregation ownership test가 있다.
- page size 15 계약이 확인됐다.
