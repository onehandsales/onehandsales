import { Building2, X } from "lucide-react";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";

type ContactCompanyFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly companyId: string;
  readonly search: string;
  readonly error?: string;
  readonly onCompanyIdChange: (companyId: string) => void;
  readonly onSearchChange: (search: string) => void;
};

// 기능 : 거래처 회사 선택 필드를 렌더링합니다.
export function ContactCompanyField({
  id,
  label,
  companyId,
  search,
  error,
  onCompanyIdChange,
  onSearchChange,
}: ContactCompanyFieldProps) {
  const companyOptionsQuery = useCompanyOptions();
  const allCompanies = companyOptionsQuery.data?.items ?? [];
  const filteredCompanies =
    search.trim().length > 0
      ? allCompanies.filter((c) =>
          c.companyName.toLowerCase().includes(search.trim().toLowerCase())
        )
      : allCompanies;
  const selectedCompany = allCompanies.find((c) => c.id === companyId);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            onCompanyIdChange("");
          }}
          placeholder="회사 검색"
          value={selectedCompany ? selectedCompany.companyName : search}
        />
        {companyId || search ? (
          <button
            aria-label="회사 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => {
              onCompanyIdChange("");
              onSearchChange("");
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!companyId && search.trim().length > 0 ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {companyOptionsQuery.isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">불러오는 중</p>
          ) : filteredCompanies.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </p>
          ) : (
            filteredCompanies.map((company) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={company.id}
                onClick={() => {
                  onCompanyIdChange(company.id);
                  onSearchChange(company.companyName);
                }}
                type="button"
              >
                <span className="font-medium">{company.companyName}</span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
