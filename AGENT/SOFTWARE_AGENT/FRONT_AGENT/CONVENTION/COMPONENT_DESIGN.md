# 컴포넌트 설계와 확장 기준

적용 대상: User Web과 Admin Web의 신규·수정 React 컴포넌트. 두 앱의 업무 feature를 직접 공유하지 않는다.

## 1. 책임과 분리 기준

| 단위 | 맡는 책임 | 두지 않을 책임 |
| --- | --- | --- |
| Route page | URL 해석, 페이지 레이아웃, 기능 조합, 페이지 오류 경계 | 큰 테이블의 모든 셀 렌더링, 데이터 전송 구현 |
| Feature container / hook | 기능 데이터 조회·변경, 상태 전환, UI에 전달할 값 | 전역 앱 조립, 다른 기능의 내부 상태 조작 |
| Feature UI | 해당 업무의 표시·입력·사용자 의도 전달 | 직접 HTTP 호출, fixture 원본 수정 |
| Shared UI | Button·Field·Dialog 등 공통 표현과 상호작용 | 특정 업무 상태·workspace 조회·권한 정책 |
| Adapter | mock/HTTP 변환, 오류 정규화, 데이터 접근 | JSX, route 이동, 사용자 토스트 |

시각적 반복, 독립된 상태 수명, 재사용할 상호작용, 독립적으로 검증할 책임 중 하나가 분명할 때 분리한다. 단순 텍스트 한 줄을 모두 컴포넌트로 나누거나 파일 줄 수만으로 분리하지 않는다. 계층과 데이터 흐름을 먼저 정하는 접근은 [Thinking in React](https://react.dev/learn/thinking-in-react)를 참고한다.

## 2. Props 계약

- 입력과 callback 타입을 명시한다. callback은 `onSave(input)`, `onCancel()`처럼 사용자 의도를 표현한다.
- UI에 QueryClient·전체 전역 store·라우터 객체를 통째로 전달하지 않는다. 필요한 데이터와 동작만 전달한다.
- controlled 값과 내부 state의 소유자를 하나로 정한다. controlled/uncontrolled 전환을 런타임에 섞지 않는다.
- 배타적인 상태는 판별 가능한 union이나 명확한 status로 표현한다. `isLoading && isSuccess && isError` 같은 불가능한 조합을 만들지 않는다.
- 표시 변화는 의미가 있는 variant로 표현한다. 서로 충돌하는 boolean props가 늘면 API를 재설계한다.
- `children`과 composition은 가변 콘텐츠에 사용한다. 모든 컴포넌트를 범용 slot framework로 만들지 않는다.
- stable key는 데이터 ID를 사용한다. 정렬·삽입·삭제되는 목록에서 배열 index나 렌더마다 생성한 ID를 key로 쓰지 않는다.
- ref는 포커스·측정 등 실제 필요가 있을 때만 노출한다. 내부 DOM 전체에 의존하는 부모 코드를 만들지 않는다.

## 3. 목록·테이블·폼·오버레이

| 종류 | 구현 전 정할 사항 |
| --- | --- |
| 목록·테이블 | 열 정의, 빈 결과, 정렬 범위, 페이지 처리, 선택 수명, 행 동작과 내부 버튼의 충돌 |
| 폼 | 초기값, 입력 타입, 검증 시점, dirty·pending·오류, 저장·취소·재진입 |
| 모달·드로어 | 열고 닫는 소유자, 초점 이동·복귀, 배경 비활성, Esc, 저장 중 닫기 정책 |
| 메뉴·팝오버 | trigger와 내용 연결, 키보드 조작, 바깥 클릭, 화면 가장자리 배치 |
| 파일 입력 | 허용 유형·크기 근거, 선택 취소, 진행·실패·재시도, 실제 업로드와 mock의 구분 |

표의 재사용은 열·셀·선택 등 공통 메커니즘까지만 추출한다. 프로젝트·청구·계약 등 다른 업무 규칙을 거대한 switch로 한 테이블에 몰아넣지 않는다. feature별 조합으로 확장한다.

폼 필수값과 검증 메시지는 출처 또는 합의한 임시 가정을 기록한다. FE 검증은 UX이며 서버 검증을 대체하지 않는다. 저장 버튼의 성공 표시는 adapter 결과에 따라 바뀌어야 한다.

## 4. Hook과 생명주기

- hook은 한 가지 기능적 책임을 이름으로 드러내고, 반환값은 호출자가 필요한 최소 범위로 유지한다.
- 사용자 클릭에서 발생하는 저장·삭제는 이벤트 경로에서 실행한다. 상태 변경을 감시하는 effect로 간접 실행하지 않는다.
- 외부 시스템과 동기화할 때 effect를 사용하고 event listener·observer·timer·subscription을 정리한다. 계산·단순 props 복사를 위한 effect는 피한다. [React Effect 지침](https://react.dev/learn/you-might-not-need-an-effect)
- 개발 중 재실행되어도 listener·요청·등록이 중복되지 않도록 정리한다. effect 경고를 없애려고 의존성을 누락하지 않는다.
- memoization은 측정한 병목 또는 참조 안정성 요구가 있을 때 적용한다. 모든 함수에 `useCallback`을 붙이는 규칙은 두지 않는다.

## 5. 공통화와 변경 영향

- 처음에는 기능 내부에 둔다. 실제 사용처에서 책임과 계약이 같다는 근거가 생기면 shared로 승격한다.
- feature 공개 export는 호출자가 필요한 UI·타입·hook으로 제한한다. 다른 feature의 내부 파일을 깊게 import하지 않는다.
- 여러 기능의 조합은 상위 page에서 수행한다. `shared`가 `features`를 역참조하거나 순환 import를 만들지 않는다.
- 공통 컴포넌트의 변경은 기존 사용처의 keyboard·disabled·loading·레이아웃을 함께 확인한다.
- 새 라이브러리는 현재 의존성으로 해결되지 않는 요구·접근성·크기·유지보수·교체 비용을 검토한다. 문서 예시만 보고 미설치 라이브러리를 import하지 않는다.
- 모든 새 컴포넌트에는 [한글 책임 주석](COMMENT_AND_LOGGING.md)을 붙인다. props로 드러나지 않는 제약과 설계 이유는 해당 코드 가까이에 남긴다.

상태 소유권은 [상태·데이터](../ARCHITECTURE/STATE_AND_DATA.md), DOM·포커스·반응형은 [웹 규칙](WEB_ACCESSIBILITY_AND_LAYOUT.md)을 따른다.
