# G01-BE-DEAL-DOMAIN

## 1. 목적

Backend에 딜 도메인의 DB 모델과 User API를 구현한다.

## 2. 범위

- Prisma schema에 Deal 관련 모델 4개 추가
- migration 생성
- DealStatus 코드 enum 추가
- `/api/deals/*` User API 구현
- xlsx export 구현
- API 테스트 추가

## 3. 제외

- Admin API
- 삭제 API
- 일정/회의록/자동화 연동
- DB enum

## 4. 구현 대상 API

- `GET /api/deals/stage-counts`
- `GET /api/deals`
- `GET /api/deals/:dealId`
- `POST /api/deals`
- `PATCH /api/deals/:dealId`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/:dealId/following-action-logs`
- `POST /api/deals/:dealId/following-action-logs`
- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `GET /api/deals/:dealId/memo-logs`
- `POST /api/deals/:dealId/memo-logs`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

## 5. 설계 기준

- Controller는 DTO validation과 auth user 추출만 담당한다.
- Application service가 use case 흐름과 transaction boundary를 담당한다.
- Repository만 Prisma Client를 직접 사용한다.
- 모든 조회는 `userId` 조건을 포함한다.
- FK 검증은 company/contact/products가 모두 같은 user 소유인지 확인한다.
- 딜 생성/수정 시 contact가 company에 속하는지 확인한다.
- 목록은 `search`, `companyId`, `contactId`, `dealStatus`, `sort`를 지원한다.
- stage counts는 `search`, `companyId`, `contactId`를 지원한다.
- 다음 행동 로그와 메모 로그 수정은 log가 해당 deal에 속하는지도 확인한다.
- export는 목록 조건을 재사용하되 page를 제외한다.

## 6. 완료 기준

- `BE/prisma/schema.prisma`에 Deal 모델과 relation이 추가된다.
- migration과 Prisma Client 생성이 완료된다.
- API 15개가 명세대로 구현된다.
- 생성 API는 Deal, DealProduct, 최초 다음 행동 로그를 transaction으로 생성한다.
- 목록은 최신 다음 행동 1개를 포함하고 제품은 제외한다.
- 상세는 `products` 배열을 포함한다.
- 옵션 3개, 다음 행동 로그, 메모 로그 정렬이 `createdAt DESC`다.
- export xlsx가 id, 제품, 최근수정일을 제외한다.
- 인증/ownership/validation/error 테스트가 통과한다.

## 7. 검증 명령

프로젝트 실제 script를 확인한 뒤 가능한 범위에서 실행한다.

```bash
cd BE
npm run lint
npm run test
npm run test:e2e
```

script가 없거나 환경 변수가 부족하면 실행하지 못한 이유를 TODO_LOG와 최종 보고에 남긴다.
