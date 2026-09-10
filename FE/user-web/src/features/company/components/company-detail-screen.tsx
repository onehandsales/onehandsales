import {
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { InvalidDetailPathDialog } from "@/components/ui/invalid-detail-path-dialog";
import { Toast } from "@/components/ui/toast";
import { useAppI18n } from "@/features/app-i18n";
import { CompanyEditDialog } from "@/features/company/components/company-edit-dialog";
import { useCompanyDetail } from "@/features/company/hooks/use-company-detail";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import type {
  CompanyDetail,
  CompanyField,
  CompanyRegion,
} from "@/features/company/types/company";
import { formatCompanyRegionLabel } from "@/features/company/utils/company-region-options";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  isInvalidDetailPathError,
  navigateFromInvalidDetailPath,
} from "@/utils/invalid-detail-path";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

const COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY = "onehand.company.detail.fullWidth";
const COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY = "onehand.company.detail.smallText";

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(() =>
    readStoredBoolean(COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY, false)
  );
  const [isSmallText, setIsSmallText] = useState(() =>
    readStoredBoolean(COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY, false)
  );
  const pageMenuRef = useRef<HTMLDivElement | null>(null);

  const companyQuery = useCompanyDetail(companyId);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();

  const company = companyQuery.data;
  const fields = useMemo(
    () =>
      company
        ? mergeCompanyField(fieldsQuery.data?.items ?? [], company.companyField)
        : (fieldsQuery.data?.items ?? []),
    [company, fieldsQuery.data?.items]
  );
  const regions = useMemo(
    () =>
      company
        ? mergeCompanyRegion(regionsQuery.data?.items ?? [], company.companyRegion)
        : (regionsQuery.data?.items ?? []),
    [company, regionsQuery.data?.items]
  );
  // 기능 : 삭제/미존재 회사 상세 URL 접근 오류를 전용 안내 대상으로 분리합니다.
  const isInvalidCompanyDetailPath =
    companyQuery.isError &&
    isInvalidDetailPathError(companyQuery.error, ["CompanyNotFound"]);

  useEffect(() => {
    window.localStorage.setItem(
      COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY,
      String(isFullWidth)
    );
  }, [isFullWidth]);

  useEffect(() => {
    window.localStorage.setItem(
      COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY,
      String(isSmallText)
    );
  }, [isSmallText]);

  useEffect(() => {
    if (!isPageMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!pageMenuRef.current?.contains(event.target as Node)) {
        setIsPageMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPageMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isPageMenuOpen]);

  if (companyQuery.isLoading) return <CompanyDetailSkeleton />;
  if (isInvalidCompanyDetailPath) {
    return (
      <>
        <CompanyDetailSkeleton />
        <InvalidDetailPathDialog
          onConfirm={() =>
            navigateFromInvalidDetailPath(navigate, "/app/companies")
          }
        />
      </>
    );
  }
  if (companyQuery.isError) {
    return (
      <CompanyDetailError
        error={companyQuery.error}
        onRetry={() => void companyQuery.refetch()}
      />
    );
  }
  if (!company) return <CompanyDetailSkeleton />;

  const contentWidthClassName = isFullWidth ? "max-w-[1444px]" : "max-w-[678px]";
  const showNotice = (message: string, description?: string) => {
    setNotice(message);
    setNoticeDescription(description ?? null);
  };

  const clearNotice = () => {
    setNotice(null);
    setNoticeDescription(null);
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-white">
        <header className="flex h-11 shrink-0 items-center px-4">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <Link
              className="truncate font-semibold text-[#6B7280] transition hover:text-[#111827]"
              title="회사 목록으로 이동"
              to="/app/companies"
            >
              회사
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="truncate font-semibold text-[#111827]">
              {company.companyName}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              className="inline-flex h-8 items-center justify-center rounded-md px-2 text-[13px] font-semibold text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
              onClick={() => setIsEditOpen(true)}
              type="button"
            >
              수정
            </button>
            <div className="relative" ref={pageMenuRef}>
              <button
                aria-expanded={isPageMenuOpen}
                aria-haspopup="menu"
                aria-label="회사 페이지 옵션"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                onClick={() => setIsPageMenuOpen((open) => !open)}
                title="회사 페이지 옵션"
                type="button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {isPageMenuOpen ? (
                <CompanyPageOptionsMenu
                  isFullWidth={isFullWidth}
                  isSmallText={isSmallText}
                  onToggleFullWidth={() =>
                    setIsFullWidth((current) => !current)
                  }
                  onToggleSmallText={() =>
                    setIsSmallText((current) => !current)
                  }
                />
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-20 pt-14">
          <div
            className={`mx-auto grid min-h-full w-full ${contentWidthClassName} content-start gap-5`}
          >
            {notice ? (
              <Toast
                description={noticeDescription ?? undefined}
                message={notice}
                onClose={clearNotice}
                variant="success"
              />
            ) : null}
            <CompanySummaryHeader
              company={company}
              isSmallText={isSmallText}
            />
          </div>
        </main>
      </div>
      <CompanyEditDialog
        company={company}
        fields={fields}
        open={isEditOpen}
        regions={regions}
        onOpenChange={setIsEditOpen}
        onSaved={() => {
          void companyQuery.refetch();
          showNotice("회사 정보를 저장했어요.");
        }}
      />
    </>
  );
}

// ── Company Document Header ─────────────────────────────────────────

function CompanySummaryHeader({
  company,
  isSmallText,
}: {
  readonly company: CompanyDetail;
  readonly isSmallText: boolean;
}) {
  const { locale } = useAppI18n();
  const companyRegionLabel = formatCompanyRegionLabel(
    company.companyRegion,
    locale
  );
  const companyAddress = company.address?.trim() ? company.address : "미입력";

  return (
    <section className="grid cursor-auto gap-6">
      <div className="grid gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#94A3B8]">
          <Building2 className="h-11 w-11" />
        </div>
        <h1
          className={`min-w-0 break-words font-semibold leading-[1.25] text-[#111827] ${
            isSmallText ? "text-[28px]" : "text-[32px]"
          }`}
        >
          {company.companyName}
        </h1>
      </div>

      <div className="grid max-w-[460px] gap-0.5 py-2">
        <CompanyDocumentProperty
          label="분야"
          isSmallText={isSmallText}
          value={company.companyField.field}
        />
        <CompanyDocumentProperty
          label="지역"
          isSmallText={isSmallText}
          value={companyRegionLabel}
        />
        <CompanyDocumentProperty
          label="주소"
          isSmallText={isSmallText}
          value={companyAddress}
        />
      </div>
    </section>
  );
}

function CompanyDocumentProperty({
  isSmallText,
  label,
  value,
}: {
  readonly isSmallText: boolean;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div
      className={`grid min-h-8 grid-cols-[88px_minmax(0,1fr)] items-center gap-3 rounded-md px-1.5 transition-colors hover:bg-[#FAF9F6] ${
        isSmallText ? "text-[13px]" : "text-[14px]"
      }`}
    >
      <span className="font-semibold text-[#8B95A5]">{label}</span>
      <span className="min-w-0 break-words font-medium text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function CompanyPageOptionsMenu({
  isFullWidth,
  isSmallText,
  onToggleFullWidth,
  onToggleSmallText,
}: {
  readonly isFullWidth: boolean;
  readonly isSmallText: boolean;
  readonly onToggleFullWidth: () => void;
  readonly onToggleSmallText: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-9 z-50 w-[220px] rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
      role="menu"
    >
      <CompanyPageOptionToggle
        checked={isSmallText}
        label="작은 텍스트"
        onClick={onToggleSmallText}
      />
      <CompanyPageOptionToggle
        checked={isFullWidth}
        label="전체 너비"
        onClick={onToggleFullWidth}
      />
    </div>
  );
}

function CompanyPageOptionToggle({
  checked,
  label,
  onClick,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[13px] font-medium text-[#374151] transition hover:bg-[#F3F4F6]"
      onClick={onClick}
      role="menuitemcheckbox"
      aria-checked={checked}
      type="button"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-[#4880EE]" : "bg-[#E5E7EB]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

// ── Skeleton / Error ────────────────────────────────────────────────

function CompanyDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <PageHeader
        breadcrumbs={[
          { label: "회사", to: "/app/companies", icon: Building2 },
          { label: "오류" },
        ]}
      />
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-[13px] text-red-600">{getApiErrorMessage(error)}</p>
          <button
            className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-[13px] text-red-600 hover:bg-red-50"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* TopBar skeleton */}
      <div className="flex h-16 items-center gap-3 bg-white px-6">
        <div className="h-4 w-4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-0">
        <div className="h-[150px] animate-pulse rounded-xl bg-white" />
        <div className="flex gap-4">
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="flex gap-4">
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[300px] w-[380px] shrink-0 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function mergeCompanyField(fields: CompanyField[], current: CompanyField) {
  return fields.some((f) => f.id === current.id) ? fields : [current, ...fields];
}

function mergeCompanyRegion(regions: CompanyRegion[], current: CompanyRegion) {
  return regions.some((r) => r.id === current.id) ? regions : [current, ...regions];
}

function readStoredBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);

  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }

  return fallback;
}
