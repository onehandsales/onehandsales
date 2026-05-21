# Backend Code Convention

> NestJS + TypeScript 코드 컨벤션
> 아키텍처 규칙은 별도 (architecture.md 참고)

---

## 1. 파일 명명

### 1.1 파일명: kebab-case + 역할 suffix
```
customer.entity.ts
phone-number.vo.ts
customer.repository.ts
prisma-customer.repository.ts
create-customer.command.ts
create-customer.handler.ts
customer-created.event.ts
customer.controller.ts
create-customer.dto.ts
customer.response.dto.ts
customer.mapper.ts
customer.errors.ts
customer.module.ts
customer.service.ts
jwt-auth.guard.ts
current-user.decorator.ts
domain-exception.filter.ts
logging.interceptor.ts
```

### 1.2 디렉토리: kebab-case
```
business-card/
modules/
value-objects/
```

### 1.3 클래스: PascalCase
```typescript
export class Customer {}
export class CreateCustomerCommand {}
export class PhoneNumber {}
```

### 1.4 인터페이스: PascalCase (I 접두사 금지)
```typescript
// ✅
export interface CustomerRepository {}

// ❌
export interface ICustomerRepository {}
```

### 1.5 함수/변수: camelCase
```typescript
const currentUser = ...;
function findCustomerById(id: string) {}
```

### 1.6 상수: UPPER_SNAKE_CASE
```typescript
export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
export const MAX_PAGE_SIZE = 100;
```

### 1.7 enum: PascalCase + 멤버 UPPER_SNAKE_CASE
```typescript
export enum DealStatus {
  LEAD = 'LEAD',
  IN_PROGRESS = 'IN_PROGRESS',
  WON = 'WON',
  LOST = 'LOST',
}
```

---

## 2. TypeScript 규칙

### 2.1 strict 모드 필수
`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2.2 `any` 금지
```typescript
// ❌
function process(data: any) {}

// ✅ unknown + 타입 가드
function process(data: unknown) {
  if (isCustomerData(data)) { ... }
}
```

### 2.3 `as` 형변환 최소화
```typescript
// ❌
const customer = result as Customer;

// ✅ 타입 가드 또는 명시적 변환
if (result instanceof Customer) {
  // ...
}
```

### 2.4 `null` vs `undefined`
- DB 컬럼: `null` (Optional column)
- 함수 파라미터 미지정: `undefined` (`?` 사용)
- 일관성: 도메인은 명시적 `null`, TypeScript optional은 `undefined`

### 2.5 readonly 적극 사용
```typescript
export class Customer {
  private constructor(
    private readonly _id: CustomerId,
    private _name: string,  // 변경 가능한 것만 readonly 빼기
  ) {}
}
```

### 2.6 enum vs union type
- DB 값과 매칭되는 건 enum
- 내부 분기만 하는 건 union type
```typescript
type SortDirection = 'asc' | 'desc';  // union
enum DealStatus { ... }                // enum
```

---

## 3. NestJS 규칙

### 3.1 DTO는 class-validator + class-transformer
```typescript
// presentation/dto/create-customer.dto.ts
export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  region?: string;
}
```

### 3.2 main.ts ValidationPipe 글로벌 설정
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // DTO에 없는 필드 제거
    forbidNonWhitelisted: true,  // 있으면 에러
    transform: true,        // string → number 등 자동 변환
  }),
);
```

### 3.3 Module 정의는 Infrastructure에
```typescript
// modules/customer/infrastructure/customer.module.ts
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
```

### 3.4 의존성 주입: 생성자 주입만
```typescript
// ✅
constructor(
  @Inject(CUSTOMER_REPOSITORY)
  private readonly customerRepo: CustomerRepository,
) {}

// ❌ property injection 금지
@Inject(CUSTOMER_REPOSITORY)
private customerRepo!: CustomerRepository;
```

### 3.5 Controller 메서드는 짧게
```typescript
// ✅ Application Service 호출 + 매핑만
@Post()
async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponseDto> {
  const customer = await this.customerService.create(toCommand(dto));
  return CustomerResponseMapper.toDto(customer);
}
```

---

## 4. Prisma 규칙

### 4.1 스키마 작성 규칙
- 모델명: PascalCase (`Customer`, `Deal`)
- 필드명: camelCase (`createdAt`, `userId`)
- 인덱스: `@@index([userId, region])` (자주 쓰는 쿼리 기준)
- soft delete: `deletedAt DateTime?`로 일관 (사용 시)

### 4.2 마이그레이션
- 마이그레이션 이름: 명령형 + snake_case
  - `npx prisma migrate dev --name add_customers_table`
  - `npx prisma migrate dev --name add_region_index_to_customers`
- 마이그레이션 파일은 절대 수정/삭제 금지 (이미 적용된 것)

### 4.3 Prisma는 Infrastructure에서만
- Domain/Application에서 `import { PrismaClient }` 금지
- Repository 구현체에서만 사용

### 4.4 N+1 방지: `include`/`select` 활용
```typescript
const deals = await this.prisma.deal.findMany({
  where: { userId },
  include: { customer: true },  // N+1 방지
});
```

---

## 5. 비동기 처리

### 5.1 async/await 일관 사용
```typescript
// ✅
async findById(id: CustomerId): Promise<Customer | null> {
  const row = await this.prisma.customer.findUnique({ where: { id: id.toString() } });
  return row ? CustomerMapper.toDomain(row) : null;
}

// ❌ then/catch 체이닝
findById(id: CustomerId) {
  return this.prisma.customer.findUnique({...}).then(...);
}
```

### 5.2 병렬 처리: Promise.all
```typescript
// ✅
const [customer, deals] = await Promise.all([
  this.customerService.findById(customerId),
  this.dealService.findByCustomer(customerId),
]);

// ❌ 직렬 처리
const customer = await this.customerService.findById(customerId);
const deals = await this.dealService.findByCustomer(customerId);
```

### 5.3 unhandled rejection 금지
```typescript
// ✅
try {
  await someAsyncOperation();
} catch (error) {
  this.logger.error('...', error);
  throw error;
}

// ❌ await 빠뜨림
someAsyncOperation();  // ← 에러 무시됨
```

---

## 6. 에러 처리

### 6.1 Domain Error 클래스 사용
```typescript
// ✅
throw new CustomerNotFoundError(id);

// ❌
throw new Error('Customer not found');
```

### 6.2 Exception Filter로 일괄 처리
- Controller에서 try/catch 남발 X
- Domain Error → Exception Filter → HTTP 응답

### 6.3 외부 호출 에러 핸들링
```typescript
// Infrastructure에서 외부 호출
async callClovaOcr(image: Buffer) {
  try {
    return await axios.post(...);
  } catch (error) {
    this.logger.error('CLOVA OCR call failed', error);
    throw new OcrServiceUnavailableError();  // Domain Error로 변환
  }
}
```

---

## 7. 로깅

### 7.1 pino 사용 (nestjs-pino)
```typescript
constructor(@InjectPinoLogger(CustomerService.name) private readonly logger: PinoLogger) {}

this.logger.info({ customerId: id.toString() }, 'Customer created');
this.logger.error({ err: error, customerId: id.toString() }, 'Failed to create customer');
```

### 7.2 로그 레벨
- `error`: 에러 (Sentry 전송)
- `warn`: 비정상이지만 처리 가능
- `info`: 주요 이벤트 (생성/수정/삭제)
- `debug`: 개발용 (production에서 비활성)

### 7.3 개인정보 로깅 금지
- 비밀번호, 토큰, 전체 전화번호, 명함 이미지 URL 등은 마스킹
```typescript
this.logger.info({ phone: phone.toMasked() }, 'Customer searched');  // 010-1234-**** 식
```

---

## 8. 환경변수

### 8.1 `.env.example`에 모든 변수 명시
```bash
NODE_ENV=
PORT=
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
APP_ORIGIN=
SENTRY_DSN=
```

### 8.2 ConfigModule + Joi 검증
```typescript
// config/env.validation.ts
export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  // ...
});
```

### 8.3 환경변수 직접 접근 금지
```typescript
// ❌
const url = process.env.DATABASE_URL;

// ✅
constructor(private readonly config: ConfigService) {}
this.config.get('DATABASE_URL');
```

---

## 9. import 정렬

### 9.1 순서
1. Node.js 표준 (`fs`, `path`)
2. 외부 라이브러리 (`@nestjs/*`, `axios`)
3. 내부 절대 경로 (`@/modules/customer/...`)
4. 상대 경로 (`./customer.entity`)

```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { CustomerRepository } from '@/modules/customer/domain/repositories/customer.repository';

import { Customer } from './customer.entity';
```

### 9.2 tsconfig paths 활용
```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

---

## 10. 테스트 (작성하는 경우)

### 10.1 단위 테스트는 Domain Layer 위주
- Domain 로직 (Entity, VO)
- 외부 의존 없는 순수 로직

### 10.2 통합 테스트는 인증/엑셀 Import만 (정책)
- 인증: 다른 사용자 데이터 누출 방지
- 엑셀 Import: 다양한 형식 회귀 방지

### 10.3 파일명
```
customer.entity.spec.ts    # 단위
auth.integration.spec.ts   # 통합
```

---

## 11. Git 커밋 메시지

### 11.1 Conventional Commits
```
feat(customer): add region filter
fix(deal): correct probability calculation
refactor(customer): extract phone validation to VO
chore: bump nestjs to v10.3
docs: update architecture rules
```

### 11.2 종류
- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `chore`: 빌드/의존성
- `docs`: 문서
- `test`: 테스트
- `style`: 포맷팅

---

## 12. 금지 사항 요약

### 12.1 절대 금지
- ❌ `any` 사용
- ❌ Domain Layer에 NestJS/Prisma import
- ❌ Application Service에서 Prisma 직접 사용
- ❌ Controller에 비즈니스 로직
- ❌ 모듈 간 Repository 직접 호출
- ❌ 환경변수 `process.env` 직접 접근
- ❌ `console.log` 사용 (pino logger 사용)
- ❌ 비밀번호/토큰 로깅
- ❌ 마이그레이션 파일 수정/삭제
- ❌ `--no-verify`로 hook skip

### 12.2 권장 사항
- ✅ readonly 적극 사용
- ✅ Promise.all로 병렬 처리
- ✅ Domain Error 클래스 정의
- ✅ class-validator로 DTO 검증
- ✅ tsconfig paths 활용
