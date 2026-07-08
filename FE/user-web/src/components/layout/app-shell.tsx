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
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useDealDetail } from "@/features/deal/hooks/use-deal-detail";
import { useDeleteDealMutation } from "@/features/deal/hooks/use-deal-mutations";
import { useProductDetail } from "@/features/product/hooks/use-product-detail";
import { useDeleteProductMutation } from "@/features/product/hooks/use-product-mutations";
import {
  useMyDevices,
  useMyProfile,
  useUpdateMyProfileMutation,
} from "@/features/auth/hooks/use-user-settings";
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
  if (section === "profile") {
    return <ProfileModalQueryContent />;
  }

  if (section === "terms") {
    return <LegalDocumentModalContent document={termsOfUseModalDocument} />;
  }

  if (section === "privacy") {
    return <LegalDocumentModalContent document={privacyPolicyModalDocument} />;
  }

  return <AccountSettingsModalContent />;
}

function ProfileModalQueryContent() {
  const profileQuery = useMyProfile();
  const devicesQuery = useMyDevices();

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

const accountLocaleOptions = [
  { value: "ko-KR", label: "한국어" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "ja-JP", label: "日本語" },
  { value: "zh-CN", label: "中文" },
] as const;

const accountTimeZoneOptions = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "UTC",
] as const;

function AccountSettingsModalContent() {
  const profileQuery = useMyProfile();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const profile = profileQuery.data ?? null;
  const [preferredLocale, setPreferredLocale] = useState("ko-KR");
  const [timeZone, setTimeZone] = useState("Asia/Seoul");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setPreferredLocale(profile.preferredLocale);
    setTimeZone(profile.timeZone);
  }, [profile]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSaved(false);

    try {
      await updateProfileMutation.mutateAsync({
        preferredLocale,
        timeZone,
      });
      setSaved(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="min-h-full bg-white px-8 py-10 md:px-12">
      <div className="mx-auto w-full max-w-[800px]">
        <div>
          <h3 className="text-[28px] font-bold leading-tight text-[#111827]">
            설정
          </h3>
          <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
            표시 언어와 시간대를 관리하세요
          </p>
        </div>

        {profileQuery.isLoading ? (
          <ProfileLoadingState />
        ) : profileQuery.error ? (
          <ProfileErrorState
            error={profileQuery.error}
            onRetry={() => void profileQuery.refetch()}
          />
        ) : profile ? (
          <form className="mt-10 grid gap-10" onSubmit={onSubmit}>
            <ProfileSection title="지역 설정">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-[#111827]">
                    표시 언어
                  </span>
                  <select
                    className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#374151] outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setPreferredLocale(event.target.value)}
                    value={preferredLocale}
                  >
                    {accountLocaleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[13px] font-medium text-[#111827]">
                    시간대
                  </span>
                  <select
                    className="h-9 rounded-md border border-[#E2E5EC] bg-white px-3 text-[13px] text-[#374151] outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setTimeZone(event.target.value)}
                    value={timeZone}
                  >
                    {getAccountTimeZoneOptions(timeZone).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  {formError ? (
                    <p className="text-[13px] text-destructive">{formError}</p>
                  ) : saved ? (
                    <p className="text-[13px] text-[#0075DE]">저장되었습니다.</p>
                  ) : null}
                </div>
                <button
                  className="h-9 rounded-md bg-[#0075DE] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0068C8] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={updateProfileMutation.isPending}
                  type="submit"
                >
                  저장
                </button>
              </div>
            </ProfileSection>

            <ProfileSection title="로그인 메타데이터">
              <div className="grid gap-1">
                <ProfileInfoRow
                  label="가입 국가"
                  value={profile.signupCountryCode ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="가입 시간대"
                  value={profile.signupTimeZone ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="마지막 로그인 국가"
                  value={profile.lastLoginCountryCode ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="마지막 로그인 시간대"
                  value={profile.lastLoginTimeZone ?? "기록 없음"}
                />
              </div>
            </ProfileSection>
          </form>
        ) : null}
      </div>
    </section>
  );
}

function getAccountTimeZoneOptions(currentTimeZone: string) {
  const browserTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";

  return Array.from(
    new Set([currentTimeZone, browserTimeZone, ...accountTimeZoneOptions])
  ).filter(Boolean);
}

type LegalDocumentModalSection = {
  readonly bullets?: readonly string[];
  readonly paragraphs?: readonly string[];
  readonly title: string;
};

type LegalDocumentModal = {
  readonly description: string;
  readonly sections: readonly LegalDocumentModalSection[];
  readonly title: string;
};

const termsOfUseModalDocument: LegalDocumentModal = {
  title: "이용약관",
  description: "Onehand 사용 조건, 계정 기준, 데이터 처리, AI 기능과 결제 정책을 안내합니다.",
  sections: [
    {
      title: "1. Onehand 사용",
      paragraphs: [
        "Onehand는 영업팀이 고객 기록, 딜 활동, 업무, 노트, AI 보조 워크플로우를 관리할 수 있도록 제공되는 업무용 워크스페이스입니다.",
        "사용자는 본인이 제출하는 정보와 계정 자격 증명의 보안을 책임집니다. Onehand는 관련 법률, 본 약관, 이 페이지에서 참조하는 정책에 따라 사용해야 합니다.",
        "조직을 대신해 Onehand를 사용하는 경우, 사용자는 해당 조직을 대표해 본 약관을 수락할 권한이 있음을 진술합니다.",
      ],
    },
    {
      title: "2. 계정과 워크스페이스",
      paragraphs: [
        "워크스페이스 소유자와 관리자는 초대 사용자, 권한, 결제 설정, 워크스페이스에 제출된 데이터를 관리합니다.",
        "Onehand는 접근 권한 관리를 돕는 도구를 제공할 수 있으나, 누가 워크스페이스에 접근해야 하는지는 각 고객과 조직의 책임입니다.",
        "사용자는 정확한 계정 정보를 제공해야 하며, 계정 또는 워크스페이스가 무단으로 접근되었다고 판단되는 경우 Onehand에 알려야 합니다.",
      ],
    },
    {
      title: "3. 허용 가능한 사용",
      paragraphs: [
        "사용자는 Onehand를 법률 위반, 권리 침해, 악성 코드 배포, 무단 접근 시도, 서비스 운영 방해, 처리 권한이 없는 데이터 처리에 사용할 수 없습니다.",
        "법률상 허용되는 경우를 제외하고, 서비스를 역설계하거나 자동화 접근을 남용하거나 서비스에 피해를 주는 방식으로 플랫폼 콘텐츠를 수집할 수 없습니다.",
        "Onehand의 기능, 화면, 데이터 또는 워크플로우를 경쟁 제품 개발 목적으로 사용할 수 없습니다.",
      ],
    },
    {
      title: "4. 고객 데이터와 개인정보",
      paragraphs: [
        "고객 데이터는 해당 데이터를 제출한 고객 또는 워크스페이스에 귀속됩니다.",
        "Onehand는 개인정보 처리방침과 적용 가능한 고객 계약에 따라 서비스를 제공하고, 보호하고, 지원하고, 개선하기 위해 고객 데이터를 처리합니다.",
        "워크스페이스에 개인정보가 포함되는 경우, 사용자는 해당 정보를 Onehand에 제출하기 위해 필요한 권리와 고지를 갖추어야 합니다.",
      ],
    },
    {
      title: "5. AI 보조 기능",
      paragraphs: [
        "Onehand는 AI 기반 요약, 초안, 검색, 라우팅 등 업무 지원 기능을 포함할 수 있습니다.",
        "AI 결과물은 유용할 수 있으나 불완전하거나 부정확할 수 있으므로, 고객 약속이나 비즈니스 의사결정에 사용하기 전에 사용자가 검토해야 합니다.",
        "AI 기능은 승인된 워크스페이스 맥락을 기반으로 사용자를 돕기 위한 기능이며, 사람의 검토, 전문적 판단, 고객별 검증을 대체하지 않습니다.",
      ],
    },
    {
      title: "6. 구독과 결제",
      paragraphs: [
        "유료 플랜, 갱신 주기, 사용량 제한, 세금, 취소 조건은 구매 시점 또는 적용 가능한 주문서에 표시됩니다.",
        "사용자는 선택한 플랜에 대한 요금 처리를 위해 Onehand와 결제 제공업체가 결제를 처리하는 데 동의합니다.",
        "별도로 명시되지 않는 한, 구독 요금은 법률상 요구되거나 서면으로 합의된 경우를 제외하고 환불되지 않습니다.",
      ],
    },
    {
      title: "7. 서비스 가용성과 변경",
      paragraphs: [
        "Onehand는 안정적인 서비스를 제공하기 위해 노력하지만, 점검, 업데이트, 보안 작업 또는 통제할 수 없는 사유로 서비스가 일시적으로 중단될 수 있습니다.",
        "Onehand는 기능을 업데이트하거나 플랜을 수정하거나 서비스 일부를 중단할 수 있습니다. 고객에게 중대한 영향을 주는 변경이 있는 경우 합리적인 범위에서 고지합니다.",
      ],
    },
    {
      title: "8. 면책과 책임 제한",
      paragraphs: [
        "법률이 허용하는 최대 범위에서 Onehand는 있는 그대로, 제공 가능한 상태로 제공됩니다.",
        "Onehand는 서비스가 항상 중단 없이 작동하거나 오류가 없거나 AI 보조 콘텐츠가 항상 정확하다고 보장하지 않습니다.",
        "법률이 허용하는 최대 범위에서 Onehand는 간접 손해, 부수적 손해, 특별 손해, 결과적 손해, 징벌적 손해, 이익 손실, 매출 손실, 데이터 손실 또는 사업 기회 손실에 대해 책임지지 않습니다.",
      ],
    },
    {
      title: "9. 약관 변경과 문의",
      paragraphs: [
        "Onehand는 본 약관을 수시로 업데이트할 수 있습니다. 중요한 변경이 있는 경우 관련 법률에서 요구하는 방식으로 고지합니다.",
        "업데이트 이후 Onehand를 계속 사용하는 경우, 사용자는 변경된 약관을 수락한 것으로 간주됩니다.",
        "본 약관에 대한 질문은 Onehand 문의 페이지를 통해 전달할 수 있습니다.",
      ],
    },
  ],
};

const privacyPolicyModalDocument: LegalDocumentModal = {
  title: "개인정보 처리방침",
  description: "Onehand가 개인정보를 수집, 이용, 공개, 보관하고 사용자의 권리를 처리하는 방식을 설명합니다.",
  sections: [
    {
      title: "1. 수집하는 정보",
      paragraphs: [
        "Onehand는 사용자가 제공하는 정보, 웹사이트 또는 서비스를 사용할 때 자동으로 수집되는 정보, 제3자 또는 조직으로부터 제공되는 정보를 수집할 수 있습니다.",
      ],
      bullets: [
        "계정 생성 정보: 이름, 이메일 주소, 비밀번호, 역할, 회사 정보, 선택적 프로필 사진, 워크스페이스 정보",
        "문의 및 지원 정보: 이메일 주소, 전화번호, 지원 메시지, 첨부파일, 사용자가 제공하는 기타 정보",
        "결제 정보: 결제 제공업체를 통해 처리되는 청구 정보와 거래 정보. Onehand는 전체 결제 카드 정보를 서비스에 직접 저장하지 않습니다.",
        "제품 사용 정보: 브라우저, 운영체제, 기기 식별자, IP 주소, 브라우저 언어, 시간대, 네트워크 신호에서 추정한 국가 코드 또는 대략적인 위치, 조회한 페이지, 클릭한 링크, 활동 빈도와 기간",
        "통합 정보: 사용자가 연결한 캘린더, 연락처, 이메일, 파일, CRM, 커뮤니케이션 도구에서 요청한 기능 제공에 필요한 정보",
      ],
    },
    {
      title: "2. 정보를 사용하는 방식",
      paragraphs: [
        "Onehand는 서비스를 제공하고, 보호하고, 지원하고, 개선하기 위한 업무상 목적과 운영상 목적을 위해 정보를 사용합니다.",
      ],
      bullets: [
        "계정과 워크스페이스 생성, 인증, 관리",
        "고객 기록, 노트, 업무, 제품, 딜 워크플로우, AI 보조 기능 제공",
        "구독, 청구서, 결제, 구매 주문 처리",
        "고객 지원, 보안 문의, 개인정보 요청에 대한 응답",
        "서비스 메시지, 제품 업데이트, 관리 고지, 지원 커뮤니케이션 발송",
        "플랫폼 안정성, 보안, 오류 분석, 제품 개선, 부정 사용 방지",
      ],
    },
    {
      title: "3. 정보 공개",
      paragraphs: [
        "Onehand는 서비스 제공과 운영에 필요한 범위에서 아래 범주의 수신자에게 정보를 공개할 수 있습니다.",
      ],
      bullets: [
        "호스팅, 분석, 결제, 고객 지원, 커뮤니케이션, 보안, 사기 방지를 지원하는 서비스 제공업체",
        "사용자가 요청하거나 승인한 제품, 서비스, 통합 또는 공동 제공을 위한 비즈니스 파트너",
        "공동 소유 또는 지배 관계에 있는 계열사",
        "광고와 분석 캠페인 측정을 위한 파트너",
        "공유 워크스페이스에서 협업하는 다른 사용자와 워크스페이스를 소유하거나 관리하는 조직",
        "법률 준수, 권리 보호, 정책 집행, 채무 회수, 위법 행위 조사에 필요한 기관 또는 제3자",
      ],
    },
    {
      title: "4. 국제 데이터 이전",
      paragraphs: [
        "Onehand가 처리하는 정보는 사용자가 거주하는 국가와 다른 국가로 이전, 처리, 저장될 수 있습니다.",
        "국제 이전이 이루어지는 경우 Onehand는 적용 가능한 법률에서 요구하는 계약상 보호 조치 또는 합법적인 이전 장치를 사용하기 위해 노력합니다.",
      ],
    },
    {
      title: "5. 사용자의 선택권",
      paragraphs: [
        "사용자는 특정 정보 이용에 대해 이의를 제기하거나 동의를 철회할 권리를 가질 수 있습니다. 동의 철회는 철회 전에 이루어진 처리에는 영향을 주지 않습니다.",
      ],
      bullets: [
        "마케팅 이메일은 이메일 하단의 수신 거부 안내를 통해 중단할 수 있습니다.",
        "서비스, 보안, 관리와 관련된 필수 안내는 계정 또는 워크스페이스 운영을 위해 계속 발송될 수 있습니다.",
        "쿠키와 유사 기술은 브라우저 설정 또는 제공되는 선호도 도구를 통해 관리할 수 있습니다.",
        "일부 브라우저가 제공하는 Do Not Track 또는 Global Privacy Control 같은 신호는 법률상 요구되는 경우 반영됩니다.",
      ],
    },
    {
      title: "6. 개인정보 권리",
      paragraphs: [
        "거주 지역과 적용 법률에 따라 사용자는 아래 권리를 가질 수 있습니다. Onehand는 법률에 따라 요청을 처리하며, 요청 처리 전에 본인 확인을 요구할 수 있습니다.",
      ],
      bullets: [
        "개인정보 접근 요청과 필요한 경우 이동 가능한 형식으로 제공받을 권리",
        "부정확하거나 불완전한 정보의 정정 요청",
        "법적 또는 운영상 예외가 적용되는 경우를 제외한 삭제 요청",
        "특정 처리의 제한 또는 반대 요청",
        "일부 맞춤형 광고, 공유 또는 개인정보 판매에 대한 거부권",
        "개인정보 권리 행사로 차별받지 않을 권리",
        "법률상 허용되는 경우 대리인을 통한 요청 제출과 답변에 대한 이의 제기",
      ],
    },
    {
      title: "7. 데이터 보관",
      paragraphs: [
        "Onehand는 서비스를 제공하고, 본 방침에서 설명한 목적을 달성하고, 법적 의무를 준수하고, 분쟁을 해결하고, 계약을 집행하고, 보안을 유지하고, 감사를 수행하고, 정당한 사업 목적을 지원하는 데 필요한 기간 동안 정보를 보관합니다.",
        "워크스페이스 콘텐츠는 워크스페이스 설정, 고객 계약, 백업 관행, 법률상 요구사항에 따라 보관될 수 있습니다.",
      ],
    },
    {
      title: "8. 정보 보안",
      paragraphs: [
        "Onehand는 처리하는 정보의 성격에 적합한 관리적, 기술적, 조직적 보호 조치를 통해 정보를 보호하기 위해 노력합니다.",
        "어떤 시스템도 완전히 안전할 수는 없습니다. 법률이 허용하는 최대 범위에서 Onehand는 정보가 무단 접근, 공개, 변경, 파기되지 않을 것이라고 보장하지 않습니다.",
        "통지가 필요한 보안 사고를 알게 되는 경우, Onehand는 관련 법률에 따라 적절한 방식으로 통지합니다.",
      ],
    },
    {
      title: "9. 제3자 웹사이트와 애플리케이션",
      paragraphs: [
        "웹사이트 또는 서비스에는 제3자 웹사이트, 애플리케이션, 통합, 서비스 링크가 포함될 수 있습니다.",
        "이러한 제3자는 Onehand가 통제하지 않으며, 해당 서비스의 개인정보 처리 관행은 각 제3자의 정책에 따릅니다.",
      ],
    },
    {
      title: "10. 아동 정보",
      paragraphs: [
        "Onehand 서비스는 일반 비즈니스 사용자를 대상으로 하며 아동을 대상으로 하지 않습니다.",
        "법적으로 유효한 동의 없이 아동의 개인정보를 수집한 사실을 알게 되는 경우, Onehand는 관련 법률에 따라 해당 정보를 삭제하기 위한 합리적인 조치를 취합니다.",
      ],
    },
    {
      title: "11. 감독기관",
      paragraphs: [
        "유럽경제지역 또는 영국 등 관련 관할권에 거주하는 사용자는 Onehand의 정보 처리가 법률을 위반한다고 판단되는 경우 데이터 보호 감독기관에 민원을 제기할 권리를 가질 수 있습니다.",
      ],
    },
    {
      title: "12. 캘리포니아 거주자를 위한 추가 정보",
      paragraphs: [
        "캘리포니아 거주자인 경우, 관련 개인정보 법률은 Onehand가 수집하는 개인정보 범주, 사용 목적, 공개 또는 공유 대상 범주에 대한 추가 정보를 제공하도록 요구할 수 있습니다.",
      ],
      bullets: [
        "식별자는 서비스 제공업체, 계열사, 법률상 수신자, 광고 파트너, 거래 당사자 또는 사용자가 동의한 대상에게 공개될 수 있습니다.",
        "상업 정보는 서비스 제공업체, 계열사, 법률상 수신자, 거래 당사자 또는 사용자가 동의한 대상에게 공개될 수 있습니다.",
        "인터넷 또는 전자 네트워크 활동 정보는 서비스 제공업체, 분석 제공업체, 광고 파트너, 법률상 수신자 또는 거래 당사자에게 공개될 수 있습니다.",
        "일반 위치 정보와 추론 정보는 서비스 제공업체, 분석 제공업체, 광고 파트너 또는 법률상 필요한 대상에게 공개될 수 있습니다.",
      ],
    },
    {
      title: "13. 데이터 프라이버시 프레임워크",
      paragraphs: [
        "고객 계약, 데이터 이전 장치 또는 개인정보 인증이 Onehand 사용에 적용되는 경우, 해당 계약 또는 관련 인증 자료에 명시된 조건이 우선합니다.",
        "Onehand가 별도로 게시하거나 합의하지 않은 한, 이 방침은 특정 데이터 이전 인증을 주장하지 않습니다. 조직에 국제 이전 보호 조치 정보가 필요한 경우 Onehand에 문의할 수 있습니다.",
      ],
    },
    {
      title: "14. 개인정보 처리방침 변경",
      paragraphs: [
        "Onehand는 본 개인정보 처리방침을 수시로 개정할 수 있습니다. 중요한 변경이 있는 경우 관련 법률에서 요구하는 방식으로 고지합니다.",
        "업데이트된 개인정보 처리방침이 효력을 발생한 후 웹사이트 또는 서비스를 계속 사용하는 경우, 사용자는 변경된 방침을 인지한 것으로 간주됩니다.",
      ],
    },
  ],
};

function LegalDocumentModalContent({
  document,
}: {
  readonly document: LegalDocumentModal;
}) {
  return (
    <section className="min-h-full bg-white px-8 py-10 md:px-12">
      <div className="mx-auto w-full max-w-[800px]">
        <div>
          <h3 className="text-[28px] font-bold leading-tight text-[#111827]">
            {document.title}
          </h3>
          <p className="mt-3 text-[14px] leading-6 text-[#64748B]">
            {document.description}
          </p>
        </div>

        <div className="mt-10 grid gap-10">
          {document.sections.map((section) => (
            <ProfileSection key={section.title} title={section.title}>
              <div className="grid gap-3">
                {section.paragraphs?.map((paragraph) => (
                  <p
                    className="text-[13px] leading-6 text-[#475569]"
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="grid list-disc gap-2 pl-5 text-[13px] leading-6 text-[#475569]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </ProfileSection>
          ))}
        </div>
      </div>
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
    readonly preferredLocale: string;
    readonly signupLocale: string | null;
    readonly signupCountryCode: string | null;
    readonly signupTimeZone: string | null;
    readonly lastLoginLocale: string | null;
    readonly lastLoginCountryCode: string | null;
    readonly lastLoginTimeZone: string | null;
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
                <ProfileInfoRow
                  label="표시 언어"
                  value={formatLocaleLabel(profile.preferredLocale)}
                />
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
                <ProfileInfoRow
                  label="가입 국가"
                  value={profile.signupCountryCode ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="마지막 로그인 국가"
                  value={profile.lastLoginCountryCode ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="가입 시간대"
                  value={profile.signupTimeZone ?? "기록 없음"}
                />
                <ProfileInfoRow
                  label="마지막 로그인 시간대"
                  value={profile.lastLoginTimeZone ?? "기록 없음"}
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

function formatLocaleLabel(locale: string) {
  if (locale === "ko-KR") return "한국어";
  if (locale === "en-US") return "English (US)";
  if (locale === "en-GB") return "English (UK)";
  if (locale === "ja-JP") return "日本語";
  if (locale === "zh-CN") return "中文";
  return locale;
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
