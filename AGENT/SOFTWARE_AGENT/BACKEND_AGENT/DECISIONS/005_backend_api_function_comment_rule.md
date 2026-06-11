# Backend API, 역할, 기능 주석 규칙 결정

## 1. 결정

Backend 코드에서 HTTP API controller 메소드는 `// API : ...` 주석으로 API 기능을 표시한다.

Backend 클래스와 인터페이스는 `// 역할 : ...` 주석으로 시스템 안에서 맡는 책임을 표시한다.

API controller 메소드가 호출하는 내부 메소드, application service, domain service, repository, adapter, helper는 `// 기능 : ...` 주석으로 기능을 표시한다.

API controller와 application orchestration 메소드 내부에는 처리 흐름이 보이도록 `// 1. ...`, `// 2. ...` 형식의 numbered step comment를 둔다.

## 2. 이유

Backend 구현은 API 하나가 controller, application service, domain 검증, repository, external port를 거쳐 처리된다.

API별로 어떤 사용자 행동을 처리하는지 주석으로 먼저 보이면 구현자와 리뷰어가 endpoint의 의도를 빠르게 확인할 수 있다. 또한 내부 메소드에는 `기능` 주석을 사용하면 API와 내부 기능의 책임이 섞이지 않는다.

클래스와 인터페이스는 Clean Architecture 계층 안에서 책임과 경계를 표현하는 단위다. 어떤 클래스가 controller인지, use case인지, repository 구현체인지, 어떤 인터페이스가 repository 계약인지 external provider port인지 주석으로 명확히 남기면 계층 경계와 의존 방향을 검토하기 쉬워진다.

numbered step comment는 긴 use case에서 인증, 검증, transaction, repository 저장, 외부 port 호출, 감사 로그 같은 처리 순서를 읽기 쉽게 만든다.

## 3. 적용 규칙

- HTTP endpoint를 직접 여는 Backend controller 메소드는 `// API : 도메인, 사용자 행동 또는 API 기능` 형식을 사용한다.
- `// API : ...` 주석은 route decorator 바로 위에 둔다.
- API controller 메소드에는 `// API : ...`와 `// 기능 : ...`을 중복해서 붙이지 않는다.
- Backend 클래스와 인터페이스 선언 바로 위에는 `// 역할 : ...` 형식을 사용한다.
- `// 역할 : ...` 주석은 클래스 또는 인터페이스가 시스템 안에서 맡는 책임을 설명한다.
- NestJS decorator가 있는 class는 `// 역할 : ...` 주석을 decorator 바로 위에 둔다.
- 클래스와 인터페이스 선언에는 `// 기능 : ...`을 쓰지 않는다.
- API controller가 호출하는 내부 메소드와 service/use case/helper는 `// 기능 : ...` 형식을 사용한다.
- Controller 내부 단계는 인증/권한 확인, request 처리, application 계층 호출, response 처리 같은 큰 흐름을 기준으로 적는다.
- Application service/use case 내부 단계는 검증, 조회, 도메인 객체 생성, transaction, repository 저장, 외부 port 호출, 감사 로그 같은 흐름을 기준으로 적는다.
- 단순 getter, mapper, 순수 계산 함수처럼 흐름을 나눌 필요가 없는 함수에는 numbered step comment를 억지로 넣지 않는다.

## 4. 예시

```ts
// 역할 : 회사 API 요청을 받아 application 계층으로 위임하는 controller입니다.
@Controller('/api/companies')
export class CompanyController {
  constructor(private readonly createCompanyUseCase: CreateCompanyUseCase) {}

  // API : 회사, 회사 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Body() request: CreateCompanyRequestDto): Promise<void> {
    // 1. 현재 사용자 인증 정보를 확인한다.
    const currentUser = this.getCurrentUser();

    // 2. application 계층에 회사 생성을 위임한다.
    await this.createCompanyUseCase.execute({
      userId: currentUser.id,
      companyName: request.companyName,
    });
  }
}

// 역할 : 회사 저장소가 구현해야 하는 영속성 계약을 정의합니다.
export interface CompanyRepository {
  findFieldById(companyFieldId: string, userId: string): Promise<CompanyField | null>;
  findRegionById(companyRegionId: string, userId: string): Promise<CompanyRegion | null>;
}

// 역할 : 회사 생성 요청을 검증하고 저장하는 application use case입니다.
export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: CompanyRepository) {}

  // 기능 : 회사 생성 요청의 분야와 지역 소유권을 검증합니다.
  private async validateCompanyReferences(command: CreateCompanyCommand): Promise<void> {
    // 1. 회사 분야가 현재 사용자 소유인지 확인한다.
    await this.companyRepository.findFieldById(command.companyFieldId, command.userId);

    // 2. 회사 지역이 현재 사용자 소유인지 확인한다.
    await this.companyRepository.findRegionById(command.companyRegionId, command.userId);
  }
}
```

## 5. 금지

- API controller 메소드에 내부 기능용 `// 기능 : ...`만 붙이고 API 의도를 숨기지 않는다.
- 클래스와 인터페이스에 역할 주석을 생략하지 않는다.
- 클래스명이나 인터페이스명을 한국어로 번역한 수준의 `// 역할 : ...` 주석을 쓰지 않는다.
- 클래스와 인터페이스 선언에 `// 기능 : ...` 주석을 쓰지 않는다.
- 내부 service/helper 메소드에 `// API : ...`를 붙이지 않는다.
- 함수명을 한국어로 번역한 수준의 주석을 쓰지 않는다.
- numbered step comment를 코드 한 줄 한 줄 번역하는 방식으로 쓰지 않는다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
