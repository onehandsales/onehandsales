import { Database, Eye, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAdminDomainDetail,
  useAdminDomainList,
} from "@/features/admin-query/hooks/use-admin-query";
import type {
  AdminDeal,
  AdminDetailResponse,
  AdminDomainItem,
  AdminDomainType,
  AdminSensitiveRawRequest,
  AdminSensitiveRawResponse,
  AdminSensitiveTargetType,
} from "@/features/admin-query/types/admin-query";
import { domainLabels, formatDate, getErrorMessage } from "../utils/admin-query-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PaginationControls,
} from "./admin-screen-shared";
import { SensitiveRawDialog } from "./sensitive-raw-dialog";

const pageSize = 10;
const domainTabs: readonly AdminDomainType[] = [
  "companies",
  "contacts",
  "products",
  "deals",
];
const sensitiveTargetTypes: Record<AdminDomainType, AdminSensitiveTargetType> = {
  companies: "COMPANY",
  contacts: "CONTACT",
  products: "PRODUCT",
  deals: "DEAL",
};

type RawDialogRequest = Omit<AdminSensitiveRawRequest, "reason"> & {
  readonly label: string;
};

type RawValuesByTarget = Record<string, Record<string, string | null>>;

export function AdminDomainDataScreen() {
  const [domain, setDomain] = useState<AdminDomainType>("companies");
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [stage, setStage] = useState("");
  const [selectedIdByDomain, setSelectedIdByDomain] = useState<
    Partial<Record<AdminDomainType, string>>
  >({});
  const [rawDialogRequest, setRawDialogRequest] =
    useState<RawDialogRequest | null>(null);
  const [rawValuesByTarget, setRawValuesByTarget] =
    useState<RawValuesByTarget>({});
  const listQuery = useAdminDomainList(domain, {
    page,
    pageSize,
    search: search || undefined,
    includeDeleted,
    stage: domain === "deals" && stage ? stage : undefined,
  });
  const selectedId = selectedIdByDomain[domain] ?? "";
  const detailQuery = useAdminDomainDetail(domain, selectedId);
  const currentColumns = useMemo(() => getColumns(domain), [domain]);
  const rawTargetKey = getRawTargetKey(domain, selectedId);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  };

  const onDomainChange = (nextDomain: AdminDomainType) => {
    setDomain(nextDomain);
    setPage(1);
    setStage("");
  };

  const onRawSuccess = (response: AdminSensitiveRawResponse) => {
    setRawValuesByTarget((current) => ({
      ...current,
      [rawTargetKey]: {
        ...(current[rawTargetKey] ?? {}),
        ...Object.fromEntries(
          response.fields.map((field) => [field.name, field.value])
        ),
      },
    }));
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="도메인 데이터"
        description="전체 회사, 담당자, 제품, 딜 데이터를 마스킹 상태로 조회합니다."
      />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {domainTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={[
                  "h-10 rounded-md border px-4 text-sm font-semibold",
                  domain === tab
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-white hover:bg-muted",
                ].join(" ")}
                onClick={() => onDomainChange(tab)}
              >
                {domainLabels[tab]}
              </button>
            ))}
          </div>

          <form
            className="grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_150px_160px_96px]"
            onSubmit={onSubmit}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={`${domainLabels[domain]} 검색`}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(event) => {
                  setIncludeDeleted(event.target.checked);
                  setPage(1);
                }}
              />
              삭제 포함
            </label>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm disabled:bg-muted"
              disabled={domain !== "deals"}
              value={stage}
              onChange={(event) => {
                setStage(event.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 단계</option>
              <option value="INITIAL_CONTACT">초기 접촉</option>
              <option value="IN_DISCUSSION">논의 중</option>
              <option value="WON">성사</option>
              <option value="LOST">실패</option>
            </select>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Search className="h-4 w-4" aria-hidden />
              검색
            </button>
          </form>

          {listQuery.isLoading ? <LoadingState /> : null}
          {listQuery.isError ? (
            <ErrorState
              message={getErrorMessage(listQuery.error)}
              onRetry={() => void listQuery.refetch()}
            />
          ) : null}
          {listQuery.data ? (
            <DomainTable
              columns={currentColumns}
              domain={domain}
              items={listQuery.data.items}
              selectedId={selectedId}
              onSelect={(targetId) =>
                setSelectedIdByDomain((current) => ({
                  ...current,
                  [domain]: targetId,
                }))
              }
            />
          ) : null}
          {listQuery.data && listQuery.data.items.length === 0 ? (
            <EmptyState message="조건에 맞는 데이터가 없습니다." />
          ) : null}
          {listQuery.data ? (
            <PaginationControls
              page={page}
              totalCount={listQuery.data.totalCount}
              hasNext={listQuery.data.hasNext}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : null}
        </section>

        <DomainDetailPanel
          domain={domain}
          detail={detailQuery.data ?? null}
          isError={detailQuery.isError}
          isLoading={detailQuery.isLoading}
          rawValues={rawValuesByTarget[rawTargetKey] ?? {}}
          selectedId={selectedId}
          onRequestRaw={(field, label) =>
            setRawDialogRequest({
              targetType: sensitiveTargetTypes[domain],
              targetId: selectedId,
              fields: [field],
              label,
            })
          }
          onRetry={() => void detailQuery.refetch()}
        />
      </div>

      {rawDialogRequest ? (
        <SensitiveRawDialog
          request={rawDialogRequest}
          onClose={() => setRawDialogRequest(null)}
          onSuccess={onRawSuccess}
        />
      ) : null}
    </section>
  );
}

type Column = {
  readonly key: string;
  readonly label: string;
  readonly render: (item: AdminDomainItem) => string;
};

function DomainTable({
  columns,
  domain,
  items,
  selectedId,
  onSelect,
}: {
  readonly columns: readonly Column[];
  readonly domain: AdminDomainType;
  readonly items: readonly AdminDomainItem[];
  readonly selectedId: string;
  readonly onSelect: (targetId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[640px]">
        <div
          className="grid gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <span key={column.key}>{column.label}</span>
          ))}
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "grid w-full gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedId === item.id ? "bg-primary/5" : "",
              ].join(" ")}
              style={{
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              }}
              onClick={() => onSelect(item.id)}
            >
              {columns.map((column) => (
                <span key={`${domain}:${item.id}:${column.key}`} className="truncate">
                  {column.render(item)}
                </span>
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainDetailPanel({
  domain,
  detail,
  isError,
  isLoading,
  rawValues,
  selectedId,
  onRequestRaw,
  onRetry,
}: {
  readonly domain: AdminDomainType;
  readonly detail: AdminDetailResponse | null;
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly rawValues: Record<string, string | null>;
  readonly selectedId: string;
  readonly onRequestRaw: (field: string, label: string) => void;
  readonly onRetry: () => void;
}) {
  if (!selectedId) {
    return (
      <aside className="grid min-h-[420px] min-w-0 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
        {domainLabels[domain]} 행을 선택하면 상세 요약을 확인할 수 있습니다.
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 content-start gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <Database className="h-5 w-5 text-primary" aria-hidden />
        <div>
          <h2 className="text-base font-semibold">{domainLabels[domain]} 상세</h2>
          <p className="mt-1 text-xs text-muted-foreground">{selectedId}</p>
        </div>
      </div>
      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <ErrorState message="상세 정보를 불러오지 못했습니다." onRetry={onRetry} />
      ) : null}
      {detail ? (
        <SensitiveFieldsPanel
          detail={detail}
          domain={domain}
          rawValues={rawValues}
          onRequestRaw={onRequestRaw}
        />
      ) : null}
      {detail ? <DetailSummary detail={detail} /> : null}
    </aside>
  );
}

function SensitiveFieldsPanel({
  detail,
  domain,
  rawValues,
  onRequestRaw,
}: {
  readonly detail: AdminDetailResponse;
  readonly domain: AdminDomainType;
  readonly rawValues: Record<string, string | null>;
  readonly onRequestRaw: (field: string, label: string) => void;
}) {
  const options = getSensitiveOptions(domain, detail);

  if (options.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <ShieldAlert className="h-4 w-4 text-amber-600" aria-hidden />
        민감 원문
      </div>
      {options.map((option) => {
        const hasRawValue = Object.prototype.hasOwnProperty.call(
          rawValues,
          option.field
        );

        return (
          <div
            key={option.field}
            className="grid gap-2 rounded-md border bg-white p-3 sm:grid-cols-[120px_1fr_auto] sm:items-center"
          >
            <div className="font-medium">{option.label}</div>
            <div className="min-w-0 break-words text-muted-foreground">
              {hasRawValue ? rawValues[option.field] ?? "원문 없음" : option.maskedValue}
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold hover:bg-muted"
              onClick={() => onRequestRaw(option.field, option.label)}
            >
              <Eye className="h-4 w-4" aria-hidden />
              원문 보기
            </button>
          </div>
        );
      })}
    </section>
  );
}

function DetailSummary({ detail }: { readonly detail: AdminDetailResponse }) {
  const entries = Object.entries(detail).filter(([key]) => key !== "recentLogs");

  return (
    <div className="grid gap-3 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-md border bg-muted/30 p-3">
          <div className="text-xs font-semibold text-muted-foreground">{key}</div>
          <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words font-sans text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}

type SensitiveOption = {
  readonly field: string;
  readonly label: string;
  readonly maskedValue: string;
};

function getSensitiveOptions(
  domain: AdminDomainType,
  detail: AdminDetailResponse
) {
  const options: SensitiveOption[] = [];

  if (
    domain === "contacts" &&
    detail.contact &&
    "phoneMasked" in detail.contact
  ) {
    options.push({
      field: "phone",
      label: "전화번호",
      maskedValue: detail.contact.phoneMasked ?? "마스킹됨",
    });
    options.push({
      field: "email",
      label: "이메일",
      maskedValue: detail.contact.emailMasked ?? "마스킹됨",
    });
  }

  if (domain === "products" && detail.product) {
    options.push({
      field: "unitPrice",
      label: "단가",
      maskedValue: detail.product.unitPriceMasked ?? "마스킹됨",
    });
  }

  if (domain === "deals" && detail.deal) {
    options.push({
      field: "amount",
      label: "금액",
      maskedValue: detail.deal.amountMasked ?? "마스킹됨",
    });
  }

  if (detail.memoSummary?.hasMemo) {
    options.push({
      field: "memo",
      label: "Memo 원문",
      maskedValue: `${detail.memoSummary.memoCount.toLocaleString()}개 기록`,
    });
  }

  return options;
}

function getColumns(domain: AdminDomainType): readonly Column[] {
  if (domain === "companies") {
    return [
      { key: "name", label: "회사", render: (item) => getText(item, "name") },
      { key: "owner", label: "소유자", render: (item) => getText(item, "userName") },
      { key: "industry", label: "분야", render: (item) => getText(item, "industry") },
      { key: "deletedAt", label: "삭제일", render: (item) => formatDate(item.deletedAt) },
    ];
  }

  if (domain === "contacts") {
    return [
      { key: "name", label: "이름", render: (item) => getText(item, "name") },
      { key: "company", label: "회사", render: (item) => getText(item, "companyName") },
      { key: "email", label: "이메일", render: (item) => getText(item, "emailMasked") },
      { key: "memo", label: "메모", render: (item) => getText(item, "memoCount") },
    ];
  }

  if (domain === "products") {
    return [
      { key: "name", label: "제품", render: (item) => getText(item, "name") },
      { key: "category", label: "분류", render: (item) => getText(item, "category") },
      { key: "price", label: "단가", render: (item) => getText(item, "unitPriceMasked") },
      { key: "deletedAt", label: "삭제일", render: (item) => formatDate(item.deletedAt) },
    ];
  }

  return [
    { key: "title", label: "딜", render: (item) => getText(item, "title") },
    { key: "company", label: "회사", render: (item) => getText(item, "companyName") },
    { key: "amount", label: "금액", render: (item) => getDealAmount(item) },
    { key: "stage", label: "단계", render: (item) => getText(item, "stage") },
  ];
}

function getText(item: AdminDomainItem, key: string) {
  const value = item[key as keyof AdminDomainItem];

  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function getDealAmount(item: AdminDomainItem) {
  const deal = item as AdminDeal;

  return `${deal.amountMasked ?? "-"} ${deal.currency ?? ""}`.trim();
}

function getRawTargetKey(domain: AdminDomainType, targetId: string) {
  return `${domain}:${targetId}`;
}
