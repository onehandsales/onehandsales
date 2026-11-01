import { PrismaReadSnapshotRunner, resolvePrismaReadContext } from "./prisma-transaction-manager";
import type { PrismaService } from "./prisma.service";

// 기능 : 외부 DB 없이 실제 snapshot adapter의 transaction 설정과 오류 경계를 검증합니다.
describe("Prisma read-only snapshot runner", () => {
  it("sets read-only and statement timeout before running owning-module queries", async () => {
    const events: string[] = [];
    const client = { $executeRawUnsafe: jest.fn(async (sql: string) => { events.push(sql); return 0; }) };
    const prisma = { $transaction: jest.fn(async (work: (value: typeof client) => Promise<unknown>, options: { isolationLevel: string; timeout: number; maxWait: number }) => {
      expect(options.isolationLevel).toBe("RepeatableRead");
      return work(client);
    }) };
    const runner = new PrismaReadSnapshotRunner(prisma as unknown as PrismaService);
    const result = await runner.run(async context => {
      events.push("query");
      expect(resolvePrismaReadContext(context)).toBe(client);
      return "result";
    });
    expect(result).toBe("result");
    expect(events).toEqual(["SET TRANSACTION READ ONLY", "SET LOCAL statement_timeout = '15000ms'", "query"]);
    expect(prisma.$transaction.mock.calls[0]?.[1]).toEqual({ isolationLevel: "RepeatableRead", timeout: 20000, maxWait: 5000 });
  });
  it("does not fall back to a default Prisma client for an unknown context", () => {
    expect(() => resolvePrismaReadContext({ transactionId: Symbol("wrong") })).toThrow("Unsupported transaction context");
  });
  it.each([{ code: "P2028" }, { code: "P2024" }, { code: "57014" }, { code: "P2010", meta: { code: "57014" } }])(
    "maps a recognized database timeout without exposing database messages", async failure => {
      const prisma = { $transaction: jest.fn().mockRejectedValue({ ...failure, message: "sensitive database details" }) };
      await expect(new PrismaReadSnapshotRunner(prisma as unknown as PrismaService).run(async () => null))
        .rejects.toMatchObject({ code: "ViewDataQueryTimedOut", message: "View query timed out" });
    });
});
