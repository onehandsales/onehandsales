# Deal Work Split

## 1. Backend 책임

상태: completed

- [x] Prisma schema에 `Deal`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog`를 추가한다.
- [x] migration을 생성하고 Prisma Client를 갱신한다.
- [x] 코드 단 DealStatus enum과 label mapper를 만든다.
- [x] `deal` Nest module을 `domain`, `application`, `infrastructure`, `presentation` 경계에 맞게 구현한다.
- [x] Company, Contact, Product ownership과 Contact-Company 관계를 검증한다.
- [x] 목록, 상세, 생성, 수정, 옵션, export, 다음 행동 로그, 메모 로그 API를 구현한다.
- [x] Deal 생성 시 Deal, DealProduct, 최초 다음 행동 로그 생성을 transaction으로 묶는다.
- [x] Deal 수정 시 productIds가 전달되면 DealProduct 연결을 교체한다.
- [x] 로그 생성/수정 API는 deal ownership과 log ownership을 모두 검증한다.
- [x] mutation과 export에 observability event를 남긴다.
- [x] unit/controller test와 clean schema migration 검증으로 주요 API 계약을 확인한다.

## 2. Frontend 책임

상태: pending

- 기존 딜 화면에서 예전 mock/stale API 계약을 제거한다.
- `FE/user-web`의 API client와 TanStack Query hook을 새 Deal API 계약에 맞춘다.
- 딜 목록 split view를 구현하거나 현재 UI를 새 계약에 맞게 재구성한다.
- 단계별 개수, 검색, 회사/담당자/상태 필터, 정렬, 10개 페이지네이션을 연결한다.
- 회사/담당자/제품 옵션을 생성/수정 form에 연결한다.
- 제품은 `productIds` 배열로 1개 이상 선택한다.
- 상세, 수정, 다음 행동 로그, 메모 로그, export를 연결한다.
- loading, empty, error, mutation pending 상태를 제공한다.
- Desktop과 Mobile에서 텍스트 겹침 없이 사용할 수 있게 검증한다.

## 3. 공통 책임

- `COMMON/API-SPEC/DEAL_API.md`와 `DEAL_API_DETAIL.md`를 API 계약의 기준으로 둔다.
- 계약 변경이 생기면 Backend와 Frontend goal 문서를 모두 갱신한다.
- FK 응답은 nested object 원칙을 유지한다.
- 딜 상세 제품 응답은 `products` 배열 원칙을 유지한다.
- export에서는 최근수정일을 제외하는 원칙을 유지한다.

## 4. 작업 순서

1. Backend Deal DB와 API 구현
2. Backend API 테스트와 contract 확인
3. User Web API client/hook 정리
4. User Web 딜 목록/상세/생성/수정 구현
5. 로그와 export UI 연결
6. 최종 수동 검증과 TODO_LOG 기록
