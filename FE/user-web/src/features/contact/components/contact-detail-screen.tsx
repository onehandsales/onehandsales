import {
  Building2,
  IdCard,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Toast } from "@/components/ui/toast";
import { ContactEditForm } from "@/features/contact/components/contact-edit-form";
import {
  ContactMemoLogSection,
  ContactPrivateMemoLogSection,
} from "@/features/contact/components/contact-log-section";
import {
  useContactDetail,
  useContactMemoLogs,
  useContactPrivateMemoLogs,
} from "@/features/contact/hooks/use-contact-detail";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";

type ContactDetailScreenProps = {
  readonly contactId: string;
};

// 기능 : 거래처 상세 화면을 렌더링합니다.
export function ContactDetailScreen({ contactId }: ContactDetailScreenProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const contactQuery = useContactDetail(contactId);
  const memoLogsQuery = useContactMemoLogs(contactId);
  const privateMemoLogsQuery = useContactPrivateMemoLogs(contactId);

  const memoLogs =
    memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs =
    privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (contactQuery.isLoading) {
    return <ContactDetailSkeleton />;
  }

  if (contactQuery.isError) {
    return (
      <ContactDetailError
        error={contactQuery.error}
        onRetry={() => void contactQuery.refetch()}
      />
    );
  }

  const contact = contactQuery.data;

  if (!contact) {
    return <ContactDetailSkeleton />;
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <PageHeader
        backHref="/contacts"
        backLabel="거래처 목록"
        description={
          [
            contact.company.companyName,
            contact.contactDepartment.departmentName,
            contact.contactJobGrade.jobGradeName,
          ]
            .filter(Boolean)
            .join(" · ") || "-"
        }
        title={contact.username}
      />

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <SectionHeader
              description="담당자와 회사 연결 정보를 정리합니다."
              title="기본 정보"
            />
            <div className="rounded-lg border bg-white p-4">
              <ContactEditForm
                contact={contact}
                onSaved={() => {
                  void contactQuery.refetch();
                  setNotice("거래처 정보가 저장되었습니다.");
                }}
              />
            </div>
          </section>

          <ContactMemoLogSection
            contactId={contactId}
            error={memoLogsQuery.error}
            hasNextPage={memoLogsQuery.hasNextPage}
            isFetchingNextPage={memoLogsQuery.isFetchingNextPage}
            isLoading={memoLogsQuery.isLoading}
            logs={memoLogs}
            onChanged={setNotice}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onRetry={() => void memoLogsQuery.refetch()}
          />

          <ContactPrivateMemoLogSection
            contactId={contactId}
            error={privateMemoLogsQuery.error}
            hasNextPage={privateMemoLogsQuery.hasNextPage}
            isFetchingNextPage={privateMemoLogsQuery.isFetchingNextPage}
            isLoading={privateMemoLogsQuery.isLoading}
            logs={privateMemoLogs}
            onChanged={setNotice}
            onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
            onRetry={() => void privateMemoLogsQuery.refetch()}
          />
        </div>

        <aside className="grid content-start gap-6">
          <section className="grid gap-3">
            <SectionHeader title="연결 회사" />
            <div className="rounded-lg border bg-white p-4">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"
                to={`/companies/${contact.company.id}`}
              >
                <Building2 className="h-4 w-4" />
                {contact.company.companyName}
              </Link>
            </div>
          </section>

          <section className="grid gap-3">
            <SectionHeader title="연락 정보" />
            <div className="grid gap-2 rounded-lg border bg-white p-4">
              <CopyRow
                icon={Phone}
                label="핸드폰번호"
                onCopied={setNotice}
                value={contact.mobile}
              />
              <CopyRow
                icon={Mail}
                label="이메일"
                onCopied={setNotice}
                value={contact.email}
              />
            </div>
          </section>

          <section className="grid gap-3">
            <SectionHeader title="등록 정보" />
            <dl className="grid gap-2 rounded-lg border bg-white p-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">등록일</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(contact.createdAt, { year: "numeric" })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">최근 수정일</dt>
                <dd className="mt-1 font-medium">
                  {formatDateTime(contact.updatedAt, { includeYear: true })}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}

function CopyRow({
  icon: Icon,
  label,
  value,
  onCopied,
}: {
  readonly icon: typeof Phone;
  readonly label: string;
  readonly value: string;
  readonly onCopied: (message: string) => void;
}) {
  const onCopy = async () => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    onCopied(`${label}를 복사했습니다.`);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium">{value || "-"}</p>
      </div>
      <button
        aria-label={`${label} 복사`}
        className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!value}
        onClick={() => void onCopy()}
        type="button"
      >
        <IdCard className="h-4 w-4" />
      </button>
    </div>
  );
}

function ContactDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-5 py-10 text-center">
      <IdCard className="mx-auto h-10 w-10 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-semibold">거래처 상세를 불러오지 못했습니다.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>
      </div>
      <Button
        className="mx-auto"
        onClick={onRetry}
        type="button"
      >
        재시도
      </Button>
    </section>
  );
}

function ContactDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <div className="grid gap-2 border-b pb-5">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}
