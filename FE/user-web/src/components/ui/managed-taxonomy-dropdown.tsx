import { ChevronDown, Plus, X } from "lucide-react";
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
  readonly getLabel: (item: TItem) => string;
  readonly onCreate: (name: string) => Promise<void>;
  readonly onDelete: (item: TItem) => Promise<void>;
  readonly onSelect: (id: string) => void;
};

// 기능 : 분류 선택, 추가, 삭제를 한 드롭다운 안에서 처리합니다.
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
  getLabel,
  onCreate,
  onDelete,
  onSelect,
}: ManagedTaxonomyDropdownProps<TItem>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItem = items.find((item) => item.id === selectedId);
  const selectedLabel = selectedItem ? getLabel(selectedItem) : "";

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
        setIsAdding(false);
        setNewName("");
        setAddError(null);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsAdding(false);
        setNewName("");
        setAddError(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isAdding) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isAdding]);

  const handleCreate = async () => {
    const name = newName.trim();

    if (!name) {
      return;
    }

    setAddError(null);

    try {
      await onCreate(name);
      setNewName("");
      setIsAdding(false);
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
      <button
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border px-3 text-[13px] outline-none transition-colors",
          isOpen
            ? "border-[#93C5FD] ring-1 ring-[#93C5FD]"
            : "border-[#E6EAF0] hover:border-[#93C5FD]",
          selectedLabel ? "text-[#111827]" : "text-[#9CA3AF]"
        )}
        id={id}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border border-[#E6EAF0] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#E6EAF0] px-3 py-2">
            <span className="text-[11px] font-semibold text-[#6B7280]">
              {title} 관리
            </span>
            <button
              className="inline-flex h-6 items-center gap-1 rounded px-2 text-[11px] font-medium text-[#1D4ED8] hover:bg-[#EFF6FF]"
              onClick={() => {
                setIsAdding(true);
                setAddError(null);
              }}
              type="button"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              추가
            </button>
          </div>

          {isAdding ? (
            <div className="flex items-center gap-1.5 border-b border-[#E6EAF0] p-1.5">
              <input
                ref={inputRef}
                className="h-7 min-w-0 flex-1 rounded border border-[#E6EAF0] px-2 text-[12px] outline-none focus:border-[#93C5FD]"
                placeholder={addPlaceholder}
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleCreate();
                  }

                  if (event.key === "Escape") {
                    setIsAdding(false);
                    setNewName("");
                    setAddError(null);
                  }
                }}
              />
              <button
                className="h-7 rounded bg-[#1D4ED8] px-2 text-[11px] font-medium text-white hover:bg-[#1E40AF] disabled:opacity-60"
                disabled={isCreating || newName.trim().length === 0}
                onClick={() => void handleCreate()}
                type="button"
              >
                저장
              </button>
              <button
                className="h-7 rounded border border-[#E5E7EB] px-2 text-[11px] text-[#374151] hover:bg-[#F9FAFB]"
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                  setAddError(null);
                }}
                type="button"
              >
                취소
              </button>
            </div>
          ) : null}

          {addError ? (
            <p className="px-2 py-1 text-[11px] text-[#EF4444]">{addError}</p>
          ) : null}

          <div className="max-h-[160px] overflow-y-auto">
            {items.length === 0 && !isAdding ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
                {emptyText}
              </p>
            ) : null}

            {items.map((item) => {
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
        </div>
      ) : null}
    </div>
  );
}
