# View 헤더 빈 요청 검증 보완

- 상태: 구현·검증·검토 완료 (2026-10-29, 구현 전 confirmed)
- 요청: Backend Agent 재검토에서 확인한 입력 검증·주석 문제와 중복 Pipe를 보완한다.
- 계약 정본: [메뉴 조회](../VIEW_HEADER_MENU_QUERY_PLAN/COMMON/API-SPEC/VIEW_HEADER_MENU_QUERY_API.md), [즐겨찾기 현재 경로](../../VIEW_HEADER_API_NAMESPACE_PLAN/COMMON/API-SPEC/VIEW_HEADER_API_NAMESPACE.md).

## 변경 범위와 계약

- 메뉴 GET 3개와 즐겨찾기 POST/DELETE의 빈 Query·Body 계약을 유지한다. 추가 키는 이름에 관계없이 400이며 미전송·빈 객체는 허용한다.
- 재현: 전역 DTO 변환이 constructor와 __proto__ 키를 제거해 추가 필드가 있는 요청이 성공한다. 이 변환이 원본 키를 지우지 않도록 Query/Body를 unknown으로 받고 공통 EmptyRequestPipe에서 검증한다.
- 중복된 기능별 Pipe·빈 DTO를 제거하고 shared/presentation/pipes에서 검증을 공유한다. 다른 필드형 DTO의 전역 class-validator 검증은 유지한다.
- 필터 그룹·조건·정렬·그룹 모델에 없는 숨김 상태를 설명한 주석을 실제 조회 의도로 고친다.
- 기존 경로, 성공 응답, 인증/멤버십, transaction, 로깅, 비즈니스 조회는 유지한다. 새 DB 변경·외부 Provider 호출·ENV/FE 변경 없음. 신규 transaction/outbox 불필요.

## 구현·검증 순서

1. 다섯 endpoint의 예약 키 입력을 회귀 테스트로 추가하고 수정 전 실패를 확인한다.
2. 파싱된 입력의 키를 유지하는 공통 검증을 적용하고 부정확한 주석을 수정한다.
3. 실제 모듈을 사용하는 HTTP 테스트와 application 회귀, typecheck/lint/build를 실행한다.
4. 입력 형태·성공 응답·DB 접근 차단과 규칙을 재검토하고 실제 결과를 기록한다.

이 변경은 HTTP 경계와 주석에 한정한다. 이전 실제 PostgreSQL 검증은 이전 실행 결과이며 이번 검증으로 재표시하지 않는다.

## 완료 결과

- `BE/src/shared/presentation/pipes/empty-request.pipe.ts`로 입력 검증을 통합하고 기능별 Pipe 2개와 빈 DTO 2개를 제거했다.
- Query/Body는 unknown으로 받아 키를 보존한다. 기존 필드형 DTO와 전역 ValidationPipe 설정은 변경하지 않았다.
- 세 메뉴 GET과 즐겨찾기 POST/DELETE에서 constructor Query, constructor·__proto__ JSON Body를 400으로 거부한다. 멤버십 조회와 즐겨찾기 transaction 호출도 발생하지 않는다.
- 미전송·빈 객체는 기존 성공 상태와 응답을 유지한다. 일반 추가 필드·배열·null·원시값의 거부, 인증·권한·UUID·오류 응답 회귀도 통과했다.
- 설정 조회 7개 메서드의 번호 주석을 모델별 의도로 정리했다. 숨김 컬럼이 없는 4개 모델에서 숨김 상태 보존 설명을 제거했다.

| 검증 | 결과 |
| --- | --- |
| 수정 전 회귀 사례 | 다섯 endpoint 모두 예상 400 대신 200/201로 실패하여 결함 재현 |
| 수정 후 관련 Jest | 3 suites / 103 tests 통과: 메뉴 HTTP 28개, 즐겨찾기 HTTP 39개, 공통 application 36개 |
| typecheck / lint / build | 모두 통과 |
| 계층·주석 정적 검토 | 현재 미커밋 TS 21개 파일, 선언 121개의 필수 주석·별도 화살표 helper 주석 확인. application/domain 금지 의존성·다른 모듈의 구체 repository 직접 import 없음 |
| 주석 의미 검토 | 조회 모델의 실제 필드·정렬·숨김 여부와 수정된 설명 대조 |

이번 검증은 로컬 HTTP·application·정적/빌드 검사다. 전체 Jest/실제 DB 통합 테스트는 이번 수정에서 다시 실행하지 않았으며 기존 64 suites / 462 tests 결과는 초기 구현의 기록이다. 커밋은 수행하지 않았다.
