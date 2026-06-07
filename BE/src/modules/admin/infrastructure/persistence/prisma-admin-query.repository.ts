import { PersonalMemoTargetType, type Prisma } from "@prisma/client";
import {
  maskEmail,
  maskMoney,
  maskPhone,
  summarizeReason,
} from "@/modules/admin/application/admin-masking";
import type {
  AdminAuditLogSummary,
  AdminCompanyListItem,
  AdminContactListItem,
  AdminDealListInput,
  AdminDealListItem,
  AdminListInput,
  AdminPaginatedResult,
  AdminProductListItem,
  AdminQueryRepository,
  AdminUserListInput,
  AdminUserResponse,
} from "@/modules/admin/application/ports/admin-query.repository";
import { UserNotFoundError } from "@/modules/admin/domain/admin.errors";
import { CompanyNotFoundError } from "@/modules/company/domain/company.errors";
import { ContactNotFoundError } from "@/modules/contact/domain/contact.errors";
import { DealNotFoundError } from "@/modules/deal/domain/deal.errors";
import { ProductNotFoundError } from "@/modules/product/domain/product.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type UserSummaryRow = {
  readonly id: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly status: string;
};

type MemoTarget = {
  readonly userId: string;
  readonly targetType: PersonalMemoTargetType;
  readonly targetId: string;
};

export class PrismaAdminQueryRepository implements AdminQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboard() {
    const [
      userCount,
      activeUserCount,
      companyCount,
      contactCount,
      productCount,
      dealCount,
      recentAuditLogs,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.count({ where: { status: "ACTIVE" } }),
      this.prismaService.company.count({ where: { deletedAt: null } }),
      this.prismaService.contact.count({ where: { deletedAt: null } }),
      this.prismaService.product.count({ where: { deletedAt: null } }),
      this.prismaService.deal.count({ where: { deletedAt: null } }),
      this.listRecentAuditLogs({ take: 5 }),
    ]);

    return {
      userCount,
      activeUserCount,
      companyCount,
      contactCount,
      productCount,
      dealCount,
      recentAuditLogs,
    };
  }

  async listUsers(
    input: AdminUserListInput
  ): Promise<AdminPaginatedResult<AdminUserResponse>> {
    const where: Prisma.UserWhereInput = {
      ...(input.search
        ? {
            OR: [
              { displayName: contains(input.search) },
              { email: contains(input.search) },
            ],
          }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.role ? { role: input.role } : {}),
    };
    const [rows, totalCount] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.user.count({ where }),
    ]);

    return paginate(rows.map(toAdminUserResponse), input, totalCount);
  }

  async getUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { setting: true },
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const [companyCount, contactCount, productCount, dealCount, recentAuditLogs] =
      await Promise.all([
        this.prismaService.company.count({ where: { userId } }),
        this.prismaService.contact.count({ where: { userId } }),
        this.prismaService.product.count({ where: { userId } }),
        this.prismaService.deal.count({ where: { userId } }),
        this.listRecentAuditLogs({ targetUserId: userId, take: 10 }),
      ]);

    return {
      user: toAdminUserResponse(user),
      settings: user.setting
        ? {
            defaultScheduleReminderMinutes:
              user.setting.defaultScheduleReminderMinutes,
            defaultNextActionReminderMinutes:
              user.setting.defaultNextActionReminderMinutes,
            emailNotificationEnabled: user.setting.emailNotificationEnabled,
            browserPushEnabled: user.setting.browserPushEnabled,
            sensitiveSaveWarningEnabled: user.setting.sensitiveSaveWarningEnabled,
          }
        : null,
      usageSummary: {
        companyCount,
        contactCount,
        productCount,
        dealCount,
      },
      recentAuditLogs,
    };
  }

  async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new UserNotFoundError();
    }
  }

  async listCompanies(
    input: AdminListInput
  ): Promise<AdminPaginatedResult<AdminCompanyListItem>> {
    const where = createCompanyWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.prismaService.company.findMany({
        where,
        select: companyListSelect,
        orderBy: { updatedAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.company.count({ where }),
    ]);

    return paginate(rows.map(toAdminCompanyListItem), input, totalCount);
  }

  async getCompany(companyId: string) {
    const company = await this.prismaService.company.findUnique({
      where: { id: companyId },
      select: {
        ...companyListSelect,
        location: true,
        description: true,
      },
    });

    if (!company) {
      throw new CompanyNotFoundError();
    }

    const [contactCount, dealCount, productConnectionCount, memoSummary, logs] =
      await Promise.all([
        this.prismaService.contact.count({
          where: { companyId, deletedAt: null },
        }),
        this.prismaService.deal.count({ where: { companyId, deletedAt: null } }),
        this.prismaService.productConnection.count({
          where: {
            targetType: "COMPANY",
            targetId: companyId,
            deletedAt: null,
          },
        }),
        this.getMemoSummary({
          userId: company.userId,
          targetType: PersonalMemoTargetType.COMPANY,
          targetId: companyId,
        }),
        this.prismaService.companyLog.findMany({
          where: { companyId },
          select: logSelect,
          orderBy: { logDate: "desc" },
          take: 5,
        }),
      ]);

    return {
      company: {
        ...toAdminCompanyListItem(company),
        location: company.location,
        description: company.description,
      },
      owner: toOwnerResponse(company.user),
      usageSummary: {
        contactCount,
        dealCount,
        productConnectionCount,
      },
      memoSummary,
      recentLogs: logs.map(toLogSummary),
    };
  }

  async listContacts(input: {
    readonly page: number;
    readonly pageSize: number;
    readonly search: string | null;
    readonly userId?: string;
    readonly companyId?: string;
    readonly includeDeleted: boolean;
  }): Promise<AdminPaginatedResult<AdminContactListItem>> {
    const where = createContactWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.prismaService.contact.findMany({
        where,
        select: contactListSelect,
        orderBy: { updatedAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.contact.count({ where }),
    ]);
    const items = await Promise.all(
      rows.map((row) => this.toAdminContactListItem(row))
    );

    return paginate(items, input, totalCount);
  }

  async getContact(contactId: string) {
    const contact = await this.prismaService.contact.findUnique({
      where: { id: contactId },
      select: {
        ...contactListSelect,
        location: true,
      },
    });

    if (!contact) {
      throw new ContactNotFoundError();
    }

    const [listItem, dealCount, memoSummary, logs] = await Promise.all([
      this.toAdminContactListItem(contact),
      this.prismaService.deal.count({
        where: { contactId, deletedAt: null },
      }),
      this.getMemoSummary({
        userId: contact.userId,
        targetType: PersonalMemoTargetType.CONTACT,
        targetId: contactId,
      }),
      this.prismaService.contactLog.findMany({
        where: { contactId },
        select: logSelect,
        orderBy: { logDate: "desc" },
        take: 5,
      }),
    ]);

    return {
      contact: { ...listItem, location: contact.location },
      owner: toOwnerResponse(contact.user),
      company: contact.company
        ? { id: contact.company.id, name: contact.company.name }
        : null,
      usageSummary: { dealCount },
      memoSummary,
      recentLogs: logs.map(toLogSummary),
    };
  }

  async listProducts(
    input: AdminListInput
  ): Promise<AdminPaginatedResult<AdminProductListItem>> {
    const where = createProductWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        select: productListSelect,
        orderBy: { updatedAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.product.count({ where }),
    ]);

    return paginate(rows.map(toAdminProductListItem), input, totalCount);
  }

  async getProduct(productId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      select: {
        ...productListSelect,
        description: true,
      },
    });

    if (!product) {
      throw new ProductNotFoundError();
    }

    const [connections, memoSummary, logs] = await Promise.all([
      this.prismaService.productConnection.groupBy({
        by: ["targetType"],
        where: { productId, deletedAt: null },
        _count: { _all: true },
      }),
      this.getMemoSummary({
        userId: product.userId,
        targetType: PersonalMemoTargetType.PRODUCT,
        targetId: productId,
      }),
      this.prismaService.productLog.findMany({
        where: { productId },
        select: logSelect,
        orderBy: { logDate: "desc" },
        take: 5,
      }),
    ]);

    const connectionSummary = summarizeProductConnections(connections);

    return {
      product: {
        ...toAdminProductListItem(product),
        description: product.description,
      },
      owner: toOwnerResponse(product.user),
      connectionSummary,
      memoSummary,
      recentLogs: logs.map(toLogSummary),
    };
  }

  async listDeals(
    input: AdminDealListInput
  ): Promise<AdminPaginatedResult<AdminDealListItem>> {
    const where = createDealWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.prismaService.deal.findMany({
        where,
        select: dealListSelect,
        orderBy: { updatedAt: "desc" },
        skip: skip(input),
        take: input.pageSize,
      }),
      this.prismaService.deal.count({ where }),
    ]);

    return paginate(rows.map(toAdminDealListItem), input, totalCount);
  }

  async getDeal(dealId: string) {
    const deal = await this.prismaService.deal.findUnique({
      where: { id: dealId },
      select: {
        ...dealListSelect,
        likelihoodPercent: true,
        nextActionTitle: true,
        nextActionDueAt: true,
        nextActionStatus: true,
        expectedCloseDate: true,
      },
    });

    if (!deal) {
      throw new DealNotFoundError();
    }

    const [
      productConnectionCount,
      activityCount,
      recentActivities,
      memoSummary,
      scheduleCount,
      meetingNoteCount,
    ] = await Promise.all([
      this.prismaService.productConnection.count({
        where: { targetType: "DEAL", targetId: dealId, deletedAt: null },
      }),
      this.prismaService.dealActivity.count({
        where: { dealId, deletedAt: null },
      }),
      this.prismaService.dealActivity.findMany({
        where: { dealId },
        select: {
          id: true,
          title: true,
          activityDate: true,
          deletedAt: true,
        },
        orderBy: { activityDate: "desc" },
        take: 5,
      }),
      this.getMemoSummary({
        userId: deal.userId,
        targetType: PersonalMemoTargetType.DEAL,
        targetId: dealId,
      }),
      this.prismaService.schedule.count({
        where: { dealId, deletedAt: null },
      }),
      this.prismaService.meetingNote.count({
        where: { dealId, deletedAt: null },
      }),
    ]);

    return {
      deal: {
        ...toAdminDealListItem(deal),
        likelihoodPercent: deal.likelihoodPercent,
        nextActionTitle: deal.nextActionTitle,
        nextActionDueAt: toIso(deal.nextActionDueAt),
        nextActionStatus: deal.nextActionStatus,
        expectedCloseDate: toIso(deal.expectedCloseDate),
      },
      owner: toOwnerResponse(deal.user),
      company: deal.company ? { id: deal.company.id, name: deal.company.name } : null,
      contact: deal.contact ? { id: deal.contact.id, name: deal.contact.name } : null,
      productSummary: { connectionCount: productConnectionCount },
      activitySummary: {
        totalCount: activityCount,
        recentActivities: recentActivities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          activityDate: activity.activityDate.toISOString(),
          deletedAt: toIso(activity.deletedAt),
        })),
      },
      memoSummary,
      schedulesSummary: { totalCount: scheduleCount },
      meetingNotesSummary: { totalCount: meetingNoteCount },
    };
  }

  private async getMemoSummary(input: MemoTarget) {
    const [memoCount, latestMemo] = await Promise.all([
      this.prismaService.personalMemo.count({
        where: {
          userId: input.userId,
          targetType: input.targetType,
          targetId: input.targetId,
          deletedAt: null,
        },
      }),
      this.prismaService.personalMemo.findFirst({
        where: {
          userId: input.userId,
          targetType: input.targetType,
          targetId: input.targetId,
          deletedAt: null,
        },
        select: { memoDate: true },
        orderBy: { memoDate: "desc" },
      }),
    ]);

    return {
      hasMemo: memoCount > 0,
      memoCount,
      latestMemoAt: latestMemo ? latestMemo.memoDate.toISOString() : null,
    };
  }

  private async toAdminContactListItem(
    row: ContactListRow
  ): Promise<AdminContactListItem> {
    const memoSummary = await this.getMemoSummary({
      userId: row.userId,
      targetType: PersonalMemoTargetType.CONTACT,
      targetId: row.id,
    });

    return {
      id: row.id,
      userId: row.userId,
      userName: toUserName(row.user),
      companyId: row.companyId,
      companyName: row.company?.name ?? null,
      name: row.name,
      department: row.department,
      position: row.position,
      phoneMasked: maskPhone(row.phone),
      emailMasked: maskEmail(row.email),
      hasMemo: memoSummary.hasMemo,
      memoCount: memoSummary.memoCount,
      latestMemoAt: memoSummary.latestMemoAt,
      deletedAt: toIso(row.deletedAt),
      permanentDeleteAt: toIso(row.permanentDeleteAt),
    };
  }

  private async listRecentAuditLogs(input: {
    readonly targetUserId?: string;
    readonly take: number;
  }): Promise<AdminAuditLogSummary[]> {
    const rows = await this.prismaService.auditLog.findMany({
      where: input.targetUserId ? { targetUserId: input.targetUserId } : {},
      select: {
        id: true,
        actorUserId: true,
        targetUserId: true,
        action: true,
        targetType: true,
        targetId: true,
        reason: true,
        createdAt: true,
        actorUser: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: input.take,
    });

    return rows.map((row) => ({
      id: row.id,
      actorUserId: row.actorUserId,
      actorUserName: row.actorUser
        ? row.actorUser.displayName ?? maskEmail(row.actorUser.email)
        : null,
      targetUserId: row.targetUserId,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      reasonSummary: summarizeReason(row.reason),
      createdAt: row.createdAt.toISOString(),
    }));
  }
}

const userSummarySelect = {
  id: true,
  displayName: true,
  email: true,
  status: true,
} satisfies Prisma.UserSelect;

const companyListSelect = {
  id: true,
  userId: true,
  name: true,
  industry: true,
  deletedAt: true,
  permanentDeleteAt: true,
  user: { select: userSummarySelect },
} satisfies Prisma.CompanySelect;

const contactListSelect = {
  id: true,
  userId: true,
  companyId: true,
  name: true,
  department: true,
  position: true,
  location: true,
  phone: true,
  email: true,
  deletedAt: true,
  permanentDeleteAt: true,
  user: { select: userSummarySelect },
  company: { select: { id: true, name: true } },
} satisfies Prisma.ContactSelect;

const productListSelect = {
  id: true,
  userId: true,
  name: true,
  category: true,
  unitPrice: true,
  deletedAt: true,
  permanentDeleteAt: true,
  user: { select: userSummarySelect },
} satisfies Prisma.ProductSelect;

const dealListSelect = {
  id: true,
  userId: true,
  companyId: true,
  contactId: true,
  title: true,
  amount: true,
  currency: true,
  stage: true,
  likelihoodStatus: true,
  deletedAt: true,
  permanentDeleteAt: true,
  user: { select: userSummarySelect },
  company: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true } },
} satisfies Prisma.DealSelect;

const logSelect = {
  id: true,
  title: true,
  logDate: true,
  deletedAt: true,
};

type CompanyListRow = Prisma.CompanyGetPayload<{
  select: typeof companyListSelect;
}>;

type ContactListRow = Prisma.ContactGetPayload<{
  select: typeof contactListSelect;
}>;

type ProductListRow = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

type DealListRow = Prisma.DealGetPayload<{
  select: typeof dealListSelect;
}>;

type LogSummaryRow = {
  readonly id: string;
  readonly title: string;
  readonly logDate: Date;
  readonly deletedAt: Date | null;
};

function createCompanyWhere(input: AdminListInput): Prisma.CompanyWhereInput {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.includeDeleted ? {} : { deletedAt: null }),
    ...(input.search
      ? {
          OR: [
            { name: contains(input.search) },
            { industry: contains(input.search) },
            { location: contains(input.search) },
          ],
        }
      : {}),
  };
}

function createContactWhere(input: {
  readonly search: string | null;
  readonly userId?: string;
  readonly companyId?: string;
  readonly includeDeleted: boolean;
}): Prisma.ContactWhereInput {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.companyId ? { companyId: input.companyId } : {}),
    ...(input.includeDeleted ? {} : { deletedAt: null }),
    ...(input.search
      ? {
          OR: [
            { name: contains(input.search) },
            { department: contains(input.search) },
            { position: contains(input.search) },
            { phone: contains(input.search) },
            { email: contains(input.search) },
            { company: { is: { name: contains(input.search) } } },
          ],
        }
      : {}),
  };
}

function createProductWhere(input: AdminListInput): Prisma.ProductWhereInput {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.includeDeleted ? {} : { deletedAt: null }),
    ...(input.search
      ? {
          OR: [
            { name: contains(input.search) },
            { category: contains(input.search) },
            { description: contains(input.search) },
          ],
        }
      : {}),
  };
}

function createDealWhere(input: AdminDealListInput): Prisma.DealWhereInput {
  return {
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.stage ? { stage: input.stage } : {}),
    ...(input.includeDeleted ? {} : { deletedAt: null }),
    ...(input.search
      ? {
          OR: [
            { title: contains(input.search) },
            { company: { is: { name: contains(input.search) } } },
            { contact: { is: { name: contains(input.search) } } },
          ],
        }
      : {}),
  };
}

function toAdminUserResponse(row: {
  readonly id: string;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly role: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly lastLoginAt: Date | null;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
}): AdminUserResponse {
  return {
    id: row.id,
    name: row.displayName,
    emailMasked: maskEmail(row.email),
    role: row.role,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: toIso(row.lastLoginAt),
    deletedAt: toIso(row.deletedAt),
    permanentDeleteAt: toIso(row.permanentDeleteAt),
  };
}

function toAdminCompanyListItem(row: CompanyListRow): AdminCompanyListItem {
  return {
    id: row.id,
    userId: row.userId,
    userName: toUserName(row.user),
    name: row.name,
    industry: row.industry,
    deletedAt: toIso(row.deletedAt),
    permanentDeleteAt: toIso(row.permanentDeleteAt),
  };
}

function toAdminProductListItem(row: ProductListRow): AdminProductListItem {
  return {
    id: row.id,
    userId: row.userId,
    userName: toUserName(row.user),
    name: row.name,
    category: row.category,
    unitPriceMasked: maskMoney(row.unitPrice),
    currency: null,
    deletedAt: toIso(row.deletedAt),
    permanentDeleteAt: toIso(row.permanentDeleteAt),
  };
}

function toAdminDealListItem(row: DealListRow): AdminDealListItem {
  return {
    id: row.id,
    userId: row.userId,
    userName: toUserName(row.user),
    title: row.title,
    companyId: row.companyId,
    companyName: row.company?.name ?? null,
    contactId: row.contactId,
    contactName: row.contact?.name ?? null,
    amountMasked: maskMoney(row.amount),
    currency: row.currency,
    stage: row.stage,
    likelihoodStatus: row.likelihoodStatus,
    deletedAt: toIso(row.deletedAt),
    permanentDeleteAt: toIso(row.permanentDeleteAt),
  };
}

function toOwnerResponse(row: UserSummaryRow) {
  return {
    id: row.id,
    name: row.displayName,
    emailMasked: maskEmail(row.email),
    status: row.status,
  };
}

function toUserName(row: UserSummaryRow) {
  return row.displayName ?? maskEmail(row.email);
}

function toLogSummary(row: LogSummaryRow) {
  return {
    id: row.id,
    title: row.title,
    logDate: row.logDate.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function summarizeProductConnections(
  rows: ReadonlyArray<{
    readonly targetType: "COMPANY" | "CONTACT" | "DEAL";
    readonly _count: { readonly _all: number };
  }>
) {
  const counts = {
    totalCount: 0,
    companyCount: 0,
    contactCount: 0,
    dealCount: 0,
  };

  for (const row of rows) {
    counts.totalCount += row._count._all;

    if (row.targetType === "COMPANY") {
      counts.companyCount += row._count._all;
    }

    if (row.targetType === "CONTACT") {
      counts.contactCount += row._count._all;
    }

    if (row.targetType === "DEAL") {
      counts.dealCount += row._count._all;
    }
  }

  return counts;
}

function paginate<TItem>(
  items: readonly TItem[],
  input: { readonly page: number; readonly pageSize: number },
  totalCount: number
): AdminPaginatedResult<TItem> {
  return {
    items,
    page: input.page,
    pageSize: input.pageSize,
    totalCount,
    hasNext: input.page * input.pageSize < totalCount,
  };
}

function skip(input: { readonly page: number; readonly pageSize: number }) {
  return (input.page - 1) * input.pageSize;
}

function contains(value: string) {
  return { contains: value, mode: "insensitive" as const };
}

function toIso(value: Date | null) {
  return value ? value.toISOString() : null;
}
