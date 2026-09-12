import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDropdownPlacement } from "@/components/ui/use-dropdown-placement";
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
  // 1. 처리 흐름에 필요한 [isOpen, setIsOpen] 값을 준비한다.
  const [isOpen, setIsOpen] = useState(false);
  // 2. 처리 흐름에 필요한 [search, setSearch] 값을 준비한다.
  const [search, setSearch] = useState("");
  // 3. 처리 흐름에 필요한 [addError, setAddError] 값을 준비한다.
  const [addError, setAddError] = useState<string | null>(null);
  // 4. 처리 흐름에 필요한 [deleteErrors, setDeleteErrors] 값을 준비한다.
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  // 5. 처리 흐름에 필요한 wrapperRef 값을 준비한다.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 6. 처리 흐름에 필요한 inputRef 값을 준비한다.
  const inputRef = useRef<HTMLInputElement>(null);
  // 7. 처리 흐름에 필요한 placement 값을 준비한다.
  const placement = useDropdownPlacement({
    estimatedHeight: 260,
    isOpen,
    triggerRef: wrapperRef,
  });
  // 8. 이후 단계에서 사용할 selectedItem 값을 준비한다.
  const selectedItem = items.find((item) => item.id === selectedId);
  // 9. 이후 단계에서 사용할 selectedLabel 값을 준비한다.
  const selectedLabel = selectedItem ? getLabel(selectedItem) : "";
  // 10. 이후 단계에서 사용할 query 값을 준비한다.
  const query = search.trim();
  // 11. 이후 단계에서 사용할 normalizedQuery 값을 준비한다.
  const normalizedQuery = normalizeText(query);
  // 12. 이후 단계에서 사용할 filteredItems 값을 준비한다.
  const filteredItems =
    query.length > 0
      ? items.filter((item) =>
          normalizeText(getLabel(item)).includes(normalizedQuery)
        )
      : items;
  // 13. 이후 단계에서 사용할 hasExactMatch 값을 준비한다.
  const hasExactMatch = items.some(
    (item) => normalizeText(getLabel(item)) === normalizedQuery
  );
  // 14. 이후 단계에서 사용할 canCreate 값을 준비한다.
  const canCreate = query.length > 0 && !hasExactMatch;

  // 15. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    if (selectedLabel) {
      setSearch(selectedLabel);
    }
  }, [selectedLabel]);

  // 16. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isOpen) {
      return;
    }

    // 기능 : on Mouse Down 기능을 수행합니다.
    // 2. 처리 흐름에 필요한 onMouseDown 값을 준비한다.
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

    // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("mousedown", onMouseDown);
    // 4. 계산된 결과를 호출자에게 반환한다.
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, selectedLabel]);

  // 17. 렌더링 이후 필요한 동작을 실행한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!isOpen) {
      return;
    }

    // 기능 : on Key Down 기능을 수행합니다.
    // 2. 이후 단계에서 사용할 onKeyDown 값을 준비한다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setAddError(null);
        setSearch(selectedLabel);
      }
    };

    // 3. 브라우저 이벤트 listener를 등록하거나 정리한다.
    document.addEventListener("keydown", onKeyDown);
    // 4. 계산된 결과를 호출자에게 반환한다.
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedLabel]);

  // 기능 : handle Create 이벤트를 처리합니다.
  // 18. 이후 단계에서 사용할 handleCreate 값을 준비한다.
  const handleCreate = async (options: { readonly promptWhenEmpty?: boolean } = {}) => {
    // 1. 이후 단계에서 사용할 name 값을 준비한다.
    const name = query;

    // 2. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!name) {
      if (options.promptWhenEmpty) {
        setAddError("추가할 이름을 입력해 주세요.");
        setIsOpen(true);
        inputRef.current?.focus();
      }
      return;
    }

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (hasExactMatch) {
      setAddError("이미 있는 항목이에요.");
      inputRef.current?.focus();
      return;
    }

    // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
    setAddError(null);

    // 5. 실패 가능성이 있는 작업을 실행하고 오류를 처리한다.
    try {
      await onCreate(name);
      setSearch(name);
      setIsOpen(false);
    } catch (error) {
      setAddError(getApiErrorMessage(error));
    }
  };

  // 기능 : handle Delete 이벤트를 처리합니다.
  // 19. 비동기 결과를 받아 handleDelete에 저장한다.
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

  // 20. 계산된 결과를 호출자에게 반환한다.
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
            "h-10 w-full rounded-md border pl-9 pr-10 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]",
            isOpen || selectedId.length > 0 ? "border-[#4880EE]" : "border-[#E6EAF0]"
          )}
          id={id}
          ref={inputRef}
          onChange={(event) => {
            // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
            setSearch(event.target.value);
            // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
            setAddError(null);
            // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
            setIsOpen(true);

            // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
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
              // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
              setSearch("");
              // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
              setAddError(null);
              // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
              setIsOpen(true);
              // 4. 현재 단계에서 필요한 동작을 실행한다.
              onSelect("");
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            placement === "up"
              ? "bottom-[calc(100%+4px)]"
              : "top-[calc(100%+4px)]"
          )}
        >
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
                        // 1. 현재 단계에서 필요한 동작을 실행한다.
                        onSelect(item.id);
                        // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
                        setSearch(label);
                        // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
                        setAddError(null);
                        // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
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

// 기능 : normalize Text 값을 내부 기준으로 정규화합니다.
function normalizeText(value: string) {
  return value.trim().toLowerCase();
}
