import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  TransactionContext,
  TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "./prisma.service";

const PRISMA_TRANSACTION_CONTEXT = Symbol("PRISMA_TRANSACTION_CONTEXT");

type PrismaTransactionContext = TransactionContext & {
  readonly [PRISMA_TRANSACTION_CONTEXT]: true;
  readonly client: Prisma.TransactionClient;
};

type PrismaTransactionalClient = PrismaService | Prisma.TransactionClient;

// 역할 : PrismaTransactionManager가 application transaction 포트를 Prisma transaction으로 구현합니다.
@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  // 기능 : PrismaService를 주입받아 transaction runner로 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 같은 Prisma transaction context 안에서 비동기 작업을 실행합니다.
  async runInTransaction<T>(
    work: (context: TransactionContext) => Promise<T>
  ): Promise<T> {
    // 1. Prisma transaction client를 application에 노출하지 않는 context로 감싼다.
    return this.prismaService.$transaction(async (transaction) => {
      const context: PrismaTransactionContext = {
        transactionId: Symbol("prismaTransaction"),
        [PRISMA_TRANSACTION_CONTEXT]: true,
        client: transaction,
      };

      // 2. 호출자가 같은 context를 repository/adapter에 전달해 하나의 원자적 작업으로 묶는다.
      return work(context);
    });
  }
}

// 기능 : infrastructure adapter가 application TransactionContext에서 Prisma client를 해석합니다.
export function resolvePrismaTransactionalClient(
  defaultClient: PrismaService,
  context?: TransactionContext | null
): PrismaTransactionalClient {
  // 1. context가 없으면 기본 PrismaService client를 사용한다.
  if (!context) {
    return defaultClient;
  }

  // 2. Prisma transaction manager가 만든 context이면 transaction client를 사용한다.
  if (isPrismaTransactionContext(context)) {
    return context.client;
  }

  // 3. 알 수 없는 transaction context는 잘못된 provider 조립으로 보고 중단한다.
  throw new Error("Unsupported transaction context");
}

// 기능 : transaction context가 Prisma transaction context인지 판별합니다.
function isPrismaTransactionContext(
  context: TransactionContext
): context is PrismaTransactionContext {
  return (
    (context as Partial<PrismaTransactionContext>)[
      PRISMA_TRANSACTION_CONTEXT
    ] === true
  );
}
