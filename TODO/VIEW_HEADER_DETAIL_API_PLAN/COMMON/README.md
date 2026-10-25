# View 헤더 공통 기준

이 폴더는 사용 흐름·작업 분담·API 계약·순서·기획 검토의 공통 기준을 관리한다. 계약 필드를 역할별 문서에 다르게 중복 정의하지 않는다.

- [전체 계획](../README.md)
- [사용 흐름](USER-FLOW.md)
- [작업 분담](WORK-SPLIT.md)
- [작업 순서](GOAL-WORK-ORDER.md)
- [기획 검토](PLANNING-REVIEW.md)
- [API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md)

## 1. 포함·제외 범위

사이드바 즐겨찾기의 `viewDefinitionId`로 현재 Workspace의 View를 조회해 헤더에 필요한 View 요약, 소속 Object/List 요약, 본인 즐겨찾기 상태를 반환한다. 즐겨찾기 목록의 `id`는 ViewFavoriteDefinition ID이며 이번 요청에 사용하지 않는다. 응답의 `id`는 ViewDefinition ID다.

포함 범위:

- 인증 사용자·Workspace 멤버십·View·연결 Object/List의 Workspace 범위 확인
- 헤더 단건 GET API 1개와 전용 Query Port·UseCase·Prisma adapter·Controller
- Object/List 모듈의 공개 단건 요약 Query Port와 adapter, Module provider/export 조립
- UseCase·HTTP 계약·Repository 통합 검증과 Backend Agent 규칙에 따른 구현 후 검토
- 구현 시 API/DB 현황 문서와 작업 로그 갱신

제외 범위:

- Frontend API 연결·라우트·헤더 컴포넌트·사이드바 클릭 동작·본문 수정
- Object/List의 View 목록 API, 즐겨찾기 등록·해제·재정렬, 새 View 생성
- Record·ListEntry·Attribute 값, View 속성·필터·정렬·그룹·위젯·업무 의존 관계 조회
- View 기본 선택·마지막 선택 저장·대시보드 제목 우선순위·추가 역할/공유 권한 정책
- Prisma schema/migration/index/UNIQUE/CHECK/seed 변경, 실제 업무 DB 데이터 수정, 배포와 커밋

이 API만 구현하면 헤더 정보 조회 준비가 끝나는 것이며, 클릭 UI나 드롭다운 전체 목록까지 연결됐다는 뜻은 아니다.

## 2. 이번 API를 막지 않는 후속 정책

- 첫 View·기본 View·마지막 선택 우선순위와 View 없음 UX: 목록/Frontend 작업에서 결정. 이 API는 지정된 View ID만 조회한다.
- 소속 없는 View와 소속이 둘인 View의 제목·드롭다운 기준: 저장된 소속을 그대로 반환하고 UI 우선순위는 정하지 않는다.
- 즐겨찾기 등록 중복/동시성/추가 위치와 해제 정책: 이번 GET은 존재 여부만 반환한다.
- 화면에서 다른 View로 전환할 목록 API, 등록·해제·View 생성과 본문/API·필터 설정 저장: 후속 작업이다.

소속이 없거나 둘 다 있는 View도 저장된 관계대로 반환한다. 제목 선택·기본 보기·다른 View 목록·추가 역할 정책은 이번 Backend 구현에서 임의로 확정하지 않는다.
