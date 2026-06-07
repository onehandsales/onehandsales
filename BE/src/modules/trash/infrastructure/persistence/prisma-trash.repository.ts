import {
  type ListTrashInput,
  type PurgeExpiredTrashResult,
  type TrashItemRecord,
  type TrashRepository,
  type TrashRestoreRecord,
  type TrashTargetType,
} from "@/modules/trash/application/ports/trash.repository";
import {
  TrashItemExpiredError,
  TrashItemNotFoundError,
} from "@/modules/trash/domain/trash.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const PRIMARY_TARGET_TYPES: readonly TrashTargetType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
];

type SoftDeletedRow = {
  readonly id: string;
  readonly deletedAt: Date | null;
  readonly permanentDeleteAt: Date | null;
};

export class PrismaTrashRepository implements TrashRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listTrash(input: ListTrashInput) {
    const targetTypes = input.targetType
      ? [input.targetType]
      : PRIMARY_TARGET_TYPES;
    const itemGroups = await Promise.all(
      targetTypes.map((targetType) =>
        this.listTrashItemsByType(input.userId, targetType)
      )
    );
    const allItems = itemGroups
      .flat()
      .sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
    const start = (input.page - 1) * input.pageSize;
    const items = allItems.slice(start, start + input.pageSize);

    return {
      items,
      page: input.page,
      pageSize: input.pageSize,
      totalCount: allItems.length,
      hasNext: start + input.pageSize < allItems.length,
    };
  }

  async restoreTrashItem(input: {
    readonly userId: string;
    readonly targetType: TrashTargetType;
    readonly targetId: string;
    readonly now: Date;
  }): Promise<TrashRestoreRecord> {
    switch (input.targetType) {
      case "COMPANY":
        return this.restoreCompany(input);
      case "CONTACT":
        return this.restoreContact(input);
      case "PRODUCT":
        return this.restoreProduct(input);
      case "DEAL":
        return this.restoreDeal(input);
      case "SCHEDULE":
        return this.restoreSchedule(input);
      case "MEETING_NOTE":
        return this.restoreMeetingNote(input);
      case "COMPANY_LOG":
        return this.restoreCompanyLog(input);
      case "CONTACT_LOG":
        return this.restoreContactLog(input);
      case "PRODUCT_LOG":
        return this.restoreProductLog(input);
      case "PRODUCT_CONNECTION":
        return this.restoreProductConnection(input);
      case "DEAL_ACTIVITY":
        return this.restoreDealActivity(input);
      case "PERSONAL_MEMO":
        return this.restorePersonalMemo(input);
    }
  }

  async purgeExpiredTrash(input: {
    readonly now: Date;
    readonly limit: number;
  }): Promise<PurgeExpiredTrashResult> {
    const deletedCountByTargetType: Partial<Record<TrashTargetType, number>> = {};

    deletedCountByTargetType.PERSONAL_MEMO = await this.purgePersonalMemos(input);
    deletedCountByTargetType.COMPANY_LOG = await this.purgeCompanyLogs(input);
    deletedCountByTargetType.CONTACT_LOG = await this.purgeContactLogs(input);
    deletedCountByTargetType.PRODUCT_LOG = await this.purgeProductLogs(input);
    deletedCountByTargetType.PRODUCT_CONNECTION =
      await this.purgeProductConnections(input);
    deletedCountByTargetType.DEAL_ACTIVITY = await this.purgeDealActivities(input);
    deletedCountByTargetType.MEETING_NOTE = await this.purgeMeetingNotes(input);
    deletedCountByTargetType.SCHEDULE = await this.purgeSchedules(input);
    deletedCountByTargetType.DEAL = await this.purgeDeals(input);
    deletedCountByTargetType.CONTACT = await this.purgeContacts(input);
    deletedCountByTargetType.PRODUCT = await this.purgeProducts(input);
    deletedCountByTargetType.COMPANY = await this.purgeCompanies(input);

    return { deletedCountByTargetType };
  }

  private async listTrashItemsByType(
    userId: string,
    targetType: TrashTargetType
  ): Promise<TrashItemRecord[]> {
    switch (targetType) {
      case "COMPANY":
        return this.listCompanies(userId);
      case "CONTACT":
        return this.listContacts(userId);
      case "PRODUCT":
        return this.listProducts(userId);
      case "DEAL":
        return this.listDeals(userId);
      case "SCHEDULE":
        return this.listSchedules(userId);
      case "MEETING_NOTE":
        return this.listMeetingNotes(userId);
      case "COMPANY_LOG":
        return this.listCompanyLogs(userId);
      case "CONTACT_LOG":
        return this.listContactLogs(userId);
      case "PRODUCT_LOG":
        return this.listProductLogs(userId);
      case "PRODUCT_CONNECTION":
        return this.listProductConnections(userId);
      case "DEAL_ACTIVITY":
        return this.listDealActivities(userId);
      case "PERSONAL_MEMO":
        return this.listPersonalMemos(userId);
    }
  }

  private async listCompanies(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.company.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        name: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("COMPANY", row.id, row.name, row)
    );
  }

  private async listContacts(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.contact.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        name: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("CONTACT", row.id, row.name, row)
    );
  }

  private async listProducts(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.product.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        name: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("PRODUCT", row.id, row.name, row)
    );
  }

  private async listDeals(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.deal.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) => createTrashItem("DEAL", row.id, row.title, row));
  }

  private async listSchedules(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.schedule.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("SCHEDULE", row.id, row.title, row)
    );
  }

  private async listMeetingNotes(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.meetingNote.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        meetingDate: true,
        companyName: true,
        contactName: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem(
        "MEETING_NOTE",
        row.id,
        createMeetingNoteTitle(row),
        row
      )
    );
  }

  private async listCompanyLogs(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.companyLog.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("COMPANY_LOG", row.id, row.title, row)
    );
  }

  private async listContactLogs(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.contactLog.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("CONTACT_LOG", row.id, row.title, row)
    );
  }

  private async listProductLogs(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.productLog.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("PRODUCT_LOG", row.id, row.title, row)
    );
  }

  private async listProductConnections(
    userId: string
  ): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.productConnection.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        targetType: true,
        deletedAt: true,
        permanentDeleteAt: true,
        product: { select: { name: true } },
      },
    });

    return rows.map((row) =>
      createTrashItem(
        "PRODUCT_CONNECTION",
        row.id,
        `제품 연결: ${row.product.name} / ${row.targetType}`,
        row
      )
    );
  }

  private async listDealActivities(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.dealActivity.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem("DEAL_ACTIVITY", row.id, row.title, row)
    );
  }

  private async listPersonalMemos(userId: string): Promise<TrashItemRecord[]> {
    const rows = await this.prismaService.personalMemo.findMany({
      where: { userId, deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        targetType: true,
        deletedAt: true,
        permanentDeleteAt: true,
      },
    });

    return rows.map((row) =>
      createTrashItem(
        "PERSONAL_MEMO",
        row.id,
        row.title ?? `Memo: ${row.targetType}`,
        row
      )
    );
  }

  private async restoreCompany(input: RestoreInput) {
    const row = await this.prismaService.company.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.company.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("COMPANY", restored.id, input.now, {
      id: restored.id,
      title: restored.name,
    });
  }

  private async restoreContact(input: RestoreInput) {
    const row = await this.prismaService.contact.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.contact.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("CONTACT", restored.id, input.now, {
      id: restored.id,
      title: restored.name,
    });
  }

  private async restoreProduct(input: RestoreInput) {
    const row = await this.prismaService.product.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.product.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("PRODUCT", restored.id, input.now, {
      id: restored.id,
      title: restored.name,
    });
  }

  private async restoreDeal(input: RestoreInput) {
    const row = await this.prismaService.deal.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.deal.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("DEAL", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restoreSchedule(input: RestoreInput) {
    const row = await this.prismaService.schedule.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.schedule.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("SCHEDULE", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restoreMeetingNote(input: RestoreInput) {
    const row = await this.prismaService.meetingNote.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.meetingNote.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("MEETING_NOTE", restored.id, input.now, {
      id: restored.id,
      title: createMeetingNoteTitle(restored),
    });
  }

  private async restoreCompanyLog(input: RestoreInput) {
    const row = await this.prismaService.companyLog.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.companyLog.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("COMPANY_LOG", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restoreContactLog(input: RestoreInput) {
    const row = await this.prismaService.contactLog.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.contactLog.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("CONTACT_LOG", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restoreProductLog(input: RestoreInput) {
    const row = await this.prismaService.productLog.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.productLog.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("PRODUCT_LOG", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restoreProductConnection(input: RestoreInput) {
    const row = await this.prismaService.productConnection.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
      select: {
        id: true,
        targetType: true,
        deletedAt: true,
        permanentDeleteAt: true,
        product: { select: { name: true } },
      },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.productConnection.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
      select: {
        id: true,
        targetType: true,
        product: { select: { name: true } },
      },
    });

    return createRestoreRecord("PRODUCT_CONNECTION", restored.id, input.now, {
      id: restored.id,
      title: `제품 연결: ${restored.product.name} / ${restored.targetType}`,
    });
  }

  private async restoreDealActivity(input: RestoreInput) {
    const row = await this.prismaService.dealActivity.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.dealActivity.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("DEAL_ACTIVITY", restored.id, input.now, {
      id: restored.id,
      title: restored.title,
    });
  }

  private async restorePersonalMemo(input: RestoreInput) {
    const row = await this.prismaService.personalMemo.findFirst({
      where: { id: input.targetId, userId: input.userId, deletedAt: { not: null } },
    });
    assertRestorable(row, input.now);
    const restored = await this.prismaService.personalMemo.update({
      where: { id: row.id },
      data: { deletedAt: null, permanentDeleteAt: null },
    });

    return createRestoreRecord("PERSONAL_MEMO", restored.id, input.now, {
      id: restored.id,
      title: restored.title ?? `Memo: ${restored.targetType}`,
    });
  }

  private async purgePersonalMemos(input: PurgeInput) {
    const ids = await this.findExpiredIds(
      this.prismaService.personalMemo,
      input
    );
    const result = await this.prismaService.personalMemo.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeCompanyLogs(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.companyLog, input);
    const result = await this.prismaService.companyLog.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeContactLogs(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.contactLog, input);
    const result = await this.prismaService.contactLog.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeProductLogs(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.productLog, input);
    const result = await this.prismaService.productLog.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeProductConnections(input: PurgeInput) {
    const ids = await this.findExpiredIds(
      this.prismaService.productConnection,
      input
    );
    const result = await this.prismaService.productConnection.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeDealActivities(input: PurgeInput) {
    const ids = await this.findExpiredIds(
      this.prismaService.dealActivity,
      input
    );
    const result = await this.prismaService.dealActivity.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeMeetingNotes(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.meetingNote, input);
    const result = await this.prismaService.meetingNote.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeSchedules(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.schedule, input);
    const result = await this.prismaService.schedule.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeDeals(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.deal, input);
    const result = await this.prismaService.deal.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeContacts(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.contact, input);
    const result = await this.prismaService.contact.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeProducts(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.product, input);
    const result = await this.prismaService.product.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async purgeCompanies(input: PurgeInput) {
    const ids = await this.findExpiredIds(this.prismaService.company, input);
    const result = await this.prismaService.company.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  private async findExpiredIds(
    delegate: ExpirableDelegate,
    input: PurgeInput
  ): Promise<string[]> {
    const fallbackCutoff = addDays(input.now, -30);
    const rows = await delegate.findMany({
      where: {
        OR: [
          { permanentDeleteAt: { lte: input.now } },
          {
            permanentDeleteAt: null,
            deletedAt: { lte: fallbackCutoff },
          },
        ],
      },
      select: { id: true },
      take: input.limit,
    });

    return rows.map((row) => row.id);
  }
}

type RestoreInput = {
  readonly userId: string;
  readonly targetId: string;
  readonly now: Date;
};

type PurgeInput = {
  readonly now: Date;
  readonly limit: number;
};

type ExpirableDelegate = {
  readonly findMany: (args: {
    where: {
      OR: Array<
        | { permanentDeleteAt: { lte: Date } }
        | {
            permanentDeleteAt: null;
            deletedAt: { lte: Date };
          }
      >;
    };
    select: { id: true };
    take: number;
  }) => Promise<Array<{ readonly id: string }>>;
};

function createTrashItem(
  targetType: TrashTargetType,
  targetId: string,
  title: string,
  row: SoftDeletedRow
): TrashItemRecord {
  const deletedAt = requireDeletedAt(row.deletedAt);

  return {
    targetType,
    targetId,
    title,
    deletedAt,
    permanentDeleteAt: row.permanentDeleteAt ?? addDays(deletedAt, 30),
  };
}

function createRestoreRecord(
  targetType: TrashTargetType,
  targetId: string,
  restoredAt: Date,
  resource: unknown
): TrashRestoreRecord {
  return { targetType, targetId, restoredAt, resource };
}

function assertRestorable<T extends SoftDeletedRow>(
  row: T | null,
  now: Date
): asserts row is T {
  if (!row || !row.deletedAt) {
    throw new TrashItemNotFoundError();
  }

  const permanentDeleteAt = row.permanentDeleteAt ?? addDays(row.deletedAt, 30);

  if (permanentDeleteAt.getTime() <= now.getTime()) {
    throw new TrashItemExpiredError();
  }
}

function requireDeletedAt(value: Date | null): Date {
  if (!value) {
    throw new TrashItemNotFoundError();
  }

  return value;
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function createMeetingNoteTitle(input: {
  readonly meetingDate?: Date | null;
  readonly companyName?: string | null;
  readonly contactName?: string | null;
}) {
  const owner = input.companyName ?? input.contactName ?? "회의록";

  if (!input.meetingDate) {
    return owner;
  }

  return `${owner} / ${input.meetingDate.toISOString().slice(0, 10)}`;
}
