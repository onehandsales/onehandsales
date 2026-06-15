export type PaginatedResponse<TItem> = {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};
