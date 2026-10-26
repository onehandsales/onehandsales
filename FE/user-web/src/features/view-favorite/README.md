# 개인 View 즐겨찾기

현재 사용자·Workspace의 사이드바 목록 조회와 View 즐겨찾기 등록/해제 API 계약을 제공한다. 외부 feature는 공개 `index.ts`의 hook·client·응답 타입·개인 목록 query key를 사용한다.

- GET 목록은 서버가 반환한 Favorite PK·View ID·이름·아이콘과 순서를 보존한다.
- POST/DELETE는 기존 apiClient를 통해 경로의 Workspace/View ID만 보내고 body/query는 사용하지 않는다. 소유자·Actor·sortOrder는 서버가 정한다.
- 개인 목록 key는 사용자/Workspace UUID 표기를 정규화한다. crm-view hook이 공통 헤더 조작과 관련 cache 갱신을 조합한다. UI가 Favorite PK를 임의 생성하지 않는다.

실제 별표 동작은 `crm-view` 공통 헤더가 담당하며 두 반응형 헤더가 단일 모델을 공유한다. 즐겨찾기 행 클릭 이동·순서 변경은 후속 범위다.
