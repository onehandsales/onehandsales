import {
  ActorType as PrismaActorType,
  AttributeType as PrismaAttributeType,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import { PrismaTransactionManager } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordAttributeValueDefinitionMaterializer } from "./prisma-record-attribute-value-definition-materializer";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

const TEST_USER_ID = "00000000-0000-4000-8000-000000029101";
const TEST_WORKSPACE_ID = "00000000-0000-4000-8000-000000029201";
const TEST_WORKSPACE_MEMBER_ID = "00000000-0000-4000-8000-000000029301";
const TEST_ACTOR_ID = "00000000-0000-4000-8000-000000029401";
const TEST_OBJECT_DEFINITION_ID = "00000000-0000-4000-8000-000000029501";
const TEST_TEXT_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000029601";
const TEST_NUMBER_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000029602";
const TEST_FIRST_RECORD_DEFINITION_ID =
  "00000000-0000-4000-8000-000000029701";
const TEST_SECOND_RECORD_DEFINITION_ID =
  "00000000-0000-4000-8000-000000029702";

// 기능 : RecordAttributeValueDefinition materializer가 기존 RecordDefinition 기준 null cell value row를 생성하는지 검증합니다.
describeWithTestDatabase("PrismaRecordAttributeValueDefinitionMaterializer", () => {
  // 1. 이후 단계에서 사용할 prismaService 값을 준비한다.
  let prismaService: PrismaService | null = null;
  // 2. 이후 단계에서 사용할 materializer 값을 준비한다.
  let materializer: PrismaRecordAttributeValueDefinitionMaterializer | null =
    null;
  // 3. 이후 단계에서 사용할 transactionManager 값을 준비한다.
  let transactionManager: PrismaTransactionManager | null = null;
  // 4. 이후 단계에서 사용할 databaseAvailable 값을 준비한다.
  let databaseAvailable = false;

  // 5. 필요한 비동기 작업을 실행한다.
  beforeAll(async () => {
    // 1. 명시된 테스트 DB URL만 Prisma 연결 문자열로 사용한다.
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // 2. Prisma materializer가 사용할 DB client를 준비한다.
    prismaService = new PrismaService();

    try {
      // 3. 테스트 DB 연결 가능 여부를 확인한다.
      await prismaService.$connect();
      databaseAvailable = true;
      materializer = new PrismaRecordAttributeValueDefinitionMaterializer(
        prismaService
      );
      transactionManager = new PrismaTransactionManager(prismaService);
    } catch {
      // 4. 테스트 DB가 꺼져 있으면 기본 unit test 실행을 막지 않는다.
      await prismaService.$disconnect();
      prismaService = null;
      materializer = null;
      transactionManager = null;
    }
  });

  // 6. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    if (!databaseAvailable || !prismaService) {
      return;
    }

    // 1. 이전 테스트 실행에서 남은 동일 fixture 데이터를 제거한다.
    await deleteTestRows(prismaService);

    // 2. RecordAttributeValueDefinition 생성을 위해 필요한 Workspace 경계 fixture를 만든다.
    await createTestRows(prismaService);
  });

  // 7. 필요한 비동기 작업을 실행한다.
  afterAll(async () => {
    if (!databaseAvailable || !prismaService) {
      return;
    }

    // 1. 테스트 fixture 데이터를 정리하고 DB 연결을 닫는다.
    await deleteTestRows(prismaService);
    await prismaService.$disconnect();
  });

  // 8. 필요한 비동기 작업을 실행한다.
  it("creates null cell value rows for existing record definitions", async () => {
    if (
      !databaseAvailable ||
      !prismaService ||
      !materializer ||
      !transactionManager
    ) {
      return;
    }

    const currentMaterializer = materializer;

    // 1. 새 AttributeDefinition과 이미 존재하는 RecordDefinition fixture를 준비한다.
    await prismaService.attributeDefinition.create({
      data: {
        id: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
        workspaceId: TEST_WORKSPACE_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        apiSlug: "name",
        title: "name",
        type: PrismaAttributeType.Text,
      },
    });
    await prismaService.recordDefinition.createMany({
      data: [
        {
          id: TEST_FIRST_RECORD_DEFINITION_ID,
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          createdByActorId: TEST_ACTOR_ID,
        },
        {
          id: TEST_SECOND_RECORD_DEFINITION_ID,
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          createdByActorId: TEST_ACTOR_ID,
        },
      ],
    });

    // 2. 실제 transaction context 안에서 기존 RecordDefinition cell row 보강을 실행한다.
    const result = await transactionManager.runInTransaction(
      (transactionContext) =>
        currentMaterializer.materializeForAttributeDefinition({
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          attributeDefinitionId: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
          attributeType: "Text",
          createdByActorId: TEST_ACTOR_ID,
          transactionContext,
        })
    );

    // 3. 기존 RecordDefinition 수만큼 cell value row가 생성되었는지 확인한다.
    expect(result).toEqual({
      createdCount: 2,
    });

    // 4. 생성된 cell value row들이 모두 null 값과 Attribute type snapshot을 갖는지 확인한다.
    const values =
      await prismaService.recordAttributeValueDefinition.findMany({
        where: {
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          attributeDefinitionId: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
        },
        orderBy: [{ recordDefinitionId: "asc" }],
        select: {
          workspaceId: true,
          recordDefinitionId: true,
          objectDefinitionId: true,
          attributeDefinitionId: true,
          createdByActorId: true,
          attributeType: true,
          jsonValue: true,
          textValue: true,
          numberValue: true,
          booleanValue: true,
          dateValue: true,
          timestampValue: true,
          selectOptionId: true,
          statusOptionId: true,
          targetRecordDefinitionId: true,
          targetObjectDefinitionId: true,
          targetActorId: true,
        },
      });

    expect(values).toEqual([
      {
        workspaceId: TEST_WORKSPACE_ID,
        recordDefinitionId: TEST_FIRST_RECORD_DEFINITION_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        attributeDefinitionId: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        attributeType: PrismaAttributeType.Text,
        jsonValue: null,
        textValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        timestampValue: null,
        selectOptionId: null,
        statusOptionId: null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
      },
      {
        workspaceId: TEST_WORKSPACE_ID,
        recordDefinitionId: TEST_SECOND_RECORD_DEFINITION_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        attributeDefinitionId: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        attributeType: PrismaAttributeType.Text,
        jsonValue: null,
        textValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        timestampValue: null,
        selectOptionId: null,
        statusOptionId: null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
      },
    ]);
  });

  // 9. 필요한 비동기 작업을 실행한다.
  it("returns zero without creating cell rows when no record definitions exist", async () => {
    if (
      !databaseAvailable ||
      !prismaService ||
      !materializer ||
      !transactionManager
    ) {
      return;
    }

    const currentMaterializer = materializer;

    // 1. 기존 RecordDefinition이 없는 ObjectDefinition에 새 AttributeDefinition만 준비한다.
    await prismaService.attributeDefinition.create({
      data: {
        id: TEST_NUMBER_ATTRIBUTE_DEFINITION_ID,
        workspaceId: TEST_WORKSPACE_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        apiSlug: "score",
        title: "score",
        type: PrismaAttributeType.Number,
      },
    });

    // 2. 실제 transaction context 안에서 materialize를 실행한다.
    const result = await transactionManager.runInTransaction(
      (transactionContext) =>
        currentMaterializer.materializeForAttributeDefinition({
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          attributeDefinitionId: TEST_NUMBER_ATTRIBUTE_DEFINITION_ID,
          attributeType: "Number",
          createdByActorId: TEST_ACTOR_ID,
          transactionContext,
        })
    );

    // 3. 기존 데이터가 없으면 cell 생성 없이 성공 결과만 반환하는지 확인한다.
    expect(result).toEqual({
      createdCount: 0,
    });
    await expect(
      prismaService.recordAttributeValueDefinition.count({
        where: {
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          attributeDefinitionId: TEST_NUMBER_ATTRIBUTE_DEFINITION_ID,
        },
      })
    ).resolves.toBe(0);
  });
});

// 기능 : 명시적으로 주입된 테스트 DB URL을 반환합니다.
function getTestDatabaseUrl(): string {
  if (!TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL is required for materializer integration tests");
  }

  return TEST_DATABASE_URL;
}

// 기능 : RecordAttributeValueDefinition materializer integration test fixture row를 생성합니다.
async function createTestRows(prismaService: PrismaService): Promise<void> {
  await prismaService.user.create({
    data: {
      id: TEST_USER_ID,
      email: "record-attribute-value-materializer-test@example.com",
      displayName: "Record Attribute Value Materializer Test",
    },
  });

  await prismaService.workspace.create({
    data: {
      id: TEST_WORKSPACE_ID,
      name: "Record Attribute Value Materializer Test",
      kind: PrismaWorkspaceKind.PERSONAL,
    },
  });

  await prismaService.workspaceMember.create({
    data: {
      id: TEST_WORKSPACE_MEMBER_ID,
      workspaceId: TEST_WORKSPACE_ID,
      userId: TEST_USER_ID,
      role: PrismaWorkspaceMemberRole.OWNER,
    },
  });

  await prismaService.actor.create({
    data: {
      id: TEST_ACTOR_ID,
      workspaceId: TEST_WORKSPACE_ID,
      type: PrismaActorType.WORKSPACE_MEMBER,
      workspaceMemberId: TEST_WORKSPACE_MEMBER_ID,
      displayNameSnapshot: "Record Attribute Value Materializer Test",
      emailSnapshot: "record-attribute-value-materializer-test@example.com",
    },
  });

  await prismaService.objectDefinition.create({
    data: {
      id: TEST_OBJECT_DEFINITION_ID,
      workspaceId: TEST_WORKSPACE_ID,
      createdByActorId: TEST_ACTOR_ID,
      apiSlug: "company",
      singularName: "company",
      pluralName: "companies",
    },
  });
}

// 기능 : RecordAttributeValueDefinition materializer integration test fixture row를 정리합니다.
async function deleteTestRows(prismaService: PrismaService): Promise<void> {
  await prismaService.recordAttributeValueDefinition.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.recordDefinition.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.attributeDefinition.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.objectDefinition.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.actor.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.workspaceMember.deleteMany({
    where: {
      workspaceId: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.workspace.deleteMany({
    where: {
      id: TEST_WORKSPACE_ID,
    },
  });
  await prismaService.user.deleteMany({
    where: {
      id: TEST_USER_ID,
    },
  });
}
