import "reflect-metadata";
import assert = require("node:assert/strict");
import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ViewDefinitionModule } from "@/modules/view-definition/infrastructure/view-definition.module";
import { ViewConfigurationService } from "@/modules/view-definition/application/view-configuration-application.service";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaTransactionManager } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { TRANSACTION_MANAGER, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { VIEW_DATA_TOKEN_CODEC } from "@/modules/view-definition/application/ports/view-data-token-codec.port";
import { EncryptedViewDataTokenCodec } from "@/modules/view-definition/infrastructure/view-data-token-codec";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : 실제 HTTP 서버나 인증 연결 없이 공개 모듈을 검증합니다.
@Module({ providers: [{ provide: AuthGuard, useValue: { canActivate: () => false } }], exports: [AuthGuard] })
class VerificationAuthModule {}

// 기능 : 읽기 전용 또는 강제 rollback 방식으로 실제 DB의 공개 port 연결을 검증합니다.
async function main() {
  const readOnly = process.argv.includes("--read-only");
  const prisma = new PrismaService();
  const rollback = new Error("verification-rollback");
  const transactions = new PrismaTransactionManager(prisma);
  const forcedRollback: TransactionManager = { async runInTransaction(work, options) {
    let result: Awaited<ReturnType<typeof work>> | undefined;
    try { await transactions.runInTransaction(async context => { result = await work(context); throw rollback; }, options); }
    catch (error) { if (error !== rollback) throw error; }
    assert.notEqual(result, undefined);
    return result!;
  } };
  const module = await Test.createTestingModule({ imports: [ViewDefinitionModule] })
    .overrideModule(AuthModule).useModule(VerificationAuthModule)
    .overrideGuard(AuthGuard).useValue({ canActivate: () => false })
    .overrideProvider(PrismaService).useValue(prisma)
    .overrideProvider(TRANSACTION_MANAGER).useValue(forcedRollback)
    .overrideProvider(VIEW_DATA_TOKEN_CODEC).useValue(new EncryptedViewDataTokenCodec("rollback-verification"))
    .overrideProvider(APPLICATION_LOGGER).useValue({ log: () => undefined, warn: () => undefined, error: () => undefined }).compile();
  try {
    const service = module.get(ViewConfigurationService);
    const views = await prisma.viewDefinition.findMany({ where: { type: { in: ["TABLE", "KANBAN", "LIST"] } }, orderBy: { createdAt: "asc" }, take: 3, select: { id: true, workspaceId: true, objectDefinitionId: true, type: true } });
    assert(views.length > 0, "No supported views");
    for (const view of views) {
      const member = await prisma.workspaceMember.findFirstOrThrow({ where: { workspaceId: view.workspaceId }, select: { userId: true } });
      const user: CurrentUserContext = { id: member.userId, sessionId: randomUUID(), email: null, displayName: null, status: "ACTIVE", platformRole: "USER", timeZone: "Asia/Seoul" };
      const scope = { workspaceId: view.workspaceId, viewDefinitionId: view.id };
      const query = { sourceType: view.objectDefinitionId ? "OBJECT" as const : "LIST" as const };
      const before = await service.get(user, scope, query);
      if (readOnly) {
        // 1. 재검토에서는 쓰기 경로 없이 현재 설정의 실행과 공개 모듈 조립을 확인한다.
        const preview = await service.preview(user, scope, {
          baseConfigurationVersion: before.configurationVersion,
          changes: { sorts: { viewSortDefinitions: before.sorts.viewSortDefinitions } },
        }, query);
        assert.equal(preview.state, "READY");
        assert.equal((await service.get(user, scope, query)).configurationVersion, before.configurationVersion);
        console.log(JSON.stringify({ type: view.type, configuration: "passed", preview: "passed", readOnly: true }));
        continue;
      }
      const title = before.settings.viewAttributeSettingDefinitions.find(row => row.attributeDisplayRole === "TITLE")!;
      assert(title, "A title is required for this verification");
      const groupId = randomUUID();
      const status = before.candidates.find(row => ["Status", "Select"].includes(row.type) && !row.isMultiselect);
      assert(status, "A select/status attribute is required for this verification");
      const statusOption = [...before.settings.statusOptions, ...before.settings.selectOptions].find(row => row.attributeDefinitionId === status.id)!;
      assert(statusOption, "A select/status option is required for this verification");
      const group = randomUUID();
      const changes = {
        filters: { viewFilterGroupDefinitions: [{ id: groupId, parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: 0 }],
          viewFilterConditionDefinitions: [{ id: randomUUID(), viewFilterGroupDefinitionId: groupId, sourceScope: title.sourceScope, attributeDefinitionId: title.attributeDefinitionId, referenceAttributeIdPathJson: title.referenceAttributeIdPathJson, comparisonOperator: "is_not_empty", comparisonValueJson: null, multiValueMatchMode: "ANY", sortOrder: 0 }] },
        sorts: { viewSortDefinitions: [{ id: randomUUID(), sourceScope: title.sourceScope, attributeDefinitionId: title.attributeDefinitionId, referenceAttributeIdPathJson: title.referenceAttributeIdPathJson, sortDirection: "DESC", sortOrder: 0, configJson: null }] },
        settings: { configJson: view.type === "KANBAN" ? { cardDensity: "COMPACT" } : { rowDensity: "COMPACT" },
          viewAttributeSettingDefinitions: before.settings.viewAttributeSettingDefinitions.map(row => row.id === title.id ? { ...row, labelOverride: "검증용 표시명" } : row),
          viewGroupDefinitions: [{ id: group, sourceScope: status.listDefinitionId ? "LIST_ENTRY" : "RECORD", attributeDefinitionId: status.id, referenceAttributeIdPathJson: [], groupRole: "GROUP", sortDirection: "ASC", sortOrder: 0, configJson: null }],
          viewGroupSettingDefinitions: [{ id: randomUUID(), viewGroupDefinitionId: group, attributeDefinitionId: status.id, statusOptionId: status.type === "Status" ? statusOption.id : null, selectOptionId: status.type === "Select" ? statusOption.id : null, groupKeyJson: null, sortOrder: 0, labelOverride: null, isHidden: false, isFold: false, configJson: null }] },
      };
      const command = { baseConfigurationVersion: before.configurationVersion, changes };
      const preview = await service.preview(user, scope, command, query);
      assert.equal(preview.state, "READY");
      assert.equal((await service.get(user, scope, query)).configurationVersion, before.configurationVersion);
      const saved = await service.update(user, scope, command, query, "rollback-verification");
      assert.notEqual(saved.configurationVersion, before.configurationVersion);
      assert.equal(saved.settings.viewAttributeSettingDefinitions.find(row => row.id === title.id)?.labelOverride, "검증용 표시명");
      assert.equal(saved.filters.viewFilterConditionDefinitions.length, 1);
      assert.equal(saved.sorts.viewSortDefinitions.length, 1);
      assert.equal(saved.settings.viewGroupSettingDefinitions.length, 1);
      assert.equal((await service.get(user, scope, query)).configurationVersion, before.configurationVersion);
      console.log(JSON.stringify({ type: view.type, preview: "passed", sevenTableWrite: "passed", rollback: "passed" }));
    }
  } finally { await module.close(); await prisma.$disconnect(); }
}
void main().catch(error => { console.error(JSON.stringify({ verification: "failed", code: typeof error?.code === "string" ? error.code : error?.name, message: error instanceof assert.AssertionError || error?.name === "Error" ? String(error.message).replace(/\b(?:postgres(?:ql)?|https?):\/\/\S+/g, "[redacted]") : undefined })); process.exitCode = 1; });
