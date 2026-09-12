# Comment And Logging Convention

## 1. 목적

이 문서는 `BE` 코드의 주석과 로깅 기준을 정의한다.

Backend 코드는 계층 경계, API 의도, transaction 흐름, 외부 provider 호출, repository 저장 순서를 나중에 빠르게 추적할 수 있어야 한다. 새로 작성하거나 수정하는 코드에는 아래 주석 규칙을 기본 적용한다.

## 2. Role / API / Function Comment

Backend 코드에는 선언 대상에 맞는 1줄 한글 주석을 둔다.

```ts
// 역할 : 인증 HTTP API 요청을 application 계층으로 위임합니다.
@Controller("api/auth")
export class AuthController {
  // API : 인증, 외부 인증 토큰 앱 세션 교환
  @Post("exchange")
  async exchange() {
    // ...
  }

  // 기능 : Authorization 헤더에서 Bearer 토큰 값을 추출하고 형식을 검증합니다.
  private getBearerToken() {
    // ...
  }
}
```

필수 대상:

- class
- interface
- controller API method
- application use case method
- service method
- repository method
- adapter method
- helper function
- test helper function

규칙:

- class와 interface는 `// 역할 : ...` 형식을 사용한다.
- HTTP endpoint를 여는 controller method는 `// API : ...` 형식을 사용한다.
- 내부 method/function은 `// 기능 : ...` 형식을 사용한다.
- 한 줄로 쓴다.
- 호출자, 사용자 행동, 시스템 책임 중 하나가 드러나게 한국어로 적는다.
- 함수명이나 클래스명을 단순 번역하지 않는다.
- 오래된 기능명이나 제거된 route를 주석에 남기지 않는다.

## 3. Numbered Step Comment

함수 내부에 실제 처리 흐름이 있으면 번호 주석을 둔다.

```ts
// 기능 : 외부 인증 토큰을 검증하고 사용자/기기/세션을 생성합니다.
async execute(command: ExchangeExternalAuthTokenCommand) {
  // 1. 외부 인증 provider access token을 검증한다.
  const verifiedUser = await this.verifyExternalUser(command.externalAuthAccessToken);

  // 2. provider 사용자 정보와 기기 입력값을 내부 형식으로 정규화한다.
  const email = this.normalizeEmail(verifiedUser.email, verifiedUser.provider);

  // 3. 사용자, 기기, 세션 생성을 하나의 transaction 안에서 처리한다.
  return this.authRepository.runInTransaction(async (repository) => {
    // ...
  });
}
```

필수 대상:

- API controller method 내부
- application use case/service orchestration 내부
- transaction 내부 callback
- 외부 provider 호출 전후
- repository 저장/갱신/조회 흐름
- 인증/권한/ownership 검증 흐름
- 복구, rollback, idempotency, token rotation 흐름

규칙:

- TypeScript/JavaScript 파일은 `// 1. ...`, `// 2. ...` 형식을 사용한다.
- SQL, shell 등 다른 언어는 해당 언어의 주석 기호를 사용하되 번호 형식은 유지한다.
- 번호 주석은 코드 한 줄의 번역이 아니라 처리 의도와 흐름을 설명한다.
- 단순 type 선언, field 선언, import, 상수 선언에는 numbered step comment를 붙이지 않는다.
- 한 줄 getter/mapper라도 새로 작성하거나 수정하는 함수라면 최소한 `// 기능 : ...` 주석은 둔다.

## 4. Logging

- access token, refresh token, 개인정보 원문은 로그에 남기지 않는다.
- 사용자 입력 검색어는 필요한 경우에도 최소한으로 다룬다.
- 오류 로그에는 request id, user id, domain id처럼 추적에 필요한 값만 남긴다.
- 지원/에러 신고 같은 보조 flow 실패는 핵심 업무 실패와 분리해 기록한다.

## 5. 금지

- 주석 없이 새 class/interface/function/method를 추가하지 않는다.
- `// 기능 : 데이터를 처리합니다.`처럼 의미가 비어 있는 주석을 쓰지 않는다.
- numbered step comment를 코드 한 줄 한 줄 번역하는 방식으로 쓰지 않는다.
- commented-out code를 남기지 않는다.

## 6. Review Checklist

- 새로 작성하거나 수정한 class/interface에 `// 역할 : ...` 주석이 있는가?
- 새로 작성하거나 수정한 API controller method에 `// API : ...` 주석이 있는가?
- 새로 작성하거나 수정한 내부 method/function에 `// 기능 : ...` 주석이 있는가?
- 함수 내부의 주요 처리 흐름이 `// 1. ...`, `// 2. ...` numbered step comment로 읽히는가?
- 주석이 함수명 번역이 아니라 책임, 사용자 행동, 처리 의도를 설명하는가?
- token, 개인정보 원문, provider 오류 원문이 로그에 남지 않는가?

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
