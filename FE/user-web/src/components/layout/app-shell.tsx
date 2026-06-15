import { Outlet, useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import {
  Bell,
  ChevronLeft,
  Download,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, type NavigateFunction, useNavigate } from "react-router-dom";
import { GlobalSearch } from "@/features/search";
import { useDealDetail } from "@/features/deal/hooks/use-deal-detail";
import { useProductDetail } from "@/features/product/hooks/use-product-detail";

const PAGE_TITLES: Record<string, { title: string }> = {
  "/": { title: "홈" },
  "/deals": { title: "딜" },
  "/companies": { title: "회사" },
  "/contacts": { title: "거래처" },
  "/products": { title: "제품" },
  "/schedules": { title: "일정" },
  "/meeting-notes": { title: "회의록" },
  "/notifications": { title: "알림" },
  "/settings": { title: "설정" },
};

const HOME_PATH = "/";

function DealDetailTopBar({ dealId }: { readonly dealId: string }) {
  const dealQuery = useDealDetail(dealId);
  const dealName = dealQuery.data?.dealName ?? "...";

  return (
    <div className="flex min-w-0 shrink items-center gap-1.5">
      <Link
        className="mr-1 shrink-0 text-[#9CA3AF] hover:text-[#374151]"
        to="/deals"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <Link
        className="shrink-0 text-[13px] text-[#6B7280] hover:text-[#374151]"
        to="/deals"
      >
        딜
      </Link>
      <span className="text-[13px] text-[#D1D5DB]">/</span>
      <span className="truncate text-[13px] font-semibold text-[#111827]">
        {dealName}
      </span>
    </div>
  );
}

function ProductDetailTopBar({ productId }: { readonly productId: string }) {
  const productQuery = useProductDetail(productId);
  const productName = productQuery.data?.productName ?? "...";

  return (
    <div className="flex min-w-0 shrink items-center gap-1.5">
      <Link
        className="mr-1 shrink-0 text-[#9CA3AF] hover:text-[#374151]"
        to="/products"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <Link
        className="shrink-0 text-[13px] text-[#6B7280] hover:text-[#374151]"
        to="/products"
      >
        제품
      </Link>
      <span className="text-[13px] text-[#D1D5DB]">/</span>
      <span className="truncate text-[13px] font-semibold text-[#111827]">
        {productName}
      </span>
    </div>
  );
}

function ProductDetailActions({ productId }: { readonly productId: string }) {
  const navigate = useNavigate();
  const { search: locationSearch } = useLocation();
  const isEditing = new URLSearchParams(locationSearch).get("edit") === "1";

  const toggleEdit = () => {
    void navigate(
      isEditing ? `/products/${productId}` : `/products/${productId}?edit=1`,
      { replace: true },
    );
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3.5 text-[13px] font-medium text-red-700 transition hover:bg-red-50"
        type="button"
      >
        <Trash2 className="h-3.5 w-3.5" />
        삭제
      </button>
      <button
        className="inline-flex h-9 items-center rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB]"
        onClick={toggleEdit}
        type="button"
      >
        {isEditing ? "취소" : "수정"}
      </button>
    </div>
  );
}

function HeaderSearch({
  isProducts,
  productSearch,
  setProductSearch,
  onProductSearchSubmit,
}: {
  readonly isProducts: boolean;
  readonly productSearch: string;
  readonly setProductSearch: (value: string) => void;
  readonly onProductSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (isProducts) {
    return (
      <form
        className="relative w-[300px] shrink-0"
        onSubmit={onProductSearchSubmit}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          className="h-10 w-full rounded-lg border border-[#E6EAF0] bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-[#9CA3AF] focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="제품 검색..."
          value={productSearch}
        />
      </form>
    );
  }

  return (
    <div className="w-[320px] shrink-0">
      <GlobalSearch />
    </div>
  );
}

function HeaderActions({
  isProducts,
  navigate,
}: {
  readonly isProducts: boolean;
  readonly navigate: NavigateFunction;
}) {
  if (isProducts) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 text-[13px] font-bold text-white transition hover:bg-[#1E40AF]"
          onClick={() => void navigate("/products?action=create")}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          제품 추가
        </button>
        <button
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-gray-50"
          onClick={() => void navigate("/products?action=export")}
          type="button"
        >
          <Download className="h-3.5 w-3.5" />
          내보내기
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1E40AF]"
        to="/deals/new"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        새 딜
      </Link>
      <button
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#374151] transition hover:bg-gray-50"
        type="button"
      >
        <Download className="h-3.5 w-3.5" />
        내보내기
      </button>
    </div>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === HOME_PATH;
  const isProducts = pathname === "/products";
  const isDeals = pathname === "/deals";

  // /products/:id 패턴 감지
  const productDetailMatch = /^\/products\/([^/]+)$/.exec(pathname);
  const productDetailId = productDetailMatch
    ? (productDetailMatch[1] ?? "")
    : "";
  const isProductDetail = productDetailId.length > 0;

  // /deals/:id 패턴 감지
  const dealDetailMatch = /^\/deals\/([^/]+)$/.exec(pathname);
  const dealDetailId = dealDetailMatch ? (dealDetailMatch[1] ?? "") : "";
  const isDealDetail = dealDetailId.length > 0;

  const page = PAGE_TITLES[pathname] ?? { title: "한손에 영업" };
  const [productSearch, setProductSearch] = useState("");

  const onProductSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params2 = new URLSearchParams();
    if (productSearch.trim()) params2.set("q", productSearch.trim());
    void navigate({ pathname: "/products", search: params2.toString() });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Desktop Shell ── */}
      <div className="hidden min-h-screen md:flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white shadow-md">
              한
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold leading-tight tracking-[-0.02em] text-sidebar-foreground">
                한손에 영업
              </p>
              <p className="text-[11px] text-sidebar-foreground/45">
                onehand.sales
              </p>
            </div>
          </div>
          <div className="mx-5 h-px bg-sidebar-border" />
          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav />
          </div>
          <div className="mx-5 h-px bg-sidebar-border" />
          {/* User profile */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-semibold text-primary">
              강
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                강변범
              </p>
              <p className="text-[11px] text-sidebar-foreground/45">
                Store Manager
              </p>
            </div>
            <Link
              aria-label="알림"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              to="/notifications"
            >
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col pl-[var(--sidebar-width)]">
          {/* TopBar */}
          <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-border bg-white px-6">
            {isProductDetail ? (
              <ProductDetailTopBar productId={productDetailId} />
            ) : isDealDetail ? (
              <DealDetailTopBar dealId={dealDetailId} />
            ) : (
              <div className="shrink-0">
                <h1 className="text-[18px] font-bold leading-tight tracking-[-0.02em] text-[#111827]">
                  {page.title}
                </h1>
              </div>
            )}

            <div className="flex-1" />

            <HeaderSearch
              isProducts={isProducts}
              onProductSearchSubmit={onProductSearchSubmit}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
            />

            {isProductDetail ? (
              <ProductDetailActions productId={productDetailId} />
            ) : isDealDetail ? null : (
              <HeaderActions isProducts={isProducts} navigate={navigate} />
            )}
          </header>

          <main
            className={
              isHome || isProductDetail || isDeals
                ? "flex flex-1 flex-col overflow-hidden"
                : "min-h-[calc(100vh-var(--topbar-height))]"
            }
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile Shell ── */}
      <div className="min-h-screen md:hidden">
        {isHome ? <MobileAppHeader title="홈" /> : null}
        <main className="pb-[calc(var(--mobile-tabbar-height,4rem)+1.5rem)]">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
