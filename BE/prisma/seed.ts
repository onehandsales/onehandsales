import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { ConfigService } from "@nestjs/config";

const prisma = new PrismaClient();
const configService = new ConfigService();

const demoUserId = "00000000-0000-4000-8000-000000000001";

const localDemoUsers = [
  {
    id: demoUserId,
    email: "local.user@example.com",
    displayName: "濡쒖뺄 ?ъ슜??,
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
    displayName: "濡쒖뺄 愿由ъ옄",
    role: UserRole.ADMIN,
    deviceId: "00000000-0000-4000-8000-000000000021",
    sessions: ["00000000-0000-4000-8000-000000000201"],
  },
] as const;

const dealStatuses = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

type DealStatus = (typeof dealStatuses)[number];

const companySeeds = [
  {
    companyName: "?쇱꽦?꾩옄",
    field: "諛섎룄泥?紐⑤컮??媛??,
    region: "寃쎄린 ?섏썝 ?붿??몄떆??,
    memo: "DX? DS 議곗쭅??B2B ?곸뾽 ?뚯씠?꾨씪?몄쓣 遺꾨━??蹂닿퀬 ?띠뼱 ?쒕떎. 寃쎌쁺吏?二쇨컙 蹂닿퀬???④퀎蹂??덉긽 留ㅼ텧??以묒슂?섎떎.",
    contacts: [
      ["源誘쇱?", "MX?ъ뾽遺", "遺??],
      ["諛뺤꽌??, "VD?ъ뾽遺", "李⑥옣"],
      ["?대룄??, "DS?곸뾽湲고쉷?", "?댁궗"],
      ["理쒖쑀吏?, "B2B?붾（?섑?", "怨쇱옣"],
    ],
  },
  {
    companyName: "SK?섏씠?됱뒪",
    field: "諛섎룄泥?硫붾え由?,
    region: "寃쎄린 ?댁쿇",
    memo: "湲濡쒕쾶 怨좉컼?щ퀎 ?κ린 怨듦툒 ?묒긽 ?대젰???쒗뭹援곌낵 ?④퍡 異붿쟻?섎젮???덉쫰媛 媛뺥븯??",
    contacts: [
      ["?뺥쁽??, "Global Sales", "遺??],
      ["?쒖?誘?, "DRAM?곸뾽?", "李⑥옣"],
      ["?ㅼ꽭以", "NAND?ъ뾽湲고쉷?", "?댁궗"],
      ["?꾪븯??, "怨좉컼?덉쭏吏?먰?", "怨쇱옣"],
    ],
  },
  {
    companyName: "LG?꾩옄",
    field: "媛???꾩옣 ?붾（??,
    region: "?쒖슱 ?ъ쓽??,
    memo: "B2B 怨듭“? ?꾩옣 怨좉컼?ъ쓽 ?쒖븞 ?대젰?????붾㈃?먯꽌 鍮꾧탳?섍퀬 ?띠뼱 ?쒕떎.",
    contacts: [
      ["媛뺣?以", "BS?ъ뾽蹂몃?", "?댁궗"],
      ["?ㅽ깭??, "H&A?곸뾽湲고쉷?", "遺??],
      ["諛곗닔鍮?, "?꾩옣怨좉컼?꾨왂?", "李⑥옣"],
      ["?쒖???, "留덉??낆쟾?듯?", "怨쇱옣"],
    ],
  },
  {
    companyName: "誘몃옒?먯뀑利앷텒",
    field: "利앷텒/?먯궛愿由?,
    region: "?쒖슱 ?꾩?濡?,
    memo: "踰뺤씤 WM ?곸뾽怨?IPO 愿???쒖쓣 遺꾨━??愿由ы븯怨? 怨좉컼 誘명똿 ?꾩냽 議곗튂 ?꾨씫??以꾩씠怨??띠뼱 ?쒕떎.",
    contacts: [
      ["?좎븘由?, "踰뺤씤?곸뾽蹂몃?", "遺??],
      ["臾몄???, "WM?꾨왂?", "李⑥옣"],
      ["?μ삁?", "IB?ъ뾽遺", "?댁궗"],
      ["怨좏깭誘?, "?붿??몄쟾?듯?", "怨쇱옣"],
    ],
  },
  {
    companyName: "?꾨??먮룞李?,
    field: "?꾩꽦李?紐⑤퉴由ы떚",
    region: "?쒖슱 ?묒옱",
    memo: "踰뺤씤李⑤웾, PBV, 湲濡쒕쾶 ?뚰듃???곸뾽??吏꾪뻾 ?곹솴???쒗뭹援곕퀎濡?蹂닿퀬?섎젮 ?쒕떎.",
    contacts: [
      ["?④린以", "援?궡?ъ뾽蹂몃?", "遺??],
      ["瑜섏꽑??, "PBV?ъ뾽?", "李⑥옣"],
      ["沅뚮굹??, "湲濡쒕쾶?ъ뾽愿由ы?", "怨쇱옣"],
      ["諛깆???, "紐⑤퉴由ы떚?꾨왂?", "?댁궗"],
    ],
  },
  {
    companyName: "?붿〈鍮꾩쫰??,
    field: "ERP/?대씪?곕뱶/AI",
    region: "媛뺤썝 異섏쿇",
    memo: "ERP? ?대씪?곕뱶 ?붾（???곸뾽?먯꽌 怨좉컼?щ퀎 PoC, ?쒖븞?? 怨꾩빟 ?쇱젙??珥섏킌??愿由ы븯???쒕떎.",
    contacts: [
      ["?〓???, "?대씪?곕뱶?ъ뾽遺", "?댁궗"],
      ["議곗???, "AI鍮꾩쫰?덉뒪?", "遺??],
      ["?띿???, "?뷀꽣?꾨씪?댁쫰?몄씪利?, "李⑥옣"],
      ["?좊떎??, "?뚰듃?덉쟾?듯?", "怨쇱옣"],
    ],
  },
  {
    companyName: "移댁뭅??,
    field: "?뚮옯??硫붿떆吏?,
    region: "寃쎄린 ?깅궓 ?먭탳",
    memo: "愿묎퀬, 而ㅻ㉧?? ?≪콈???쒗쑕 ?곸뾽??怨좉컼?щ퀎濡?臾띠뼱 蹂닿퀬 ?띠뼱 ?쒕떎.",
    contacts: [
      ["源?섏?", "鍮꾩쫰?덉뒪?뚮옯?쇳?", "遺??],
      ["?댁꽌??, "而ㅻ㉧?ㅼ젣?댄?", "李⑥옣"],
      ["諛뺤???, "愿묎퀬?ъ뾽?꾨왂?", "?댁궗"],
      ["理쒕굹?", "?≪콈?먯쁺?낇?", "怨쇱옣"],
    ],
  },
  {
    companyName: "荑좏뙜",
    field: "?댁빱癒몄뒪/臾쇰쪟",
    region: "?쒖슱 ?≫뙆",
    memo: "????곸뾽怨?臾쇰쪟 ?뚰듃??怨꾩빟??鍮좊Ⅴ寃??섏뼱 ?쇱젙怨????곌껐??以묒슂?섍쾶 蹂몃떎.",
    contacts: [
      ["?뺤꽌以", "留덉폆?뚮젅?댁뒪?", "遺??],
      ["?쒖냼??, "濡쒖폆諛곗넚?댁쁺?", "李⑥옣"],
      ["?ㅼ???, "臾쇰쪟?뚰듃?덉떗?", "?댁궗"],
      ["?꾩콈??, "??ъ꽦?ν?", "怨쇱옣"],
    ],
  },
  {
    companyName: "?좎뒪",
    field: "??뚰겕/湲덉쑖 ?뚮옯??,
    region: "?쒖슱 媛뺣궓",
    memo: "?쒗쑕 湲덉쑖?щ퀎 怨꾩빟 議곌굔怨?蹂댁븞 寃???곹깭瑜????④퀎? ?④퍡 愿由ы븯???쒕떎.",
    contacts: [
      ["媛뺣룄??, "?쒗쑕?ъ뾽?", "遺??],
      ["?ㅼ꽌??, "湲덉쑖?뚮옯?쇳?", "李⑥옣"],
      ["諛고쁽以", "由ъ뒪?ш?由ы?", "?댁궗"],
      ["?쒕?吏", "?꾨줈?뺥듃?꾨왂?", "怨쇱옣"],
    ],
  },
  {
    companyName: "?좏븳???,
    field: "???湲곗뾽湲덉쑖",
    region: "?쒖슱 以묎뎄",
    memo: "湲곗뾽湲덉쑖 RM??怨좉컼 ?묒큺 ?대젰, ?뚯쓽濡? ?ㅼ쓬 ?됰룞???쒖??뷀븯?ㅻ뒗 ?붽뎄媛 ?덈떎.",
    contacts: [
      ["臾몄꽌以", "湲곗뾽湲덉쑖遺", "遺??],
      ["?ν븯由?, "?붿??몄쟾?듬?", "李⑥옣"],
      ["怨좏쁽??, "WM?ъ뾽遺", "?댁궗"],
      ["?⑥쑀??, "由ъ뒪?ъ떖?щ?", "怨쇱옣"],
    ],
  },
  {
    companyName: "?ъ뒪肄뷀??⑹뒪",
    field: "泥좉컯/?뚯옱",
    region: "?쒖슱 ?移?,
    memo: "洹몃９?щ퀎 ?κ린 ?꾨줈?앺듃? ?뚯옱 怨듦툒 ?쒖쓣 ?곌껐??愿由ы븯???쒕떎.",
    contacts: [
      ["瑜섏???, "泥좉컯?ъ뾽?꾨왂?", "遺??],
      ["沅뚯꽌??, "移쒗솚寃쎌냼?ы?", "李⑥옣"],
      ["諛깅룄??, "洹몃９?ъ뾽愿由ы?", "?댁궗"],
      ["?≪븘??, "援щℓ?묐젰?", "怨쇱옣"],
    ],
  },
  {
    companyName: "?쒗솕?붾（??,
    field: "?쒖뼇愿??뷀븰",
    region: "?쒖슱 ?κ탳??,
    memo: "?쒖뼇愿??꾨줈?앺듃蹂??ъ옄?? EPC, 怨듦툒 怨꾩빟???섎굹?????먮쫫?쇰줈 蹂닿퀬 ?띠뼱 ?쒕떎.",
    contacts: [
      ["議곕???, "?먯??ъ뾽遺", "遺??],
      ["?띿꽌??, "耳誘몄뭡?곸뾽?", "李⑥옣"],
      ["?좎???, "?꾨줈?앺듃湲덉쑖?", "?댁궗"],
      ["源?쇱삩", "湲濡쒕쾶?ъ뾽?", "怨쇱옣"],
    ],
  },
] as const;

const productSeeds = [
  ["?몄씪利??뚯씠?꾨씪??Enterprise", 3200000, "CRM", "?먮ℓ以?],
  ["AI ?뚯쓽濡??붿빟??, 1250000, "AI ?뚯쓽濡?, "?먮ℓ以?],
  ["?꾩옣 ?곸뾽 紐⑤컮?쇳뙥", 1480000, "紐⑤컮???곸뾽", "?먮ℓ以?],
  ["紐낇븿 OCR ?먮룞?낅젰", 850000, "?먮룞??, "?꾨줈紐⑥뀡"],
  ["?꾩썝 蹂닿퀬 ??쒕낫??, 2400000, "由ы룷??, "?먮ℓ以?],
  ["湲곗뾽 蹂댁븞 媛먯궗 ?듭뀡", 1900000, "蹂댁븞/愿由?, "?뷀꽣?꾨씪?댁쫰"],
  ["ERP/洹몃９?⑥뼱 ?곕룞 而ㅻ꽖??, 3600000, "?곗씠???곕룞", "?뷀꽣?꾨씪?댁쫰"],
  ["怨좉컼???듯빀 寃???좊뱶??, 980000, "寃??, "?먮ℓ以?],
  ["?곸뾽 議곗쭅 ?⑤낫???뚰겕??, 1100000, "?⑤낫??援먯쑁", "?먮ℓ以?],
  ["怨꾩빟 由ъ뒪??泥댄겕由ъ뒪??, 1350000, "蹂댁븞/愿由?, "?곷떞以?],
  ["二쇨컙 由щ쭏?몃뜑 ?먮룞??, 760000, "?먮룞??, "?꾨줈紐⑥뀡"],
  ["?뚰듃???쒕８ ?⑦궎吏", 2800000, "?묒뾽", "?곷떞以?],
] as const;

const dealTemplates = [
  {
    suffix: "?꾩궗 ?곸뾽 ?뚯씠?꾨씪???쒖???,
    baseCost: 11800000,
    action: "遺?쒕퀎 湲곗〈 ?묒? 愿由??묒떇 3醫??섏쭛",
    memo: "?꾩뾽 ?낅젰 遺?댁쓣 以꾩씠怨?寃쎌쁺吏?蹂닿퀬 ?щ㎎??留욎텛??寃껋씠 ?듭떖?대떎.",
  },
  {
    suffix: "AI ?뚯쓽濡?湲곕컲 ?꾩냽 議곗튂 ?먮룞??,
    baseCost: 7200000,
    action: "理쒓렐 怨좉컼 誘명똿 ?뱀랬 ?섑뵆濡??붿빟 ?덉쭏 鍮꾧탳",
    memo: "?뚯쓽 ??24?쒓컙 ?덉뿉 ?ㅼ쓬 ?됰룞???깅줉?섎뒗 ?먮쫫??寃利앺븯???쒕떎.",
  },
  {
    suffix: "?꾩썝 蹂닿퀬 ??쒕낫??援ъ텞",
    baseCost: 16400000,
    action: "二쇨컙 蹂닿퀬 吏??6媛쒖? ?꾪꽣 湲곗? ?뺤젙",
    memo: "?④퀎蹂??덉긽 留ㅼ텧怨?吏???쒖쓣 ???붾㈃?먯꽌 蹂대뒗 ?붽뎄媛 媛뺥븯??",
  },
  {
    suffix: "蹂댁븞 媛먯궗 諛??곗씠???곕룞 PoC",
    baseCost: 19800000,
    action: "蹂댁븞 泥댄겕由ъ뒪?몄? ?곕룞 踰붿쐞 臾몄꽌 ?꾨떖",
    memo: "?댁쁺???묎렐 湲곕줉怨?誘쇨컧 ?먮Ц 議고쉶 ?ъ쑀媛 ?대? ?뱀씤 議곌굔?대떎.",
  },
] as const;

function getRequired<T>(items: readonly T[], index: number, label: string): T {
  const value = items[index];
  if (value === undefined) {
    throw new Error(`Missing ${label} at index ${index}`);
  }
  return value;
}

function getCircularItems<T>(items: readonly T[], start: number, count: number): T[] {
  return Array.from({ length: count }, (_, index) =>
    getRequired(items, (start + index) % items.length, "circular item")
  );
}

function getDate(daysFromBase: number): Date {
  return new Date(Date.UTC(2026, 6, 1 + daysFromBase));
}

function getDateTime(daysFromBase: number, hour: number): Date {
  return new Date(Date.UTC(2026, 5, 24 + daysFromBase, hour - 9, 0, 0));
}

function getMobile(companyIndex: number, contactIndex: number): string {
  const middle = String(4200 + companyIndex * 19 + contactIndex * 7).padStart(4, "0");
  const last = String(6100 + companyIndex * 23 + contactIndex * 11).padStart(4, "0");
  return `010-${middle}-${last}`;
}

// 湲곕뒫 : ?곕え ?대떦???대??곗쓣 KR national/E.164 ????꾨뱶濡?蹂?섑빀?덈떎.
function createSeedContactPhone(mobile: string) {
  const nationalNumber = mobile.replace(/\D/g, "");

  return {
    mobile,
    phoneCountryCode: "KR",
    phoneNationalNumber: nationalNumber,
    phoneE164: `+82${nationalNumber.slice(1)}`,
  };
}

function getEmail(name: string, companyIndex: number): string {
  const domains = [
    "samsung.example",
    "skhynix.example",
    "lge.example",
    "miraeasset.example",
    "hyundai.example",
    "douzone.example",
    "kakao.example",
    "coupang.example",
    "toss.example",
    "shinhan.example",
    "posco.example",
    "hanwha.example",
  ];
  return `contact${companyIndex + 1}-${name.length}@${domains[companyIndex]}`;
}

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
    prisma.dealProduct.deleteMany({ where: { userId } }),
    prisma.dealContact.deleteMany({ where: { userId } }),
    prisma.dealCompany.deleteMany({ where: { userId } }),
    prisma.dealFollowingActionLog.deleteMany({ where: { userId } }),
    prisma.dealMemoLog.deleteMany({ where: { userId } }),
    prisma.deal.deleteMany({ where: { userId } }),
    prisma.productUserPrivateMemoLog.deleteMany({ where: { userId } }),
    prisma.productMemoLog.deleteMany({ where: { userId } }),
    prisma.product.deleteMany({ where: { userId } }),
    prisma.productCategory.deleteMany({ where: { userId } }),
    prisma.productStatus.deleteMany({ where: { userId } }),
    prisma.contactUserPrivateMemoLog.deleteMany({ where: { userId } }),
    prisma.contactMemoLog.deleteMany({ where: { userId } }),
    prisma.contact.deleteMany({ where: { userId } }),
    prisma.contactDepartment.deleteMany({ where: { userId } }),
    prisma.contactJobGrade.deleteMany({ where: { userId } }),
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
  const departmentMap = new Map<string, string>();
  const jobGradeMap = new Map<string, string>();
  const categoryMap = new Map<string, string>();
  const statusMap = new Map<string, string>();

  for (const field of [...new Set(companySeeds.map((company) => company.field))]) {
    const row = await prisma.companyField.create({ data: { userId, field } });
    fieldMap.set(field, row.id);
  }

  for (const region of [...new Set(companySeeds.map((company) => company.region))]) {
    const row = await prisma.companyRegion.create({ data: { userId, region } });
    regionMap.set(region, row.id);
  }

  const departments = [
    ...new Set(companySeeds.flatMap((company) => company.contacts.map((contact) => contact[1]))),
  ];
  for (const departmentName of departments) {
    const row = await prisma.contactDepartment.create({
      data: { userId, departmentName },
    });
    departmentMap.set(departmentName, row.id);
  }

  const jobGrades = [
    ...new Set(companySeeds.flatMap((company) => company.contacts.map((contact) => contact[2]))),
  ];
  for (const jobGradeName of jobGrades) {
    const row = await prisma.contactJobGrade.create({
      data: { userId, jobGradeName },
    });
    jobGradeMap.set(jobGradeName, row.id);
  }

  for (const categoryName of [...new Set(productSeeds.map((product) => product[2]))]) {
    const row = await prisma.productCategory.create({
      data: { userId, categoryName },
    });
    categoryMap.set(categoryName, row.id);
  }

  for (const statusName of [...new Set(productSeeds.map((product) => product[3]))]) {
    const row = await prisma.productStatus.create({
      data: { userId, statusName },
    });
    statusMap.set(statusName, row.id);
  }

  const companies = [];
  const contactsByCompany = new Map<string, Awaited<ReturnType<typeof prisma.contact.create>>[]>();

  for (const [companyIndex, seed] of companySeeds.entries()) {
    const company = await prisma.company.create({
      data: {
        userId,
        companyName: seed.companyName,
        companyFieldId: fieldMap.get(seed.field)!,
        companyRegionId: regionMap.get(seed.region)!,
      },
    });
    companies.push(company);

    await prisma.companyMemoLog.create({
      data: {
        userId,
        companyId: company.id,
        memoType: "怨꾩젙 媛쒖슂",
        memo: seed.memo,
      },
    });

    const contacts = [];
    for (const [contactIndex, contactSeed] of seed.contacts.entries()) {
      const [username, departmentName, jobGradeName] = contactSeed;
      const phone = createSeedContactPhone(getMobile(companyIndex, contactIndex));
      const contact = await prisma.contact.create({
        data: {
          userId,
          companyId: company.id,
          username,
          mobile: phone.mobile,
          phoneCountryCode: phone.phoneCountryCode,
          phoneNationalNumber: phone.phoneNationalNumber,
          phoneE164: phone.phoneE164,
          email: getEmail(username, companyIndex),
          contactDepartmentId: departmentMap.get(departmentName)!,
          contactJobGradeId: jobGradeMap.get(jobGradeName)!,
        },
      });
      contacts.push(contact);

      await prisma.contactMemoLog.create({
        data: {
          userId,
          contactId: contact.id,
          memoType: "愿怨?硫붾え",
          memo: `${seed.companyName} ${departmentName} ?대떦?? ${
            getRequired(
              dealTemplates,
              contactIndex % dealTemplates.length,
              "deal template"
            ).suffix
          } ?쇱쓽??李몄뿬?쒕떎.`,
        },
      });
    }
    contactsByCompany.set(company.id, contacts);
  }

  const products = [];
  for (const [productIndex, productSeed] of productSeeds.entries()) {
    const [productName, productPrice, categoryName, statusName] = productSeed;
    const product = await prisma.product.create({
      data: {
        userId,
        productName,
        productPrice,
        currencyCode: "KRW",
        productCategoryId: categoryMap.get(categoryName)!,
        productStatusId: statusMap.get(statusName)!,
      },
    });
    products.push(product);

    await prisma.productMemoLog.create({
      data: {
        userId,
        productId: product.id,
        memoType: "?곹뭹 ?ㅻ챸",
        memo: `${categoryName} ?곸뿭??${statusName} ?곹뭹. ?湲곗뾽 ?곸뾽 議곗쭅??諛섎났 蹂닿퀬? ?꾩냽 議곗튂 愿由щ? 以꾩씠????珥덉젏???붾떎. ?곹뭹 肄붾뱶 DEMO-${String(productIndex + 1).padStart(2, "0")}.`,
      },
    });
  }

  for (const [companyIndex, company] of companies.entries()) {
    const contacts = contactsByCompany.get(company.id)!;

    for (const [templateIndex, template] of dealTemplates.entries()) {
      const productCount = 3 + ((companyIndex + templateIndex) % 3);
      const linkedProducts = getCircularItems(
        products,
        companyIndex + templateIndex * 2,
        productCount
      );
      const status =
        getRequired(
          dealStatuses,
          (companyIndex * dealTemplates.length + templateIndex) %
            dealStatuses.length,
          "deal status"
        ) satisfies DealStatus;
      const contact = getRequired(
        contacts,
        templateIndex % contacts.length,
        "company contact"
      );
      const deal = await prisma.deal.create({
        data: {
          userId,
          dealName: `${company.companyName} ${template.suffix}`,
          dealCost: template.baseCost + companyIndex * 820000 + templateIndex * 430000,
          currencyCode: "KRW",
          dealStatus: status,
          expectedEndDate: getDate(companyIndex * 3 + templateIndex * 11),
        },
      });
      await prisma.dealCompany.create({
        data: {
          userId,
          dealId: deal.id,
          companyId: company.id,
        },
      });

      await prisma.dealContact.create({
        data: {
          userId,
          dealId: deal.id,
          contactId: contact.id,
        },
      });

      await prisma.dealProduct.createMany({
        data: linkedProducts.map((product) => ({
          userId,
          dealId: deal.id,
          productId: product.id,
        })),
      });

      await prisma.dealFollowingActionLog.create({
        data: {
          userId,
          dealId: deal.id,
          followingAction: template.action,
          checkComplete: status === "WON" || status === "LOST",
        },
      });

      await prisma.dealMemoLog.create({
        data: {
          userId,
          dealId: deal.id,
          memoType: "?곸뾽 硫붾え",
          memo: `${company.companyName} ${template.memo} ?곌껐 ?곹뭹? ${linkedProducts.map((product) => product.productName).join(", ")}?대떎.`,
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
