# Backend Architecture Rules

> NestJS 백엔드의 소프트웨어 아키텍처 규칙
> **Modular Monolith + DDD + Clean Architecture**

---

## 1. 핵심 원칙

### 1.1 3대 원칙
1. **Modular Monolith**: 단일 배포 단위 안에서 Bounded Context별 모듈 분리
2. **DDD (Domain-Driven Design)**: 도메인 모델 중심 설계
3. **Clean Architecture**: 의존성은 바깥에서 안쪽으로만 (Domain ← Application ← Infrastructure)

### 1.2 절대 규칙 (위반 시 PR 거부)
- ❌ **Domain Layer가 외부 라이브러리에 의존하면 안 됨** (Prisma, NestJS 데코레이터 등)
- ❌ **Application Service에서 DB 모델(Prisma 객체)을 그대로 다루면 안 됨** — 반드시 Domain Entity/VO로 변환
- ❌ **Controller에 비즈니스 로직을 넣으면 안 됨** — Application Service에 위임
- ❌ **모듈 간 직접 import 금지** — Public Interface(Application Service)로만 통신
- ❌ **Repository를 Application 외부에서 직접 호출 금지** — 반드시 Application Service 경유

---

## 2. 디렉토리 구조

### 2.1 전체 구조

**핵심**: 각 도메인 모듈은 자체 4계층(domain/application/infrastructure/presentation)을 가짐.

```
src/
├── modules/                        # Bounded Context (도메인)별 모듈
│   │                               # 각 모듈은 자체 4계층 구조
│   ├── user/                       # User 도메인 (자체 4계층)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── auth/                       # 인증 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── customer/                   # 거래처 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── deal/                       # 영업건 도메인
│   │   ├── domain/ application/ infrastructure/ presentation/
│   │
│   ├── company/                    # 회사 도메인
│   ├── note/                       # off-the-record 메모
│   ├── business-card/              # 명함 스캔
│   │
│   └── admin/                      # ★ Admin 전용 도메인 (분리 대비)
│       ├── domain/
│       ├── application/            # 관리자 유스케이스 (사용자 관리, 통계 등)
│       ├── infrastructure/
│       └── presentation/           # /admin/api/* 라우트
│
├── shared/                         # 공통 (Shared Kernel)
│   ├── domain/                     # 공통 도메인 (Money, Address 등)
│   ├── application/                # 공통 유스케이스 인터페이스
│   ├── infrastructure/             # Prisma, Logger, Sentry 등
│   └── presentation/               # 공통 미들웨어, 가드, 필터
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── admin.guard.ts      # Role === 'ADMIN' 체크
│       └── decorators/
│           └── current-user.decorator.ts
│
├── config/                         # 환경설정
├── main.ts
└── app.module.ts
```

### 2.2 모듈 내부 구조 (4-Layer Clean Architecture)

```
modules/customer/
│
├── domain/                         # ★ 핵심 비즈니스 (외부 의존 X)
│   ├── entities/
│   │   └── customer.entity.ts     # Customer aggregate root
│   ├── value-objects/
│   │   ├── phone-number.vo.ts
│   │   ├── region.vo.ts
│   │   └── customer-id.vo.ts
│   ├── events/
│   │   └── customer-created.event.ts
│   ├── repositories/
│   │   └── customer.repository.ts # 인터페이스만 (추상)
│   ├── services/                   # Domain Service (Entity로 안 끝나는 도메인 로직)
│   │   └── customer-merge.service.ts
│   └── errors/
│       └── customer.errors.ts      # CustomerNotFoundError 등
│
├── application/                    # 유스케이스 (오케스트레이션)
│   ├── commands/                   # 쓰기 작업
│   │   ├── create-customer.command.ts
│   │   ├── update-customer.command.ts
│   │   └── delete-customer.command.ts
│   ├── queries/                    # 읽기 작업
│   │   ├── find-customer.query.ts
│   │   └── list-customers.query.ts
│   ├── handlers/                   # CQRS handler
│   │   ├── create-customer.handler.ts
│   │   └── ...
│   ├── ports/                      # 외부 시스템 인터페이스
│   │   ├── ocr.port.ts
│   │   └── storage.port.ts
│   └── services/                   # Application Service (옵션)
│       └── customer.service.ts
│
├── infrastructure/                 # 외부 시스템 어댑터
│   ├── persistence/
│   │   ├── prisma-customer.repository.ts   # CustomerRepository 구현체
│   │   └── mappers/
│   │       └── customer.mapper.ts          # Prisma ↔ Domain 변환
│   ├── http/
│   │   └── clova-ocr.adapter.ts           # OcrPort 구현
│   ├── messaging/
│   │   └── customer-event.publisher.ts
│   └── customer.module.ts                  # NestJS Module 정의
│
└── presentation/                   # API Controller (Thin)
    ├── controllers/
    │   └── customer.controller.ts
    ├── dto/
    │   ├── create-customer.dto.ts
    │   └── customer.response.dto.ts
    └── mappers/
        └── customer-response.mapper.ts     # Domain → DTO 변환
```

---

## 3. 4 Layer 상세 규칙

### 3.1 Domain Layer (가장 안쪽, 가장 중요)

**역할**: 비즈니스 규칙, 불변식, 도메인 개념의 표현

**허용**:
- TypeScript 표준 라이브러리
- 다른 도메인 Entity/VO import (같은 모듈 내)
- `shared/domain` import

**금지**:
- ❌ NestJS 데코레이터 (`@Injectable`, `@Module` 등) - 순수 클래스만
- ❌ Prisma import
- ❌ HTTP/Axios/fetch
- ❌ Logger (도메인은 부수 효과 X, 예외만 throw)

**Entity 예시**:
```typescript
// modules/customer/domain/entities/customer.entity.ts
export class Customer {
  private constructor(
    private readonly _id: CustomerId,
    private _name: string,
    private _phone: PhoneNumber | null,
    private _region: Region | null,
    private readonly _userId: UserId,
    private _createdAt: Date,
  ) {}

  static create(props: CreateCustomerProps): Customer {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidCustomerNameError();
    }
    return new Customer(
      CustomerId.generate(),
      props.name.trim(),
      props.phone ? PhoneNumber.from(props.phone) : null,
      props.region ? Region.from(props.region) : null,
      props.userId,
      new Date(),
    );
  }

  static reconstitute(props: CustomerReconstituteProps): Customer {
    // DB에서 복원할 때 (검증 없이)
    return new Customer(...);
  }

  changeRegion(region: Region): void {
    this._region = region;
  }

  get id(): CustomerId { return this._id; }
  get name(): string { return this._name; }
  // ...
}
```

**Value Object 예시**:
```typescript
// modules/customer/domain/value-objects/phone-number.vo.ts
export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static from(input: string): PhoneNumber {
    const normalized = input.replace(/[^0-9]/g, '');
    if (!/^01[0-9]{8,9}$/.test(normalized)) {
      throw new InvalidPhoneNumberError(input);
    }
    return new PhoneNumber(normalized);
  }

  toString(): string { return this.value; }
  equals(other: PhoneNumber): boolean { return this.value === other.value; }
}
```

**Repository 인터페이스 예시**:
```typescript
// modules/customer/domain/repositories/customer.repository.ts
export interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  findByUserAndPhone(userId: UserId, phone: PhoneNumber): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  delete(id: CustomerId): Promise<void>;
}

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');
```

---

### 3.2 Application Layer (유스케이스)

**역할**: 유스케이스 조율, 트랜잭션 경계, 권한 체크

**허용**:
- Domain Layer import
- Port 인터페이스 정의 (외부 시스템 추상)
- NestJS `@Injectable` (DI 위함)

**금지**:
- ❌ Prisma 직접 사용
- ❌ HTTP 라이브러리 직접 사용 (Port를 통해서만)
- ❌ DB 모델(Prisma 객체)을 그대로 반환

**Service 예시**:
```typescript
// modules/customer/application/services/customer.service.ts
@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: CustomerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async createCustomer(command: CreateCustomerCommand): Promise<Customer> {
    // 1. 중복 체크 (도메인 규칙)
    if (command.phone) {
      const existing = await this.customerRepo.findByUserAndPhone(
        command.userId,
        PhoneNumber.from(command.phone),
      );
      if (existing) throw new DuplicateCustomerError();
    }

    // 2. 도메인 객체 생성 (검증은 Customer.create에서)
    const customer = Customer.create({
      name: command.name,
      phone: command.phone,
      region: command.region,
      userId: command.userId,
    });

    // 3. 저장
    await this.customerRepo.save(customer);

    // 4. 도메인 이벤트 발행
    this.eventPublisher.publish(new CustomerCreatedEvent(customer.id));

    return customer;
  }
}
```

**Command/Query 객체**:
```typescript
// modules/customer/application/commands/create-customer.command.ts
export class CreateCustomerCommand {
  constructor(
    public readonly userId: UserId,
    public readonly name: string,
    public readonly phone?: string,
    public readonly region?: string,
  ) {}
}
```

---

### 3.3 Infrastructure Layer (외부 시스템 어댑터)

**역할**: Domain/Application의 인터페이스를 실제 기술로 구현

**허용**:
- Prisma 사용
- HTTP/Axios
- 외부 라이브러리 자유롭게
- Domain/Application import (구현하기 위해)

**Repository 구현 예시**:
```typescript
// modules/customer/infrastructure/persistence/prisma-customer.repository.ts
@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: CustomerId): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({
      where: { id: id.toString() },
    });
    return row ? CustomerMapper.toDomain(row) : null;
  }

  async save(customer: Customer): Promise<void> {
    const data = CustomerMapper.toPersistence(customer);
    await this.prisma.customer.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
  // ...
}
```

**Mapper 예시**:
```typescript
// modules/customer/infrastructure/persistence/mappers/customer.mapper.ts
export class CustomerMapper {
  static toDomain(row: PrismaCustomer): Customer {
    return Customer.reconstitute({
      id: CustomerId.from(row.id),
      name: row.name,
      phone: row.phone ? PhoneNumber.from(row.phone) : null,
      region: row.region ? Region.from(row.region) : null,
      userId: UserId.from(row.userId),
      createdAt: row.createdAt,
    });
  }

  static toPersistence(customer: Customer): PrismaCustomerData {
    return {
      id: customer.id.toString(),
      name: customer.name,
      phone: customer.phone?.toString() ?? null,
      region: customer.region?.toString() ?? null,
      userId: customer.userId.toString(),
      createdAt: customer.createdAt,
    };
  }
}
```

**모듈 정의**:
```typescript
// modules/customer/infrastructure/customer.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CustomerService],  // 다른 모듈이 쓰려면 Service만 export
})
export class CustomerModule {}
```

---

### 3.4 Presentation Layer (Controller, Thin)

**역할**: HTTP 요청을 Application Layer로 위임

**허용**:
- NestJS 데코레이터
- DTO 정의 + class-validator
- Application Service 호출

**금지**:
- ❌ 비즈니스 로직 (검증은 DTO 레벨, 도메인 검증은 Domain Layer)
- ❌ Repository 직접 호출
- ❌ Prisma 직접 사용
- ❌ Domain Entity를 그대로 JSON 응답 (Mapper로 DTO 변환)

**Controller 예시 (User용)**:
```typescript
// modules/customer/presentation/controllers/customer.controller.ts
@Controller('api/customers')                       // ★ /api/* 는 User용
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.createCustomer(
      new CreateCustomerCommand(
        UserId.from(user.id),
        dto.name,
        dto.phone,
        dto.region,
      ),
    );
    return CustomerResponseMapper.toDto(customer);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.findById(
      CustomerId.from(id),
      UserId.from(user.id),
    );
    return CustomerResponseMapper.toDto(customer);
  }
}
```

**Controller 예시 (Admin용)**:
```typescript
// modules/admin/presentation/controllers/admin-customer.controller.ts
@Controller('admin/api/customers')                 // ★ /admin/api/* 는 Admin용
@UseGuards(JwtAuthGuard, AdminGuard)               // ★ AdminGuard 추가
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async listAll(): Promise<CustomerResponseDto[]> {
    // Admin은 모든 사용자의 거래처 조회 가능
    const customers = await this.customerService.findAllForAdmin();
    return customers.map(CustomerResponseMapper.toDto);
  }
}
```

---

## 4. 모듈 간 통신 규칙

### 4.1 동기 통신 (Application Service 호출)

```typescript
// modules/deal/application/services/deal.service.ts
@Injectable()
export class DealService {
  constructor(
    @Inject(DEAL_REPOSITORY) private readonly dealRepo: DealRepository,
    private readonly customerService: CustomerService,  // ✅ 다른 모듈의 Service 사용 OK
  ) {}

  async createDeal(command: CreateDealCommand): Promise<Deal> {
    // 거래처 존재 확인 (Customer 모듈 호출)
    const customer = await this.customerService.findById(command.customerId, command.userId);
    
    const deal = Deal.create({ ...command, customerId: customer.id });
    await this.dealRepo.save(deal);
    return deal;
  }
}
```

**❌ 금지**:
```typescript
// 다른 모듈의 Repository를 직접 호출 X
constructor(
  @Inject(CUSTOMER_REPOSITORY) private customerRepo: CustomerRepository,
) {}
```

### 4.2 비동기 통신 (도메인 이벤트)

모듈 간 느슨한 결합이 필요할 때 (예: 거래처 생성 시 명함 OCR 처리):

```typescript
// modules/business-card 가 customer-created 이벤트 구독
@EventsHandler(CustomerCreatedEvent)
export class CustomerCreatedHandler {
  async handle(event: CustomerCreatedEvent) {
    // 명함 OCR 후처리 등
  }
}
```

---

## 5. 트랜잭션 처리

### 5.1 Application Service에서 트랜잭션 경계 설정

```typescript
@Injectable()
export class DealService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(DEAL_REPOSITORY) private readonly dealRepo: DealRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: CustomerRepository,
  ) {}

  async createDealWithNewCustomer(cmd: CreateDealWithCustomerCommand) {
    return this.prisma.$transaction(async (tx) => {
      const customer = Customer.create({ ... });
      await this.customerRepo.saveWithTx(customer, tx);

      const deal = Deal.create({ customerId: customer.id, ... });
      await this.dealRepo.saveWithTx(deal, tx);

      return deal;
    });
  }
}
```

**규칙**:
- 트랜잭션은 Application Layer에서만 시작
- Domain Layer는 트랜잭션을 모름
- 복잡해지면 Unit of Work 패턴 도입

---

## 6. 에러 처리

### 6.1 Domain Error
```typescript
// modules/customer/domain/errors/customer.errors.ts
export class CustomerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Customer not found: ${id}`, 'CUSTOMER_NOT_FOUND');
  }
}

export class DuplicateCustomerError extends DomainError {
  constructor() {
    super('Customer with this phone already exists', 'DUPLICATE_CUSTOMER');
  }
}
```

### 6.2 Exception Filter로 HTTP 변환
```typescript
// shared/presentation/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, number> = {
      CUSTOMER_NOT_FOUND: 404,
      DUPLICATE_CUSTOMER: 409,
      INVALID_PHONE_NUMBER: 400,
    };

    const status = statusMap[error.code] ?? 400;
    response.status(status).json({
      code: error.code,
      message: error.message,
    });
  }
}
```

---

## 7. 의존성 규칙 (Dependency Rule)

```
┌─────────────────────────────────────────┐
│  Presentation (Controller, DTO)         │ ←─┐
└─────────────────────────────────────────┘   │
                  ↓                            │
┌─────────────────────────────────────────┐   │
│  Application (Service, Command, Query)  │   │ 의존 방향
└─────────────────────────────────────────┘   │
                  ↓                            │
┌─────────────────────────────────────────┐   │
│  Domain (Entity, VO, Repo Interface)    │   │
└─────────────────────────────────────────┘   │
                  ↑                            │
┌─────────────────────────────────────────┐   │
│  Infrastructure (Prisma Repo 구현 등)   │ ──┘
└─────────────────────────────────────────┘
```

**핵심**: Infrastructure는 Domain의 인터페이스를 구현하지만, Domain은 Infrastructure를 모름 (의존성 역전)

---

## 8. 폴더 명명 규칙

| 항목 | 명명 |
|------|------|
| Entity | `customer.entity.ts` (단수 + .entity.ts) |
| Value Object | `phone-number.vo.ts` |
| Repository 인터페이스 | `customer.repository.ts` |
| Repository 구현 | `prisma-customer.repository.ts` |
| Service | `customer.service.ts` |
| Command | `create-customer.command.ts` |
| Query | `find-customer.query.ts` |
| Event | `customer-created.event.ts` |
| Handler | `create-customer.handler.ts` |
| Controller | `customer.controller.ts` |
| DTO (요청) | `create-customer.dto.ts` |
| DTO (응답) | `customer.response.dto.ts` |
| Mapper | `customer.mapper.ts` |
| Error | `customer.errors.ts` |

---

## 9. 새 모듈 만들 때 체크리스트

```
☐ domain/
  ☐ entities/ (aggregate root 1개 이상)
  ☐ value-objects/
  ☐ repositories/ (인터페이스 + Symbol)
  ☐ errors/
☐ application/
  ☐ commands/ + queries/
  ☐ services/
  ☐ ports/ (외부 시스템 인터페이스)
☐ infrastructure/
  ☐ persistence/ (Prisma 구현 + Mapper)
  ☐ <module>.module.ts (NestJS 모듈, Repository 바인딩)
☐ presentation/
  ☐ controllers/
  ☐ dto/
  ☐ mappers/ (Domain → DTO)
```

---

## 10. 안티 패턴 (Don't)

### 10.1 ❌ Anemic Domain Model
```typescript
// ❌ 나쁨: Entity에 getter/setter만
export class Customer {
  id: string;
  name: string;
  phone: string;
  // ... 비즈니스 로직 X
}
```

```typescript
// ✅ 좋음: 비즈니스 로직이 Entity에
export class Customer {
  changeRegion(region: Region): void { ... }
  canBeMergedWith(other: Customer): boolean { ... }
}
```

### 10.2 ❌ Application Service에서 Prisma 직접 사용
```typescript
// ❌ 나쁨
async createCustomer(dto: CreateCustomerDto) {
  return this.prisma.customer.create({ data: dto });
}
```

```typescript
// ✅ 좋음
async createCustomer(cmd: CreateCustomerCommand) {
  const customer = Customer.create({ ... });
  await this.customerRepo.save(customer);
  return customer;
}
```

### 10.3 ❌ Domain에서 외부 라이브러리 import
```typescript
// ❌ 나쁨
import { Injectable } from '@nestjs/common';
import { PrismaCustomer } from '@prisma/client';

@Injectable()  // 도메인이 NestJS를 알면 안 됨
export class Customer { ... }
```

### 10.4 ❌ Controller에서 Domain 직접 반환
```typescript
// ❌ 나쁨: Domain 객체를 그대로 JSON으로
return customer;
```

```typescript
// ✅ 좋음: DTO로 변환
return CustomerResponseMapper.toDto(customer);
```

### 10.5 ❌ 모듈 간 Repository 직접 호출
```typescript
// ❌ 나쁨: Deal 모듈이 Customer Repository를 직접 사용
constructor(@Inject(CUSTOMER_REPOSITORY) private customerRepo: CustomerRepository) {}
```

```typescript
// ✅ 좋음: Customer Service를 통해서
constructor(private readonly customerService: CustomerService) {}
```

---

## 11. Admin vs User 분리 전략 (단일 백엔드)

### 11.1 기본 방침
**같은 백엔드 서버에서 Admin/User를 처리하되, 나중에 분리 가능하도록 코드 영역을 미리 분리한다.**

- 빠른 개발 우선 (Phase 1~4)
- 분리 신호 감지 시 1~2일 내 분리 가능하도록 설계

### 11.2 라우트 분리

| 영역 | URL 접두사 | 가드 | 위치 |
|------|----------|-----|------|
| User API | `/api/*` | `JwtAuthGuard` | 각 도메인 모듈의 `presentation/controllers/` |
| Admin API | `/admin/api/*` | `JwtAuthGuard` + `AdminGuard` | `modules/admin/presentation/` 또는 도메인 모듈 내 별도 controller |

### 11.3 Role 기반 권한 (User 테이블 컬럼)

```typescript
// modules/user/domain/value-objects/user-role.vo.ts
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// User Entity에 role 포함
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private _role: UserRole,
    // ...
  ) {}
  
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }
}
```

```typescript
// shared/presentation/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // JwtAuthGuard가 채워둠
    
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
```

JWT 페이로드에 `role` 포함:
```typescript
{
  sub: 'user-uuid',
  email: 'user@example.com',
  role: 'ADMIN',  // ★
  exp: ...
}
```

### 11.4 Admin 전용 도메인 로직 위치

#### 케이스 A: 도메인 모듈에 Admin Controller 추가
거래처/영업건 같은 **기존 도메인을 관리자도 조회**하는 경우:

```
modules/customer/
├── domain/                              # 공유
├── application/
│   └── services/
│       └── customer.service.ts          # findByUser(), findAllForAdmin() 둘 다 정의
├── infrastructure/
└── presentation/
    ├── controllers/
    │   ├── customer.controller.ts       # User용 (/api/customers)
    │   └── admin-customer.controller.ts # Admin용 (/admin/api/customers)
    └── dto/
```

**Application Service 예시**:
```typescript
@Injectable()
export class CustomerService {
  // User: 본인 거래처만
  async findByUser(userId: UserId): Promise<Customer[]> {
    return this.customerRepo.findByUserId(userId);
  }
  
  // ★ Admin 전용 메서드는 이름에 명시
  async findAllForAdmin(): Promise<Customer[]> {
    return this.customerRepo.findAll();
  }
  
  async countAllForAdmin(): Promise<number> {
    return this.customerRepo.count();
  }
}
```

#### 케이스 B: Admin 전용 도메인 (사용자 관리, 시스템 통계)
관리자만 다루는 새 도메인:

```
modules/admin/
├── domain/
│   ├── entities/
│   │   └── system-metrics.entity.ts
│   └── services/
│       └── user-management.service.ts
├── application/
│   ├── services/
│   │   ├── user-management.service.ts  # 사용자 활성화/비활성화 등
│   │   └── metrics.service.ts          # 전체 통계
│   └── ports/
├── infrastructure/
│   └── persistence/
└── presentation/
    └── controllers/
        ├── admin-user-management.controller.ts
        └── admin-metrics.controller.ts
```

### 11.5 절대 규칙 (Admin 분리 대비)

- ✅ Admin Controller는 **반드시 `/admin/api/*` 접두사**
- ✅ Admin Controller는 **반드시 `AdminGuard` 사용**
- ✅ Admin 전용 메서드는 이름에 `ForAdmin` 명시 (예: `findAllForAdmin`)
- ✅ Admin 전용 도메인은 `modules/admin/`으로 격리
- ❌ User Controller에서 role 체크로 Admin 기능 분기 금지 (반드시 별도 Controller)
- ❌ Admin이 User의 Application Service를 호출할 때 user_id 우회 금지 (Admin 전용 메서드 사용)

### 11.6 분리 시점 신호 (참고)

다음 중 발생 시 백엔드 분리 검토:
- Admin이 무거운 통계/분석 쿼리로 User API 응답 느려짐
- Admin 사용자 수 증가 (관리자가 10명+)
- 보안 격리 요구 강해짐 (Admin은 VPN 안에서만 접근 등)
- Admin 배포 주기와 User 배포 주기가 달라짐

### 11.7 분리 작업 (분리 시점 도달 시)

1. `modules/admin/` 폴더 전체를 새 레포로 복사
2. 공유 도메인 모듈(`customer`, `deal` 등)은 npm 패키지로 추출하거나 복사
3. Admin 전용 메서드(`findAllForAdmin`)를 새 서버에서 활성화
4. 기존 단일 서버에서 Admin 라우트 제거
5. DNS: `admin-api.yourdomain.com` 추가

---

## 12. AI에게 작업 시킬 때 강조할 것

1. "이 모듈의 도메인 레이어는 NestJS와 Prisma를 import하지 마라"
2. "Application Service는 반드시 Domain Entity로 작업하고, Repository를 통해 저장하라"
3. "Controller에는 비즈니스 로직 넣지 말고, Service에 위임만 해라"
4. "다른 모듈을 쓸 때는 Application Service만 호출하라 (Repository 직접 X)"
5. "응답은 Domain Entity가 아니라 DTO로 변환해서 반환하라"
6. "User용 Controller는 /api/*, Admin용은 /admin/api/* 접두사 + AdminGuard 사용"
7. "Admin 전용 메서드는 이름에 ForAdmin 명시 (findAllForAdmin 등)"
8. "각 도메인 모듈은 자체 4계층(domain/application/infrastructure/presentation)을 가진다"
