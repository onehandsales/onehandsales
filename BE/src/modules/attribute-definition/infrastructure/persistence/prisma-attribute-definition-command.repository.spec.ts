import {
  ActorType as PrismaActorType,
  WorkspaceKind as PrismaWorkspaceKind,
  WorkspaceMemberRole as PrismaWorkspaceMemberRole,
} from "@prisma/client";
import { AttributeDefinitionApiSlugAlreadyExistsError } from "@/modules/attribute-definition/domain/attribute-definition.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAttributeDefinitionCommandRepository } from "./prisma-attribute-definition-command.repository";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeWithTestDatabase = TEST_DATABASE_URL ? describe : describe.skip;

const TEST_USER_ID = "00000000-0000-4000-8000-000000009101";
const TEST_WORKSPACE_ID = "00000000-0000-4000-8000-000000009201";
const TEST_WORKSPACE_MEMBER_ID = "00000000-0000-4000-8000-000000009301";
const TEST_ACTOR_ID = "00000000-0000-4000-8000-000000009401";
const TEST_OBJECT_DEFINITION_ID = "00000000-0000-4000-8000-000000009501";

// 기능 : AttributeDefinition Prisma 쓰기 저장소와 DB unique 제약 매핑을 검증합니다.
describeWithTestDatabase("PrismaAttributeDefinitionCommandRepository", () => {
  // 1. 이후 단계에서 사용할 prismaService 값을 준비한다.
  let prismaService: PrismaService | null = null;
  // 2. 이후 단계에서 사용할 repository 값을 준비한다.
  let repository: PrismaAttributeDefinitionCommandRepository | null = null;
  // 3. 이후 단계에서 사용할 databaseAvailable 값을 준비한다.
  let databaseAvailable = false;

  // 4. 필요한 비동기 작업을 실행한다.
  beforeAll(async () => {
    // 1. 명시된 테스트 DB URL만 Prisma 연결 문자열로 사용한다.
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // 2. Prisma repository가 사용할 DB client를 준비한다.
    prismaService = new PrismaService();

    try {
      // 3. 테스트 DB 연결 가능 여부를 확인한다.
      await prismaService.$connect();
      databaseAvailable = true;
      repository = new PrismaAttributeDefinitionCommandRepository(prismaService);
    } catch {
      // 4. 테스트 DB가 꺼져 있으면 기본 unit test 실행을 막지 않는다.
      await prismaService.$disconnect();
      prismaService = null;
      repository = null;
    }
  });

  // 5. 필요한 비동기 작업을 실행한다.
  beforeEach(async () => {
    if (!databaseAvailable || !prismaService) {
      return;
    }

    // 1. 이전 테스트 실행에서 남은 동일 fixture 데이터를 제거한다.
    await deleteTestRows(prismaService);

    // 2. AttributeDefinition 생성을 위해 필요한 Workspace 경계 fixture를 만든다.
    await createTestRows(prismaService);
  });

  // 6. 필요한 비동기 작업을 실행한다.
  afterAll(async () => {
    if (!databaseAvailable || !prismaService) {
      return;
    }

    // 1. 테스트 fixture 데이터를 정리하고 DB 연결을 닫는다.
    await deleteTestRows(prismaService);
    await prismaService.$disconnect();
  });

  // 7. 필요한 비동기 작업을 실행한다.
  it("maps duplicate object attribute apiSlug DB constraint to domain conflict", async () => {
    if (!databaseAvailable || !repository) {
      return;
    }

    const input = {
      workspaceId: TEST_WORKSPACE_ID,
      objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
      createdByActorId: TEST_ACTOR_ID,
      apiSlug: "company_phone",
      title: "Company phone",
      sortOrder: 0,
      type: "PhoneNumber" as const,
      icon: "phone",
      isMultiselect: false,
      description: null,
      config: null,
    };

    await repository.createAttributeDefinition(input);

    await expect(
      repository.createAttributeDefinition({
        ...input,
        title: "Company phone duplicate",
      })
    ).rejects.toBeInstanceOf(AttributeDefinitionApiSlugAlreadyExistsError);
  });

  // 8. 필요한 비동기 작업을 실행한다.
  it("allows the same apiSlug on another object definition", async () => {
    if (!databaseAvailable || !prismaService || !repository) {
      return;
    }

    const otherObjectDefinition = await prismaService.objectDefinition.create({
      data: {
        workspaceId: TEST_WORKSPACE_ID,
        createdByActorId: TEST_ACTOR_ID,
        apiSlug: "contact",
        singularName: "contact",
        pluralName: "contacts",
      },
      select: {
        id: true,
      },
    });

    await repository.createAttributeDefinition({
      workspaceId: TEST_WORKSPACE_ID,
      objectDefinitionId: TEST_OBJECT_DEFINITION_ID,
      createdByActorId: TEST_ACTOR_ID,
      apiSlug: "phone",
      title: "Phone",
      sortOrder: 0,
      type: "PhoneNumber",
      icon: "phone",
      isMultiselect: false,
      description: null,
      config: null,
    });

    await expect(
      repository.createAttributeDefinition({
        workspaceId: TEST_WORKSPACE_ID,
        objectDefinitionId: otherObjectDefinition.id,
        createdByActorId: TEST_ACTOR_ID,
        apiSlug: "phone",
        title: "Phone",
        sortOrder: 0,
        type: "PhoneNumber",
        icon: "phone",
        isMultiselect: false,
        description: null,
        config: null,
      })
    ).resolves.toEqual({
      id: expect.any(String),
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

// 기능 : AttributeDefinition repository integration test fixture row를 생성합니다.
async function createTestRows(prismaService: PrismaService): Promise<void> {
  await prismaService.user.create({
    data: {
      id: TEST_USER_ID,
      email: "attribute-definition-repository-test@example.com",
      displayName: "Attribute Definition Repository Test",
    },
  });

  await prismaService.workspace.create({
    data: {
      id: TEST_WORKSPACE_ID,
      name: "Attribute Definition Repository Test",
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
      displayNameSnapshot: "Attribute Definition Repository Test",
      emailSnapshot: "attribute-definition-repository-test@example.com",
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

// 기능 : AttributeDefinition repository integration test fixture row를 정리합니다.
async function deleteTestRows(prismaService: PrismaService): Promise<void> {
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
