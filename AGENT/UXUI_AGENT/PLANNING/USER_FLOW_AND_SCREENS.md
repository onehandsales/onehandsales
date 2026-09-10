# User Flow / 화면 목록

## 핵심 User Flow

### Flow 0. 로그인 후 홈 확인

1. 사용자가 로그인한다.
2. `/app` 홈에서 핵심 요약을 본다.
3. 빠른 실행 또는 하단 navigation으로 주요 도메인에 이동한다.

### Flow 1. 기본 데이터 등록

1. 회사, 담당자, 제품 중 하나의 목록으로 이동한다.
2. `new` 화면 또는 패널에서 새 row를 생성한다.
3. 생성 직후 상세 또는 목록에서 값이 반영된 것을 확인한다.

### Flow 2. 딜 관리

1. 딜 목록 또는 파이프라인을 연다.
2. 새 딜을 만들고 회사/담당자/제품을 연결한다.
3. 단계, 금액, 다음 행동을 수정한다.
4. 딜 상세에서 메모와 활동 로그를 확인한다.

### Flow 3. Export

1. 회사/담당자/제품/딜 목록에서 검색과 필터를 적용한다.
2. xlsx export를 실행한다.
3. 다운로드된 파일이 현재 조건과 일치하는지 확인한다.

### Flow 4. 통합검색

1. 상단 검색을 연다.
2. 회사, 담당자, 제품, 딜 키워드를 입력한다.
3. 결과를 선택해 해당 상세로 이동한다.

### Flow 5. 다음 행동 처리

1. 딜 상세에서 다음 행동을 생성한다.
2. 완료 여부를 변경한다.
3. 활동 로그가 함께 정리되는지 확인한다.

## User Web 화면 목록

| 화면 | Route |
| --- | --- |
| 홈 | `/app` |
| 회사 목록 | `/app/companies` |
| 회사 생성 | `/app/companies/new`, `/app/companies/new/full` |
| 회사 상세 | `/app/companies/:companyId` |
| 담당자 목록 | `/app/contacts` |
| 담당자 생성 | `/app/contacts/new`, `/app/contacts/new/full` |
| 담당자 상세 | `/app/contacts/:contactId` |
| 제품 목록 | `/app/products` |
| 제품 생성 | `/app/products/new`, `/app/products/new/full` |
| 제품 상세 | `/app/products/:productId` |
| 딜 목록 | `/app/deals` |
| 딜 생성 | `/app/deals/new`, `/app/deals/new/full` |
| 딜 상세 | `/app/deals/:dealId` |
| 휴지통 | `/app/trash` |
| 더보기 | `/app/more` |
| 계정 모달 | 보호 route 위의 `?account=settings` |

## Admin Web 화면 목록

| 화면 | Route |
| --- | --- |
| 권한 확인 | `/` |
| 로그인 | `/login` |

## 우선순위

1. 홈과 딜 목록/상세를 업무 시작점으로 둔다.
2. 회사/담당자/제품은 딜 생성을 돕는 빠른 선택과 상세 정보 확인을 우선한다.
3. 검색과 휴지통은 전체 도메인의 공통 보조 flow로 둔다.
4. 모바일에서는 목록 탐색, 상세 확인, 다음 행동 변경을 먼저 안정화한다.
