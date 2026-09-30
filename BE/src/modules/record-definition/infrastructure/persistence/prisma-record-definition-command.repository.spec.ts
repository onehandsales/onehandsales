import {
  ActorType as PrismaActorType,
  AttributeType as PrismaAttributeType,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import { PrismaTransactionManager } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordDefinitionCommandRepository } from "./prisma-record-definition-command.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

const TEST_USER_ID = "00000000-0000-4000-8000-000000019101";
const TEST_WORKSPACE_ID = "00000000-0000-4000-8000-000000019201";
const TEST_WORKSPACE_MEMBER_ID = "00000000-0000-4000-8000-000000019301";
const TEST_ACTOR_ID = "00000000-0000-4000-8000-000000019401";
const TEST_OBJECT_DEFINITION_ID = "00000000-0000-4000-8000-000000019501";
const TEST_TEXT_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000019601";
const TEST_NUMBER_ATTRIBUTE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000019602";
const TEST_RECORD_DEFINITION_ID = "00000000-0000-4000-8000-000000019701";
const TEST_RECORD_ATTRIBUTE_VALUE_DEFINITION_ID =
  "00000000-0000-4000-8000-000000019801";

// 기능 : RecordDefinition Prisma 쓰기 저장소의 RecordDefinition과 null cell value row 생성을 검증합니다.
describeWithTestDatabase("PrismaRecordDefinitionCommandRepository", () => {
  // 1. 이후 단계에서 사용할 prismaService 값을 준비한다.
  let prismaService: PrismaService | null = null;
  // 2. 이후 단계에서 사용할 repository 값을 준비한다.
  let repository: PrismaRecordDefinitionCommandRepository | null = null;
  // 3. 이후 단계에서 사용할 transactionManager 값을 준비한다.
  let transactionManager: PrismaTransactionManager | null = null;
  // 4. 이후 단계에서 사용할 databaseAvailable 값을 준비한다.
  let databaseAvailable = false;

  // 5. 필요한 비동기 작업을 실행한다.
  beforeAll(async () => {
    // 1. 명시된 테스트 DB URL만 Prisma 연결 문자열로 사용한다.
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // 2. Prisma repository가 사용할 DB client를 준비한다.
    prismaService = new PrismaService();

    try {
      // 3. 테스트 DB 연결 가능 여부를 확인한다.
      await prismaService.$connect();
      databaseAvailable = true;
      repository = new PrismaRecordDefinitionCommandRepository(prismaService);
      transactionManager = new PrismaTransactionManager(prismaService);
    } catch {
      // 4. 테스트 DB가 꺼져 있으면 기본 unit test 실행을 막지 않는다.
      await prismaService.$disconnect();
      prismaService = null;
      repository = null;
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

    // 2. RecordDefinition 생성을 위해 필요한 Workspace 경계 fixture를 만든다.
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
  it("creates null record attribute values for the current object attributes", async () => {
    if (
      !databaseAvailable ||
      !prismaService ||
      !repository ||
      !transactionManager
    ) {
      return;
    }

    const commandRepository = repository;

    // 1. 새 row 생성 시 cell 기준이 되는 AttributeDefinition fixture를 준비한다.
    await prismaService.attributeDefinition.createMany({
      data: [
        {
          id: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          createdByActorId: TEST_ACTOR_ID,
          apiSlug: "name",
          title: "name",
          type: PrismaAttributeType.Text,
        },
        {
          id: TEST_NUMBER_ATTRIBUTE_DEFINITION_ID,
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          createdByActorId: TEST_ACTOR_ID,
          apiSlug: "score",
          title: "score",
          type: PrismaAttributeType.Number,
        },
      ],
    });

    // 2. 실제 transaction context 안에서 RecordDefinition 생성을 실행한다.
    const created = await transactionManager.runInTransaction(
      (transactionContext) =>
        commandRepository.createRecordDefinition({
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          createdByActorId: TEST_ACTOR_ID,
          transactionContext,
        })
    );

    // 3. RecordDefinition row가 생성되었는지 확인한다.
    await expect(
      prismaService.recordDefinition.findUniqueOrThrow({
        where: {
          id: created.id,
        },
        select: {
          workspaceId: true,
          objectDefinitionId: true,
          createdByActorId: true,
        },
      })
    ).resolves.toEqual({
      workspaceId: TEST_WORKSPACE_ID,
      objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
      createdByActorId: TEST_ACTOR_ID,
    });

    // 4. 현재 AttributeDefinition마다 비어 있는 RecordAttributeValueDefinition row가 생성되었는지 확인한다.
    const values =
      await prismaService.recordAttributeValueDefinition.findMany({
        where: {
          workspaceId: TEST_WORKSPACE_ID,
          recordDefinitionId: created.id,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        },
        orderBy: [{ attributeDefinitionId: "asc" }],
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
        recordDefinitionId: created.id,
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
        recordDefinitionId: created.id,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        attributeDefinitionId: TEST_NUMBER_ATTRIBUTE_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        attributeType: PrismaAttributeType.Number,
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
  it("updates a record attribute value and parent record audit", async () => {
    if (
      !databaseAvailable ||
      !prismaService ||
      !repository ||
      !transactionManager
    ) {
      return;
    }

    const commandRepository = repository;

    // 1. cell value update 대상 AttributeDefinition과 RecordDefinition fixture를 준비한다.
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
    await prismaService.recordDefinition.create({
      data: {
        id: TEST_RECORD_DEFINITION_ID,
        workspaceId: TEST_WORKSPACE_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
      },
    });
    await prismaService.recordAttributeValueDefinition.create({
      data: {
        id: TEST_RECORD_ATTRIBUTE_VALUE_DEFINITION_ID,
        workspaceId: TEST_WORKSPACE_ID,
        recordDefinitionId: TEST_RECORD_DEFINITION_ID,
        objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
        attributeDefinitionId: TEST_TEXT_ATTRIBUTE_DEFINITION_ID,
        createdByActorId: TEST_ACTOR_ID,
        attributeType: PrismaAttributeType.Text,
      },
    });

    // 2. 실제 transaction context 안에서 cell value와 부모 record audit update를 실행한다.
    const updated = await transactionManager.runInTransaction(
      (transactionContext) =>
        commandRepository.updateRecordAttributeValueDefinition({
          workspaceId: TEST_WORKSPACE_ID,
          objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
          recordDefinitionId: TEST_RECORD_DEFINITION_ID,
          recordAttributeValueDefinitionId:
            TEST_RECORD_ATTRIBUTE_VALUE_DEFINITION_ID,
          updatedByActorId: TEST_ACTOR_ID,
          values: {
            jsonValue: null,
            textValue: "회사명",
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
          transactionContext,
        })
    );

    expect(updated).toEqual({
      id: TEST_RECORD_ATTRIBUTE_VALUE_DEFINITION_ID,
    });

    // 3. cell value row가 textValue만 채우고 나머지 value 컬럼을 비웠는지 확인한다.
    await expect(
      prismaService.recordAttributeValueDefinition.findUniqueOrThrow({
        where: {
          id: TEST_RECORD_ATTRIBUTE_VALUE_DEFINITION_ID,
        },
        select: {
          updatedByActorId: true,
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
      })
    ).resolves.toEqual({
      updatedByActorId: TEST_ACTOR_ID,
      jsonValue: null,
      textValue: "회사명",
      numberValue: null,
      booleanValue: null,
      dateValue: null,
      timestampValue: null,
      selectOptionId: null,
      statusOptionId: null,
      targetRecordDefinitionId: null,
      targetObjectDefinitionId: null,
      targetActorId: null,
    });

    // 4. 부모 RecordDefinition도 같은 수정 감사 Actor로 갱신되었는지 확인한다.
    await expect(
      prismaService.recordDefinition.findUniqueOrThrow({
        where: {
          id: TEST_RECORD_DEFINITION_ID,
        },
        select: {
          updatedByActorId: true,
        },
      })
    ).resolves.toEqual({
      updatedByActorId: TEST_ACTOR_ID,
    });
  });
});

// 기능 : 명시적으로 주입된 테스트 DB URL을 반환합니다.
function getTestDatabaseUrl(): string {
  if (!TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL is required for repository integration tests");
  }

  return TEST_DATABASE_URL;
}

// 기능 : RecordDefinition repository integration test fixture row를 생성합니다.
async function createTestRows(prismaService: PrismaService): Promise<void> {
  await prismaService.user.create({
    data: {
      id: TEST_USER_ID,
      email: "record-definition-repository-test@example.com",
      displayName: "Record Definition Repository Test",
    },
  });

  await prismaService.workspace.create({
    data: {
      id: TEST_WORKSPACE_ID,
      name: "Record Definition Repository Test",
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
      displayNameSnapshot: "Record Definition Repository Test",
      emailSnapshot: "record-definition-repository-test@example.com",
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

// 기능 : RecordDefinition repository integration test fixture row를 정리합니다.
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
