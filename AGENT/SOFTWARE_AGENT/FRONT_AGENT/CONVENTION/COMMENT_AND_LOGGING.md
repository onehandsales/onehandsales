# 한글 주석과 프론트엔드 로깅

적용 대상: `FE/user-web`, `FE/admin-web`의 신규 코드와 동작을 수정한 코드.

주석은 호출자가 기대하는 책임, 상태 전환, 제약의 이유를 설명한다. 모든 줄을 번역하거나 함수 이름만 한국어로 반복하지 않는다. 기존 코드 전체의 주석 교체는 별도 범위로 진행한다.

## 1. 컴포넌트별 필수 주석

컴포넌트 선언 바로 위에 `// 기능 : ...`으로 시작하는 한글 한 문장을 한 줄로 작성한다.

| 대상 | 적을 내용 |
| --- | --- |
| Page | 어떤 진입 상태에서 어떤 기능들을 조합하는가 |
| Feature component | 어떤 데이터를 표시·입력하고 어떤 사용자 의도를 전달하는가 |
| Shared component | 공통 상호작용·접근성 책임과 외부에서 제어할 값 |
| Hook | 어떤 상태·요청을 조정하며 실행 범위가 무엇인가 |
| Event / submit handler | 행동 이후의 상태 전환·저장·복구 |
| Adapter / API 함수 | 데이터 원본·변환·오류 경계 |
| Route / storage / test helper | 복원·이동·검증 준비의 목적과 범위 |

- 선언형 함수, arrow component, export component, `memo` 등 wrapper 선언에도 동일하게 적용한다.
- `memo(function ...)`처럼 하나의 컴포넌트를 감싼 경우 공개 선언 앞 책임 주석 하나로 충분하다. 별도 helper는 자체 주석을 둔다.
- 한 줄 helper도 이름 있는 함수라면 기능 주석을 둔다. 단순 `map` 표현이나 값 전달 callback은 억지로 추출하지 않는다.
- 조건 분기·비동기·부작용을 가진 익명 callback은 이름 있는 함수로 추출해 책임을 적는다.
- type/interface는 전부 주석을 강제하지 않는다. 이름만으로 알 수 없는 값의 의미·소유권·제약에는 `// 의미 : ...`를 붙인다.
- props나 반환 타입이 이미 설명하는 내용을 긴 JSDoc으로 반복하지 않는다.

## 2. 좋은 주석과 수정할 주석

| 수정할 주석 | 사용할 표현 예 |
| --- | --- |
| `// 기능 : ClientList를 렌더링합니다.` | `// 기능 : 고객 목록과 선택 상태를 표시하고 상세 열기 요청을 부모에 전달한다.` |
| `// 기능 : 상태를 업데이트합니다.` | `// 기능 : 선택한 항목의 편집 초안을 초기화하고 상세 패널을 연다.` |
| `// 1. 조건을 확인한다.` | `// 1. 저장 중인 초안의 중복 제출을 차단한다.` |
| `// 2. 함수를 호출한다.` | `// 2. 제출 시점의 대상 ID와 입력값으로 변경을 요청한다.` |

UI 주석은 구현 사실에 맞아야 한다. 실제로는 값만 표시하는 컴포넌트에 저장·권한 검증 책임이 있다고 적지 않는다.

## 3. 컴포넌트 작성 예시

아래는 주석·props 소유권의 예시다. 고객 이름의 실제 필수 정책이나 Bonsai의 화면 문구를 확정하는 코드가 아니다.

```tsx
import { useId } from 'react';
import type { ChangeEvent } from 'react';

type ClientNameFieldProps = {
  value: string;
  error?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
};

// 기능 : 부모가 관리하는 고객 이름과 오류를 표시하고 입력 변경을 전달한다.
export function ClientNameField({
  value,
  error,
  disabled = false,
  onValueChange,
}: ClientNameFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  // 기능 : 입력한 문자열을 폼 소유자에게 전달한다.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.value);
  }

  return (
    <div>
      <label htmlFor={inputId}>고객 이름</label>
      <input
        id={inputId}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? <p id={errorId}>{error}</p> : null}
    </div>
  );
}

type SaveButtonProps = {
  pending: boolean;
};

// 기능 : 폼 저장 동작을 제공하고 요청 중 중복 제출을 막는 상태를 표시한다.
export const SaveButton = ({ pending }: SaveButtonProps) => (
  <button type="submit" disabled={pending} aria-busy={pending}>
    {pending ? '저장 중…' : '저장'}
  </button>
);
```

각 컴포넌트가 책임 주석을 갖고 입력 상태의 소유자는 부모로 유지된다. 단순 JSX 구획에 번호 주석을 넣지 않는다. disabled 버튼만으로 모든 제출 경로의 중복 실행이 차단되지는 않으므로 submit handler에서도 pending 상태를 확인한다.

## 4. 처리 흐름과 이유 주석

로그인·refresh·저장·검증·navigation·캐시 복원 등 여러 의미 있는 단계를 가진 함수에는 주요 단계 앞에 번호 주석을 쓴다.

```text
// 기능 : 편집 초안을 저장하고 성공 시 관련 목록을 갱신한다.
// 1. 중복 제출을 막고 제출 대상과 입력값을 고정한다.
// 2. 데이터 공급자에 변경을 요청하고 결과를 기다린다.
// 3. 성공하면 관련 조회를 갱신하고 실패하면 초안을 유지한다.
```

위 블록은 흐름 설명 양식이며 구현 코드는 아니다. 실제 번호는 해당 코드가 수행하는 단계와 일치시킨다.

- 번호 하나는 의미 있는 처리 묶음을 설명한다. 변수 선언·setter·return마다 번호를 붙이지 않는다.
- 단순 표시 컴포넌트·타입·import·상수에는 번호를 붙이지 않는다.
- 경쟁 조건 방지, 브라우저 우회 처리, 성능상 선택 등 비자명한 제약은 `// 이유 : ...` 한 줄로 설명한다.
- 오래된 구현 설명은 코드 변경과 함께 수정한다. 주석 처리한 옛 코드나 개인 대화 기록을 남기지 않는다.
- API 결과를 확인하지 않았는데 “서버 저장 완료”, mock인데 “실제 발송” 같은 표현을 쓰지 않는다.

## 5. 로깅 경계

2026-11-20 확인 범위에서 두 앱 package에 Sentry 의존성이 없으며, 확인한 User Web 소스에는 공통 logger 파일이 없다. 기존 문서의 Sentry 채널 설명을 현재 구현 사실로 취급하지 않는다.

- 진단 로그가 필요한 작업에서는 현재 호출 경로를 먼저 확인한다. 공통 logger를 도입하면 앱의 `lib` 경계에 모으고 전송 대상·운영 활성화·비식별화 정책을 명시한다.
- 신규 코드에서 직접 `console.log`를 추가하지 않는다. 개발 임시 출력은 최종 변경에 남기지 않는다.
- event key는 짧고 안정적인 영어 식별자, context는 최소한의 구조화된 값으로 유지한다.
- token·secret·이메일·고객 이름·자유 입력·파일 본문·요청 전체·원본 응답을 로그로 전송하지 않는다.
- 예상된 취소·유효성 실패·정상적인 401/403 흐름은 무조건 치명 오류로 기록하지 않는다. 실제 장애와 구분한다.
- 사용자에게 보여줄 오류와 개발 진단을 분리한다. 사용자 화면에 stack이나 내부 endpoint를 노출하지 않는다.
- Sentry·analytics 등 외부 전송 서비스는 필요와 범위를 정한 후 도입한다. 문서만으로 서비스 연결을 가정하지 않는다.
- Admin 클라이언트 로그는 서버 감사 로그를 대신하지 않는다.

## 6. 리뷰 기준

선언 바로 위 한글 책임 주석, 주요 흐름의 의도, 실제 동작과 주석의 일치, 민감 정보 노출 여부를 확인한다. 주석 개수나 정규식 통과만으로 품질을 판정하지 않는다.

관련: [컴포넌트](COMPONENT_DESIGN.md), [User Web 규칙](FRONTEND_USER_WEB.md), [Admin 규칙](ADMIN_WEB.md), [리뷰 체크리스트](../ENGINEERING_REVIEW_CHECKLIST.md).
