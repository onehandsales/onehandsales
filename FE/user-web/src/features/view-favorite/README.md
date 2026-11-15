# 개인 View 즐겨찾기

> 현재 범용 CRM 구현의 동작·검증 기록이다. 새 화면은 [folk UX 기준](../../../../../AGENT/UXUI_AGENT/DECISIONS/025_uxui_folk_reference.md)과 [전환 영향](../../../../../AGENT/SOFTWARE_AGENT/COMMON/FOLK_TRANSITION_MATRIX.md)을 따른다. 아래 기존 치수·메뉴·저장 방식은 folk 목표로 자동 승계하지 않는다.

현재 사용자·Workspace의 사이드바 목록 조회와 View 즐겨찾기 등록/해제 API 계약을 제공한다. 외부 feature는 공개 `index.ts`의 hook·client·응답 타입·개인 목록 query key를 사용한다.

- GET 목록은 서버가 반환한 Favorite PK·View ID·이름·아이콘과 순서를 보존한다.
- POST/DELETE는 기존 apiClient를 통해 경로의 Workspace/View ID만 보내고 body/query는 사용하지 않는다. 소유자·Actor·sortOrder는 서버가 정한다.
- 개인 목록 key는 사용자/Workspace UUID 표기를 정규화한다. crm-view hook이 공통 헤더 조작과 관련 cache 갱신을 조합한다. UI가 Favorite PK를 임의 생성하지 않는다.

실제 즐겨찾기 버튼 동작은 `crm-view` 공통 헤더가 담당하며 두 반응형 헤더가 단일 모델을 공유한다. 행 클릭은 해당 View 화면으로 이동한다. 순서 변경은 `sidebar-order` feature가 Favorite PK 전체 배열을 PATCH하며 현재 사용자·Workspace 목록 query key를 재사용한다.
