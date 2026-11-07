# 관리 항목과 첫 TABLE 생성

사이드바 `관리 대상 +`의 기존 두 단계 입력을 유지하면서 Object만 저장하던 동작을
관리 항목과 바로 사용할 첫 TABLE 생성으로 변경했다.

예: `매물` → 아이콘/설명 → 생성 → `전체 매물` TABLE로 이동.
공통 `이름` 텍스트 속성이 첫 제목 열로 표시되며 실제 매물 Record는 아직 없다.

- [API 계약과 트랜잭션/실패 기준](COMMON/API-SPEC/OBJECT_TABLE_CREATE_API.md)
- [Backend 구현 및 검증](BE-TODO.md)
- [Frontend 구현 및 검증](FE-TODO.md)

ObjectDefinition, AttributeDefinition, ViewDefinition, ViewAttributeSettingDefinition을 같은 transaction으로 저장한다.
모듈별 공개 application port를 사용하고 각 소유 모듈의 infrastructure만 해당 모델에 쓴다.
API 주소와 request body는 유지하며 response에 viewDefinitionId를 추가했다.

DB schema/migration 변경, 기존 데이터 보정, 업무 목록 생성, 관리자 화면 변경은 없다.
