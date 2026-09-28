import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import {
  RECORD_DEFINITION_LIST_PAGE_SIZE,
  RECORD_DEFINITION_LIST_QUERY,
  type RecordDefinitionListQuery,
  type WorkspaceObjectRecordDefinitionCursor,
  type WorkspaceObjectRecordDefinitionListItem,
  type WorkspaceObjectRecordDefinitionListResponse,
} from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import {
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

// 역할 : ListWorkspaceObjectRecordDefinitionsUseCase가 Object 목록 body row용 RecordDefinition 목록 조회를 담당합니다.
@Injectable()
export class ListWorkspaceObjectRecordDefinitionsUseCase {
  // 기능 : Workspace 접근 포트, ObjectDefinition 접근 포트, RecordDefinition 조회 포트를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(RECORD_DEFINITION_LIST_QUERY)
    private readonly recordDefinitionListQuery: RecordDefinitionListQuery
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 RecordDefinition page를 반환합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    cursor?: string
  ): Promise<WorkspaceObjectRecordDefinitionListResponse> {
    // 1. 현재 사용자 ID와 요청 Workspace ID 기준으로 Workspace membership을 확인한다.
    const hasWorkspaceMembership =
      await this.workspaceAccessQuery.hasWorkspaceMembership(
        currentUser.id,
        workspaceId
      );

    // 2. 멤버십이 없거나 Workspace가 없으면 정보 노출 없이 not found로 차단한다.
    if (!hasWorkspaceMembership) {
      throw new RecordDefinitionWorkspaceNotFoundError();
    }

    // 3. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    // 4. ObjectDefinition이 없거나 다른 Workspace에 속하면 not found로 차단한다.
    if (!hasObjectDefinition) {
      throw new RecordDefinitionObjectDefinitionNotFoundError();
    }

    // 5. cursor query 값을 RecordDefinition 페이지 조건으로 변환한다.
    const decodedCursor = this.decodeCursor(cursor);

    // 6. 접근 가능한 Workspace ObjectDefinition의 RecordDefinition page 조회를 위임한다.
    const page =
      await this.recordDefinitionListQuery.listWorkspaceObjectRecordDefinitions({
        workspaceId,
        objectDefinitionId,
        cursor: decodedCursor,
        pageSize: RECORD_DEFINITION_LIST_PAGE_SIZE,
      });

    // 7. 다음 페이지가 있으면 마지막 응답 row 기준으로 다음 cursor를 생성한다.
    const nextCursor = this.createNextCursor(page.hasNextPage, page.items);

    return {
      items: page.items,
      pageInfo: {
        hasNextPage: page.hasNextPage,
        nextCursor,
      },
    };
  }

  // 기능 : 불투명 cursor 문자열을 RecordDefinition 정렬 기준으로 복원합니다.
  private decodeCursor(
    cursor?: string
  ): WorkspaceObjectRecordDefinitionCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      // 1. base64url cursor를 JSON payload로 복원한다.
      const payload = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      ) as unknown;

      // 2. payload 구조와 cursor 필드 값을 검증한다.
      if (!this.isCursorPayload(payload)) {
        throw new ValidationDomainError("Invalid cursor");
      }

      const createdAt = new Date(payload.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new ValidationDomainError("Invalid cursor");
      }

      return {
        createdAt,
        id: payload.id,
      };
    } catch (error) {
      if (error instanceof ValidationDomainError) {
        throw error;
      }

      throw new ValidationDomainError("Invalid cursor");
    }
  }

  // 기능 : 다음 page 조회에 사용할 불투명 cursor를 생성합니다.
  private createNextCursor(
    hasNextPage: boolean,
    items: WorkspaceObjectRecordDefinitionListItem[]
  ): string | null {
    if (!hasNextPage) {
      return null;
    }

    const lastItem = items.at(-1);

    if (!lastItem) {
      return null;
    }

    return Buffer.from(
      JSON.stringify({
        createdAt: lastItem.createdAt,
        id: lastItem.id,
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : cursor payload가 페이지 기준 필드를 가진 객체인지 확인합니다.
  private isCursorPayload(
    payload: unknown
  ): payload is { readonly createdAt: string; readonly id: string } {
    if (typeof payload !== "object" || payload === null) {
      return false;
    }

    const candidate = payload as Record<string, unknown>;

    return (
      typeof candidate["createdAt"] === "string" &&
      typeof candidate["id"] === "string" &&
      this.isUuid(candidate["id"])
    );
  }

  // 기능 : 문자열이 UUID 형식인지 확인합니다.
  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  }
}
