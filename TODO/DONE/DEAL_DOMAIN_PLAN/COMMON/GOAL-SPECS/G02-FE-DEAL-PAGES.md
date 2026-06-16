# G02-FE-DEAL-PAGES

## 1. 목적

User Web 딜 화면을 새 Backend Deal API 계약에 맞게 구현한다.

## 2. 범위

- 딜 API client와 TanStack Query hook 정리
- 딜 목록 split view 구현 또는 기존 UI 재연동
- 단계별 개수, 목록, 상세 조회
- 검색, 회사/담당자/상태 필터, 정렬, 10개 페이지네이션
- 딜 생성/수정 form
- 회사/담당자/제품 옵션 조회
- 다음 행동 로그 목록/생성/수정
- 메모 로그 목록/생성/수정
- 딜 xlsx export

## 3. 제외

- Admin Web
- 삭제 UI
- 일정/회의록/자동화 화면 연동
- 성공 확률, 통화 선택, 예상 종료 시각

## 4. 기존 코드 정리 기준

- 예전 딜 계약 필드가 남아 있으면 제거한다.
- 제거 대상 예시:
  - `title`
  - `amount`
  - `currency`
  - `stage`
  - `likelihoodStatus`
  - `nextActionText`
- 새 계약 필드를 사용한다.
  - `dealName`
  - `dealCost`
  - `dealStatus`
  - `dealStatusLabel`
  - `expectedEndDate`
  - `latestFollowingAction`
  - nested `company`, `contact`, `products`

## 5. UI 동작 기준

- Desktop: 목록과 상세를 나란히 보여준다.
- Mobile: 목록 우선, 선택 시 상세로 이동 또는 전환한다.
- 검색/필터/정렬 변경 시 page를 1로 초기화한다.
- 회사 필터 선택 시 담당자 필터 후보는 같은 회사의 담당자로 좁힌다.
- stage counts는 검색/회사/담당자 필터를 반영한다.
- 목록은 제품을 표시하지 않는다.
- 상세에는 제품 목록을 표시한다.
- 생성/수정 form은 `productIds` 배열로 제품을 1개 이상 선택하게 한다.
- 다음 행동 생성/수정 후 목록과 로그를 갱신한다.
- 메모 생성/수정 후 메모 목록을 갱신한다.
- export는 현재 검색/회사/담당자/상태/정렬을 반영하고 page는 전달하지 않는다.

## 6. 완료 기준

- User Web이 Deal API 15개 중 필요한 화면 API를 실제로 호출한다.
- 목록/상세/생성/수정/로그/export가 mock 없이 동작한다.
- error, empty, loading, pending 상태가 깨지지 않는다.
- Desktop과 Mobile에서 텍스트와 버튼이 겹치지 않는다.
- 빌드가 통과한다.

## 7. 검증 명령

프로젝트 실제 script를 확인한 뒤 가능한 범위에서 실행한다.

```bash
cd FE/user-web
npm run lint
npm run build
```

Playwright 설정이 있으면 딜 목록 진입, 생성 form, export 버튼까지 수동 또는 자동으로 확인한다.
