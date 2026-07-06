import { Outlet, useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  FileText,
  House,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  type LucideIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import { SearchModal } from "@/features/search";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useDealDetail } from "@/features/deal/hooks/use-deal-detail";
import { useDeleteDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import { useProductDetail } from "@/features/product/hooks/use-product-detail";
import { useDeleteProductMutation } from "@/features/product/hooks/use-product-mutations";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api-client";
import { SettingsPage } from "@/pages/settings";

const HOME_PATH = "/app";

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
      void navigate("/app/deals", {
        replace: true,
        state: { notice: "딜을 삭제했어요." },
      });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "딜", to: "/app/deals", icon: BriefcaseBusiness },
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
          cancelLabel="닫기"
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
      isEditing ? `/app/products/${productId}` : `/app/products/${productId}?edit=1`,
      { replace: true },
    );
  };

  const onDelete = async () => {
    setDeleteError(null);
    try {
      await deleteProductMutation.mutateAsync(productId);
      setDeleteConfirmOpen(false);
      void navigate("/app/products", {
        replace: true,
        state: { notice: "제품을 삭제했어요." },
      });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "제품", to: "/app/products", icon: Package },
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
          cancelLabel="닫기"
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
  const navigate = useNavigate();
  const { logout, user } = useAuthSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountModal, setAccountModal] = useState<
    "settings" | "terms" | "privacy" | null
  >(
    null,
  );
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isHome = pathname === HOME_PATH;
  const userName = user?.name ?? user?.email?.split("@")[0] ?? "사용자";
  const userSubtitle =
    user?.email ?? (user?.role === "ADMIN" ? "Admin" : "Sales Manager");
  const userInitial = getUserInitial(userName);

  const handleLogout = async () => {
    await logout();
    void navigate("/");
  };

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

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    setAccountMenuOpen(false);
    setAccountModal(null);
    setLogoutConfirmOpen(false);
  }, [pathname]);

  // /app/products/:id 패턴 감지
  const productDetailMatch = /^\/app\/products\/([^/]+)$/.exec(pathname);
  const productDetailId = productDetailMatch
    ? (productDetailMatch[1] ?? "")
    : "";
  const isProductDetail =
    productDetailId.length > 0 && productDetailId !== "new";

  // /app/deals/:id 패턴 감지
  const dealDetailMatch = /^\/app\/deals\/([^/]+)$/.exec(pathname);
  const dealDetailId = dealDetailMatch ? (dealDetailMatch[1] ?? "") : "";
  const isDealDetail = dealDetailId.length > 0 && dealDetailId !== "new";

  // /app/companies/:id 패턴 감지
  const companyDetailMatch = /^\/app\/companies\/([^/]+)$/.exec(pathname);
  const companyDetailId = companyDetailMatch
    ? (companyDetailMatch[1] ?? "")
    : "";
  const isCompanyDetail =
    companyDetailId.length > 0 && companyDetailId !== "new";

  // /app/contacts/:id 패턴 감지
  const contactDetailMatch = /^\/app\/contacts\/([^/]+)$/.exec(pathname);
  const contactDetailId = contactDetailMatch
    ? (contactDetailMatch[1] ?? "")
    : "";
  const isContactDetail =
    contactDetailId.length > 0 && contactDetailId !== "scan";

  // 자체 헤더를 가진 화면들 — app-shell TopBar 숨김
  const isDealListPage = pathname === "/app/deals" || pathname === "/app/deals/new";
  const isProductListPage =
    pathname === "/app/products" || pathname === "/app/products/new";
  const isCompanyListPage =
    pathname === "/app/companies" ||
    pathname === "/app/companies/new" ||
    isCompanyDetail ||
    isContactDetail;
  const isContactListPage = pathname === "/app/contacts";
  const isMeetingNoteListPage =
    pathname === "/app/meeting-notes" || /^\/app\/meeting-notes\/[^/]+$/.test(pathname);
  const isSchedulePage =
    pathname === "/app/schedules" || pathname === "/app/schedules/week";
  const isTrashPage = pathname === "/app/trash";
  const isBusinessCardPage = pathname === "/app/business-cards";
  const isImportPage = pathname === "/app/import";
  const isImportDetailPage = /^\/app\/import\/[^/]+$/.test(pathname);
  const isFixedViewportPage = isHome || isProductDetail;

  // 모바일 헤더 숨김 처리: 상세 페이지 및 자체 헤더 보유 페이지
  const isMeetingNoteDetail = /^\/app\/meeting-notes\/[^/]+$/.test(pathname);
  const isScheduleRoute =
    pathname === "/app/schedules" || pathname === "/app/schedules/week";
  const isMobileHeaderHidden =
    isDealDetail ||
    isCompanyDetail ||
    isContactDetail ||
    isProductDetail ||
    isMeetingNoteDetail ||
    isImportDetailPage ||
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
    isImportDetailPage ||
    isProductDetail;

  // 현재 페이지 브레드크럼 결정
  const topBarContent = (() => {
    if (isProductDetail)
      return <ProductDetailHeader productId={productDetailId} />;
    if (isDealDetail) return <DealDetailHeader dealId={dealDetailId} />;

    type PageMeta = { label: string; icon: typeof House };
    const pageMetaMap: Record<string, PageMeta> = {
      "/app": { label: "홈", icon: House },
      "/app/deals": { label: "딜", icon: BriefcaseBusiness },
      "/app/deals/new": { label: "딜", icon: BriefcaseBusiness },
      "/app/schedules": { label: "일정", icon: CalendarDays },
      "/app/trash": { label: "휴지통", icon: Trash2 },
      "/app/settings": { label: "설정", icon: Settings },
    };
    const meta = pageMetaMap[pathname] ?? { label: "한손에 영업", icon: House };
    const actions =
      pathname === "/app/deals" || pathname === "/app"
        ? [
            {
              icon: Plus,
              tooltip: "딜 생성",
              href: "/app/deals/new",
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
          <div className="relative px-2 pb-2 pt-1" ref={accountMenuRef}>
            {accountMenuOpen ? (
              <div className="absolute bottom-[64px] left-2 right-2">
                <div
                  className="overflow-hidden rounded-xl bg-white p-1.5 text-[#111827] shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
                  role="menu"
                >
                  <AccountMenuItem
                    icon={Trash2}
                    label="휴지통"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      void navigate("/app/trash");
                    }}
                  />
                  <AccountMenuItem
                    icon={Settings}
                    label="설정"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setAccountModal("settings");
                    }}
                  />
                  <div className="mx-2 my-1.5 h-px bg-[#E9ECF2]" />
                  <AccountMenuItem
                    icon={CircleHelp}
                    label="도움말"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setAccountModal("terms");
                    }}
                  />
                  <AccountMenuItem
                    icon={LogOut}
                    label="로그아웃"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                  />
                </div>
              </div>
            ) : null}

            <button
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              className="flex h-12 w-full items-center gap-2.5 rounded-xl px-2 text-left transition hover:bg-[#E9EBF0] data-[open=true]:bg-[#EEF4FF]"
              data-open={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
              type="button"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4880EE] text-[11px] font-semibold text-white">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#111827]">
                  {userName}
                </p>
                <p className="truncate text-[11px] text-[#9CA3AF]">
                  {userSubtitle}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
            </button>
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

      {accountModal ? (
        <AccountModal onClose={() => setAccountModal(null)} title="계정">
          <AccountModalContent
            section={accountModal}
            onSectionChange={setAccountModal}
          />
        </AccountModal>
      ) : null}

      <LogoutConfirmModal
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          void handleLogout();
        }}
        open={logoutConfirmOpen}
        userInitial={userInitial}
        userMeta={user?.email ?? userSubtitle}
        userName={userName}
      />

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

function AccountMenuItem({
  endIcon: EndIcon,
  icon: Icon,
  label,
  onClick,
}: {
  readonly endIcon?: LucideIcon;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] font-medium text-[#374151] transition hover:bg-[#F3F6FB]"
      onClick={onClick}
      role="menuitem"
      type="button"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {EndIcon ? (
        <EndIcon className="h-4 w-4 shrink-0 text-[#9CA3AF]" strokeWidth={1.75} />
      ) : null}
    </button>
  );
}

function LogoutConfirmModal({
  onCancel,
  onConfirm,
  open,
  userInitial,
  userMeta,
  userName,
}: {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly open: boolean;
  readonly userInitial: string;
  readonly userMeta: string;
  readonly userName: string;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 px-4 py-6"
      onMouseDown={onCancel}
    >
      <section
        aria-modal="true"
        className="w-full max-w-[360px] rounded-xl bg-white px-6 py-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2 className="text-[22px] font-bold leading-tight text-[#111827]">
          정말 로그아웃하시겠습니까?
        </h2>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3 shadow-[inset_0_0_0_1px_#E2E8F0]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4880EE] text-[12px] font-semibold text-white">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#111827]">
              {userName}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
              {userMeta}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <button
            className="h-11 rounded-full bg-[#4880EE] px-4 text-[13px] font-semibold text-white transition hover:bg-[#3268D6]"
            onClick={onConfirm}
            type="button"
          >
            로그아웃
          </button>
          <button
            className="h-11 rounded-full bg-[#F8FAFC] px-4 text-[13px] font-semibold text-[#374151] shadow-[inset_0_0_0_1px_#E2E8F0] transition hover:bg-[#F1F5F9]"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
        </div>
      </section>
    </div>
  );
}

type AccountModalSection = "settings" | "terms" | "privacy";

function AccountModal({
  children,
  onClose,
  title,
}: {
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly title: string;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-6"
      onMouseDown={onClose}
    >
      <section
        aria-modal="true"
        className="max-h-full w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex h-14 items-center justify-between gap-3 px-5">
          <h2 className="truncate text-[15px] font-semibold text-[#111827]">
            {title}
          </h2>
          <button
            aria-label="닫기"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#F3F6FB] hover:text-[#111827]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>
        <div className="px-5 pb-5">{children}</div>
      </section>
    </div>
  );
}

const accountModalItems: Array<{
  readonly icon: LucideIcon;
  readonly label: string;
  readonly section: AccountModalSection;
}> = [
  { icon: Settings, label: "설정", section: "settings" },
  { icon: FileText, label: "이용약관", section: "terms" },
  { icon: ShieldCheck, label: "개인정보", section: "privacy" },
];

function AccountModalContent({
  onSectionChange,
  section,
}: {
  readonly onSectionChange: (section: AccountModalSection) => void;
  readonly section: AccountModalSection;
}) {
  return (
    <div className="grid h-[min(76vh,720px)] overflow-hidden rounded-lg bg-[#FAFAF8] md:grid-cols-[176px_minmax(0,1fr)]">
      <aside className="bg-white p-2">
        <nav className="grid gap-1">
          {accountModalItems.map((item) => (
            <AccountModalSidebarItem
              active={section === item.section}
              icon={item.icon}
              key={item.section}
              label={item.label}
              onClick={() => onSectionChange(item.section)}
            />
          ))}
        </nav>
      </aside>

      <div className="min-h-0 overflow-y-auto">
        {section === "settings" ? (
          <SettingsPage />
        ) : (
          <AccountLegalDocument section={section} />
        )}
      </div>
    </div>
  );
}

function AccountModalSidebarItem({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={`flex h-10 items-center gap-2 rounded-lg px-3 text-left text-[13px] font-medium transition ${
        active
          ? "bg-[#EAF2FF] text-[#1D4ED8]"
          : "text-[#64748B] hover:bg-[#F3F6FB] hover:text-[#111827]"
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function AccountLegalDocument({
  section,
}: {
  readonly section: Exclude<AccountModalSection, "settings">;
}) {
  const document =
    section === "terms"
      ? {
          description: "서비스 이용 조건과 계정 사용 기준을 확인하는 문서입니다.",
          icon: FileText,
          title: "이용 약관",
        }
      : {
          description: "개인정보 수집, 이용, 보관 기준을 확인하는 문서입니다.",
          icon: ShieldCheck,
          title: "개인정보 처리방침",
        };
  const Icon = document.icon;

  return (
    <section className="min-h-full bg-[#FAFAF8] px-5 py-6">
      <article className="rounded-lg bg-white px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] text-[#1D4ED8]">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold text-[#111827]">
              {document.title}
            </h3>
            <p className="mt-1 text-[13px] leading-5 text-[#64748B]">
              {document.description}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-[#F8FAFC] px-4 py-4">
          <p className="text-[13px] leading-6 text-[#475569]">
            정식 문서가 확정되면 이 영역에 상세 내용이 반영됩니다.
          </p>
        </div>
      </article>
    </section>
  );
}

function getUserInitial(name: string) {
  const trimmed = name.trim();

  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}
