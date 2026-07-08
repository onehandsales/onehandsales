import { Outlet, useLocation } from "react-router-dom";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";
import { MobileAppHeader } from "@/components/navigation/mobile-app-header";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  FileText,
  House,
  Laptop,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
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
import { useMyDevices, useMyProfile } from "@/features/auth/hooks/use-user-settings";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api-client";

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
    "profile" | "settings" | "terms" | "privacy" | null
  >(
    null,
  );
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [onehandAppOpen, setOnehandAppOpen] = useState(true);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isHome = pathname === HOME_PATH;
  const userName = user?.name ?? user?.email?.split("@")[0] ?? "사용자";
  const userEmail = user?.email ?? "로그인된 이메일 없음";
  const accountSubtitle = user?.role === "ADMIN" ? "Admin" : "무료 요금제";
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

  const accountProfile = (
    <div className="relative px-2 pb-1 pt-2" ref={accountMenuRef}>
      {accountMenuOpen ? (
        <div className="absolute left-2 right-2 top-[calc(100%+4px)] z-50">
          <div
            className="overflow-hidden rounded-xl bg-white p-2 text-[#111827] shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
            role="menu"
          >
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6C445] text-[13px] font-semibold text-white">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#111827]">
                  {userName}
                </p>
                <p className="truncate text-[11px] text-[#6B7280]">
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="mx-1 my-1.5 h-px bg-[#E9ECF2]" />
            <AccountMenuItem
              icon={Settings}
              label="설정"
              onClick={() => {
                setAccountMenuOpen(false);
                setAccountModal("profile");
              }}
            />
            <div className="mx-1 my-1.5 h-px bg-[#E9ECF2]" />
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
            {accountSubtitle}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
      </button>
    </div>
  );

  const sidebarAppLinks = (
    <div className="mt-3">
      <button
        aria-expanded={onehandAppOpen}
        className="mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[11px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E9EBF0] hover:text-[#6B7280]"
        onClick={() => setOnehandAppOpen((open) => !open)}
        type="button"
      >
        <ChevronRight
          className={`h-3 w-3 shrink-0 transition-transform ${
            onehandAppOpen ? "rotate-90" : "rotate-0"
          }`}
          strokeWidth={2}
        />
        <span>Onehand 앱</span>
      </button>
      {onehandAppOpen ? (
        <div className="flex flex-col gap-px">
          <button
            aria-current={isTrashPage ? "page" : undefined}
            className={`group flex h-8 items-center gap-2.5 rounded-md px-2 text-left text-[13px] font-medium transition-colors ${
              isTrashPage
                ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                : "text-[#4B5563] hover:bg-[#E9EBF0] hover:text-[#111827]"
            }`}
            onClick={() => void navigate("/app/trash")}
            type="button"
          >
            <Trash2
              className={`h-[15px] w-[15px] shrink-0 ${
                isTrashPage ? "text-[#4880EE]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
              }`}
              strokeWidth={1.75}
            />
            <span>휴지통</span>
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Desktop Shell ── */}
      <div className="hidden min-h-dvh md:flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col bg-sidebar">
          {accountProfile}
          {/* Search button */}
          <div className="flex gap-1 px-2 pb-1">
            <button
              aria-label="홈"
              className={`flex h-8 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] transition ${
                isHome
                  ? "bg-[#EFF6FF] text-[#4880EE]"
                  : "text-[#9CA3AF] hover:bg-[#E9EBF0] hover:text-[#374151]"
              }`}
              onClick={() => void navigate(HOME_PATH)}
              type="button"
            >
              <House
                className="h-[15px] w-[15px] shrink-0"
                strokeWidth={1.75}
              />
              <span>홈</span>
            </button>
            <button
              type="button"
              className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-[13px] text-[#9CA3AF] transition hover:bg-[#E9EBF0] hover:text-[#374151]"
              onClick={() => setSearchOpen(true)}
            >
              <Search
                className="h-[15px] w-[15px] shrink-0"
                strokeWidth={1.75}
              />
              <span>통합검색</span>
              <kbd className="ml-auto hidden rounded border border-[#E2E5EC] bg-[#F0F1F3] px-1 py-0.5 text-[10px] font-medium leading-none sm:block">
                ⌘K
              </kbd>
            </button>
          </div>
          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-2 py-1">
            <SidebarNav />
            {sidebarAppLinks}
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col pl-[var(--sidebar-width)]">
          {/* TopBar */}
          {!hideTopBar ? (
            <div className="sticky top-0 z-20 bg-white">
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
        <AccountModal onClose={() => setAccountModal(null)}>
          <AccountModalContent
            onClose={() => setAccountModal(null)}
            profileLabel={userName}
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
        userMeta={accountSubtitle}
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

type AccountModalSection = "profile" | "settings" | "terms" | "privacy";

function AccountModal({
  children,
  onClose,
}: {
  readonly children: ReactNode;
  readonly onClose: () => void;
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
        {children}
      </section>
    </div>
  );
}

function AccountModalContent({
  onClose,
  profileLabel,
  onSectionChange,
  section,
}: {
  readonly onClose: () => void;
  readonly profileLabel: string;
  readonly onSectionChange: (section: AccountModalSection) => void;
  readonly section: AccountModalSection;
}) {
  const accountModalItems: Array<{
    readonly icon: LucideIcon;
    readonly label: string;
    readonly section: AccountModalSection;
  }> = [
    { icon: UserRound, label: profileLabel, section: "profile" },
    { icon: Settings, label: "설정", section: "settings" },
    { icon: FileText, label: "이용약관", section: "terms" },
    { icon: ShieldCheck, label: "개인정보", section: "privacy" },
  ];

  return (
    <div className="grid h-[min(76vh,720px)] overflow-hidden bg-white md:grid-cols-[176px_minmax(0,1fr)]">
      <aside className="bg-sidebar p-2 pt-4">
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

      <div className="relative min-h-0 bg-white">
        <button
          aria-label="닫기"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#F3F6FB] hover:text-[#111827]"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
        <div className="h-full min-h-0 overflow-y-auto">
          <AccountModalSectionContent section={section} />
        </div>
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

function AccountModalSectionContent({
  section,
}: {
  readonly section: AccountModalSection;
}) {
  const profileQuery = useMyProfile();
  const devicesQuery = useMyDevices();

  if (section === "profile") {
    return (
      <ProfileModalContent
        devices={devicesQuery.data?.devices ?? []}
        devicesError={devicesQuery.error}
        isDevicesLoading={devicesQuery.isLoading}
        isProfileLoading={profileQuery.isLoading}
        onRetryDevices={() => void devicesQuery.refetch()}
        onRetryProfile={() => void profileQuery.refetch()}
        profile={profileQuery.data ?? null}
        profileError={profileQuery.error}
      />
    );
  }

  const content: Record<
    Exclude<AccountModalSection, "profile">,
    {
      readonly body: string;
      readonly eyebrow: string;
      readonly icon: LucideIcon;
      readonly title: string;
    }
  > = {
    settings: {
      body: "워크스페이스 표시 방식, 알림, 개인 환경 설정은 이 영역에서 관리합니다. 현재는 기본 설정 구조만 준비되어 있으며 세부 옵션은 서비스 정책에 맞춰 추가됩니다.",
      eyebrow: "Settings",
      icon: Settings,
      title: "설정",
    },
    terms: {
      body: "Onehand 이용 조건, 계정 사용 기준, 서비스 제한 사항을 안내하는 영역입니다. 정식 약관 문서가 확정되면 이곳에 핵심 내용을 요약해 표시합니다.",
      eyebrow: "Terms",
      icon: FileText,
      title: "이용약관",
    },
    privacy: {
      body: "개인정보 수집, 이용, 보관, 삭제 기준을 안내하는 영역입니다. 개인정보 처리방침 문서와 연결되는 핵심 내용을 이곳에서 확인할 수 있게 됩니다.",
      eyebrow: "Privacy",
      icon: ShieldCheck,
      title: "개인정보",
    },
  };
  const selected = content[section];
  const Icon = selected.icon;

  return (
    <section className="flex min-h-full items-center justify-center bg-white px-8 py-12">
      <article className="mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#EAF2FF] text-[#1D4ED8]">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {selected.eyebrow}
        </p>
        <h3 className="mt-2 text-[28px] font-bold leading-tight text-[#111827]">
          {selected.title}
        </h3>
        <p className="mt-4 text-[14px] leading-7 text-[#64748B]">
          {selected.body}
        </p>
      </article>
    </section>
  );
}

type ProfileModalContentProps = {
  readonly devices: ReadonlyArray<{
    readonly id: string;
    readonly slot: string;
    readonly label: string | null;
    readonly status: string;
    readonly lastSeenAt: string | null;
    readonly createdAt: string;
    readonly activeSessionCount: number;
    readonly isCurrentDevice: boolean;
  }>;
  readonly devicesError: unknown;
  readonly isDevicesLoading: boolean;
  readonly isProfileLoading: boolean;
  readonly onRetryDevices: () => void;
  readonly onRetryProfile: () => void;
  readonly profile: {
    readonly id: string;
    readonly email: string | null;
    readonly name: string | null;
    readonly role: string;
    readonly status: string;
    readonly timeZone: string;
    readonly lastLoginAt: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly oauthAccounts: ReadonlyArray<{
      readonly id: string;
      readonly provider: string;
      readonly providerEmail: string | null;
      readonly createdAt: string;
    }>;
  } | null;
  readonly profileError: unknown;
};

function ProfileModalContent({
  devices,
  devicesError,
  isDevicesLoading,
  isProfileLoading,
  onRetryDevices,
  onRetryProfile,
  profile,
  profileError,
}: ProfileModalContentProps) {
  return (
    <section className="min-h-full bg-white px-8 py-10 md:px-12">
      <div className="mx-auto w-full max-w-[800px]">
        <div>
          <h3 className="text-[28px] font-bold leading-tight text-[#111827]">
            프로필
          </h3>
          <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
            프로필, 로그인 정보 및 기기를 관리하세요
          </p>
        </div>

        {isProfileLoading ? (
          <ProfileLoadingState />
        ) : profileError ? (
          <ProfileErrorState error={profileError} onRetry={onRetryProfile} />
        ) : profile ? (
          <div className="mt-10 grid gap-10">
            <ProfileSection title="계정">
              <div className="grid gap-1">
                <ProfileInfoRow
                  label="선호하는 이름"
                  value={profile.name ?? "이름 없음"}
                />
                <ProfileInfoRow label="이메일" value={profile.email ?? "이메일 없음"} />
                <ProfileInfoRow label="시간대" value={profile.timeZone} />
              </div>
            </ProfileSection>

            <ProfileSection title="계정 상태">
              <div className="grid gap-1">
                <ProfileInfoRow label="권한" value={profile.role} />
                <ProfileInfoRow label="상태" value={profile.status} />
                <ProfileInfoRow
                  label="마지막 로그인"
                  value={formatAccountModalDateTime(profile.lastLoginAt)}
                />
                <ProfileInfoRow
                  label="프로필 수정일"
                  value={formatAccountModalDateTime(profile.updatedAt)}
                />
              </div>
            </ProfileSection>

            <ProfileSection title="로그인 계정">
              {profile.oauthAccounts.length > 0 ? (
                <div className="grid gap-1">
                  {profile.oauthAccounts.map((account) => (
                    <ProfileInfoRow
                      key={account.id}
                      label={formatProviderLabel(account.provider)}
                      value={[
                        account.providerEmail ?? "이메일 없음",
                        formatAccountModalDateTime(account.createdAt),
                      ].join(" · ")}
                    />
                  ))}
                </div>
              ) : (
                <ProfileEmptyText>연결된 로그인 계정이 없어요.</ProfileEmptyText>
              )}
            </ProfileSection>

            <ProfileSection title="기기">
              {isDevicesLoading ? (
                <ProfileInlineLoading />
              ) : devicesError ? (
                <div className="rounded-lg bg-[#F8FAFC] px-4 py-3 text-center">
                  <p className="text-[13px] text-[#64748B]">
                    {getApiErrorMessage(devicesError)}
                  </p>
                  <button
                    className="mt-2 text-[13px] font-semibold text-[#1D4ED8] hover:underline"
                    onClick={onRetryDevices}
                    type="button"
                  >
                    다시 시도
                  </button>
                </div>
              ) : devices.length > 0 ? (
                <ProfileDeviceTable devices={devices} />
              ) : (
                <ProfileEmptyText>등록된 기기가 없어요.</ProfileEmptyText>
              )}
            </ProfileSection>

            <ProfileSection title="사용자 ID">
              <div className="py-3">
                <p className="break-all text-[13px] font-medium text-[#475569]">
                  {profile.id}
                </p>
              </div>
            </ProfileSection>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProfileSection({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title: string;
}) {
  return (
    <section>
      <h4 className="text-[15px] font-semibold text-[#111827]">
        {title}
      </h4>
      <div className="mt-4 border-t border-[#E9ECF2] pt-3">{children}</div>
    </section>
  );
}

function ProfileInfoRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid gap-1 py-2 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-6">
      <p className="text-[13px] font-medium text-[#111827]">{label}</p>
      <p className="break-words text-[13px] leading-6 text-[#64748B]">
        {value}
      </p>
    </div>
  );
}

function ProfileDeviceTable({
  devices,
}: {
  readonly devices: ProfileModalContentProps["devices"];
}) {
  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.8fr)] border-b border-[#E9ECF2] px-1 pb-2 text-[12px] text-[#8A8F98]">
        <span>기기 이름</span>
        <span>마지막 활동</span>
      </div>
      <div>
        {devices.map((device) => (
          <ProfileDeviceRow key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

function ProfileDeviceRow({
  device,
}: {
  readonly device: ProfileModalContentProps["devices"][number];
}) {
  const label = device.label ?? formatDeviceSlotLabel(device.slot);
  const lastActive = device.isCurrentDevice
    ? "지금"
    : formatAccountModalDateTime(device.lastSeenAt);

  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(120px,0.8fr)] items-center border-b border-[#E9ECF2] px-1 py-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-[#A1A1AA]" strokeWidth={1.7} />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[#374151]">
            {label}
          </p>
          {device.isCurrentDevice ? (
            <p className="mt-0.5 text-[12px] font-medium text-[#0075DE]">
              이 기기
            </p>
          ) : null}
        </div>
      </div>
      <p className="text-[12px] leading-5 text-[#6B7280]">{lastActive}</p>
    </div>
  );
}

function ProfileLoadingState() {
  return (
    <div className="mt-16 flex items-center justify-center gap-2 text-[13px] text-[#64748B]">
      <Loader2 className="h-4 w-4 animate-spin" />
      프로필을 불러오는 중입니다.
    </div>
  );
}

function ProfileInlineLoading() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-4 py-4 text-[13px] text-[#64748B]">
      <Loader2 className="h-4 w-4 animate-spin" />
      기기를 불러오는 중입니다.
    </div>
  );
}

function ProfileErrorState({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="mt-12 rounded-lg bg-[#F8FAFC] px-5 py-6">
      <p className="text-[13px] leading-6 text-[#64748B]">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-3 text-[13px] font-semibold text-[#1D4ED8] hover:underline"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function ProfileEmptyText({ children }: { readonly children: ReactNode }) {
  return (
    <p className="py-4 text-[13px] text-[#64748B]">
      {children}
    </p>
  );
}

function formatProviderLabel(provider: string) {
  const normalized = provider.toLowerCase();
  if (normalized === "google") return "Google";
  if (normalized === "kakao") return "Kakao";
  if (normalized === "naver") return "Naver";
  if (normalized === "apple") return "Apple";
  return provider;
}

function formatDeviceSlotLabel(slot: string) {
  if (slot === "mobile") return "Mobile Device";
  if (slot === "personal_laptop") return "Personal Device";
  if (slot === "work_laptop") return "Work Device";
  return "Device";
}

function formatAccountModalDateTime(value: string | null) {
  if (!value) {
    return "기록 없음";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getUserInitial(name: string) {
  const trimmed = name.trim();

  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}
