# Backend Comment And Logging Convention

## 1. Comment Principle

Backend 주석은 역할과 처리 흐름을 빠르게 읽기 위한 기준이다.

이 프로젝트는 사용자 확정 규칙으로 Backend의 클래스/인터페이스, API controller 메소드, 내부 함수/메소드 주석을 강제한다.

## 2. Class And Interface Role Comment

Backend의 모든 클래스와 인터페이스에는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// 역할 : 회사 생성 유스케이스의 application orchestration을 담당합니다.
export class CreateCompanyUseCase {
  // ...
}

// 역할 : 회사 저장소가 구현해야 하는 영속성 계약을 정의합니다.
export interface CompanyRepository {
  // ...
}
```

규칙:

- 문구는 반드시 `// 역할 : `로 시작한다.
- 한 줄로 쓴다.
- 클래스나 인터페이스가 시스템 안에서 맡는 책임을 한국어로 적는다.
- NestJS decorator가 있는 class는 `// 역할 : ...` 주석을 decorator 바로 위에 둔다.
- 클래스와 인터페이스 선언에는 `// 기능 : ...`을 쓰지 않는다.

필수 대상:

- controller class
- application service/use case class
- domain entity/value object/domain service/error class
- repository interface
- port/interface
- repository/adapter/mapper implementation class
- DTO/request/response class
- guard/filter/interceptor/module class
- test fixture/helper class 또는 interface

## 3. API Comment

HTTP API 하나를 처리하는 controller 메소드에는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// API : 회사, 회사 생성
@Post()
@HttpCode(HttpStatus.CREATED)
async createCompany() {
  // ...
}
```

규칙:

- 문구는 반드시 `// API : `로 시작한다.
- 형식은 `도메인, 사용자 행동 또는 API 기능`으로 쓴다.
- API 주석은 HTTP endpoint를 직접 여는 controller 메소드에만 사용한다.
- API 주석은 route decorator 바로 위에 둔다.
- `// API : ...`와 `// 기능 : ...`을 같은 메소드에 중복해서 붙이지 않는다.

## 4. Function Comment

API controller 메소드가 호출하는 내부 메소드, application service, domain service, repository, adapter, helper는 바로 위에 다음 형식의 1줄 주석을 단다.

```ts
// 기능 : 회사 생성 요청의 분야와 지역 소유권을 검증합니다.
private async validateCompanyReferences() {
  // ...
}
```

규칙:

- 문구는 반드시 `// 기능 : `으로 시작한다.
- 한 줄로 쓴다.
- 호출자가 기대하는 역할을 한국어로 적는다.
- 함수명을 단순 번역하지 않는다.

## 5. Numbered Step Comment

Backend API controller와 application orchestration 메소드 내부에는 처리 흐름이 보이도록 numbered step comment를 둔다.

```ts
// 1. 현재 사용자 인증 정보를 확인한다.
// 2. application 계층에 회사 생성을 위임한다.
```

규칙:

- 단계 주석은 `// 1. ...`, `// 2. ...` 형식으로 쓴다.
- Controller에서는 인증/권한 확인, request 처리, application 계층 호출, response 처리처럼 큰 흐름을 보여준다.
- Application service/use case에서는 검증, 조회, 도메인 객체 생성, transaction, repository 저장, 외부 port 호출, 감사 로그 같은 흐름을 보여준다.
- 단순 getter, mapper, 순수 계산 함수에는 numbered step comment를 억지로 넣지 않는다.

## 6. Backend Logging

Backend logs are structured JSON.

Rules:

- use pino or the project logger wrapper
- no `console.log`
- no ASCII boxes or multiline separators
- short English event key
- context object for details
- PII is redacted
- request context injected automatically
- domain layer does not log
- exception filters and infrastructure adapters log

Good event shape:

```text
company.created
contact.duplicateDetected
deal.stageChanged
meetingNote.generated
admin.sensitiveRawView.requested
ocr.callFailed
```

Sensitive data includes:

- personal memo
- meeting note body
- deal amount
- user-marked sensitive data
- phone
- email
- token
- password
- business card image URL when private

## 7. 금지

- class/interface에 역할 주석을 생략하지 않는다.
- API controller method에 `// 기능 : ...`만 붙이고 API 의도를 숨기지 않는다.
- 내부 service/helper method에 `// API : ...`를 붙이지 않는다.
- 이름을 한국어로 번역한 수준의 주석을 쓰지 않는다.
- `console.log`를 사용하지 않는다.
- PII를 plain text로 logging하지 않는다.

## 8. Review Checklist

- 모든 Backend class/interface에 `// 역할 : ...` 주석이 있는가?
- 모든 Backend HTTP API controller method에 `// API : ...` 주석이 있는가?
- 모든 non-API function/method에 `// 기능 : ...` 주석이 있는가?
- API controller와 application orchestration flow가 numbered step comment로 읽히는가?
- domain layer가 log를 남기지 않는가?
- Admin reason text가 client log나 일반 logger로 새지 않는가?

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
