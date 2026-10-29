# View 헤더 입력 검증·주석 보완 기록

- 작업일: 2026-10-29
- 상태: 구현·검증·검토 완료
- 사용자 요청: 직전 Backend 규칙 재검토의 수정 사항을 적용한다.
- 관련 계획: [완료 기록](../../../TODO/DONE/VIEW_HEADER_EMPTY_REQUEST_FIX_PLAN/README.md)
- 착수 시 이전 View 헤더 메뉴 구현·문서 변경이 미커밋 상태였으며 보존했다.

## 수정과 검증

1. 기존 빈 DTO 변환으로 constructor·__proto__ 입력 키가 제거되는 문제를 다섯 endpoint의 회귀 테스트로 먼저 재현했다. 수정 전 5개 사례 모두 실패했다.
2. Query/Body를 unknown으로 받아 원본 키를 유지하고 shared/presentation의 EmptyRequestPipe로 검증을 통합했다. 기존 기능별 Pipe 2개와 빈 DTO 2개를 제거했다.
3. 숨김 컬럼이 없는 모델의 잘못된 주석을 수정하고 조회 메서드 7개의 번호 주석을 실제 의도로 정리했다.
4. 메뉴 HTTP 28개 + 즐겨찾기 HTTP 39개 + 공통 application 36개, 합계 **3 suites / 103 tests 통과**. 거부 요청이 멤버십 조회·즐겨찾기 transaction 전에 차단됨을 확인했다.
5. typecheck/lint/build 통과. 현재 미커밋 TS 21개 파일의 선언 121개와 화살표 helper 주석, 계층·모듈 경계 정적 검사 통과. 주석 내용은 실제 Prisma 모델과 별도로 대조했다.
6. 현재 API 계약, 이전 검토 기록, TODO 색인을 갱신하고 후속 계획을 DONE으로 보관한다.

이번 변경으로 FE·schema/migration·ENV 파일·실제 업무 DB를 변경하지 않았다. 전체 Jest와 실제 DB 통합 테스트는 재실행하지 않았고 초기 구현의 64 suites / 462 tests를 이번 수정의 결과로 사용하지 않는다. 커밋은 수행하지 않았다.

## 커밋 요청 및 아키텍처 참고 문서 보완

- 후속 사용자 요청: Git 커밋과 Backend Agent ARCHITECTURE의 shared/presentation 참고 문서 업데이트.
- 실제 shared/presentation 파일, main.ts의 전역 등록, AppModule middleware, AuthModule Guard/resolver 조립을 대조하여 SHARED_PRESENTATION.md를 작성했다.
- 공통 책임·폴더 선택·의존 방향·입력 변환 순서·unknown과 EmptyRequestPipe 사용·예외 응답·요청 ID·검증 기준을 기록하고 Backend/Architecture 색인과 소스 README에서 연결했다.
- 코드 변경 후 통과한 관련 103개 테스트·typecheck/lint/build 결과를 확인했다. 이번 추가 작업은 문서 변경이며 링크·소스 경로·예시·diff 공백 검사를 수행한 뒤 기존 구현과 함께 커밋한다.
- 아키텍처 문서와 연결 문서 6개의 로컬 링크 25개, 파라미터 예시 2개와 실제 Controller의 일치, git diff 공백 검사를 통과했다.
