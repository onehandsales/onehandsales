import { Inject, Injectable } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  READ_SNAPSHOT_RUNNER,
  type ReadSnapshotRunner,
} from "@/shared/application/ports/read-snapshot-runner.port";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import {
  WORKSPACE_SNAPSHOT_QUERY,
  type WorkspaceSnapshotQuery,
} from "@/modules/workspace/application/ports/workspace-snapshot-query.port";
import { DomainError } from "@/shared/domain/errors/domain-error";
import {
  VIEW_DATA_CONFIGURATION_QUERY,
  type ViewDataConfigurationQuery,
} from "../ports/view-data-configuration-query.port";
import {
  VIEW_DATA_TOKEN_CODEC,
  type ViewDataTokenCodec,
} from "../ports/view-data-token-codec.port";
import { VIEW_HEADER_CLOCK } from "../ports/view-header-configuration-query.port";
import {
  ViewDataLoader,
  resolveViewSource,
} from "../view-data/view-data-loader";
import {
  ViewDataQueryContext,
  validateViewDataRequest,
  assertSupportedViewType,
} from "../view-data/view-data-query-context";
import { readViewData } from "../view-data/view-data-readers";
import {
  assertViewDataLimit,
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "../view-data/view-data.errors";
import type {
  ViewDataRequest,
  WorkspaceViewMainContentResponse,
} from "../view-data/view-data.types";

// 역할 : 사용자 권한과 읽기 snapshot 안에서 본문 조회 전체 흐름을 조정합니다.
@Injectable()
export class GetWorkspaceViewMainContentUseCase {
  // 기능 : 인증·소유 query·snapshot·실행기와 관측 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly access: WorkspaceAccessQuery,
    @Inject(WORKSPACE_SNAPSHOT_QUERY)
    private readonly workspace: WorkspaceSnapshotQuery,
    @Inject(READ_SNAPSHOT_RUNNER)
    private readonly snapshots: ReadSnapshotRunner,
    @Inject(VIEW_DATA_CONFIGURATION_QUERY)
    private readonly views: ViewDataConfigurationQuery,
    @Inject(VIEW_DATA_TOKEN_CODEC) private readonly tokens: ViewDataTokenCodec,
    @Inject(VIEW_HEADER_CLOCK) private readonly now: () => number,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
    private readonly loader: ViewDataLoader,
  ) {}
  // 기능 : 저장 설정 기반의 세 타입 본문을 같은 읽기 시점으로 반환합니다.
  async execute(
    user: CurrentUserContext,
    workspaceId: string,
    viewDefinitionId: string,
    request: ViewDataRequest,
    requestId: string | null = null,
  ): Promise<WorkspaceViewMainContentResponse> {
    const scope = {
        workspaceId: workspaceId.toLowerCase(),
        viewDefinitionId: viewDefinitionId.toLowerCase(),
      },
      started = this.now();
    try {
      // 1. 멤버십을 먼저 확인하고 snapshot 안에서 다시 검사한다.
      if (
        !(await this.access.hasWorkspaceMembership(user.id, scope.workspaceId))
      )
        throw new DomainError(
          "ViewDataWorkspaceNotFound",
          "Workspace not found",
        );
      // 2. application이 설정과 업무 데이터를 묶는 읽기 snapshot 경계를 시작한다.
      const response = await this.snapshots.run(async (transaction) => {
        // 1. 같은 조회 시점의 멤버십과 선택 View·설정 행의 소속을 재검증한다.
        if (
          !(await this.workspace.hasMembership(
            user.id,
            scope.workspaceId,
            transaction,
          ))
        )
          throw new DomainError(
            "ViewDataWorkspaceNotFound",
            "Workspace not found",
          );
        const configuration = await this.views.read(scope, transaction);
        if (
          !configuration ||
          configuration.view.workspaceId !== scope.workspaceId ||
          configuration.view.id !== scope.viewDefinitionId
        )
          throw new DomainError("ViewDataViewNotFound", "View not found");
        assertSupportedViewType(configuration.view.type);
        for (const rows of [
          configuration.viewAttributeSettingDefinitions,
          configuration.viewFilterGroupDefinitions,
          configuration.viewFilterConditionDefinitions,
          configuration.viewSortDefinitions,
          configuration.viewGroupDefinitions,
          configuration.viewGroupSettingDefinitions,
        ]) {
          if (
            rows.some(
              (row) =>
                row.workspaceId !== scope.workspaceId ||
                row.viewDefinitionId !== scope.viewDefinitionId,
            )
          )
            throw new ViewDataConfigurationError();
        }
        const source = resolveViewSource(configuration.view, request);
        validateViewDataRequest(configuration.view.type, request);
        try {
          // 2. 원본 전체에서 필터·정렬한 결과를 타입별로 페이지 처리한다.
          const snapshot = await this.loader.load(
            configuration,
            source,
            transaction,
          );
          const context = new ViewDataQueryContext(
            snapshot,
            request,
            user,
            this.tokens,
          );
          return readViewData(context);
        } catch (error) {
          if (!(error instanceof ViewDataNeedsConfiguration)) throw error;
          return {
            viewDefinitionId: configuration.view.id,
            viewName: configuration.view.name,
            viewType: configuration.view.type,
            source,
            configurationFingerprint: this.tokens.fingerprint(configuration),
            part: request.part ?? "MAIN",
            state: "NEEDS_CONFIGURATION",
            bindings: [],
            summary: null,
            issues: [
              {
                code: error.code,
                field: error.field,
                bindingId: error.bindingId,
              },
            ],
            data: null,
          } satisfies WorkspaceViewMainContentResponse;
        }
      });
      // 3. 큰 응답도 잘라 성공 처리하지 않고 명시 한도 오류를 반환한다.
      if (this.now() - started > 20000)
        throw new DomainError("ViewDataQueryTimedOut", "View query timed out");
      assertViewDataLimit(
        new TextEncoder().encode(JSON.stringify(response)).byteLength,
        5 * 1024 * 1024,
      );
      this.logger.log(
        JSON.stringify({
          event: "view.data.read_completed",
          requestId,
          userId: user.id,
          ...scope,
          viewType: response.viewType,
          part: response.part,
          state: response.state,
          durationMs: Math.max(0, this.now() - started),
          counts: response.summary,
        }),
        "GetWorkspaceViewMainContentUseCase",
      );
      return response;
    } catch (error) {
      const message = JSON.stringify({
          event: "view.data.read_failed",
          requestId,
          userId: user.id,
          ...scope,
          durationMs: Math.max(0, this.now() - started),
          errorCode:
            error instanceof DomainError ? error.code : "InternalServerError",
        });
      const code = error instanceof DomainError ? error.code : "InternalServerError";
      if (code.endsWith("NotFound") || code === "ViewDataCursorStale")
        this.logger.log(message, "GetWorkspaceViewMainContentUseCase");
      else if (["ValidationError", "ViewDataQueryLimitExceeded", "ViewDataTypeUnsupported", "ViewDataQueryTimedOut"].includes(code))
        this.logger.warn(message, "GetWorkspaceViewMainContentUseCase");
      else this.logger.error(message, undefined, "GetWorkspaceViewMainContentUseCase");
      throw error;
    }
  }
}
