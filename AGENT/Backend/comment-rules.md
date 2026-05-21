# Backend Comment Rules

> 주석은 "WHY"만 적는다. "WHAT"은 코드와 명명으로 표현한다.

---

## 1. 핵심 원칙

### 1.1 주석은 기본적으로 쓰지 않는다
- 잘 짠 코드는 주석 없이 읽힘
- 좋은 변수명/함수명/타입이 주석을 대체
- 주석은 코드가 바뀌면 거짓말이 됨 (관리 비용)

### 1.2 주석이 필요한 경우 (WHY)
- 코드만 보고는 알 수 없는 **이유/맥락**
- 비즈니스적 제약 (예: "법적으로 7년 보관")
- 외부 시스템의 특이 동작 회피 (예: "CLOVA OCR이 빈 응답 줄 때")
- 알고리즘 선택 이유 (예: "O(n^2)지만 데이터 50개 이하 보장됨")
- TODO/HACK/FIXME (반드시 이슈 번호 또는 날짜)

### 1.3 절대 쓰지 말 것
- ❌ 코드가 무엇을 하는지 그대로 적기
- ❌ 함수명을 한국어로 번역하기
- ❌ 변경 이력 (Git이 함)
- ❌ 누가 언제 작성했는지 (Git이 함)
- ❌ 주석 처리한 코드 (Git이 보관)

---

## 2. 좋은 주석 예시

### 2.1 비즈니스 제약
```typescript
// 영업사원이 같은 거래처에 연락 가능 여부 판단:
// 법적 영업 제한 시간(20시~9시)에는 자동 호출 불가
function canCallNow(customer: Customer): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 20;
}
```

### 2.2 외부 시스템 회피
```typescript
async parseBusinessCard(image: Buffer) {
  // CLOVA OCR이 흑백 명함에서 가끔 빈 confidence를 반환함 (2024-11 확인)
  // 빈 응답이면 grayscale 변환 후 재시도
  const result = await this.callClova(image);
  if (!result.confidence) {
    return this.callClova(await this.toGrayscale(image));
  }
  return result;
}
```

### 2.3 알고리즘 선택 이유
```typescript
// 거래처 수가 사용자당 최대 5,000개로 운영 정책상 제한됨
// O(n^2)이지만 5,000개에서 실측 50ms → 인덱스 추가하기보다 단순 유지
function findDuplicates(customers: Customer[]): Customer[] { ... }
```

### 2.4 TODO/FIXME (이슈 번호 또는 날짜)
```typescript
// TODO(#123): 페이지네이션 추가 - 현재 전체 조회로 응답 느림
// FIXME(2026-06-01): Prisma 5.x 업그레이드 후 deprecated API 교체
// HACK: Supabase RLS와 Nest 권한 체크 이중화 - 신뢰성 확보 후 RLS만 남기기
```

---

## 3. 나쁜 주석 예시 (절대 금지)

### 3.1 ❌ 코드 그대로 번역
```typescript
// ❌ 거래처를 ID로 찾는다
async findById(id: CustomerId): Promise<Customer | null> { }
```
→ 함수명이 이미 설명함

### 3.2 ❌ 변경 이력
```typescript
// ❌ 2024-11-01 김철수: phone validation 추가
// ❌ 2024-12-15 박영희: region 컬럼 추가
export class Customer { }
```
→ Git log가 함

### 3.3 ❌ 의미 없는 구분자
```typescript
// ❌
// ===================
// Customer Service
// ===================
```

### 3.4 ❌ 주석 처리된 코드
```typescript
// ❌
async create(cmd: CreateCustomerCommand) {
  // const old = this.legacyService.create(...);
  // if (old) return old;
  return this.repo.save(customer);
}
```
→ 지워라. Git이 보관함.

### 3.5 ❌ JSDoc으로 타입 중복
```typescript
// ❌ TypeScript 타입이 이미 있음
/**
 * @param {string} name - 거래처 이름
 * @param {string} phone - 전화번호
 * @returns {Customer} 생성된 거래처
 */
function create(name: string, phone: string): Customer { }
```

---

## 4. JSDoc 사용 정책

### 4.1 JSDoc은 다음 경우에만
- **public API**의 사용자 (다른 모듈/외부)가 봐야 하는 함수
- IDE 자동완성에 도움이 되는 정보
- **WHY가 들어가는 경우만** (단순 타입 중복 금지)

### 4.2 좋은 JSDoc
```typescript
/**
 * 거래처를 OCR 결과로 생성합니다.
 *
 * @remarks
 * 동일 사용자의 거래처 중 전화번호가 일치하면 새로 만들지 않고
 * 기존 거래처에 명함 이미지만 추가합니다. (병합 정책)
 */
async createFromOcr(cmd: CreateFromOcrCommand): Promise<Customer> { }
```

### 4.3 나쁜 JSDoc
```typescript
// ❌
/**
 * @param id 거래처 ID
 * @returns 거래처
 */
findById(id: CustomerId): Promise<Customer | null>
```

---

## 5. 주석 분류 태그

### 5.1 표준 태그 (반드시 컨텍스트 동반)
| 태그 | 의미 | 형식 |
|------|------|------|
| `TODO` | 나중에 해야 할 일 | `TODO(#123):` 또는 `TODO(2026-06-01):` |
| `FIXME` | 버그가 있지만 임시 회피 | `FIXME(#456):` |
| `HACK` | 의도적 우회 | `HACK: 사유` |
| `NOTE` | 중요한 맥락 정보 | `NOTE: 사유` |
| `WARNING` | 잘못 건들면 위험 | `WARNING: 사유` |

### 5.2 예시
```typescript
// TODO(#234): 알림 발송 후 결과 webhook 처리 추가
// FIXME(#199): pagination cursor가 정렬 컬럼 동일 값일 때 누락 가능 - sub-sort 필요
// HACK: Prisma transaction에서 raw query 사용 - $transaction([])에서 raw 안 됨 이슈
// NOTE: 이 메서드는 명함 OCR 콜백에서만 호출됨. 직접 호출 금지.
// WARNING: 이 마이그레이션은 5분 이상 걸림. 배포 시 maintenance mode 필요.
```

---

## 6. 도메인 용어 주석

도메인 용어가 일반적이지 않을 때 한 줄 설명:
```typescript
// "딜(Deal)" = 영업 건. 한 거래처에 대한 하나의 영업 시도.
export class Deal {
  // "확률(probability)" = 영업사원이 주관적으로 입력한 성사 가능성 (0~100)
  private _probability: number;
}
```

용어 자체가 모호하지 않다면 `AGENT/domain-glossary.md`에 정리, 코드에는 안 씀.

---

## 7. 자동 생성 코드

### 7.1 Prisma generate 결과물
- 주석 X (어차피 자동 생성)

### 7.2 OpenAPI/Swagger 데코레이터
```typescript
@ApiOperation({ summary: '거래처 생성' })  // ✅ Swagger UI에 표시됨
@ApiResponse({ status: 201, type: CustomerResponseDto })
@Post()
async create() { ... }
```
- `@ApiOperation`은 문서화 목적이므로 OK

---

## 8. 검토 체크리스트

PR 리뷰 시 주석 관련 체크:
- [ ] 코드 그대로 번역한 주석 없는가
- [ ] 주석 처리된 코드 없는가
- [ ] TODO/FIXME에 이슈 번호 또는 날짜 있는가
- [ ] WHY가 아닌 WHAT을 설명한 주석 없는가
- [ ] 변수명/함수명 개선으로 주석을 없앨 수 있는가
- [ ] 변경 이력이 주석에 있지 않은가

---

## 9. AI에게 코드 생성 시킬 때 강조할 것

1. "주석은 기본적으로 쓰지 마라. WHY가 필요한 경우만 한 줄."
2. "JSDoc은 public API만, 타입 중복은 금지"
3. "TODO/FIXME에는 반드시 이슈 번호나 날짜를 붙여라"
4. "코드를 한국어로 번역하는 주석은 절대 쓰지 마라"
5. "주석 처리된 코드는 남기지 말고 삭제하라 (Git이 보관함)"
