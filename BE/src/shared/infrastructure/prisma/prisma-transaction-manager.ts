import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  TransactionContext,
  TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "./prisma.service";
import type { ReadSnapshotRunner } from "@/shared/application/ports/read-snapshot-runner.port";
import { DomainError } from "@/shared/domain/errors/domain-error";

const PRISMA_TRANSACTION_CONTEXT = Symbol("PRISMA_TRANSACTION_CONTEXT");

type PrismaTransactionContext = TransactionContext & {
  readonly [PRISMA_TRANSACTION_CONTEXT]: true;
  readonly client: Prisma.TransactionClient;
};

type PrismaTransactionalClient = PrismaService | Prisma.TransactionClient;

// 기능 : snapshot 참여가 필수인 조회에서 기본 client로 빠지는 것을 방지합니다.
export function resolvePrismaReadContext(context: TransactionContext): Prisma.TransactionClient {
  if (!isPrismaTransactionContext(context)) throw new Error("Unsupported transaction context");
  return context.client;
}

// 역할 : 조회 전용 RepeatableRead snapshot을 기존 transaction context로 제공합니다.
@Injectable()
export class PrismaReadSnapshotRunner implements ReadSnapshotRunner {
  // 기능 : 실제 DB transaction을 생성하는 infrastructure 의존성을 받습니다.
  constructor(private readonly prisma: PrismaService) {}

  // 기능 : 제한 시간 안에서 쓰기를 금지한 일관된 조회를 실행합니다.
  async run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
    try {
      // 1. 첫 업무 조회 전에 읽기 전용과 statement 제한을 지정한다.
      return await this.prisma.$transaction(async client => {
        await client.$executeRawUnsafe("SET TRANSACTION READ ONLY");
        await client.$executeRawUnsafe("SET LOCAL statement_timeout = '15000ms'");
        const context: PrismaTransactionContext = {
          transactionId: Symbol("readSnapshot"), [PRISMA_TRANSACTION_CONTEXT]: true, client,
        };
        // 2. 모든 공개 query Port에 같은 context를 전달하도록 호출자에 제공한다.
        return work(context);
      }, { isolationLevel: "RepeatableRead", timeout: 20000, maxWait: 5000 });
    } catch (error) {
      // 3. DB 원문을 HTTP에 노출하지 않고 알려진 timeout만 안전하게 변환한다.
      const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
      const meta = typeof error === "object" && error !== null && "meta" in error ? error.meta : null;
      const databaseCode = meta && typeof meta === "object" && "code" in meta ? meta.code : null;
      if (code === "P2028" || code === "P2024" || code === "57014" || databaseCode === "57014") {
        throw new DomainError("ViewDataQueryTimedOut", "View query timed out");
      }
      throw error;
    }
  }
}

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
