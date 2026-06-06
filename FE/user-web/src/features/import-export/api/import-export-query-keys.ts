export const importExportQueryKeys = {
  all: ["import-export"] as const,
  imports: () => [...importExportQueryKeys.all, "imports"] as const,
  importDetail: (importJobId: string) =>
    [...importExportQueryKeys.imports(), importJobId] as const,
};
