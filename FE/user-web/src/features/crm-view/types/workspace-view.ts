export type WorkspaceViewTargetType = "OBJECT" | "LIST";
export type WorkspaceViewType =
  | "TABLE" | "KANBAN" | "LIST" | "GALLERY" | "CALENDAR" | "TIMELINE"
  | "GANTT" | "CHART" | "PIVOT" | "MAP" | "DASHBOARD";

export type WorkspaceViewTarget = {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
};

export type WorkspaceViewHeaderResponse = {
  readonly viewId: string | null;
  readonly viewName: string | null;
  readonly viewIcon: string | null;
  readonly viewType: WorkspaceViewType | null;
  readonly isFavorite: boolean;
  readonly objectDefinition: WorkspaceViewTarget | null;
  readonly listDefinition: WorkspaceViewTarget | null;
};

export type WorkspaceViewListItem = {
  readonly viewId: string;
  readonly viewName: string;
  readonly viewIcon: string | null;
  readonly viewType: WorkspaceViewType;
  readonly isSelected: boolean;
};

export type WorkspaceViewsResponse = {
  readonly items: readonly WorkspaceViewListItem[];
};
