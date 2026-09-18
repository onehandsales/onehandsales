import { apiClient } from "@/lib/api-client";

export type CreatedWorkspaceResponse = {
  readonly workspaceId: string;
};

export type CreateWorkspaceInput = {
  readonly workspaceName: string;
};

// 기능 : 현재 사용자의 새 Workspace 생성 API를 호출합니다.
export function createWorkspace(input: CreateWorkspaceInput) {
  return apiClient<CreatedWorkspaceResponse>("/api/users/me/workspaces", {
    method: "POST",
    body: {
      workspaceName: input.workspaceName,
    },
  });
}
