import { SensitiveFieldNotAllowedError } from "@/modules/admin/domain/admin.errors";
import type { EncryptionPort } from "@/shared/application/ports/encryption.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAdminSensitiveRepository } from "./prisma-admin-sensitive.repository";

describe("PrismaAdminSensitiveRepository", () => {
  it("creates an audit log before decrypting encrypted raw fields", async () => {
    const order: string[] = [];
    const tx = {
      personalMemo: {
        findUnique: jest.fn().mockResolvedValue({
          id: "memo-1",
          userId: "user-1",
          contentCiphertext: "ciphertext",
          contentKeyVersion: "v1",
        }),
      },
      auditLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          order.push("audit");
          expect(data).toMatchObject({
            actorUserId: "admin-1",
            action: "ADMIN_SENSITIVE_RAW_VIEW",
            targetType: "PERSONAL_MEMO",
            targetId: "memo-1",
            targetUserId: "user-1",
            reason: "고객 지원 요청으로 메모 원문 확인",
            metadata: {
              fields: ["content"],
              ipAddress: "127.0.0.1",
              userAgent: "test-agent",
            },
          });
          expect(JSON.stringify(data.metadata)).not.toContain("복호화된");

          return {
            id: "audit-1",
            createdAt: new Date("2026-06-07T00:00:00.000Z"),
          };
        }),
      },
    };
    const prismaService = {
      $transaction: jest.fn((callback) => callback(tx)),
    } as unknown as PrismaService;
    const encryptionPort = {
      decryptText: jest.fn().mockImplementation(async () => {
        order.push("decrypt");

        return "복호화된 메모";
      }),
    } as unknown as EncryptionPort;
    const repository = new PrismaAdminSensitiveRepository(
      prismaService,
      encryptionPort
    );

    const response = await repository.viewRawData({
      actorUserId: "admin-1",
      targetType: "PERSONAL_MEMO",
      targetId: "memo-1",
      fields: ["content"],
      reason: "고객 지원 요청으로 메모 원문 확인",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });

    expect(order).toEqual(["audit", "decrypt"]);
    expect(response).toEqual({
      targetType: "PERSONAL_MEMO",
      targetId: "memo-1",
      fields: [{ name: "content", value: "복호화된 메모" }],
      auditLogId: "audit-1",
      viewedAt: "2026-06-07T00:00:00.000Z",
    });
  });

  it("rejects disallowed fields before opening a transaction", async () => {
    const prismaService = {
      $transaction: jest.fn(),
    } as unknown as PrismaService;
    const encryptionPort = {
      decryptText: jest.fn(),
    } as unknown as EncryptionPort;
    const repository = new PrismaAdminSensitiveRepository(
      prismaService,
      encryptionPort
    );

    await expect(
      repository.viewRawData({
        actorUserId: "admin-1",
        targetType: "CONTACT",
        targetId: "contact-1",
        fields: ["password"],
        reason: "고객 지원 요청으로 연락처 확인",
        ipAddress: null,
        userAgent: null,
      })
    ).rejects.toBeInstanceOf(SensitiveFieldNotAllowedError);
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});
