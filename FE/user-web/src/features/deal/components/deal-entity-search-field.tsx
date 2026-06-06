import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import type { DealEntityOption } from "@/features/deal/hooks/use-deal-entity-options";

type DealEntitySearchFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly search: string;
  readonly selectedId: string;
  readonly options: DealEntityOption[];
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly placeholder?: string;
  readonly emptyText: string;
  readonly onSearchChange: (search: string) => void;
  readonly onSelect: (option: DealEntityOption) => void;
  readonly onClear: () => void;
};

export function DealEntitySearchField({
  id,
  label,
  icon: Icon,
  search,
  selectedId,
  options,
  isLoading,
  errorMessage,
  placeholder,
  emptyText,
  onSearchChange,
  onSelect,
  onClear,
}: DealEntitySearchFieldProps) {
  const shouldShowOptions = search.trim().length > 0 && !selectedId;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          aria-invalid={Boolean(errorMessage)}
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id={id}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          value={search}
        />
        {selectedId || search ? (
          <button
            aria-label={`${label} 선택 지우기`}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={onClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {shouldShowOptions ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {emptyText}
            </p>
          ) : (
            options.map((option) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={option.id}
                onClick={() => onSelect(option)}
                type="button"
              >
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">
                  {option.subtitle || "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
