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
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            to="/meeting-notes"
          >
            <ArrowLeft className="h-4 w-4" />
            회의록 목록
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">
            {isEdit ? "회의록 상세" : "회의록 작성"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            회사와 담당자, 미팅 내용, 다음 행동을 수동으로 기록합니다.
          </p>
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form
          className="grid gap-5 rounded-md border bg-white p-4"
          id="meeting-note-form"
          onSubmit={onSubmit}
        >
          <section className="grid gap-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-base font-semibold">기본 정보</h2>
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

          <section className="grid gap-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-base font-semibold">제품과 딜</h2>
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

          <section className="grid gap-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-semibold">미팅 내용</h2>
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

        <MeetingNoteSnapshotPanel meetingNote={activeMeetingNote} />
      </div>
    </section>
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
      <label className="text-sm font-medium" htmlFor="meeting-deal-search">
        딜 검색
      </label>
      <div className="relative">
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-describedby={errorMessage ? "meeting-deal-error" : undefined}
          aria-invalid={Boolean(errorMessage)}
          className="h-10 w-full rounded-md border pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="meeting-deal-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="딜명 검색"
          value={search}
        />
        {selectedId || search ? (
          <button
            aria-label="딜 선택 지우기"
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={onClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {shouldShowOptions ? (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">검색 중</p>
          ) : options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              검색된 딜이 없습니다.
            </p>
          ) : (
            options.map((option) => (
              <button
                className="grid w-full gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
                key={option.id}
                onClick={() => onSelect(option)}
                type="button"
              >
                <span className="font-medium">{option.name}</span>
                <span className="text-xs text-muted-foreground">
                  {option.subtitle || "-"}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
      {errorMessage ? (
        <p className="text-xs text-destructive" id="meeting-deal-error">
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
      <aside className="grid h-fit gap-4 rounded-md border bg-white p-4">
        <h2 className="text-base font-semibold">저장된 스냅샷</h2>
        <p className="text-sm text-muted-foreground">
          저장 후 회사, 담당자, 제품, 딜 스냅샷이 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <aside className="grid h-fit gap-4 rounded-md border bg-white p-4">
      <div>
        <h2 className="text-base font-semibold">저장된 스냅샷</h2>
        <p className="mt-1 text-xs text-muted-foreground">
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
    <section className="grid gap-2 border-t pt-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li className="rounded-md bg-muted/50 px-3 py-2" key={item.id}>
              <p className="truncate text-sm font-medium">{item.primary}</p>
              {item.secondary ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
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
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        type={type}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
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
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="resize-y rounded-md border px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
        id={id}
        rows={rows}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
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
