import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type ManagedTaxonomyItem = {
  readonly id: string;
};

type ManagedTaxonomyDropdownProps<TItem extends ManagedTaxonomyItem> = {
  readonly id: string;
  readonly title: string;
  readonly placeholder: string;
  readonly addPlaceholder: string;
  readonly emptyText: string;
  readonly items: readonly TItem[];
  readonly selectedId: string;
  readonly isCreating?: boolean;
  readonly isDeleting?: boolean;
  readonly createActionLabel?: string;
  readonly listClassName?: string;
  readonly getLabel: (item: TItem) => string;
  readonly onCreate: (name: string) => Promise<void>;
  readonly onDelete: (item: TItem) => Promise<void>;
  readonly onSelect: (id: string) => void;
};

// 기능 : 분류를 검색해 선택하고 검색 결과가 없으면 입력값으로 바로 추가합니다.
export function ManagedTaxonomyDropdown<TItem extends ManagedTaxonomyItem>({
  id,
  title,
  placeholder,
  addPlaceholder,
  emptyText,
  items,
  selectedId,
  isCreating = false,
  isDeleting = false,
  createActionLabel,
  listClassName,
  getLabel,
  onCreate,
  onDelete,
  onSelect,
}: ManagedTaxonomyDropdownProps<TItem>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItem = items.find((item) => item.id === selectedId);
  const selectedLabel = selectedItem ? getLabel(selectedItem) : "";
  const query = search.trim();
  const normalizedQuery = normalizeText(query);
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText(getLabel(item)).includes(normalizedQuery)
        )
      : items;
  const hasExactMatch = items.some(
    (item) => normalizeText(getLabel(item)) === normalizedQuery
  );
  const canCreate = query.length > 0 && !hasExactMatch;

  useEffect(() => {
    if (selectedLabel) {
      setSearch(selectedLabel);
    }
  }, [selectedLabel]);

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
        setAddError(null);
        setSearch(selectedLabel);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, selectedLabel]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setAddError(null);
        setSearch(selectedLabel);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedLabel]);

  const handleCreate = async (options: { readonly promptWhenEmpty?: boolean } = {}) => {
    const name = query;

    if (!name) {
      if (options.promptWhenEmpty) {
        setAddError("추가할 이름을 입력해주세요.");
        setIsOpen(true);
        inputRef.current?.focus();
      }
      return;
    }

    if (hasExactMatch) {
      setAddError("이미 있는 항목입니다.");
      inputRef.current?.focus();
      return;
    }

    setAddError(null);

    try {
      await onCreate(name);
      setSearch(name);
      setIsOpen(false);
    } catch (error) {
      setAddError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (item: TItem) => {
    setDeleteErrors((prev) => ({ ...prev, [item.id]: "" }));

    try {
      await onDelete(item);
    } catch (error) {
      setDeleteErrors((prev) => ({
        ...prev,
        [item.id]: getApiErrorMessage(error),
      }));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={addPlaceholder}
          autoComplete="off"
          className={cn(
            "h-10 w-full rounded-md border pl-9 pr-10 text-[13px] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]",
            isOpen || selectedId.length > 0 ? "border-[#2563EB]" : "border-[#E6EAF0]"
          )}
          id={id}
          ref={inputRef}
          onChange={(event) => {
            setSearch(event.target.value);
            setAddError(null);
            setIsOpen(true);

            if (selectedId) {
              onSelect("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canCreate && filteredItems.length === 0) {
              event.preventDefault();
              void handleCreate();
            }
          }}
          placeholder={placeholder}
          value={search}
        />
        {selectedId || search ? (
          <button
            aria-label={`${title} 선택 지우기`}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => {
              setSearch("");
              setAddError(null);
              setIsOpen(true);
              onSelect("");
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border border-[#E6EAF0] bg-white shadow-lg">
          <div className="border-b border-[#E6EAF0] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#6B7280]">
              {title} 검색
            </span>
          </div>

          {addError ? (
            <p className="px-2 py-1 text-[11px] text-[#EF4444]">{addError}</p>
          ) : null}

          <div className={cn("max-h-[160px] overflow-y-auto", listClassName)}>
            {filteredItems.length === 0 ? (
              <div className="grid gap-2 px-3 py-3">
                <p className="text-[12px] text-[#9CA3AF]">{emptyText}</p>
                {!createActionLabel && canCreate ? (
                  <button
                    className="inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-md border border-dashed border-primary/30 bg-primary/5 px-2.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isCreating}
                    onClick={() => void handleCreate()}
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {createActionLabel ?? `${query} ${title} 추가`}
                  </button>
                ) : null}
              </div>
            ) : null}

            {filteredItems.map((item) => {
              const label = getLabel(item);
              const isSelected = selectedId === item.id;

              return (
                <div key={item.id}>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 transition-colors hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EFF6FF]"
                    )}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 px-1 text-left text-[13px]"
                      onClick={() => {
                        onSelect(item.id);
                        setSearch(label);
                        setAddError(null);
                        setIsOpen(false);
                      }}
                      type="button"
                    >
                      <span
                        className={cn(
                          "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                          isSelected
                            ? "border-[#1D4ED8]"
                            : "border-[#CBD5E1]"
                        )}
                      >
                        {isSelected ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[#374151]">
                        {label}
                      </span>
                    </button>
                    <button
                      aria-label={`${label} 삭제`}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded hover:bg-[#FEE2E2] hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isDeleting}
                      onClick={() => void handleDelete(item)}
                      title="삭제"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {deleteErrors[item.id] ? (
                    <p className="px-3 pb-1 text-[11px] text-[#EF4444]">
                      {deleteErrors[item.id]}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {createActionLabel || (canCreate && filteredItems.length > 0) ? (
            <div className="border-t border-[#E6EAF0] px-2 py-1.5">
              <button
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={createActionLabel ? isCreating : !canCreate || isCreating}
                onClick={() => void handleCreate({ promptWhenEmpty: Boolean(createActionLabel) })}
                type="button"
              >
                <Plus className="h-3.5 w-3.5" />
                {createActionLabel ?? `${query} ${title} 추가`}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}
