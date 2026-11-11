import type { Prisma } from "@prisma/client";

// 기능 : 생성/순서 변경이 공유하는 transaction 잠금을 얻고 최신 읽기 격리를 확인합니다.
export async function lockSidebarOrder(client: Prisma.TransactionClient, key: string): Promise<void> {
  // 1. 세션에 남지 않는 advisory transaction lock을 사용한다.
  const rows = await client.$queryRaw<{ isolationLevel: string }[]>`
    SELECT current_setting('transaction_isolation') AS "isolationLevel"
    FROM pg_advisory_xact_lock(hashtextextended(${key.toLowerCase()}, 0))
  `;
  if (rows[0]?.isolationLevel !== "read committed") {
    throw new Error("Sidebar order mutations require READ COMMITTED");
  }
}
