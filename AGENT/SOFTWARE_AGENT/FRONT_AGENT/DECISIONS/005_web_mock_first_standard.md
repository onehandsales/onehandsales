# 005. 웹 프론트엔드 규칙과 mock 우선 개발

결정일: 2026-11-20 KST

상태: 사용자 요청을 반영한 개발 기준. 이 결정만으로 FE 실행 방식이나 BE 연결이 변경되지는 않는다.

## 1. 배경과 범위

FRONT_AGENT는 React 기반 User Web과 Admin Web을 다루는 문서다. 모바일 앱 전용 규칙이 아니며, 모바일 브라우저는 웹의 반응형·입력·접근성 검증 범위에 포함한다.

기존 문서는 기술 선택과 일부 호출 규칙을 제공했지만, 컴포넌트 책임·상태 소유권·mock 데이터의 일관성·브라우저 내비게이션·키보드 조작의 수용 기준이 부족했다. 이를 구현자가 재현하고 리뷰할 수 있는 규칙으로 보완한다.

## 2. 결정

1. 신규 Bonsai 업무 화면은 mock 데이터로 전체 UX와 화면 사이 흐름을 먼저 구현한다. 기존 업무 BE/API/DB 구조에 화면을 맞추지 않는다.
2. 컴포넌트 → 기능 hook → 데이터 계약 → 선택된 adapter 순서로 데이터에 접근한다. mock/HTTP 선택은 앱 조립 지점에서 관리한다.
3. mock도 목록·상세·편집 화면에서 같은 데이터를 사용한다. 오류·로딩·빈 결과·취소·재진입을 재현할 수 있어야 한다.
4. 데이터 관계와 미확인 정책은 FE 개발 중 계속 기록한다. UX 검증 후 Bonsai 공식 도움말·공식 API 문서와 대조하여 우리 서비스의 DB/API 계약을 확정한다.
5. 웹 공통 기준은 URL·키보드·포커스·시맨틱 HTML·반응형·스크롤·성능·보안을 포함한다.
6. 새로 작성하거나 동작을 변경한 컴포넌트·hook·함수에는 책임을 설명하는 한글 주석을 작성한다. 기존 `// 기능 :` 형식을 유지하며 기계적인 코드 번역은 하지 않는다.
7. 실제 인증 유지 여부는 업무 mock과 별도로 명시한다. User Web의 mock 권한이 Admin Web의 서버 권한 확인을 대신하지 않는다.

## 3. 적용과 우선순위

- 제품 범위는 [PM 036](../../../PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md)과 [UX 025](../../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)를 따른다.
- 기존 문서의 “mock 가능”은 신규 Bonsai 업무 화면에 대해 “mock 우선”으로 구체화한다. 기존 live 기능의 일괄 삭제나 인증 해제를 뜻하지 않는다.
- 기존 API 계약 선행 규칙은 실제 API 연동 시 적용한다. FE용 임시 타입을 서버 계약이나 확정 DB 스키마로 기록하지 않는다.
- 환경은 기존 local/production 정책을 유지한다. mock/live는 데이터 공급 방식이며 새 배포 환경이 아니다.
- 문서에서 지정한 구조는 앞으로 구현할 기준이다. 현재 소스의 적합성은 작업별로 확인한다.

## 4. 적용 문서와 완료 판정

- [mock 개발과 연동 경계](../ARCHITECTURE/MOCK_FIRST_DEVELOPMENT.md)
- [상태·데이터 소유권](../ARCHITECTURE/STATE_AND_DATA.md)
- [컴포넌트 설계](../CONVENTION/COMPONENT_DESIGN.md)
- [웹 접근성·레이아웃](../CONVENTION/WEB_ACCESSIBILITY_AND_LAYOUT.md)
- [한글 주석과 로깅](../CONVENTION/COMMENT_AND_LOGGING.md)
- [엔지니어링 리뷰](../ENGINEERING_REVIEW_CHECKLIST.md)

화면 재현 완료, mock 상호작용 완료, 실제 API 연동 완료, 운영 검증 완료는 각각 별도 상태로 보고한다.

## 5. 이번 문서 개정의 검증 기록

2026-11-20 KST에 기존 문서 16개를 검토하여 15개를 보완하고 6개를 추가했다. 전체 22개 문서의 로컬 링크 124개와 package script 참조 11개를 확인했다. 한글 주석 문서의 TSX 예제 1개는 User Web의 strict 컴파일 옵션으로 메모리에서 타입 검사했으며 오류가 없었다.

FE·BE 실행 코드, 환경, DB는 변경하지 않았다. 앱 전체 typecheck·build·E2E·실제 브라우저 검증은 이번 문서 작업에서 실행하지 않았다. 기존 코드의 규칙 적용과 mock 연결 구현은 후속 실행 작업에서 검증해야 한다.
