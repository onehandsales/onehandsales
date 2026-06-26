import { Building2, ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDropdownPlacement } from "@/components/ui/use-dropdown-placement";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import { cn } from "@/utils/cn";

type ContactCompanyFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly companyId: string;
  readonly search: string;
  readonly error?: string;
  readonly onCreate?: (companyName: string) => void;
  readonly onCompanyIdChange: (companyId: string) => void;
  readonly onSearchChange: (search: string) => void;
};

// 기능 : 담당자 회사 선택 필드를 렌더링합니다.
export function ContactCompanyField({
  id,
  label,
  companyId,
  search,
  error,
  onCreate,
  onCompanyIdChange,
  onSearchChange,
}: ContactCompanyFieldProps) {
  const companyOptionsQuery = useCompanyOptions();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const placement = useDropdownPlacement({
    estimatedHeight: 240,
    isOpen,
    triggerRef: anchorRef,
  });
  const allCompanies = companyOptionsQuery.data?.items ?? [];
  const filterText = companyId ? "" : search.trim();
  const filteredCompanies =
    filterText.length > 0
      ? allCompanies.filter((c) =>
          c.companyName.toLowerCase().includes(filterText.toLowerCase())
        )
      : allCompanies;
  const selectedCompany = allCompanies.find((c) => c.id === companyId);
  const canCreate = filterText.length > 0 && filteredCompanies.length === 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div ref={anchorRef} className="relative">
        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring",
            isOpen && "ring-2 ring-ring"
          )}
          id={id}
          onChange={(event) => {
            onSearchChange(event.target.value);
            onCompanyIdChange("");
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
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
              setIsOpen(true);
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}

        {isOpen ? (
          <div
            className={cn(
              "absolute left-0 right-0 z-50 max-h-44 overflow-y-auto rounded-md border bg-white shadow-lg",
              placement === "up"
                ? "bottom-[calc(100%+4px)]"
                : "top-[calc(100%+4px)]"
            )}
          >
            {companyOptionsQuery.isLoading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                불러오는 중
              </p>
            ) : companyOptionsQuery.isError ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                회사 목록을 불러오지 못했습니다.
              </p>
            ) : filteredCompanies.length === 0 ? (
              <div className="grid gap-2 px-3 py-3">
                <p className="text-sm text-muted-foreground">
                  검색된 회사가 없습니다.
                </p>
                {canCreate && onCreate ? (
                  <button
                    className="inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
                    onClick={() => {
                      setIsOpen(false);
                      onCreate(filterText);
                    }}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {filterText} 회사 추가
                  </button>
                ) : null}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <button
                  className={cn(
                    "grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted",
                    company.id === companyId && "bg-[#EFF6FF]"
                  )}
                  key={company.id}
                  onClick={() => {
                    onCompanyIdChange(company.id);
                    onSearchChange(company.companyName);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <span className="font-medium">{company.companyName}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
