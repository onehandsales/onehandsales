/* eslint-disable no-console */
const { createCipheriv, createHash, randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  OAuthProvider,
  PrismaClient,
  UserRole,
  UserStatus,
} = require("@prisma/client");

loadEnv(path.join(__dirname, "..", ".env"));

const prisma = new PrismaClient();

const USER_ID = "00000000-0000-4000-8000-000000000001";
const ADMIN_ID = "00000000-0000-4000-8000-000000000002";
const USER_DEVICE_ID = "00000000-0000-4000-8000-000000000011";
const ADMIN_DEVICE_ID = "00000000-0000-4000-8000-000000000021";

const dealStatuses = [
  "INITIAL_CONTACT",
  "NEEDS_CHECK",
  "PROPOSAL_QUOTE",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const companySeeds = [
  ["한빛테크", "제조/스마트팩토리", "서울 강남", "반도체 장비 생산 라인의 영업 현황과 유지보수 계약을 통합 관리하려는 계정입니다."],
  ["누리커머스", "유통/커머스", "서울 송파", "입점 브랜드별 딜, 담당자, 캠페인 일정을 함께 추적해야 하는 고객입니다."],
  ["오름바이오", "바이오/헬스케어", "경기 성남", "병원 네트워크와 임상 협력 프로젝트가 많은 성장 계정입니다."],
  ["라온모빌리티", "모빌리티", "경기 수원", "법인 차량과 충전 인프라 패키지를 검토 중인 대형 고객입니다."],
  ["세움건설", "건설/부동산", "서울 마포", "현장별 장비 도입과 하자 대응 프로세스 개선 니즈가 있습니다."],
  ["다온클라우드", "IT/SaaS", "서울 구로", "파트너 영업과 엔터프라이즈 고객 대응 기록을 분리해 보고 싶어 합니다."],
  ["리버핀테크", "금융", "서울 여의도", "보안 검토와 계약 리스크 체크가 길게 이어지는 금융 계정입니다."],
  ["해솔교육", "공공/교육", "대전 유성", "캠퍼스별 상담 이력과 도입 의사결정권자를 연결해 관리합니다."],
  ["브릿지미디어", "미디어/콘텐츠", "서울 상암", "광고주 제안과 콘텐츠 제작 일정을 딜 중심으로 묶어 봅니다."],
  ["파인푸드", "식품/F&B", "부산 해운대", "프랜차이즈 지점 확장과 물류 계약이 함께 움직이는 계정입니다."],
  ["코어에너지", "에너지", "울산 남구", "설비 교체, 안전 점검, 장기 유지보수 계약을 병행합니다."],
  ["모아로지스", "물류", "인천 연수", "창고 자동화와 라스트마일 운영 리포트를 검토합니다."],
  ["비전메디컬", "바이오/헬스케어", "서울 종로", "의료기기 구매와 임상 세미나 일정을 함께 관리합니다."],
  ["플랜비리테일", "유통/커머스", "경기 고양", "오프라인 매장별 프로모션과 본사 승인 절차가 중요합니다."],
  ["아이든소프트", "IT/SaaS", "서울 판교", "SaaS 구독 확장과 기술 PoC가 동시에 진행됩니다."],
  ["청명소재", "제조/소재", "충북 청주", "소재 공급 계약과 품질 이슈 확인이 잦습니다."],
  ["그린하우스랩", "농식품/애그테크", "전북 전주", "스마트팜 구축과 지자체 협력 프로젝트를 검토합니다."],
  ["에이치큐파트너스", "컨설팅", "서울 중구", "고객사별 제안 산출물과 파트너 담당자를 촘촘히 관리합니다."],
  ["블루핀보험", "금융", "서울 강서", "대리점 영업망과 상품 교육 일정을 연동하고 싶어 합니다."],
  ["아크디자인", "디자인/브랜딩", "서울 성수", "브랜드 리뉴얼 프로젝트와 제작 일정이 딜별로 분리됩니다."],
  ["케이씨공공서비스", "공공/교육", "세종", "공공 입찰, 제안서, 현장 설명회 일정이 많은 계정입니다."],
  ["스텔라호텔", "여행/숙박", "제주 제주시", "지점별 B2B 행사 유치와 장기 계약을 동시에 추진합니다."],
  ["온유케어", "헬스케어/복지", "광주 북구", "복지시설 네트워크와 정기 납품 계약을 관리합니다."],
  ["메타팩토리", "제조/스마트팩토리", "경남 창원", "공장 자동화 PoC와 본계약 전환 가능성이 높은 계정입니다."],
];

const departments = ["영업기획팀", "구매팀", "전략사업팀", "디지털전환팀", "운영관리팀", "재무관리팀"];
const grades = ["매니저", "책임", "팀장", "이사", "본부장"];
const contactNames = [
  "김도윤", "박서연", "이민준", "최하린", "정유진", "강지훈", "윤서아", "장현우",
  "한지민", "오세준", "신다은", "류태오", "문채원", "백승현", "임나영", "고준서",
  "노유라", "서지호", "차예린", "권도현", "송하늘", "배지안", "홍민재", "유가은",
  "조윤호", "전소민", "남태현", "심아린", "허준영", "황서윤", "민재원", "주다현",
  "길성민", "방예지", "석지후", "엄채린", "변도겸", "여서진", "추가람", "표민성",
  "마유빈", "도시윤", "나현서", "피준호", "라서율", "곽지완", "설다인", "하준혁",
  "공채아", "기서준", "단유나", "봉시우", "안세아", "원지율", "진도하", "천수빈",
  "탁현준", "편아영", "감도윤", "견서현", "명지오", "소유림", "위태준", "재하린",
  "제민규", "창서우", "태아린", "하도현", "현유주", "가민준", "나서영", "다지환",
];

const productSeeds = [
  ["세일즈 파이프라인 Enterprise", 3200000, "CRM", "판매중"],
  ["AI 회의록 요약", 1250000, "AI 자동화", "판매중"],
  ["명함 OCR 자동입력", 850000, "업무 자동화", "프로모션"],
  ["모바일 영업 앱 패키지", 1480000, "모바일", "판매중"],
  ["임원 보고 대시보드", 2400000, "리포팅", "판매중"],
  ["보안 감사 옵션", 1900000, "보안/관리", "엔터프라이즈"],
  ["ERP 연동 커넥터", 3600000, "데이터 연동", "엔터프라이즈"],
  ["고객사 통합 검색", 980000, "검색", "판매중"],
  ["영업 교육 온보딩", 1100000, "교육", "판매중"],
  ["계약 리스크 체크리스트", 1350000, "보안/관리", "상담중"],
  ["주간 리마인더 자동화", 760000, "업무 자동화", "프로모션"],
  ["파트너 제휴 패키지", 2800000, "협업", "상담중"],
  ["현장 방문 리포트", 690000, "리포팅", "판매중"],
  ["견적 승인 워크플로", 1580000, "업무 자동화", "판매중"],
  ["고객 등급 분석", 1750000, "분석", "상담중"],
  ["대량 데이터 불러오기", 920000, "데이터 연동", "판매중"],
  ["세일즈 코칭 리포트", 1320000, "교육", "프로모션"],
  ["프리미엄 SLA", 4200000, "운영지원", "엔터프라이즈"],
];

const dealTemplates = [
  {
    suffix: "신규 도입 제안",
    action: "현업 부서별 필수 입력 항목과 승인 흐름 확인",
    memo: "초기 니즈는 명확하며 예산 승인 전에 보안 검토 자료가 필요합니다.",
    cost: 11800000,
  },
  {
    suffix: "운영 자동화 PoC",
    action: "PoC 범위와 성공 기준을 문서로 정리해 전달",
    memo: "반복 보고와 다음 행동 정리 부담을 줄이는 데 관심이 큽니다.",
    cost: 7200000,
  },
  {
    suffix: "확장 계약 협의",
    action: "기존 사용 부서의 정량 효과와 추가 라이선스 수량 확인",
    memo: "기존 도입 부서 만족도가 높아 인접 조직 확장이 가능합니다.",
    cost: 16400000,
  },
];

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue;
    }

    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      continue;
    }

    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  }
}

function envValue(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function column(key, label, required, type) {
  return { key, label, required, type };
}

function dateOnly(daysFromBase) {
  const date = new Date(Date.UTC(2026, 5, 30));
  date.setUTCDate(date.getUTCDate() + daysFromBase);
  return date;
}

function kstDateTime(daysFromBase, hour, minute = 0) {
  const date = new Date(Date.UTC(2026, 5, 30));
  date.setUTCDate(date.getUTCDate() + daysFromBase);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hour - 9,
      minute,
      0,
      0
    )
  );
}

function mobile(index) {
  const middle = String(4100 + index * 7).padStart(4, "0");
  const last = String(6100 + index * 11).padStart(4, "0");
  return `010-${middle.slice(-4)}-${last.slice(-4)}`;
}

function email(companyIndex, contactIndex) {
  return `contact-${String(companyIndex + 1).padStart(2, "0")}-${contactIndex + 1}@demo.onehandsales.local`;
}

function pick(items, index) {
  return items[index % items.length];
}

function range(count) {
  return Array.from({ length: count }, (_, index) => index);
}

function encryptPrivateMemo(scope, plaintext) {
  const secret =
    envValue(`${scope}_PRIVATE_MEMO_ENCRYPTION_KEY`) ||
    envValue("ENCRYPTION_MASTER_KEY") ||
    "local-demo-private-memo-secret";
  const keyVersion =
    envValue(`${scope}_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION`) ||
    envValue("ENCRYPTION_KEY_VERSION") ||
    "v1";
  const iv = randomBytes(12);
  const key = createHash("sha256").update(secret).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    memoCiphertext: [
      "aes-256-gcm",
      iv.toString("base64url"),
      authTag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":"),
    memoKeyVersion: keyVersion,
  };
}

async function seedAuth() {
  await prisma.user.upsert({
    where: { id: USER_ID },
    create: {
      id: USER_ID,
      email: "local.user@example.com",
      displayName: "로컬 세일즈 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      lastLoginAt: new Date(),
    },
    update: {
      email: "local.user@example.com",
      displayName: "로컬 세일즈 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      deletedAt: null,
      lastLoginAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    create: {
      id: ADMIN_ID,
      email: "local.admin@example.com",
      displayName: "로컬 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      lastLoginAt: new Date(),
    },
    update: {
      email: "local.admin@example.com",
      displayName: "로컬 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      timeZone: "Asia/Seoul",
      deletedAt: null,
      lastLoginAt: new Date(),
    },
  });

  await prisma.userOAuthAccount.deleteMany({
    where: { userId: { in: [USER_ID, ADMIN_ID] } },
  });
  await prisma.userOAuthAccount.createMany({
    data: [
      {
        userId: USER_ID,
        provider: OAuthProvider.GOOGLE,
        providerUserId: "local-google-user",
        providerEmail: "local.user@example.com",
      },
      {
        userId: ADMIN_ID,
        provider: OAuthProvider.GOOGLE,
        providerUserId: "local-google-admin",
        providerEmail: "local.admin@example.com",
      },
    ],
  });

  await upsertDeviceAndSessions({
    userId: USER_ID,
    deviceId: USER_DEVICE_ID,
    label: "Local user browser",
    sessions: [
      "00000000-0000-4000-8000-000000000101",
      "00000000-0000-4000-8000-000000000102",
    ],
  });
  await upsertDeviceAndSessions({
    userId: ADMIN_ID,
    deviceId: ADMIN_DEVICE_ID,
    label: "Local admin browser",
    sessions: ["00000000-0000-4000-8000-000000000201"],
  });
}

async function upsertDeviceAndSessions({ userId, deviceId, label, sessions }) {
  await prisma.authDevice.upsert({
    where: { id: deviceId },
    create: {
      id: deviceId,
      userId,
      deviceSlot: AuthDeviceSlot.PERSONAL_LAPTOP,
      deviceIdHash: `${userId}:local-device`,
      label,
      status: AuthDeviceStatus.ACTIVE,
      lastSeenAt: new Date(),
    },
    update: {
      label,
      status: AuthDeviceStatus.ACTIVE,
      revokedAt: null,
      replacedAt: null,
      lastSeenAt: new Date(),
    },
  });

  for (const sessionId of sessions) {
    await prisma.authSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        userId,
        authDeviceId: deviceId,
        status: AuthSessionStatus.ACTIVE,
        refreshTokenHash: `${sessionId}:local-refresh`,
        expiresAt: new Date("2099-12-31T00:00:00.000Z"),
        lastUsedAt: new Date(),
      },
      update: {
        userId,
        authDeviceId: deviceId,
        status: AuthSessionStatus.ACTIVE,
        revokedAt: null,
        expiresAt: new Date("2099-12-31T00:00:00.000Z"),
        lastUsedAt: new Date(),
      },
    });
  }
}

async function clearDemoData(userId) {
  await prisma.dealProduct.deleteMany({ where: { userId } });
  await prisma.dealContact.deleteMany({ where: { userId } });
  await prisma.dealCompany.deleteMany({ where: { userId } });
  await prisma.dealFollowingActionLog.deleteMany({ where: { userId } });
  await prisma.dealMemoLog.deleteMany({ where: { userId } });
  await prisma.deal.deleteMany({ where: { userId } });
  await prisma.productUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.productMemoLog.deleteMany({ where: { userId } });
  await prisma.product.deleteMany({ where: { userId } });
  await prisma.productCategory.deleteMany({ where: { userId } });
  await prisma.productStatus.deleteMany({ where: { userId } });
  await prisma.contactUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.contactMemoLog.deleteMany({ where: { userId } });
  await prisma.contact.deleteMany({ where: { userId } });
  await prisma.contactDepartment.deleteMany({ where: { userId } });
  await prisma.contactJobGrade.deleteMany({ where: { userId } });
  await prisma.companyUserPrivateMemoLog.deleteMany({ where: { userId } });
  await prisma.companyMemoLog.deleteMany({ where: { userId } });
  await prisma.company.deleteMany({ where: { userId } });
  await prisma.companyField.deleteMany({ where: { userId } });
  await prisma.companyRegion.deleteMany({ where: { userId } });
}

async function seedDomainData(userId) {
  const fieldByName = new Map();
  const regionByName = new Map();
  const departmentByName = new Map();
  const gradeByName = new Map();
  const categoryByName = new Map();
  const productStatusByName = new Map();

  for (const field of [...new Set(companySeeds.map((seed) => seed[1]))]) {
    fieldByName.set(field, await prisma.companyField.create({ data: { userId, field } }));
  }

  for (const region of [...new Set(companySeeds.map((seed) => seed[2]))]) {
    regionByName.set(region, await prisma.companyRegion.create({ data: { userId, region } }));
  }

  for (const departmentName of departments) {
    departmentByName.set(
      departmentName,
      await prisma.contactDepartment.create({ data: { userId, departmentName } })
    );
  }

  for (const jobGradeName of grades) {
    gradeByName.set(
      jobGradeName,
      await prisma.contactJobGrade.create({ data: { userId, jobGradeName } })
    );
  }

  for (const categoryName of [...new Set(productSeeds.map((seed) => seed[2]))]) {
    categoryByName.set(
      categoryName,
      await prisma.productCategory.create({ data: { userId, categoryName } })
    );
  }

  for (const statusName of [...new Set(productSeeds.map((seed) => seed[3]))]) {
    productStatusByName.set(
      statusName,
      await prisma.productStatus.create({ data: { userId, statusName } })
    );
  }

  const companies = [];
  const contacts = [];
  const contactsByCompanyId = new Map();
  const products = [];
  const deals = [];

  for (const [companyIndex, seed] of companySeeds.entries()) {
    const [companyName, field, region, memo] = seed;
    const company = await prisma.company.create({
      data: {
        userId,
        companyName,
        companyFieldId: fieldByName.get(field).id,
        companyRegionId: regionByName.get(region).id,
        createdAt: kstDateTime(-30 + companyIndex, 9),
      },
    });
    const companyRecord = { ...company, field, region, memo };
    companies.push(companyRecord);
    contactsByCompanyId.set(company.id, []);

    await prisma.companyMemoLog.createMany({
      data: [
        {
          userId,
          companyId: company.id,
          memoType: "계정 개요",
          memo,
          createdAt: kstDateTime(-25 + companyIndex, 10),
        },
        {
          userId,
          companyId: company.id,
          memoType: "최근 접점",
          memo: `${companyName} 담당자와 이번 분기 검토 범위, 예산 승인 일정, PoC 필요 여부를 확인했습니다.`,
          createdAt: kstDateTime(-18 + companyIndex, 15),
        },
      ],
    });

    await prisma.companyUserPrivateMemoLog.create({
      data: {
        userId,
        companyId: company.id,
        ...encryptPrivateMemo(
          "COMPANY",
          `${companyName} 내부 메모: 가격 민감도는 보통이며, 의사결정권자 일정 확인이 중요합니다.`
        ),
        createdAt: kstDateTime(-16 + companyIndex, 11),
      },
    });

    for (let contactIndex = 0; contactIndex < 3; contactIndex += 1) {
      const globalIndex = companyIndex * 3 + contactIndex;
      const departmentName = pick(departments, companyIndex + contactIndex);
      const jobGradeName = pick(grades, companyIndex + contactIndex + 2);
      const username = contactNames[globalIndex];
      const contact = await prisma.contact.create({
        data: {
          userId,
          companyId: company.id,
          username,
          mobile: mobile(globalIndex),
          email: email(companyIndex, contactIndex),
          contactDepartmentId: departmentByName.get(departmentName).id,
          contactJobGradeId: gradeByName.get(jobGradeName).id,
          createdAt: kstDateTime(-24 + companyIndex, 9 + contactIndex),
        },
      });
      const contactRecord = {
        ...contact,
        companyName,
        departmentName,
        jobGradeName,
      };
      contacts.push(contactRecord);
      contactsByCompanyId.get(company.id).push(contactRecord);

      await prisma.contactMemoLog.createMany({
        data: [
          {
            userId,
            contactId: contact.id,
            memoType: "관계 메모",
            memo: `${username}님은 ${companyName} ${departmentName}의 핵심 담당자입니다. 의사결정 자료는 짧은 요약과 수치 근거를 선호합니다.`,
            createdAt: kstDateTime(-20 + companyIndex, 12 + contactIndex),
          },
          {
            userId,
            contactId: contact.id,
            memoType: "커뮤니케이션",
            memo: "전화보다 이메일 회신이 빠르며, 미팅 전 아젠다를 먼저 공유하면 응답률이 높습니다.",
            createdAt: kstDateTime(-12 + companyIndex, 16),
          },
        ],
      });

      await prisma.contactUserPrivateMemoLog.create({
        data: {
          userId,
          contactId: contact.id,
          ...encryptPrivateMemo(
            "CONTACT",
            `${username} 개인 메모: 실무 영향력이 높고, 내부 승인 전에 레퍼런스 사례를 꼭 확인합니다.`
          ),
          createdAt: kstDateTime(-10 + companyIndex, 17),
        },
      });
    }
  }

  for (const [productIndex, seed] of productSeeds.entries()) {
    const [productName, productPrice, categoryName, statusName] = seed;
    const product = await prisma.product.create({
      data: {
        userId,
        productName,
        productPrice,
        productCategoryId: categoryByName.get(categoryName).id,
        productStatusId: productStatusByName.get(statusName).id,
        createdAt: kstDateTime(-40 + productIndex, 10),
      },
    });
    const productRecord = { ...product, categoryName, statusName };
    products.push(productRecord);

    await prisma.productMemoLog.createMany({
      data: [
        {
          userId,
          productId: product.id,
          memoType: "제품 설명",
          memo: `${productName}은 ${categoryName} 영역의 데모 제품이며 현재 상태는 ${statusName}입니다.`,
          createdAt: kstDateTime(-35 + productIndex, 11),
        },
        {
          userId,
          productId: product.id,
          memoType: "영업 포인트",
          memo: "반복 업무 절감, 보고 시간 단축, 고객 접점 누락 방지를 핵심 메시지로 사용합니다.",
          createdAt: kstDateTime(-28 + productIndex, 14),
        },
      ],
    });

    await prisma.productUserPrivateMemoLog.create({
      data: {
        userId,
        productId: product.id,
        ...encryptPrivateMemo(
          "PRODUCT",
          `${productName} 내부 메모: 할인 가능 범위는 데모 기준 최대 12%로 가정합니다.`
        ),
        createdAt: kstDateTime(-22 + productIndex, 15),
      },
    });
  }

  for (const [companyIndex, company] of companies.entries()) {
    const companyDeals = [];
    const companyContacts = contactsByCompanyId.get(company.id);

    for (const [templateIndex, template] of dealTemplates.entries()) {
      const status = pick(dealStatuses, companyIndex + templateIndex);
      const deal = await prisma.deal.create({
        data: {
          userId,
          dealName: `${company.companyName} ${template.suffix}`,
          dealCost: template.cost + companyIndex * 410000 + templateIndex * 680000,
          dealStatus: status,
          expectedEndDate: dateOnly(12 + companyIndex * 2 + templateIndex * 9),
          createdAt: kstDateTime(-15 + companyIndex, 10 + templateIndex),
        },
      });
      const linkedContacts = [
        companyContacts[templateIndex % companyContacts.length],
        companyContacts[(templateIndex + 1) % companyContacts.length],
      ];
      const linkedProducts = range(4).map((offset) =>
        pick(products, companyIndex + templateIndex * 3 + offset)
      );
      const dealRecord = {
        ...deal,
        company,
        contacts: linkedContacts,
        products: linkedProducts,
      };
      deals.push(dealRecord);
      companyDeals.push(dealRecord);

      await prisma.dealCompany.create({
        data: { userId, dealId: deal.id, companyId: company.id },
      });
      await prisma.dealContact.createMany({
        data: linkedContacts.map((contact) => ({
          userId,
          dealId: deal.id,
          contactId: contact.id,
        })),
        skipDuplicates: true,
      });
      await prisma.dealProduct.createMany({
        data: linkedProducts.map((product) => ({
          userId,
          dealId: deal.id,
          productId: product.id,
        })),
        skipDuplicates: true,
      });
      await prisma.dealFollowingActionLog.createMany({
        data: [
          {
            userId,
            dealId: deal.id,
            followingAction: template.action,
            checkComplete: status === "WON" || status === "LOST",
            createdAt: kstDateTime(-8 + companyIndex, 9),
          },
          {
            userId,
            dealId: deal.id,
            followingAction: "다음 미팅 전까지 제품별 견적 범위와 도입 일정표 공유",
            checkComplete: false,
            createdAt: kstDateTime(-5 + companyIndex, 16),
          },
        ],
      });
      await prisma.dealMemoLog.createMany({
        data: [
          {
            userId,
            dealId: deal.id,
            memoType: "딜 요약",
            memo: `${company.companyName} ${template.memo}`,
            createdAt: kstDateTime(-7 + companyIndex, 13),
          },
          {
            userId,
            dealId: deal.id,
            memoType: "연결 제품",
            memo: linkedProducts.map((product) => product.productName).join(", "),
            createdAt: kstDateTime(-4 + companyIndex, 17),
          },
        ],
      });
    }

  }


  return { companies, contacts, products, deals };
}

async function assertTrashEmpty(userId) {
  const trashModels = [
    "company",
    "contact",
    "product",
    "deal",
    "companyMemoLog",
    "companyUserPrivateMemoLog",
    "contactMemoLog",
    "contactUserPrivateMemoLog",
    "productMemoLog",
    "productUserPrivateMemoLog",
    "dealFollowingActionLog",
    "dealMemoLog",
  ];

  const trash = {};
  for (const model of trashModels) {
    trash[model] = await prisma[model].count({
      where: { userId, deletedAt: { not: null } },
    });
  }

  const total = Object.values(trash).reduce((sum, count) => sum + count, 0);
  if (total !== 0) {
    throw new Error(`Trash is not empty: ${JSON.stringify(trash)}`);
  }
}

async function summary(userId) {
  const counts = {};
  const modelWhere = {
    companyField: { userId },
    companyRegion: { userId },
    company: { userId },
    companyMemoLog: { userId },
    companyUserPrivateMemoLog: { userId },
    contactDepartment: { userId },
    contactJobGrade: { userId },
    contact: { userId },
    contactMemoLog: { userId },
    contactUserPrivateMemoLog: { userId },
    productCategory: { userId },
    productStatus: { userId },
    product: { userId },
    productMemoLog: { userId },
    productUserPrivateMemoLog: { userId },
    deal: { userId },
    dealCompany: { userId },
    dealContact: { userId },
    dealProduct: { userId },
    dealFollowingActionLog: { userId },
    dealMemoLog: { userId },
  };

  for (const [model, where] of Object.entries(modelWhere)) {
    counts[model] = await prisma[model].count({ where });
  }

  return counts;
}

async function main() {
  console.log("Seeding rich local demo data...");
  await seedAuth();
  await clearDemoData(USER_ID);
  await seedDomainData(USER_ID);
  await assertTrashEmpty(USER_ID);
  console.log(JSON.stringify(await summary(USER_ID), null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
