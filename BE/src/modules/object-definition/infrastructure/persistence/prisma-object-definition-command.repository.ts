import { Prisma } from "@prisma/client";
import type {
  CreateObjectDefinitionInput,
  CreateObjectDefinitionResult,
  ObjectDefinitionApiSlugLookupInput,
  ObjectDefinitionCommandRepository,
} from "@/modules/object-definition/application/ports/object-definition-command.repository";
import { ObjectDefinitionApiSlugAlreadyExistsError } from "@/modules/object-definition/domain/object-definition.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaObjectDefinitionCommandRepository가 ObjectDefinition 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaObjectDefinitionCommandRepository
  implements ObjectDefinitionCommandRepository
{
  // 기능 : PrismaService를 주입받아 ObjectDefinition 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 같은 Workspace 안에 동일 apiSlug의 ObjectDefinition이 있는지 확인합니다.
  async hasObjectDefinitionApiSlug(
    input: ObjectDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    // 1. Workspace 경계와 apiSlug 기준으로 기존 ObjectDefinition 존재 여부를 조회한다.
    const objectDefinition = await this.prismaService.objectDefinition.findFirst({
      where: {
        workspaceId: input.workspaceId,
        apiSlug: input.apiSlug,
      },
      select: {
        id: true,
      },
    });

    // 2. 조회 결과 존재 여부를 중복 여부로 반환한다.
    return objectDefinition !== null;
  }

  // 기능 : Workspace에 ObjectDefinition row를 생성합니다.
  async createObjectDefinition(
    input: CreateObjectDefinitionInput
  ): Promise<CreateObjectDefinitionResult> {
    try {
      // 1. ObjectDefinition row를 생성하고 생성된 ID만 조회한다.
      const objectDefinition =
        await this.prismaService.objectDefinition.create({
          data: {
            workspaceId: input.workspaceId,
            createdByActorId: input.createdByActorId,
            apiSlug: input.apiSlug,
            singularName: input.singularName,
            pluralName: input.pluralName,
            icon: input.icon,
            description: input.description,
          },
          select: {
            id: true,
          },
        });

      // 2. 생성 결과를 application 계층 응답 계약으로 반환한다.
      return {
        id: objectDefinition.id,
      };
    } catch (error) {
      // 3. 동시 요청 등으로 DB unique 제약에 걸리면 domain conflict로 변환한다.
      if (this.isUniqueConstraintError(error)) {
        throw new ObjectDefinitionApiSlugAlreadyExistsError();
      }

      throw error;
    }
  }

  // 기능 : Prisma unique constraint 오류인지 판별합니다.
  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }
}
