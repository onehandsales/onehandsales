# Backend Transaction Convention

## 1. 목적

이 문서는 Backend use case를 구현할 때 transaction 경계를 어디에 두고, 어떤 흐름을 하나의 원자적 작업으로 묶어야 하는지 정의한다.

초기 단계에서도 transaction 기준은 미리 고정한다. 나중에 데이터가 쌓인 뒤 transaction 정책을 바꾸면 부수 데이터 불일치나 복구 불가능한 상태가 생길 수 있기 때문이다.

## 2. 기본 원칙

- transaction 경계는 application layer에 둔다.
- domain layer는 transaction, Prisma, DB connection을 모른다.
- presentation controller는 transaction을 시작하지 않는다.
- infrastructure repository는 transaction client를 받을 수 있어야 하지만, use case 흐름을 결정하지 않는다.
- 한 use case 안에서 여러 model을 함께 변경하면 기본적으로 transaction을 검토한다.
- 외부 Provider 호출은 DB transaction 안에 오래 붙잡지 않는다.
- transaction은 기본적으로 한 module ownership 안에서 끝낸다.
- 다른 module의 Prisma repository 구현체를 transaction 안에 직접 섞지 않는다.
- 미래 service 분리 가능성이 있는 mutation은 idempotency 또는 outbox 필요 여부를 검토한다.

## 3. Transaction이 필요한 경우

아래 중 하나라도 해당하면 API 명세와 BE-TODO에 transaction 여부를 반드시 적는다.

- 하나의 사용자 행동이 2개 이상의 DB model을 생성, 수정, 삭제한다.
- 제거/보존 상태와 관련 로그 또는 하위 상태 변경이 함께 필요하다.
- 여러 하위 row 생성처럼 부분 성공이 사용자 데이터 불일치를 만들 수 있다.
- deal stage 변경과 activity log 생성처럼 본 상태와 이력이 항상 같이 움직여야 한다.
- 본 데이터 생성과 필수 부수 데이터 생성이 함께 성공해야 의미가 완성된다.

Transaction이 필요하지 않은 경우도 문서에 `transaction: 없음`이라고 적는다.

## 4. Application Layer 작성 방식

Application use case 또는 application service는 아래 순서를 기본 흐름으로 삼는다.

```text
1. current user, 권한, request validation 결과를 확인한다.
2. 조회만 필요한 선행 검증을 수행한다.
3. transaction이 필요한 변경 범위를 결정한다.
4. transaction callback 안에서 본 데이터와 부수 데이터를 함께 저장한다.
5. transaction 밖에서 response DTO를 구성하거나 외부 Provider 후속 처리를 수행한다.
```

코드 주석은 `COMMENT_AND_LOGGING.md`의 numbered step comment 규칙을 따른다.

## 5. TransactionManager Port

공유 transaction 추상화가 필요한 경우 application layer에는 port를 두고 infrastructure에서 Prisma adapter를 구현한다.

권장 형태:

```ts
// 역할 : TransactionManager application use case가 원자적 작업을 실행할 수 있는 계약을 정의합니다.
export interface TransactionManager {
  // 기능 : 같은 transaction context 안에서 작업 callback을 실행합니다.
  runInTransaction<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}
```

규칙:

- application use case는 Prisma transaction API를 직접 import하지 않는다.
- repository method는 필요한 경우 `TransactionContext`를 받을 수 있다.
- 같은 use case 안에서 repository마다 독립 Prisma client를 열어 transaction이 깨지게 만들지 않는다.
- transaction context 타입은 Prisma 타입을 application에 노출하지 않는 wrapper로 둔다.

## 6. 외부 Provider와 Transaction


원칙:

- DB 변경 전 검증에 외부 Provider가 필요하면 먼저 호출하고, 결과만 transaction에 넣는다.
- DB 변경 후 외부 side effect가 필요하면 outbox 또는 후속 작업 상태를 기록한다.
- 외부 Provider 호출 실패가 DB rollback이어야 하는지, 후속 재시도 대상인지 API 명세에 적는다.

## 7. Outbox 기준

다음 흐름은 outbox 또는 outbox에 준하는 후속 처리 기록을 검토한다.

- 사용자는 성공 응답을 받았지만 후속 처리가 나중에 완료될 수 있다.
- 재시도와 중복 방지가 필요하다.
- 다른 module 또는 미래 외부 service로 side effect를 전달해야 한다.
- 외부 provider 호출 실패를 사용자 요청 transaction과 분리해야 한다.

MVP에서 outbox를 구현하지 않더라도 TODO/API 명세에는 `outbox: 보류`, `재시도 정책: 없음`, `실패 시 사용자 영향`을 명시한다.

## 8. Idempotency 기준

아래 흐름은 idempotency key 또는 중복 처리 기준을 검토한다.

- 같은 mutation이 client 재시도로 중복 도착할 수 있다.
- 여러 row를 생성해 부분 중복이 사용자 데이터 불일치를 만들 수 있다.
- 외부 provider callback 또는 결제/구독/파일 처리처럼 중복 호출 가능성이 있다.
- future MSA에서 command 재전송 또는 event 재처리가 필요할 수 있다.

API 계약에는 아래 중 필요한 항목을 적는다.

- idempotency 필요 여부
- key 출처: client header, request body, server generated key
- key scope: user, workspace, provider, operation
- 중복 요청 응답 기준: 기존 성공 응답 재사용, conflict, no-op
- 보관 기간 또는 cleanup 기준

## 9. MSA 대비 Transaction 기준

현재 단일 DB transaction으로 처리할 수 있더라도, 아래 기준을 함께 검토한다.

- 이 흐름이 나중에 별도 service로 분리될 가능성이 있는가?
- 분리되면 distributed transaction 없이 처리할 수 있는가?
- owning module 하나가 command를 받고 나머지는 event/outbox로 따라가도 되는가?
- 동기 응답에 반드시 필요한 변경과 후속 처리가 분리되는가?

분리 가능성이 높은 흐름을 구현할 때는 transaction 자체보다 ownership, idempotency, outbox, 실패 보상 기준을 먼저 문서화한다.

## 10. TODO와 API 명세 작성 규칙

API가 DB를 변경하면 `COMMON/API-SPEC/*`와 `BE-TODO`에 아래 항목을 반드시 적는다.

- transaction 필요 여부: `필요` / `없음` / `보류`
- transaction 이유
- transaction 안에서 변경되는 model
- transaction 밖에서 실행되는 외부 Provider 또는 후속 작업
- 부수 로그/이력을 같은 transaction에 묶는지 여부
- 실패 시 rollback되어야 하는 범위
- idempotency 또는 중복 요청 처리 기준
- outbox 또는 후속 처리 기록 필요 여부

## 11. 금지 사항

- controller에서 transaction을 시작하지 않는다.
- domain entity가 transaction context를 인자로 받지 않는다.
- application layer에서 Prisma `$transaction`을 직접 import하거나 호출하지 않는다.
- transaction 안에서 장시간 외부 HTTP 호출을 수행하지 않는다.
- transaction 필요 여부를 API 명세에서 생략하지 않는다.
- 다른 module의 Prisma repository 구현체를 가져와 하나의 transaction에 직접 섞지 않는다.
- future MSA 분리 가능성이 높은 흐름을 distributed transaction 전제로 설계하지 않는다.

## 12. Review Checklist

- use case가 변경하는 model 목록이 API 명세와 맞는가?
- transaction이 필요한 흐름을 `필요`로 표시했는가?
- transaction이 필요 없으면 이유를 적었는가?
- 부수 로그/이력이 필요한 mutation은 같은 transaction으로 묶였는가?
- 외부 Provider 호출 위치가 transaction 안/밖으로 명확히 나뉘었는가?
- rollback 범위와 사용자에게 보이는 실패 응답이 정리됐는가?
- transaction이 한 module ownership 안에서 끝나는가?
- 여러 module이 관련되면 orchestration owner가 문서화됐는가?
- retry 가능한 mutation의 idempotency 기준이 있는가?
- outbox 또는 후속 처리 기록 필요 여부를 검토했는가?

## 13. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/MODULAR_MONOLITH_AND_MSA.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
