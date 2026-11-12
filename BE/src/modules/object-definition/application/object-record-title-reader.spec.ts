import { Test } from "@nestjs/testing";
import type { AttributeDefinitionMetadata } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ObjectRecordTitleModule } from "../infrastructure/object-record-title.module";
import { OBJECT_RECORD_TITLE_QUERY, type ObjectRecordTitleQuery } from "./ports/object-record-title-query.port";
import { OBJECT_RECORD_TITLE_REPOSITORY } from "./ports/object-record-title.repository";
import { ObjectRecordTitleReader } from "./object-record-title-reader";

// 기능 : 대표 이름의 소속 검증과 공개 port 조립을 DB 연결 없이 검증합니다.
describe("ObjectRecordTitleReader", () => {
  const context: TransactionContext = { transactionId: Symbol("title-test") };
  const pointer = { objectDefinitionId: "object", attributeDefinitionId: "attribute" };
  const attribute: AttributeDefinitionMetadata = { id: "attribute", workspaceId: "workspace", objectDefinitionId: "object", listDefinitionId: null,
    title: "이름", type: "Text", icon: null, isMultiselect: false, configJson: null };
  const objects = { titles: jest.fn() }, metadata = { findAttributes: jest.fn(), findOptions: jest.fn() };
  let reader: ObjectRecordTitleReader;
  beforeEach(() => {
    objects.titles.mockReset().mockResolvedValue([pointer]); metadata.findAttributes.mockReset().mockResolvedValue([attribute]);
    reader = new ObjectRecordTitleReader(objects, metadata);
  });
  it.each(["Text", "PersonalName"])("reads %s metadata from its owner in the same context", async type => {
    metadata.findAttributes.mockResolvedValue([{ ...attribute, type }]);
    await expect(reader.titles("workspace", context)).resolves.toEqual([pointer]);
    expect(metadata.findAttributes).toHaveBeenCalledWith("workspace", ["attribute"], context);
    expect(objects.titles).toHaveBeenCalledWith("workspace", context);
  });
  it.each([{ workspaceId: "foreign" }, { objectDefinitionId: "foreign" }, { listDefinitionId: "list" }, { type: "Number" }])("rejects incompatible metadata %j", async override => {
    metadata.findAttributes.mockResolvedValue([{ ...attribute, ...override }]);
    await expect(reader.titles("workspace", context)).resolves.toEqual([]);
  });
  it("does not choose an arbitrary attribute when the pointer is absent or deleted", async () => {
    objects.titles.mockResolvedValue([]);
    await expect(reader.titles("workspace", context)).resolves.toEqual([]);
    expect(metadata.findAttributes).not.toHaveBeenCalled();
    objects.titles.mockResolvedValue([pointer]); metadata.findAttributes.mockResolvedValue([]);
    await expect(reader.titles("workspace", context)).resolves.toEqual([]);
  });
  it("assembles the narrow public modules without a circular dependency", async () => {
    const module = await Test.createTestingModule({ imports: [ObjectRecordTitleModule] })
      .overrideProvider(PrismaService).useValue({})
      .overrideProvider(OBJECT_RECORD_TITLE_REPOSITORY).useValue(objects)
      .overrideProvider(ATTRIBUTE_DEFINITION_METADATA_QUERY).useValue(metadata).compile();
    try {
      await expect(module.get<ObjectRecordTitleQuery>(OBJECT_RECORD_TITLE_QUERY).titles("workspace", context)).resolves.toEqual([pointer]);
    } finally { await module.close(); }
  });
});
