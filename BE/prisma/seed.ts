import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const localDemoUsers = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "local.user@example.com",
    displayName: "로컬 사용자",
    role: UserRole.USER,
    deviceId: "00000000-0000-4000-8000-000000000011",
    sessions: [
      "00000000-0000-4000-8000-000000000101",
      "00000000-0000-4000-8000-000000000102",
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "local.admin@example.com",
    displayName: "로컬 관리자",
    role: UserRole.ADMIN,
    deviceId: "00000000-0000-4000-8000-000000000021",
    sessions: ["00000000-0000-4000-8000-000000000201"],
  },
] as const;

async function seedLocalMockAuth() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  for (const demoUser of localDemoUsers) {
    await prisma.user.upsert({
      where: { id: demoUser.id },
      create: {
        id: demoUser.id,
        email: demoUser.email,
        displayName: demoUser.displayName,
        role: demoUser.role,
        status: UserStatus.ACTIVE,
      },
      update: {
        email: demoUser.email,
        displayName: demoUser.displayName,
        role: demoUser.role,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
    });

    await prisma.authDevice.upsert({
      where: { id: demoUser.deviceId },
      create: {
        id: demoUser.deviceId,
        userId: demoUser.id,
        deviceSlot: AuthDeviceSlot.PERSONAL_LAPTOP,
        deviceIdHash: `${demoUser.id}:local-device`,
        label: "Local mock device",
        status: AuthDeviceStatus.ACTIVE,
        lastSeenAt: new Date(),
      },
      update: {
        status: AuthDeviceStatus.ACTIVE,
        revokedAt: null,
        replacedAt: null,
        lastSeenAt: new Date(),
      },
    });

    for (const sessionId of demoUser.sessions) {
      await prisma.authSession.upsert({
        where: { id: sessionId },
        create: {
          id: sessionId,
          userId: demoUser.id,
          authDeviceId: demoUser.deviceId,
          status: AuthSessionStatus.ACTIVE,
          refreshTokenHash: `${sessionId}:local-refresh`,
          expiresAt: new Date("2099-12-31T00:00:00.000Z"),
          lastUsedAt: new Date(),
        },
        update: {
          status: AuthSessionStatus.ACTIVE,
          revokedAt: null,
          expiresAt: new Date("2099-12-31T00:00:00.000Z"),
          lastUsedAt: new Date(),
        },
      });
    }
  }
}

async function main() {
  await seedLocalMockAuth();
}

void main().finally(async () => {
  await prisma.$disconnect();
});
