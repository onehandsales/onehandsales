import { Outlet, useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import {
  BriefcaseBusiness,
  CalendarDays,
  House,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchModal } from "@/features/search";
import { useEffect, useState } from "react";
import { useDealDetail } from "@/features/deal/hooks/use-deal-detail";
import { useDeleteDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import { useProductDetail } from "@/features/product/hooks/use-product-detail";
import { useDeleteProductMutation } from "@/features/product/hooks/use-product-mutations";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api-client";

const HOME_PATH = "/";

// ── 딜 상세 TopBar ──────────────────────────────────────────
function DealDetailHeader({ dealId }: { readonly dealId: string }) {
  const navigate = useNavigate();
  const dealQuery = useDealDetail(dealId);
  const deleteDealMutation = useDeleteDealMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const dealName = dealQuery.data?.dealName ?? "...";

  const onDelete = async () => {
    setDeleteError(null);
    try {
      await deleteDealMutation.mutateAsync(dealId);
      setDeleteConfirmOpen(false);
      void navigate("/deals", {
        replace: true,
        state: { notice: "딜이 삭제되었습니다." },
      });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "딜", to: "/deals", icon: BriefcaseBusiness },
          { label: dealName },
        ]}
        actions={[
          {
            icon: Trash2,
            tooltip: "삭제",
            variant: "danger",
            disabled: deleteDealMutation.isPending,
            onClick: () => {
              setDeleteError(null);
              setDeleteConfirmOpen(true);
            },
          },
        ]}
      />
      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="삭제"
        errorMessage={deleteError}
        isPending={deleteDealMutation.isPending}
        onCancel={() => {
          if (!deleteDealMutation.isPending) {
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={() => void onDelete()}
        open={deleteConfirmOpen}
        title={`${dealQuery.data?.dealName ?? "딜"} 딜을 삭제할까요?`}
      />
    </>
  );
}

// ── 제품 상세 TopBar ─────────────────────────────────────────
function ProductDetailHeader({ productId }: { readonly productId: string }) {
  const navigate = useNavigate();
  const { search: locationSearch } = useLocation();
  const productQuery = useProductDetail(productId);
  const deleteProductMutation = useDeleteProductMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const productName = productQuery.data?.productName ?? "...";
  const isEditing = new URLSearchParams(locationSearch).get("edit") === "1";

  const toggleEdit = () => {
    void navigate(
      isEditing ? `/products/${productId}` : `/products/${productId}?edit=1`,
      { replace: true },
    );
  };

  const onDelete = async () => {
    setDeleteError(null);
    try {
      await deleteProductMutation.mutateAsync(productId);
      setDeleteConfirmOpen(false);
      void navigate("/products", {
        replace: true,
        state: { notice: "제품이 삭제되었습니다." },
      });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "제품", to: "/products", icon: Package },
          { label: productName },
        ]}
        actions={[
          {
            icon: isEditing ? X : Pencil,
            tooltip: isEditing ? "수정 취소" : "수정",
            onClick: toggleEdit,
          },
          {
            icon: Trash2,
            tooltip: "삭제",
            variant: "danger",
            disabled: deleteProductMutation.isPending,
            onClick: () => {
              setDeleteError(null);
              setDeleteConfirmOpen(true);
            },
          },
        ]}
      />
      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="삭제"
        errorMessage={deleteError}
        isPending={deleteProductMutation.isPending}
        onCancel={() => {
          if (!deleteProductMutation.isPending) {
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={() => void onDelete()}
        open={deleteConfirmOpen}
        title={`${productQuery.data?.productName ?? "제품"} 제품을 삭제할까요?`}
      />
    </>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = pathname === HOME_PATH;

  // ⌘K / Ctrl+K 단축키로 검색 모달 열기
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // /products/:id 패턴 감지
  const productDetailMatch = /^\/products\/([^/]+)$/.exec(pathname);
  const productDetailId = productDetailMatch
    ? (productDetailMatch[1] ?? "")
    : "";
  const isProductDetail =
    productDetailId.length > 0 && productDetailId !== "new";

  // /deals/:id 패턴 감지
  const dealDetailMatch = /^\/deals\/([^/]+)$/.exec(pathname);
  const dealDetailId = dealDetailMatch ? (dealDetailMatch[1] ?? "") : "";
  const isDealDetail = dealDetailId.length > 0 && dealDetailId !== "new";

  // /companies/:id 패턴 감지
  const companyDetailMatch = /^\/companies\/([^/]+)$/.exec(pathname);
  const companyDetailId = companyDetailMatch
    ? (companyDetailMatch[1] ?? "")
    : "";
  const isCompanyDetail =
    companyDetailId.length > 0 && companyDetailId !== "new";

  // /contacts/:id 패턴 감지
  const contactDetailMatch = /^\/contacts\/([^/]+)$/.exec(pathname);
  const contactDetailId = contactDetailMatch
    ? (contactDetailMatch[1] ?? "")
    : "";
  const isContactDetail =
    contactDetailId.length > 0 && contactDetailId !== "scan";

  // 자체 헤더를 가진 화면들 — app-shell TopBar 숨김
  const isDealListPage = pathname === "/deals" || pathname === "/deals/new";
  const isProductListPage =
    pathname === "/products" || pathname === "/products/new";
  const isCompanyListPage =
    pathname === "/companies" ||
    pathname === "/companies/new" ||
    isCompanyDetail ||
    isContactDetail;
  const isContactListPage = pathname === "/contacts";
  const isMeetingNoteListPage =
    pathname === "/meeting-notes" || /^\/meeting-notes\/[^/]+$/.test(pathname);
  const isSchedulePage =
    pathname === "/schedules" || pathname === "/schedules/week";
  const isTrashPage = pathname === "/trash";
  const isBusinessCardPage = pathname === "/business-cards";
  const isImportPage = pathname === "/import";
  const isFixedViewportPage = isHome || isProductDetail;

  // 모바일 헤더 숨김 처리: 상세 페이지 및 자체 헤더 보유 페이지
  const isMeetingNoteDetail = /^\/meeting-notes\/[^/]+$/.test(pathname);
  const isScheduleRoute =
    pathname === "/schedules" || pathname === "/schedules/week";
  const isMobileHeaderHidden =
    isDealDetail ||
    isCompanyDetail ||
    isContactDetail ||
    isProductDetail ||
    isMeetingNoteDetail ||
    isScheduleRoute;

  const hideTopBar =
    isDealListPage ||
    isDealDetail ||
    isCompanyListPage ||
    isProductListPage ||
    isContactListPage ||
    isMeetingNoteListPage ||
    isSchedulePage ||
    isTrashPage ||
    isBusinessCardPage ||
    isImportPage ||
    isProductDetail;

  // 현재 페이지 브레드크럼 결정
  const topBarContent = (() => {
    if (isProductDetail)
      return <ProductDetailHeader productId={productDetailId} />;
    if (isDealDetail) return <DealDetailHeader dealId={dealDetailId} />;

    type PageMeta = { label: string; icon: typeof House };
    const pageMetaMap: Record<string, PageMeta> = {
      "/": { label: "홈", icon: House },
      "/deals": { label: "딜", icon: BriefcaseBusiness },
      "/deals/new": { label: "딜", icon: BriefcaseBusiness },
      "/schedules": { label: "일정", icon: CalendarDays },
      "/trash": { label: "휴지통", icon: Trash2 },
      "/settings": { label: "설정", icon: Settings },
    };
    const meta = pageMetaMap[pathname] ?? { label: "한손에 영업", icon: House };
    const actions =
      pathname === "/deals" || pathname === "/"
        ? [
            {
              icon: Plus,
              tooltip: "새 딜 추가",
              href: "/deals/new",
              variant: "primary" as const,
            },
          ]
        : [];
    return (
      <PageHeader
        breadcrumbs={[{ label: meta.label, icon: meta.icon }]}
        actions={actions}
      />
    );
  })();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Desktop Shell ── */}
      <div className="hidden min-h-dvh md:flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col bg-sidebar">
          {/* Brand */}
          <div className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2.5 px-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4880EE] text-[12px] font-bold text-white">
              한
            </div>
            <span className="text-[14px] font-semibold text-[#111827]">
              한손에 영업
            </span>
          </div>
          <div className="h-px bg-transparent" />
          {/* Search button */}
          <div className="px-2 pb-1">
            <button
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] text-[#9CA3AF] transition hover:bg-[#E9EBF0] hover:text-[#374151]"
              onClick={() => setSearchOpen(true)}
            >
              <Search
                className="h-[15px] w-[15px] shrink-0"
                strokeWidth={1.75}
              />
              <span>검색</span>
              <kbd className="ml-auto hidden rounded border border-[#E2E5EC] bg-[#F0F1F3] px-1 py-0.5 text-[10px] font-medium leading-none sm:block">
                ⌘K
              </kbd>
            </button>
          </div>
          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-2 py-1">
            <SidebarNav />
          </div>
          <div className="h-px bg-transparent" />
          {/* User profile */}
          <div className="flex items-center gap-2.5 px-3 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4880EE] text-[11px] font-semibold text-white">
              김
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[#111827]">
                김영업
              </p>
              <p className="text-[11px] text-[#9CA3AF]">Sales Manager</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col pl-[var(--sidebar-width)]">
          {/* TopBar */}
          {!hideTopBar ? (
            <div className="sticky top-0 z-20 bg-[#FAFAF8]">
              {topBarContent}
            </div>
          ) : null}

          <main
            className={
              isFixedViewportPage
                ? "flex min-h-[calc(100dvh-var(--topbar-height))] flex-col"
                : hideTopBar
                  ? "min-h-dvh"
                  : "min-h-[calc(100dvh-var(--topbar-height))]"
            }
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Mobile Shell ── */}
      <div className="min-h-dvh md:hidden">
        {!isMobileHeaderHidden ? (
          <MobileAppHeader onSearchClick={() => setSearchOpen(true)} />
        ) : null}
        <main className="pb-24">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
