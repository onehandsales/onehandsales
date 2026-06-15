import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMeetingNoteDealOptions } from "@/features/meeting-note/hooks/use-meeting-note-deal-options";
import {
  useCreateMeetingNoteMutation,
  useUpdateMeetingNoteMutation,
} from "@/features/meeting-note/hooks/use-meeting-note-mutations";
import { useMeetingNoteDetail } from "@/features/meeting-note/hooks/use-meeting-note-queries";
import {
  emptyMeetingNoteFormValues,
  meetingNoteFormSchema,
  toCreateMeetingNoteInput,
  toMeetingNoteFormValues,
  toUpdateMeetingNoteInput,
  type MeetingNoteFormValues,
} from "@/features/meeting-note/schemas/meeting-note-schema";
import type { MeetingNote } from "@/features/meeting-note/types/meeting-note";
import { getMeetingDateParts } from "@/features/meeting-note/utils/meeting-note-date";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime, formatMoney } from "@/utils/format";

type MeetingNoteEditorScreenProps = {
  readonly meetingNoteId?: string;
};

// 기능 : 회의록 작성과 상세 수정 화면을 렌더링합니다.
export function MeetingNoteEditorScreen({
  meetingNoteId,
}: MeetingNoteEditorScreenProps) {
  const isEdit = Boolean(meetingNoteId);
  const navigate = useNavigate();
  const location = useLocation();
  const detailQuery = useMeetingNoteDetail(meetingNoteId ?? "", isEdit);
  const createMutation = useCreateMeetingNoteMutation();
  const updateMutation = useUpdateMeetingNoteMutation();
  const [notice, setNotice] = useState(() => readLocationNotice(location.state));
  const [savedMeetingNote, setSavedMeetingNote] = useState<MeetingNote | null>(
    null
  );
  const [initializedKey, setInitializedKey] = useState("");
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MeetingNoteFormValues>({
    resolver: zodResolver(meetingNoteFormSchema),
    defaultValues: emptyMeetingNoteFormValues,
  });
  const dealId = useWatch({ control, name: "dealId" }) ?? "";
  const dealSearch = useWatch({ control, name: "dealSearch" }) ?? "";
  const dealOptionsQuery = useMeetingNoteDealOptions(dealSearch);
  const activeMeetingNote = savedMeetingNote ?? detailQuery.data ?? null;
  const actionError =
    createMutation.error ?? updateMutation.error ?? detailQuery.error ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEdit) {
      const detail = detailQuery.data;

      if (detail && initializedKey !== detail.id) {
        reset(toMeetingNoteFormValues(detail));
        setSavedMeetingNote(detail);
        setInitializedKey(detail.id);
      }

      return;
    }

    if (initializedKey !== "new") {
      reset(emptyMeetingNoteFormValues);
      setSavedMeetingNote(null);
      setInitializedKey("new");
    }
  }, [detailQuery.data, initializedKey, isEdit, reset]);

  // 기능 : 회의록 form submit을 생성 또는 수정 mutation으로 처리합니다.
  const onSubmit = handleSubmit(async (values) => {
    if (isEdit && meetingNoteId) {
      const updated = await updateMutation.mutateAsync(
        toUpdateMeetingNoteInput(meetingNoteId, values)
      );
      setSavedMeetingNote(updated);
      reset(toMeetingNoteFormValues(updated));
      setNotice("회의록이 수정되었습니다.");
      return;
    }

    const created = await createMutation.mutateAsync(
      toCreateMeetingNoteInput(values)
    );
    navigate(`/meeting-notes/${created.id}`, {
      replace: true,
      state: { notice: "회의록이 저장되었습니다." },
    });
  });

  // 기능 : 딜 검색어를 변경하고 기존 선택 딜을 해제합니다.
  const updateDealSearch = (value: string) => {
    setValue("dealSearch", value, { shouldValidate: true });

    if (dealId) {
      setValue("dealId", "", { shouldValidate: true });
    }
  };

  // 기능 : 딜 옵션 선택 값을 form에 반영합니다.
  const selectDeal = (option: { readonly id: string; readonly name: string }) => {
    setValue("dealId", option.id, { shouldValidate: true });
    setValue("dealSearch", option.name, { shouldValidate: true });
  };

  // 기능 : 딜 선택 값을 form에서 제거합니다.
  const clearDeal = () => {
    setValue("dealId", "", { shouldValidate: true });
    setValue("dealSearch", "", { shouldValidate: true });
  };

  if (detailQuery.isLoading && isEdit) {
    return <MeetingNoteEditorSkeleton />;
  }

  if (detailQuery.isError && isEdit) {
    return (
      <section className="mx-auto grid max-w-[900px] gap-4 px-5 py-6">
        <Link
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          to="/meeting-notes"
        >
          <ArrowLeft className="h-4 w-4" />
          회의록 목록
        </Link>
        <ErrorMessage message={getApiErrorMessage(detailQuery.error)} />
      </section>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {notice ? (
        <div className="mx-6 mt-3">
          <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}

      {actionError ? (
        <div className="mx-6 mt-3">
          <ErrorMessage message={getApiErrorMessage(actionError)} />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F9FAFB]">
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <Link
            className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-[#64748B] hover:text-[#374151]"
            to="/meeting-notes"
          >
            <ArrowLeft className="h-4 w-4" />
            회의록 목록
          </Link>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold leading-tight text-[#111827]">
                  {isEdit ? "회의록 상세" : "회의록 작성"}
                </h1>
                <p className="mt-1 text-[13px] text-[#6B7280]">
                  회사와 담당자, 미팅 내용, 다음 행동을 기록합니다.
                </p>
              </div>
              <button
                className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3 text-[13px] font-semibold text-white hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
                form="meeting-note-form"
                type="submit"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? "수정 저장" : "저장"}
              </button>
            </div>
          </div>

          <form
            className="grid gap-4"
            id="meeting-note-form"
            onSubmit={onSubmit}
          >
            <section className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#6B7280]" />
                <h2 className="text-[14px] font-semibold text-[#111827]">기본 정보</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  errorMessage={errors.meetingLocalDateTime?.message}
                  id="meeting-local-date-time"
                  label="미팅 일시"
                  register={register("meetingLocalDateTime")}
                  type="datetime-local"
                />
                <TextField
                  errorMessage={errors.companyName?.message}
                  id="meeting-company-name"
                  label="회사"
                  register={register("companyName")}
                />
                <TextField
                  errorMessage={errors.contactUsername?.message}
                  id="meeting-contact-username"
                  label="담당자"
                  register={register("contactUsername")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  errorMessage={errors.companyField?.message}
                  id="meeting-company-field"
                  label="업종"
                  register={register("companyField")}
                />
                <TextField
                  errorMessage={errors.companyRegion?.message}
                  id="meeting-company-region"
                  label="지역"
                  register={register("companyRegion")}
                />
                <TextField
                  errorMessage={errors.department?.message}
                  id="meeting-contact-department"
                  label="부서"
                  register={register("department")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  errorMessage={errors.jobGrade?.message}
                  id="meeting-contact-job-grade"
                  label="직급"
                  register={register("jobGrade")}
                />
                <TextField
                  errorMessage={errors.contactEmail?.message}
                  id="meeting-contact-email"
                  label="이메일"
                  register={register("contactEmail")}
                />
                <TextField
                  errorMessage={errors.contactMobile?.message}
                  id="meeting-contact-mobile"
                  label="연락처"
                  register={register("contactMobile")}
                />
              </div>
            </section>

            <section className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
                <h2 className="text-[14px] font-semibold text-[#111827]">제품과 딜</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  errorMessage={errors.productName?.message}
                  id="meeting-product-name"
                  label="제품"
                  register={register("productName")}
                />
                <TextField
                  errorMessage={errors.productPrice?.message}
                  id="meeting-product-price"
                  label="제품 금액"
                  register={register("productPrice")}
                  type="number"
                />
                <TextField
                  errorMessage={errors.productCategory?.message}
                  id="meeting-product-category"
                  label="제품 카테고리"
                  register={register("productCategory")}
                />
                <TextField
                  errorMessage={errors.productStatus?.message}
                  id="meeting-product-status"
                  label="제품 상태"
                  register={register("productStatus")}
                />
              </div>
              <DealSearchField
                errorMessage={errors.dealId?.message}
                isLoading={dealOptionsQuery.isFetching}
                onClear={clearDeal}
                onSearchChange={updateDealSearch}
                onSelect={selectDeal}
                options={dealOptionsQuery.data ?? []}
                search={dealSearch}
                selectedId={dealId}
              />
            </section>

            <section className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111827]">미팅 내용</h2>
              </div>
              <TextAreaField
                errorMessage={errors.details?.message}
                id="meeting-details"
                label="상세 내용"
                register={register("details")}
                rows={8}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField
                  errorMessage={errors.nextPlan?.message}
                  id="meeting-next-plan"
                  label="향후 계획"
                  register={register("nextPlan")}
                  rows={4}
                />
                <TextAreaField
                  errorMessage={errors.requiredAction?.message}
                  id="meeting-required-action"
                  label="필요 액션"
                  register={register("requiredAction")}
                  rows={4}
                />
              </div>
            </section>
          </form>
        </div>

        <div className="flex w-[415px] shrink-0 flex-col gap-4 overflow-y-auto bg-[#F9FAFB] p-6">
          <MeetingNoteSummaryCard meetingNote={activeMeetingNote} />
          <MeetingNoteSnapshotPanel meetingNote={activeMeetingNote} />
        </div>
      </div>
    </div>
  );
}

function MeetingNoteSummaryCard({
  meetingNote,
}: {
  readonly meetingNote: MeetingNote | null;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-[13px] font-semibold text-[#111827]">회의 현황</h3>
      <div className="grid grid-cols-2 gap-3">
        <MeetingDateSummaryMetric value={meetingNote?.meetingAt} />
        <SummaryMetric
          label="회사"
          value={`${(meetingNote?.companies.length ?? 0).toLocaleString("ko-KR")}개`}
        />
        <SummaryMetric
          label="담당자"
          value={`${(meetingNote?.contacts.length ?? 0).toLocaleString("ko-KR")}명`}
        />
        <SummaryMetric
          label="딜"
          value={`${(meetingNote?.deals.length ?? 0).toLocaleString("ko-KR")}건`}
        />
      </div>
    </div>
  );
}

function MeetingDateSummaryMetric({
  value,
}: {
  readonly value: string | null | undefined;
}) {
  const meetingDate = getMeetingDateParts(value);

  if (!meetingDate.hasValue) {
    return (
      <div className="col-span-2 flex min-w-0 flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
        <span className="text-[11px] font-medium text-[#6B7280]">미팅 일시</span>
        <span className="text-[18px] font-bold text-[#9CA3AF]">{meetingDate.full}</span>
      </div>
    );
  }

  return (
    <div className="col-span-2 grid gap-2 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] p-3">
      <span className="text-[11px] font-medium text-[#9A3412]">미팅 일시</span>
      <div className="min-w-0">
        <p className="truncate text-[16px] font-bold text-[#111827]">
          {meetingDate.date}
        </p>
        <p className="mt-1 inline-flex rounded-full bg-white px-2 py-1 text-[13px] font-bold text-[#C2410C] shadow-sm ring-1 ring-[#FED7AA]">
          {meetingDate.time}
        </p>
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg bg-[#F9FAFB] p-3">
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
      <span className="truncate text-[18px] font-bold text-[#111827]">{value}</span>
    </div>
  );
}

// 기능 : 딜 검색 입력과 선택 목록을 렌더링합니다.
function DealSearchField({
  search,
  selectedId,
  options,
  isLoading,
  errorMessage,
  onSearchChange,
  onSelect,
  onClear,
}: {
  readonly search: string;
  readonly selectedId: string;
  readonly options: readonly {
    readonly id: string;
    readonly name: string;
    readonly subtitle: string;
  }[];
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly onSearchChange: (search: string) => void;
  readonly onSelect: (option: { readonly id: string; readonly name: string }) => void;
  readonly onClear: () => void;
}) {
  const shouldShowOptions = search.trim().length > 0 && !selectedId;

  return (
    <div className="grid gap-2">
      <label className="text-[12px] font-medium text-[#374151]" htmlFor="meeting-deal-search">
        딜 검색
      </label>
      <div className="relative">
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          aria-describedby={errorMessage ? "meeting-deal-error" : undefined}
          aria-invalid={Boolean(errorMessage)}
          className="h-10 w-full rounded-md border border-[#E6EAF0] bg-white pl-9 pr-10 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
          id="meeting-deal-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="딜명 검색"
          value={search}
        />
        {selectedId || search ? (
          <button
            aria-label="딜 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6]"
            onClick={onClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {shouldShowOptions ? (
        <div className="max-h-44 overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
          {isLoading ? (
            <p className="px-3 py-2 text-[13px] text-[#9CA3AF]">검색 중</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-[#9CA3AF]">
              검색된 딜이 없습니다.
            </p>
          ) : (
            options.map((option) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-[13px] hover:bg-[#F9FAFB]"
                key={option.id}
                onClick={() => onSelect(option)}
                type="button"
              >
                <span className="font-medium text-[#111827]">{option.name}</span>
                <span className="text-[12px] text-[#6B7280]">
                  {option.subtitle || "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-[12px] text-[#DC2626]" id="meeting-deal-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

// 기능 : 저장된 회의록 snapshot 배열을 상세 화면에 표시합니다.
function MeetingNoteSnapshotPanel({
  meetingNote,
}: {
  readonly meetingNote: MeetingNote | null;
}) {
  if (!meetingNote) {
    return (
      <aside className="grid h-fit gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
        <h2 className="text-[13px] font-semibold text-[#111827]">저장된 스냅샷</h2>
        <p className="text-[13px] text-[#9CA3AF]">
          저장 후 회사, 담당자, 제품, 딜 스냅샷이 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <aside className="grid h-fit gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div>
        <h2 className="text-[13px] font-semibold text-[#111827]">저장된 스냅샷</h2>
        <p className="mt-1 text-[12px] text-[#9CA3AF]">
          {formatDateTime(meetingNote.createdAt)} 등록
        </p>
      </div>
      <SnapshotGroup
        emptyText="회사 없음"
        items={meetingNote.companies.map((company) => ({
          id: company.id,
          primary: company.companyNameSnapshot,
          secondary: [company.companyFieldSnapshot, company.companyRegionSnapshot]
            .filter(Boolean)
            .join(" / "),
        }))}
        title="회사"
      />
      <SnapshotGroup
        emptyText="담당자 없음"
        items={meetingNote.contacts.map((contact) => ({
          id: contact.id,
          primary: contact.contactUsernameSnapshot,
          secondary: [contact.companyNameSnapshot, contact.departmentSnapshot, contact.jobGradeSnapshot]
            .filter(Boolean)
            .join(" / "),
        }))}
        title="담당자"
      />
      <SnapshotGroup
        emptyText="제품 없음"
        items={meetingNote.products.map((product) => ({
          id: product.id,
          primary: product.productNameSnapshot,
          secondary: [
            product.productCategorySnapshot,
            product.productStatusSnapshot,
            product.productPriceSnapshot !== null
              ? formatMoney(product.productPriceSnapshot, "KRW")
              : null,
          ]
            .filter(Boolean)
            .join(" / "),
        }))}
        title="제품"
      />
      <SnapshotGroup
        emptyText="딜 없음"
        items={meetingNote.deals.map((deal) => ({
          id: deal.id,
          primary: deal.dealNameSnapshot,
          secondary: [deal.dealStatusSnapshot, deal.dealExpectedEndDateSnapshot]
            .filter(Boolean)
            .join(" / "),
        }))}
        title="딜"
      />
    </aside>
  );
}

// 기능 : snapshot 그룹 목록을 렌더링합니다.
function SnapshotGroup({
  title,
  emptyText,
  items,
}: {
  readonly title: string;
  readonly emptyText: string;
  readonly items: readonly {
    readonly id: string;
    readonly primary: string;
    readonly secondary: string;
  }[];
}) {
  return (
    <section className="grid gap-2 border-t border-[#F3F4F6] pt-3">
      <h3 className="text-[13px] font-semibold text-[#111827]">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-[#9CA3AF]">{emptyText}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li className="rounded-lg border border-[#E5E7EB] px-3 py-2.5" key={item.id}>
              <p className="truncate text-[13px] font-semibold text-[#111827]">{item.primary}</p>
              {item.secondary ? (
                <p className="mt-1 truncate text-[12px] text-[#6B7280]">
                  {item.secondary}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// 기능 : 한 줄 입력 필드를 렌더링합니다.
function TextField({
  id,
  label,
  register,
  errorMessage,
  type = "text",
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly type?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-[12px] font-medium text-[#374151]" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border border-[#E6EAF0] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
        id={id}
        type={type}
        {...register}
      />
      {errorMessage ? (
        <p className="text-[12px] text-[#DC2626]" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

// 기능 : 여러 줄 입력 필드를 렌더링합니다.
function TextAreaField({
  id,
  label,
  register,
  errorMessage,
  rows,
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly rows: number;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-[12px] font-medium text-[#374151]" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="resize-y rounded-md border border-[#E6EAF0] bg-white px-3 py-2 text-[13px] leading-6 text-[#111827] outline-none focus:border-[#93C5FD] focus:ring-1 focus:ring-[#93C5FD]"
        id={id}
        rows={rows}
        {...register}
      />
      {errorMessage ? (
        <p className="text-[12px] text-[#DC2626]" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

// 기능 : 성공 안내 메시지를 렌더링합니다.
function NoticeMessage({
  message,
  onDismiss,
}: {
  readonly message: string;
  readonly onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      <button
        aria-label="알림 닫기"
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-emerald-100"
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// 기능 : 오류 안내 메시지를 렌더링합니다.
function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

// 기능 : 상세 로딩 skeleton을 렌더링합니다.
function MeetingNoteEditorSkeleton() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <div className="h-20 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="h-[640px] animate-pulse rounded-md bg-muted" />
        <div className="h-[480px] animate-pulse rounded-md bg-muted" />
      </div>
    </section>
  );
}

// 기능 : router location state에서 안내 문구를 읽습니다.
function readLocationNotice(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return null;
  }

  const value = (state as Record<string, unknown>).notice;

  return typeof value === "string" ? value : null;
}
