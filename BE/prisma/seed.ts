import {
  AuthDeviceSlot,
  AuthDeviceStatus,
  AuthSessionStatus,
  MeetingNoteSourceType,
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
    companyName: "삼성전자",
    field: "반도체/모바일/가전",
    region: "경기 수원 디지털시티",
    memo: "DX와 DS 조직의 B2B 영업 파이프라인을 분리해 보고 싶어 한다. 경영진 주간 보고용 단계별 예상 매출이 중요하다.",
    contacts: [
      ["김민준", "MX사업부", "부장"],
      ["박서연", "VD사업부", "차장"],
      ["이도현", "DS영업기획팀", "이사"],
      ["최유진", "B2B솔루션팀", "과장"],
    ],
  },
  {
    companyName: "SK하이닉스",
    field: "반도체 메모리",
    region: "경기 이천",
    memo: "글로벌 고객사별 장기 공급 협상 이력을 제품군과 함께 추적하려는 니즈가 강하다.",
    contacts: [
      ["정현우", "Global Sales", "부장"],
      ["한지민", "DRAM영업팀", "차장"],
      ["오세준", "NAND사업기획팀", "이사"],
      ["임하늘", "고객품질지원팀", "과장"],
    ],
  },
  {
    companyName: "LG전자",
    field: "가전/전장 솔루션",
    region: "서울 여의도",
    memo: "B2B 공조와 전장 고객사의 제안 이력을 한 화면에서 비교하고 싶어 한다.",
    contacts: [
      ["강민준", "BS사업본부", "이사"],
      ["윤태오", "H&A영업기획팀", "부장"],
      ["배수빈", "전장고객전략팀", "차장"],
      ["서지안", "마케팅전략팀", "과장"],
    ],
  },
  {
    companyName: "미래에셋증권",
    field: "증권/자산관리",
    region: "서울 을지로",
    memo: "법인 WM 영업과 IPO 관련 딜을 분리해 관리하고, 고객 미팅 후속 조치 누락을 줄이고 싶어 한다.",
    contacts: [
      ["신아린", "법인영업본부", "부장"],
      ["문지호", "WM전략팀", "차장"],
      ["장예은", "IB사업부", "이사"],
      ["고태민", "디지털전략팀", "과장"],
    ],
  },
  {
    companyName: "현대자동차",
    field: "완성차/모빌리티",
    region: "서울 양재",
    memo: "법인차량, PBV, 글로벌 파트너 영업의 진행 상황을 제품군별로 보고하려 한다.",
    contacts: [
      ["남기준", "국내사업본부", "부장"],
      ["류선우", "PBV사업팀", "차장"],
      ["권나연", "글로벌사업관리팀", "과장"],
      ["백지아", "모빌리티전략팀", "이사"],
    ],
  },
  {
    companyName: "네이버",
    field: "검색/클라우드/AI",
    region: "경기 성남 판교",
    memo: "클라우드와 AI 솔루션 영업에서 고객사별 PoC, 제안서, 계약 일정을 촘촘히 관리하려 한다.",
    contacts: [
      ["송민재", "클라우드사업부", "이사"],
      ["조은서", "AI비즈니스팀", "부장"],
      ["홍지후", "엔터프라이즈세일즈", "차장"],
      ["유다인", "파트너전략팀", "과장"],
    ],
  },
  {
    companyName: "카카오",
    field: "플랫폼/메시징",
    region: "경기 성남 판교",
    memo: "광고, 커머스, 톡채널 제휴 영업을 고객사별로 묶어 보고 싶어 한다.",
    contacts: [
      ["김하준", "비즈니스플랫폼팀", "부장"],
      ["이서윤", "커머스제휴팀", "차장"],
      ["박지호", "광고사업전략팀", "이사"],
      ["최나은", "톡채널영업팀", "과장"],
    ],
  },
  {
    companyName: "쿠팡",
    field: "이커머스/물류",
    region: "서울 송파",
    memo: "셀러 영업과 물류 파트너 계약이 빠르게 늘어 일정과 딜 연결을 중요하게 본다.",
    contacts: [
      ["정서준", "마켓플레이스팀", "부장"],
      ["한소율", "로켓배송운영팀", "차장"],
      ["오지훈", "물류파트너십팀", "이사"],
      ["임채원", "셀러성장팀", "과장"],
    ],
  },
  {
    companyName: "토스",
    field: "핀테크/금융 플랫폼",
    region: "서울 강남",
    memo: "제휴 금융사별 계약 조건과 보안 검토 상태를 딜 단계와 함께 관리하려 한다.",
    contacts: [
      ["강도윤", "제휴사업팀", "부장"],
      ["윤서아", "금융플랫폼팀", "차장"],
      ["배현준", "리스크관리팀", "이사"],
      ["서민지", "프로덕트전략팀", "과장"],
    ],
  },
  {
    companyName: "신한은행",
    field: "은행/기업금융",
    region: "서울 중구",
    memo: "기업금융 RM의 고객 접촉 이력, 회의록, 다음 행동을 표준화하려는 요구가 있다.",
    contacts: [
      ["문서준", "기업금융부", "부장"],
      ["장하린", "디지털전략부", "차장"],
      ["고현우", "WM사업부", "이사"],
      ["남유정", "리스크심사부", "과장"],
    ],
  },
  {
    companyName: "포스코홀딩스",
    field: "철강/소재",
    region: "서울 대치",
    memo: "그룹사별 장기 프로젝트와 소재 공급 딜을 연결해 관리하려 한다.",
    contacts: [
      ["류지훈", "철강사업전략팀", "부장"],
      ["권서연", "친환경소재팀", "차장"],
      ["백도현", "그룹사업관리팀", "이사"],
      ["송아영", "구매협력팀", "과장"],
    ],
  },
  {
    companyName: "한화솔루션",
    field: "태양광/화학",
    region: "서울 장교동",
    memo: "태양광 프로젝트별 투자사, EPC, 공급 계약을 하나의 딜 흐름으로 보고 싶어 한다.",
    contacts: [
      ["조민석", "큐셀사업부", "부장"],
      ["홍서영", "케미칼영업팀", "차장"],
      ["유지완", "프로젝트금융팀", "이사"],
      ["김라온", "글로벌사업팀", "과장"],
    ],
  },
] as const;

const productSeeds = [
  ["세일즈 파이프라인 Enterprise", 3200000, "CRM", "판매중"],
  ["AI 회의록 요약팩", 1250000, "AI 회의록", "판매중"],
  ["현장 영업 모바일팩", 1480000, "모바일 영업", "판매중"],
  ["명함 OCR 자동입력", 850000, "자동화", "프로모션"],
  ["임원 보고 대시보드", 2400000, "리포팅", "판매중"],
  ["기업 보안 감사 옵션", 1900000, "보안/관리", "엔터프라이즈"],
  ["ERP/그룹웨어 연동 커넥터", 3600000, "데이터 연동", "엔터프라이즈"],
  ["고객사 통합 검색 애드온", 980000, "검색", "판매중"],
  ["영업 조직 온보딩 워크숍", 1100000, "온보딩/교육", "판매중"],
  ["계약 리스크 체크리스트", 1350000, "보안/관리", "상담중"],
  ["주간 리마인더 자동화", 760000, "자동화", "프로모션"],
  ["파트너 딜룸 패키지", 2800000, "협업", "상담중"],
] as const;

const dealTemplates = [
  {
    suffix: "전사 영업 파이프라인 표준화",
    baseCost: 11800000,
    action: "부서별 기존 엑셀 관리 양식 3종 수집",
    memo: "현업 입력 부담을 줄이고 경영진 보고 포맷을 맞추는 것이 핵심이다.",
  },
  {
    suffix: "AI 회의록 기반 후속 조치 자동화",
    baseCost: 7200000,
    action: "최근 고객 미팅 녹취 샘플로 요약 품질 비교",
    memo: "회의 후 24시간 안에 다음 행동이 등록되는 흐름을 검증하려 한다.",
  },
  {
    suffix: "임원 보고 대시보드 구축",
    baseCost: 16400000,
    action: "주간 보고 지표 6개와 필터 기준 확정",
    memo: "단계별 예상 매출과 지연 딜을 한 화면에서 보는 요구가 강하다.",
  },
  {
    suffix: "보안 감사 및 데이터 연동 PoC",
    baseCost: 19800000,
    action: "보안 체크리스트와 연동 범위 문서 전달",
    memo: "운영자 접근 기록과 민감 원문 조회 사유가 내부 승인 조건이다.",
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

function getEmail(name: string, companyIndex: number): string {
  const domains = [
    "samsung.example",
    "skhynix.example",
    "lge.example",
    "miraeasset.example",
    "hyundai.example",
    "naver.example",
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
    prisma.meetingNoteDeal.deleteMany({ where: { userId } }),
    prisma.meetingNoteProduct.deleteMany({ where: { userId } }),
    prisma.meetingNoteContact.deleteMany({ where: { userId } }),
    prisma.meetingNoteCompany.deleteMany({ where: { userId } }),
    prisma.meetingNote.deleteMany({ where: { userId } }),
    prisma.scheduleDeal.deleteMany({ where: { userId } }),
    prisma.schedule.deleteMany({ where: { userId } }),
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
        memoType: "계정 개요",
        memo: seed.memo,
      },
    });

    const contacts = [];
    for (const [contactIndex, contactSeed] of seed.contacts.entries()) {
      const [username, departmentName, jobGradeName] = contactSeed;
      const contact = await prisma.contact.create({
        data: {
          userId,
          companyId: company.id,
          username,
          mobile: getMobile(companyIndex, contactIndex),
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
          memoType: "관계 메모",
          memo: `${seed.companyName} ${departmentName} 담당자. ${
            getRequired(
              dealTemplates,
              contactIndex % dealTemplates.length,
              "deal template"
            ).suffix
          } 논의에 참여한다.`,
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
        productCategoryId: categoryMap.get(categoryName)!,
        productStatusId: statusMap.get(statusName)!,
      },
    });
    products.push(product);

    await prisma.productMemoLog.create({
      data: {
        userId,
        productId: product.id,
        memoType: "상품 설명",
        memo: `${categoryName} 영역의 ${statusName} 상품. 대기업 영업 조직의 반복 보고와 후속 조치 관리를 줄이는 데 초점을 둔다. 상품 코드 DEMO-${String(productIndex + 1).padStart(2, "0")}.`,
      },
    });
  }

  const dealsByCompany = new Map<string, Awaited<ReturnType<typeof prisma.deal.create>>[]>();
  const allDeals = [];

  for (const [companyIndex, company] of companies.entries()) {
    const contacts = contactsByCompany.get(company.id)!;
    const companyDeals = [];

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
          dealStatus: status,
          expectedEndDate: getDate(companyIndex * 3 + templateIndex * 11),
        },
      });
      companyDeals.push(deal);
      allDeals.push(deal);

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
          memoType: "영업 메모",
          memo: `${company.companyName} ${template.memo} 연결 상품은 ${linkedProducts.map((product) => product.productName).join(", ")}이다.`,
        },
      });
    }

    dealsByCompany.set(company.id, companyDeals);
  }

  for (const [companyIndex, company] of companies.entries()) {
    const companyDeals = dealsByCompany.get(company.id)!;
    const linkedDeals = companyDeals.slice(0, 3);
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        scheduleTitle: `${company.companyName} 주간 영업 점검`,
        startAt: getDateTime(companyIndex, 10 + (companyIndex % 5)),
        endAt: getDateTime(companyIndex, 11 + (companyIndex % 5)),
        timeZone: "Asia/Seoul",
        location: `${company.companyName} 담당자 온라인 미팅`,
        memo: "주요 딜 3건의 단계, 다음 행동, 리스크를 점검한다.",
      },
    });

    await prisma.scheduleDeal.createMany({
      data: linkedDeals.map((deal) => ({
        userId,
        scheduleId: schedule.id,
        dealId: deal.id,
      })),
    });
  }

  for (let index = 0; index < 4; index += 1) {
    const linkedDeals = getCircularItems(allDeals, index * 7, 5);
    const schedule = await prisma.schedule.create({
      data: {
        userId,
        scheduleTitle: `전략 계정 ${index + 1}차 통합 리뷰`,
        startAt: getDateTime(14 + index, 14),
        endAt: getDateTime(14 + index, 15),
        timeZone: "Asia/Seoul",
        location: "onehand.sales 내부 리뷰",
        memo: "대기업 계정별 중요 딜 5건을 묶어 리스크와 다음 행동을 정리한다.",
      },
    });

    await prisma.scheduleDeal.createMany({
      data: linkedDeals.map((deal) => ({
        userId,
        scheduleId: schedule.id,
        dealId: deal.id,
      })),
    });
  }

  for (const [companyIndex, company] of companies.entries()) {
    const companySeed = getRequired(companySeeds, companyIndex, "company seed");
    const linkedCompanies = getCircularItems(companies, companyIndex, 3);
    const contacts = contactsByCompany.get(company.id)!.slice(0, 4);
    const companyDeals = dealsByCompany.get(company.id)!.slice(0, 4);
    const linkedProducts = getCircularItems(products, companyIndex, 4);
    const sourceType =
      companyIndex % 3 === 0
        ? MeetingNoteSourceType.TEXT_AI
        : companyIndex % 3 === 1
          ? MeetingNoteSourceType.STT_AI
          : MeetingNoteSourceType.MANUAL;
    const note = await prisma.meetingNote.create({
      data: {
        userId,
        sourceType,
        meetingAt: getDateTime(companyIndex - 10, 9 + (companyIndex % 6)),
        timeZone: "Asia/Seoul",
        details: `${company.companyName} 미팅에서는 ${companySeed.field} 조직의 영업 진행 상황을 개인 담당자 기준으로 남기되, 임원 보고에서는 단계별 딜과 예상 매출을 합산해 보고하는 방향을 논의했다. 담당자 4명, 딜 4건, 상품 4개가 같은 회의록에 연결되어 후속 조치 누락을 줄이는 흐름을 검증했다.`,
        nextPlan: "다음 미팅 전까지 핵심 딜 4건의 다음 행동과 예상 마감일을 업데이트한다.",
        requiredAction: "보안 검토 자료, 모바일 입력 화면, 임원 보고 대시보드 예시를 전달한다.",
        rawText: null,
      },
    });

    for (const linkedCompany of linkedCompanies) {
      const field = await prisma.companyField.findUnique({
        where: { id: linkedCompany.companyFieldId },
      });
      const region = await prisma.companyRegion.findUnique({
        where: { id: linkedCompany.companyRegionId },
      });
      await prisma.meetingNoteCompany.create({
        data: {
          userId,
          meetingNoteId: note.id,
          companyId: linkedCompany.id,
          companyNameSnapshot: linkedCompany.companyName,
          companyFieldSnapshot: field?.field ?? null,
          companyRegionSnapshot: region?.region ?? null,
        },
      });
    }

    for (const contact of contacts) {
      const department = await prisma.contactDepartment.findUnique({
        where: { id: contact.contactDepartmentId },
      });
      const jobGrade = await prisma.contactJobGrade.findUnique({
        where: { id: contact.contactJobGradeId },
      });
      await prisma.meetingNoteContact.create({
        data: {
          userId,
          meetingNoteId: note.id,
          contactId: contact.id,
          companyId: company.id,
          contactUsernameSnapshot: contact.username,
          contactEmailSnapshot: contact.email,
          contactMobileSnapshot: contact.mobile,
          contactCompanyNameSnapshot: company.companyName,
          contactDepartmentSnapshot: department?.departmentName ?? null,
          contactJobGradeSnapshot: jobGrade?.jobGradeName ?? null,
        },
      });
    }

    for (const product of linkedProducts) {
      const category = await prisma.productCategory.findUnique({
        where: { id: product.productCategoryId },
      });
      const status = await prisma.productStatus.findUnique({
        where: { id: product.productStatusId },
      });
      await prisma.meetingNoteProduct.create({
        data: {
          userId,
          meetingNoteId: note.id,
          productId: product.id,
          productNameSnapshot: product.productName,
          productPriceSnapshot: product.productPrice,
          productCategorySnapshot: category?.categoryName ?? null,
          productStatusSnapshot: status?.statusName ?? null,
        },
      });
    }

    for (const deal of companyDeals) {
      await prisma.meetingNoteDeal.create({
        data: {
          userId,
          meetingNoteId: note.id,
          dealId: deal.id,
          dealNameSnapshot: deal.dealName,
          dealStatusSnapshot: deal.dealStatus,
          dealCostSnapshot: deal.dealCost,
          dealExpectedEndDateSnapshot: deal.expectedEndDate,
        },
      });
    }
  }
}

async function main() {
  await seedLocalMockAuth();
  await seedLocalDemoSalesData();
}

void main().finally(async () => {
  await prisma.$disconnect();
});
