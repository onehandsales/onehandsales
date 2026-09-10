import { ConfigService } from "@nestjs/config";
import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();
const configService = new ConfigService();

const demoUserId = "00000000-0000-4000-8000-000000000001";

const localDemoUsers = [
  {
    id: demoUserId,
    email: "local.user@example.com",
    displayName: "Local User",
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
    displayName: "Local Admin",
    role: UserRole.ADMIN,
    deviceId: "00000000-0000-4000-8000-000000000021",
    sessions: ["00000000-0000-4000-8000-000000000201"],
  },
] as const;

const companySeeds = [
  {
    companyName: "Samsung Electronics",
    field: "Semiconductor",
    region: "Gyeonggi Suwon",
    countryCode: "KR",
    regionCode: "41",
    address: "129 Samsung-ro, Yeongtong-gu, Suwon-si",
    memo: "Key account for enterprise sales workflow validation.",
  },
  {
    companyName: "LG Electronics",
    field: "Consumer Electronics",
    region: "Seoul Yeongdeungpo",
    countryCode: "KR",
    regionCode: "11",
    address: "128 Yeoui-daero, Yeongdeungpo-gu, Seoul",
    memo: "Tracks B2B account history and weekly sales notes.",
  },
  {
    companyName: "Kakao",
    field: "Platform",
    region: "Gyeonggi Seongnam",
    countryCode: "KR",
    regionCode: "41",
    address: "242 Pangyoyeok-ro, Bundang-gu, Seongnam-si",
    memo: "Public demo company used for local UI smoke checks.",
  },
  {
    companyName: "OneHand Demo US",
    field: "SaaS",
    region: "California",
    countryCode: "US",
    regionCode: "CA",
    address: "San Francisco, CA",
    memo: "US locale sample for region and currency preference testing.",
  },
] as const;

async function seedLocalMockAuth() {
  if (configService.get<string>("NODE_ENV") === "production") {
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
        timeZone: "Asia/Seoul",
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

async function resetLocalDemoDomainData(userId: string) {
  await prisma.$transaction([
    prisma.companyUserPrivateMemoLog.deleteMany({ where: { userId } }),
    prisma.companyMemoLog.deleteMany({ where: { userId } }),
    prisma.company.deleteMany({ where: { userId } }),
    prisma.companyField.deleteMany({ where: { userId } }),
    prisma.companyRegion.deleteMany({ where: { userId } }),
  ]);
}

async function seedLocalDemoSalesData() {
  if (configService.get<string>("NODE_ENV") === "production") {
    return;
  }

  const userId = demoUserId;
  await resetLocalDemoDomainData(userId);

  const fieldMap = new Map<string, string>();
  const regionMap = new Map<string, string>();

  for (const field of [
    ...new Set(companySeeds.map((company) => company.field)),
  ]) {
    const row = await prisma.companyField.create({ data: { userId, field } });
    fieldMap.set(field, row.id);
  }

  for (const seed of companySeeds) {
    if (regionMap.has(seed.region)) {
      continue;
    }

    const row = await prisma.companyRegion.create({
      data: {
        userId,
        region: seed.region,
        countryCode: seed.countryCode,
        regionCode: seed.regionCode,
      },
    });
    regionMap.set(seed.region, row.id);
  }

  for (const seed of companySeeds) {
    const company = await prisma.company.create({
      data: {
        userId,
        companyName: seed.companyName,
        companyFieldId: fieldMap.get(seed.field)!,
        companyRegionId: regionMap.get(seed.region)!,
        address: seed.address,
      },
    });

    await prisma.companyMemoLog.create({
      data: {
        userId,
        companyId: company.id,
        memoType: "Account memo",
        memo: seed.memo,
      },
    });
  }
}

async function main() {
  await seedLocalMockAuth();
  await seedLocalDemoSalesData();
}

void main().finally(async () => {
  await prisma.$disconnect();
});
