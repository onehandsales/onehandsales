import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CircleStop,
  FileAudio,
  IdCard,
  Loader2,
  Maximize2,
  Mic,
  NotebookPen,
  Package,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { ModalFieldGroup } from "@/components/ui/modal-form";
import { ErrorState } from "@/components/ui/state";
import { useDropdownPlacement } from "@/components/ui/use-dropdown-placement";
import { useAppI18n, type AppLocale } from "@/features/app-i18n";
import { useAuthSession } from "@/features/auth";
import {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
  useDealList,
} from "@/features/deal/entity-options";
import {
  useCreateMeetingNoteMutation,
  useCreateMeetingNoteSttAiDraftMutation,
  useCreateMeetingNoteTextAiDraftMutation,
} from "@/features/meeting-note/hooks/use-meeting-note-mutations";
import { useMeetingNoteAudioRecorder } from "@/features/meeting-note/hooks/use-meeting-note-audio-recorder";
import {
  emptyMeetingNoteCreateFormValues,
  meetingNoteCreateFormSchema,
  toCreateMeetingNoteInput,
  type MeetingNoteCreateFormValues,
} from "@/features/meeting-note/schemas/meeting-note-schema";
import type {
  MeetingNote,
  MeetingNoteAiDraftContextInput,
  MeetingNoteAiDraftResponse,
  MeetingNoteSourceType,
} from "@/features/meeting-note/types/meeting-note";
import {
  MobileLocalDraftRestorePrompt,
  getOrCreateMeetingNoteCreateClientDraftId,
  isMeetingNoteCreateLocalDraftEmpty,
  rotateMeetingNoteCreateClientDraftId,
  toMeetingNoteCreateLocalDraftPayload,
  toMeetingNoteCreateValuesFromLocalDraft,
  useMobileLocalDraft,
  type MeetingNoteCreateLocalDraftPayload,
} from "@/features/mobile-local-draft";
import { getApiErrorMessage, isApiErrorRetryable } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type MeetingNoteCreateDialogProps = {
  readonly open: boolean;
  readonly initialValues?: Partial<MeetingNoteCreateFormValues>;
  readonly mode?: "docked" | "overlay" | "page";
  readonly width?: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onCreated: (meetingNote: MeetingNote) => void;
  readonly onExpand?: (values: MeetingNoteCreateFormValues) => void;
  readonly onResizeStart?: () => void;
};

type MeetingNoteDraftRequestKind = "STT" | "TEXT";

export type EntitySelectOption = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
};

const formId = "meeting-note-create-form";
const maxAudioFileSizeBytes = 25 * 1024 * 1024;
const emptyEntityIds: string[] = [];
const textareaClassName =
  "resize-none rounded-md border border-[#E2E5EC] bg-white px-3 py-2 text-sm leading-5 text-[#111827] outline-none focus:border-[#4880EE] focus:ring-2 focus:ring-[#DBEAFE]";
const actionButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#D8E0EA] bg-white px-3 text-[13px] font-semibold text-[#1F2937] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60";

// 기능 : 회의록 생성 모달을 렌더링합니다.
export function MeetingNoteCreateDialog({
  open,
  initialValues,
  mode = "overlay",
  width,
  onOpenChange,
  onCreated,
  onExpand,
  onResizeStart,
}: MeetingNoteCreateDialogProps) {
  const { t } = useAppI18n();
  const { user } = useAuthSession();
  const createMeetingNoteMutation = useCreateMeetingNoteMutation();
  const textAiDraftMutation = useCreateMeetingNoteTextAiDraftMutation();
  const sttAiDraftMutation = useCreateMeetingNoteSttAiDraftMutation();
  const {
    cancelRecording,
    clearRecording: clearAudioRecording,
    durationLabel: recordingDurationLabel,
    errorCode: recordingErrorCode,
    isSupported: isAudioRecordingSupported,
    recordedFile,
    startRecording,
    status: recordingStatus,
    stopRecording,
  } = useMeetingNoteAudioRecorder();
  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const productOptionsQuery = useDealProductOptions();
  const dealOptionsQuery = useDealList({ page: 1, sort: "createdAtDesc" });
  const [draftSourceType, setDraftSourceType] =
    useState<MeetingNoteSourceType>("MANUAL");
  const [clientDraftId, setClientDraftId] = useState(() =>
    getOrCreateMeetingNoteCreateClientDraftId()
  );
  const [rawDraftText, setRawDraftText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [draftClientError, setDraftClientError] = useState<string | null>(null);
  const [lastDraftRequestKind, setLastDraftRequestKind] =
    useState<MeetingNoteDraftRequestKind | null>(null);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MeetingNoteCreateFormValues>({
    resolver: zodResolver(meetingNoteCreateFormSchema),
    defaultValues: emptyMeetingNoteCreateFormValues,
  });

  const companyIds =
    useWatch({ control, name: "companyIds" }) ?? emptyEntityIds;
  const contactIds =
    useWatch({ control, name: "contactIds" }) ?? emptyEntityIds;
  const productIds =
    useWatch({ control, name: "productIds" }) ?? emptyEntityIds;
  const dealIds = useWatch({ control, name: "dealIds" }) ?? emptyEntityIds;
  const title = useWatch({ control, name: "title" }) ?? "";
  const details = useWatch({ control, name: "details" }) ?? "";
  const nextPlan = useWatch({ control, name: "nextPlan" }) ?? "";
  const requiredAction = useWatch({ control, name: "requiredAction" }) ?? "";
  const meetingLocalDateTime =
    useWatch({ control, name: "meetingLocalDateTime" }) ?? "";
  const localDraftPayload = useMemo<MeetingNoteCreateLocalDraftPayload>(
    () =>
      toMeetingNoteCreateLocalDraftPayload(clientDraftId, {
        title,
        meetingLocalDateTime,
        companyIds,
        contactIds,
        productIds,
        dealIds,
        details,
        nextPlan,
        requiredAction,
      }),
    [
      clientDraftId,
      companyIds,
      contactIds,
      dealIds,
      details,
      meetingLocalDateTime,
      nextPlan,
      productIds,
      requiredAction,
      title,
    ]
  );
  const {
    discardDraft: discardMeetingNoteDraft,
    promptDraft,
    restorePromptDraft,
  } = useMobileLocalDraft<MeetingNoteCreateLocalDraftPayload>({
    draftId: clientDraftId,
    draftType: "MEETING_NOTE_CREATE",
    enabled: open,
    isPayloadEmpty: isMeetingNoteCreateLocalDraftEmpty,
    onRestore: (payload) => {
      reset(toMeetingNoteCreateValuesFromLocalDraft(payload, getValues()));
      setDraftSourceType("MANUAL");
    },
    payload: localDraftPayload,
    shouldSave: isDirty,
    userId: user?.id ?? null,
  });
  const optionError =
    companyOptionsQuery.error ??
    contactOptionsQuery.error ??
    productOptionsQuery.error ??
    dealOptionsQuery.error;
  const resetTextAiDraftMutation = textAiDraftMutation.reset;
  const resetSttAiDraftMutation = sttAiDraftMutation.reset;

  useEffect(() => {
    if (open) {
      reset({
        ...emptyMeetingNoteCreateFormValues,
        ...initialValues,
        companyIds: initialValues?.companyIds ?? [],
        contactIds: initialValues?.contactIds ?? [],
        productIds: initialValues?.productIds ?? [],
        dealIds: initialValues?.dealIds ?? [],
      });
      setDraftSourceType("MANUAL");
      setRawDraftText("");
      setAudioFile(null);
      setTranscript(null);
      setIsTranscriptOpen(false);
      setDraftClientError(null);
      setLastDraftRequestKind(null);
      clearAudioRecording();
      resetTextAiDraftMutation();
      resetSttAiDraftMutation();
    }
  }, [
    clearAudioRecording,
    initialValues,
    open,
    reset,
    resetSttAiDraftMutation,
    resetTextAiDraftMutation,
  ]);

  useEffect(() => {
    if (!open || !recordedFile) {
      return;
    }

    if (recordedFile.size > maxAudioFileSizeBytes) {
      setAudioFile(null);
      setDraftClientError(t("meetingNoteCreate.audioTooLarge"));
      clearAudioRecording();
      return;
    }

    setAudioFile(recordedFile);
    setDraftClientError(null);
  }, [clearAudioRecording, open, recordedFile, t]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !createMeetingNoteMutation.isPending) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createMeetingNoteMutation.isPending, onOpenChange, open]);

  const isDocked = mode === "docked";
  const isPage = mode === "page";
  const CloseIcon = isPage ? ArrowLeft : ChevronsRight;

  if (!open && !isDocked) {
    return null;
  }

  const companyOptions: EntitySelectOption[] = (
    companyOptionsQuery.data ?? []
  ).map((company) => ({
    id: company.id,
    label: company.companyName,
  }));
  const contactOptions: EntitySelectOption[] = (
    contactOptionsQuery.data ?? []
  ).map((contact) => ({
    id: contact.id,
    label: contact.username,
    description: contact.label,
  }));
  const productOptions: EntitySelectOption[] = (
    productOptionsQuery.data ?? []
  ).map((product) => ({
    id: product.id,
    label: product.productName,
  }));
  const dealOptions: EntitySelectOption[] = (
    dealOptionsQuery.data?.items ?? []
  ).map((deal) => ({
    id: deal.id,
    label: deal.dealName,
    description: [
      deal.companies.map((company) => company.companyName).join(", "),
      deal.contacts.map((contact) => contact.username).join(", "),
    ]
      .filter(Boolean)
      .join(" / "),
  }));

  const applyDraft = (draft: MeetingNoteAiDraftResponse) => {
    setValue("details", draft.details, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("nextPlan", draft.nextPlan ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("requiredAction", draft.requiredAction ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDraftSourceType(draft.sourceType);
    setTranscript(draft.transcript);
    setIsTranscriptOpen(Boolean(draft.transcript));
    setDraftClientError(null);
  };

  // 기능 : AI 초안 요청 컨텍스트를 계산합니다.
  const getDraftContext = (): MeetingNoteAiDraftContextInput | null => {
    if (
      !meetingLocalDateTime.trim() ||
      companyIds.length === 0 ||
      contactIds.length === 0
    ) {
      setDraftClientError(t("meetingNoteCreate.contactFirstRequired"));
      return null;
    }

    return {
      meetingLocalDateTime: meetingLocalDateTime.trim(),
      companies: companyIds,
      contacts: contactIds,
      products: productIds.length ? productIds : undefined,
      deals: dealIds.length ? dealIds : undefined,
    };
  };

  // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
  const onCreateTextAiDraft = async () => {
    const text = rawDraftText.trim();

    if (!text) {
      setDraftClientError(t("meetingNoteCreate.rawMemoRequired"));
      return;
    }

    const context = getDraftContext();

    if (!context) {
      return;
    }

    setDraftClientError(null);
    setLastDraftRequestKind("TEXT");
    textAiDraftMutation.reset();
    sttAiDraftMutation.reset();

    try {
      const draft = await textAiDraftMutation.mutateAsync({
        ...context,
        text,
      });
      applyDraft(draft);
    } catch {
      // React Query mutation state renders the API error below.
    }
  };

  // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
  const onCreateSttAiDraft = async () => {
    if (!audioFile) {
      setDraftClientError(t("meetingNoteCreate.audioRequired"));
      return;
    }

    const context = getDraftContext();

    if (!context) {
      return;
    }

    setDraftClientError(null);
    setLastDraftRequestKind("STT");
    textAiDraftMutation.reset();
    sttAiDraftMutation.reset();

    try {
      const draft = await sttAiDraftMutation.mutateAsync({
        ...context,
        audioFile,
      });
      applyDraft(draft);
    } catch {
      // React Query mutation state renders the API error below.
    }
  };

  // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
  const onStartAudioRecording = async () => {
    setAudioFile(null);
    setDraftClientError(null);
    textAiDraftMutation.reset();
    sttAiDraftMutation.reset();
    await startRecording();
  };

  // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
  const onSelectAudioFile = (selectedFile: File | null) => {
    clearAudioRecording();

    if (selectedFile && selectedFile.size > maxAudioFileSizeBytes) {
      setAudioFile(null);
      setDraftClientError(t("meetingNoteCreate.audioTooLarge"));
      return;
    }

    setAudioFile(selectedFile);
    setDraftClientError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    const created = await createMeetingNoteMutation.mutateAsync(
      toCreateMeetingNoteInput(values, draftSourceType)
    );
    await discardMeetingNoteDraft("saved");
    setClientDraftId(rotateMeetingNoteCreateClientDraftId());
    onCreated(created);
    onOpenChange(false);
  });

  // 기능 : 사용자가 복구를 거부하면 기존 draft를 지우고 다음 입력은 새 draft ID로 저장합니다.
  const onDiscardPromptDraft = async () => {
    await discardMeetingNoteDraft("user_discarded");
    setClientDraftId(rotateMeetingNoteCreateClientDraftId());
  };

  const isDraftPending =
    textAiDraftMutation.isPending || sttAiDraftMutation.isPending;
  const draftApiError = textAiDraftMutation.error ?? sttAiDraftMutation.error;
  const isRecordingBusy =
    recordingStatus === "requesting" || recordingStatus === "recording";
  const recordingFallbackMessage =
    recordingErrorCode === "AUDIO_RECORDING_PERMISSION_DENIED"
      ? t("meetingNoteCreate.recordingPermissionDenied")
      : recordingErrorCode === "AUDIO_RECORDING_NOT_SUPPORTED" ||
          !isAudioRecordingSupported
        ? t("meetingNoteCreate.recordingUnsupported")
        : null;
  // 기능 : 마지막 AI 초안 요청을 현재 form 값으로 다시 실행합니다.
  const onRetryDraft = () => {
    if (lastDraftRequestKind === "TEXT") {
      void onCreateTextAiDraft();
      return;
    }

    if (lastDraftRequestKind === "STT") {
      void onCreateSttAiDraft();
    }
  };

  const panel = (
    <section
      aria-label={t("meetingNoteCreate.panelAria")}
      aria-modal={isPage ? undefined : !isDocked}
      className={
        isPage
          ? "flex min-h-full flex-col bg-white"
          : isDocked
            ? `fixed inset-y-0 right-0 z-50 flex h-screen shrink-0 flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-[transform,opacity] duration-500 ease-out will-change-transform ${
                open
                  ? "meeting-note-create-panel-enter pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-full opacity-0"
              }`
            : "pointer-events-auto relative flex h-full w-full flex-col bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] sm:max-w-[520px]"
      }
      role={isPage ? undefined : "dialog"}
      style={isDocked ? { width: width ?? 520 } : undefined}
    >
      {isDocked ? (
        <button
          aria-label={t("meetingNoteCreate.resizePanel")}
          className="absolute -left-1 top-0 z-10 h-full w-2 cursor-col-resize transition hover:bg-[#EFF6FF] focus:bg-[#EFF6FF] focus:outline-none"
          onMouseDown={(event) => {
            event.preventDefault();
            onResizeStart?.();
          }}
          type="button"
        />
      ) : null}
      <header className="flex h-10 shrink-0 items-center px-1.5">
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            aria-label={
              isPage
                ? t("meetingNoteCreate.backToList")
                : t("meetingNoteCreate.collapsePanel")
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createMeetingNoteMutation.isPending}
            onClick={() => onOpenChange(false)}
            title={
              isPage
                ? t("meetingNoteCreate.backToList")
                : t("meetingNoteCreate.collapsePanel")
            }
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          {onExpand && !isPage ? (
            <button
              aria-label={t("dealCreate.openFullPage")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8A8F98] transition hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createMeetingNoteMutation.isPending}
              onClick={() => onExpand(getValues())}
              title={t("dealCreate.openFullPage")}
              type="button"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </header>

      <form
        className="flex min-h-0 flex-1 flex-col"
        id={formId}
        onSubmit={(event) => void onSubmit(event)}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div
            className={
              isPage
                ? "mx-auto grid min-h-full w-full max-w-[920px] content-start gap-4"
                : "grid min-h-full content-start gap-4"
            }
          >
            <section className="grid cursor-auto gap-2">
              <label
                className="text-[16px] font-semibold text-[#94A3B8]"
                htmlFor="meeting-create-title"
              >
                {t("meetingNoteCreate.title")}
              </label>
              <div className="relative">
                <NotebookPen className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#CBD5E1]" />
                <input
                  aria-describedby={
                    errors.title ? "meeting-create-title-error" : undefined
                  }
                  aria-invalid={Boolean(errors.title)}
                  className="h-14 w-full border-0 bg-transparent pl-8 pr-1 text-[32px] font-semibold leading-none text-[#111827] outline-none placeholder:text-[#CBD5E1] placeholder:opacity-100"
                  id="meeting-create-title"
                  placeholder={t("meetingNoteCreate.titlePlaceholder")}
                  {...register("title")}
                />
              </div>
              {errors.title ? (
                <p
                  className="text-[12px] text-red-500"
                  id="meeting-create-title-error"
                >
                  {errors.title.message}
                </p>
              ) : null}
            </section>

            {promptDraft ? (
              <MobileLocalDraftRestorePrompt
                onDiscard={() => void onDiscardPromptDraft()}
                onRestore={restorePromptDraft}
              />
            ) : null}

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
              <MeetingDateTimeField
                errorMessage={errors.meetingLocalDateTime?.message}
                id="meeting-create-local-date-time"
                label={t("meetingNoteCreate.meetingDate")}
                register={register("meetingLocalDateTime")}
                value={meetingLocalDateTime}
                variant="panel"
                onChange={(value) =>
                  setValue("meetingLocalDateTime", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
            <EntityMultiSelectField
              emptyText={t("meetingNoteCreate.dataEmpty")}
              errorMessage={errors.companyIds?.message}
              icon={Building2}
              id="meeting-create-company-ids"
              isLoading={companyOptionsQuery.isFetching}
              label={t("dealCreate.company")}
              options={companyOptions}
              selectedIds={companyIds}
              variant="panel"
              onChange={(ids) =>
                setValue("companyIds", ids, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <EntityMultiSelectField
              emptyText={t("meetingNoteCreate.dataEmpty")}
              errorMessage={errors.contactIds?.message}
              icon={IdCard}
              id="meeting-create-contact-ids"
              isLoading={contactOptionsQuery.isFetching}
              label={t("dealCreate.contact")}
              options={contactOptions}
              selectedIds={contactIds}
              variant="panel"
              onChange={(ids) =>
                setValue("contactIds", ids, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            </section>

            <section className="grid cursor-auto gap-3 sm:grid-cols-2">
            <EntityMultiSelectField
              emptyText={t("meetingNoteCreate.dataEmpty")}
              errorMessage={errors.productIds?.message}
              icon={Package}
              id="meeting-create-product-ids"
              isLoading={productOptionsQuery.isFetching}
              label={t("meetingNoteCreate.productOptional")}
              options={productOptions}
              selectedIds={productIds}
              variant="panel"
              onChange={(ids) =>
                setValue("productIds", ids, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <EntityMultiSelectField
              emptyText={t("meetingNoteCreate.dataEmpty")}
              errorMessage={errors.dealIds?.message}
              icon={BriefcaseBusiness}
              id="meeting-create-deal-ids"
              isLoading={dealOptionsQuery.isFetching}
              label={t("meetingNoteCreate.dealOptional")}
              options={dealOptions}
              selectedIds={dealIds}
              variant="panel"
              onChange={(ids) =>
                setValue("dealIds", ids, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            </section>

            <section className="grid cursor-auto gap-3">
              <div className="text-[16px] font-semibold text-[#94A3B8]">
                {t("meetingNoteCreate.aiOrganize")}
              </div>
          <TextAreaField
            id="meeting-create-ai-raw-text"
            label={t("meetingNoteCreate.rawMemo")}
            rows={2}
            value={rawDraftText}
            variant="panel"
            onChange={setRawDraftText}
          />

          <div className="grid gap-2 rounded-md border border-[#E6EAF0] bg-[#F9FAFB] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={actionButtonClassName}
                disabled={isDraftPending}
                type="button"
                onClick={() => void onCreateTextAiDraft()}
              >
                {textAiDraftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("meetingNoteCreate.aiWithText")}
              </button>

              {recordingStatus === "recording" ? (
                <>
                  <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#FCA5A5] bg-white px-3 text-[13px] font-semibold text-[#B91C1C]">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                    {t("meetingNoteCreate.recording")} {recordingDurationLabel}
                  </span>
                  <button
                    className={actionButtonClassName}
                    disabled={isDraftPending}
                    type="button"
                    onClick={stopRecording}
                  >
                    <CircleStop className="h-4 w-4" />
                    {t("meetingNoteCreate.recordStop")}
                  </button>
                  <button
                    className={actionButtonClassName}
                    disabled={isDraftPending}
                    type="button"
                    onClick={cancelRecording}
                  >
                    <X className="h-4 w-4" />
                    {t("meetingNoteCreate.recordCancel")}
                  </button>
                </>
              ) : recordingStatus === "requesting" ? (
                <>
                  <span className="inline-flex h-9 items-center gap-2 rounded-md border border-[#D8E0EA] bg-white px-3 text-[13px] font-semibold text-[#374151]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("meetingNoteCreate.recordingPreparing")}
                  </span>
                  <button
                    className={actionButtonClassName}
                    type="button"
                    onClick={cancelRecording}
                  >
                    <X className="h-4 w-4" />
                    {t("meetingNoteCreate.recordCancel")}
                  </button>
                </>
              ) : (
                <button
                  className={actionButtonClassName}
                  disabled={isDraftPending || isRecordingBusy}
                  type="button"
                  onClick={() => void onStartAudioRecording()}
                >
                  <Mic className="h-4 w-4" />
                  {t("meetingNoteCreate.recordStart")}
                </button>
              )}

              <label
                className={cn(
                  actionButtonClassName,
                  (isDraftPending || isRecordingBusy) &&
                    "cursor-not-allowed opacity-60"
                )}
                htmlFor="meeting-create-audio-file"
              >
                <FileAudio className="h-4 w-4" />
                {t("meetingNoteCreate.audioUploadFallback")}
              </label>
              <input
                accept="audio/*"
                className="sr-only"
                disabled={isDraftPending || isRecordingBusy}
                id="meeting-create-audio-file"
                type="file"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  event.currentTarget.value = "";
                  onSelectAudioFile(selectedFile);
                }}
              />

              <button
                className={actionButtonClassName}
                disabled={isDraftPending || isRecordingBusy}
                type="button"
                onClick={() => void onCreateSttAiDraft()}
              >
                {sttAiDraftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("meetingNoteCreate.sttDraft")}
              </button>
            </div>

            {recordingFallbackMessage ? (
              <p className="break-words text-[12px] leading-4 text-[#6B7280]">
                {recordingFallbackMessage}
              </p>
            ) : null}

            {audioFile ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-[#E6EAF0] bg-white px-3 py-2 text-[13px] text-[#374151]">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <FileAudio className="h-4 w-4 shrink-0 text-[#6B7280]" />
                  <span className="truncate">{audioFile.name}</span>
                </span>
                <button
                  aria-label={t("meetingNoteCreate.audioClear")}
                  className="grid h-7 w-7 place-items-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
                  type="button"
                  onClick={() => {
                    clearAudioRecording();
                    setAudioFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {transcript ? (
              <div className="grid gap-1.5 rounded-md border border-[#D8E0EA] bg-white p-3">
                <button
                  aria-expanded={isTranscriptOpen}
                  className="flex min-w-0 items-center justify-between gap-2 text-left"
                  type="button"
                  onClick={() => setIsTranscriptOpen((current) => !current)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[12px] font-semibold text-[#374151]">
                      {t("meetingNoteCreate.transcript")}
                    </span>
                    <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#1F4EF5]">
                      {t("meetingNoteCreate.temporaryCheck")}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                      isTranscriptOpen && "rotate-180"
                    )}
                  />
                </button>
                {isTranscriptOpen ? (
                  <p className="max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-[13px] leading-5 text-[#4B5563]">
                    {transcript}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
            </section>

            <section className="grid cursor-auto gap-3">
              <div className="text-[16px] font-semibold text-[#94A3B8]">
                {t("meetingNoteCreate.meetingContent")}
              </div>
          <TextAreaField
            errorMessage={errors.details?.message}
            id="meeting-create-details"
            label={t("meetingNoteCreate.details")}
            register={register("details")}
            rows={3}
            variant="panel"
          />
          <TextAreaField
            errorMessage={errors.nextPlan?.message}
            id="meeting-create-next-plan"
            label={t("meetingNoteCreate.nextPlan")}
            register={register("nextPlan")}
            rows={1}
            variant="panel"
          />
          <TextAreaField
            errorMessage={errors.requiredAction?.message}
            id="meeting-create-required-action"
            label={t("meetingNoteCreate.requiredAction")}
            register={register("requiredAction")}
            rows={1}
            variant="panel"
          />
            </section>

        {draftClientError ? (
          <ErrorState
            message={draftClientError}
            title={t("meetingNoteCreate.aiConditionTitle")}
            variant="inline"
          />
        ) : null}

        {draftApiError ? (
          <ErrorState
            className="flex-wrap"
            message={getApiErrorMessage(draftApiError)}
            onRetry={
              isApiErrorRetryable(draftApiError) && lastDraftRequestKind
                ? onRetryDraft
                : undefined
            }
            title={t("meetingNoteCreate.aiFailed")}
            variant="inline"
          />
        ) : null}

        {optionError ? (
          <ErrorState
            message={getApiErrorMessage(optionError)}
            title={t("meetingNoteCreate.optionsFailed")}
            variant="inline"
          />
        ) : null}

        {createMeetingNoteMutation.error ? (
          <ErrorState
            message={getApiErrorMessage(createMeetingNoteMutation.error)}
            title={t("meetingNoteCreate.saveFailed")}
            variant="inline"
          />
        ) : null}

          </div>
        </div>

        <footer className="flex h-16 shrink-0 items-center px-5">
          <div
            className={
              isPage
                ? "mx-auto flex w-full max-w-[920px] justify-end gap-2"
                : "flex w-full justify-end gap-2"
            }
          >
            <button
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createMeetingNoteMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {isPage ? t("dealCreate.list") : t("common.close")}
            </button>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#4880EE] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={createMeetingNoteMutation.isPending}
              type="submit"
            >
              {createMeetingNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {createMeetingNoteMutation.isPending
                ? t("common.saving")
                : t("common.save")}
            </button>
          </div>
        </footer>
      </form>
    </section>
  );

  if (isDocked || isPage) {
    return panel;
  }

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-50 flex w-full justify-end">
      {panel}
    </div>
  );
}

type MeetingNoteCreateFieldVariant = "modal" | "panel";

type MeetingNoteCreatePanelPropertyProps = {
  readonly children: ReactNode;
  readonly error?: string;
  readonly errorId?: string;
  readonly label: string;
};

// 기능 : 회의록 생성 패널 속성 영역을 렌더링합니다.
function MeetingNoteCreatePanelProperty({
  children,
  error,
  errorId,
  label,
}: MeetingNoteCreatePanelPropertyProps) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="text-[16px] font-semibold text-[#94A3B8]">{label}</div>
      <div className="min-w-0">
        {children}
        {error ? (
          <p
            className="mt-1 truncate text-[12px] leading-4 text-red-500"
            id={errorId}
            title={error}
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// 기능 : 회의 일시 입력 필드를 렌더링합니다.
function MeetingDateTimeField({
  id,
  label,
  value,
  register,
  errorMessage,
  variant = "modal",
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly variant?: MeetingNoteCreateFieldVariant;
  readonly onChange: (value: string) => void;
}) {
  const { locale, t } = useAppI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const placement = useDropdownPlacement({
    estimatedHeight: 340,
    isOpen,
    triggerRef: wrapperRef,
  });
  const groupId = `${id}-field`;
  const errorId =
    variant === "panel" ? `${id}-message` : `${groupId}-message`;
  const parts = parseDateTimeValue(value);
  const [viewYear, setViewYear] = useState(parts.year);
  const [viewMonth, setViewMonth] = useState(parts.month);
  const calendarDays = createCalendarDays(viewYear, viewMonth);
  const weekdayLabels = getWeekdayLabels(locale);

  useEffect(() => {
    setViewYear(parts.year);
    setViewMonth(parts.month);
  }, [parts.month, parts.year]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  // 기능 : 날짜 선택 변경을 처리합니다.
  const updateDate = (year: number, month: number, day: number) => {
    onChange(toDateTimeValue({ ...parts, year, month, day }));
  };

  // 기능 : 시간 선택 변경을 처리합니다.
  const updateTime = (next: Partial<Pick<DateTimeParts, "hour" | "minute">>) => {
    onChange(toDateTimeValue({ ...parts, ...next }));
  };

  const moveMonth = (offset: number) => {
    const nextDate = new Date(viewYear, viewMonth - 1 + offset, 1);
    setViewYear(nextDate.getFullYear());
    setViewMonth(nextDate.getMonth() + 1);
  };

  const field = (
      <div ref={wrapperRef} className="relative">
        <input id={`${id}-value`} type="hidden" {...register} />
        <button
          aria-describedby={errorMessage ? errorId : undefined}
          aria-expanded={isOpen}
          aria-invalid={Boolean(errorMessage)}
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-md border bg-white px-3 text-[13px] text-[#111827] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]",
            isOpen ? "border-[#4880EE] ring-1 ring-[#4880EE]" : "border-[#E6EAF0]"
          )}
          id={id}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
        >
          <CalendarClock className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          <span className="min-w-0 flex-1 truncate text-left">
            {formatDateTimeLabel(parts, locale)}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen ? (
          <div
            className={cn(
              "absolute left-0 z-50 w-full rounded-md border border-[#E6EAF0] bg-white p-3 shadow-lg",
              placement === "up"
                ? "bottom-[calc(100%+4px)]"
                : "top-[calc(100%+4px)]"
            )}
          >
            <div className="flex items-center justify-between">
              <button
                aria-label={t("meetingNoteCreate.monthPrevious")}
                className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] hover:bg-[#F3F4F6]"
                type="button"
                onClick={() => moveMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[13px] font-semibold text-[#111827]">
                {formatCalendarMonthLabel(viewYear, viewMonth, locale)}
              </span>
              <button
                aria-label={t("meetingNoteCreate.monthNext")}
                className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] hover:bg-[#F3F4F6]"
                type="button"
                onClick={() => moveMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#6B7280]">
              {weekdayLabels.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected =
                  day.year === parts.year &&
                  day.month === parts.month &&
                  day.day === parts.day;
                const isCurrentMonth = day.month === viewMonth;

                return (
                  <button
                    className={cn(
                      "h-7 rounded-md text-[12px] transition-colors hover:bg-[#EFF6FF]",
                      isCurrentMonth ? "text-[#111827]" : "text-[#CBD5E1]",
                      isSelected && "bg-[#4880EE] font-semibold text-white hover:bg-[#1D4ED8]"
                    )}
                    key={`${day.year}-${day.month}-${day.day}`}
                    type="button"
                    onClick={() => updateDate(day.year, day.month, day.day)}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-[#E6EAF0] pt-3">
              <span className="shrink-0 text-[12px] font-medium text-[#6B7280]">
                {t("meetingNoteCreate.time")}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <input
                  aria-label={t("meetingNoteCreate.timeHour")}
                  className="h-9 w-12 rounded-md border border-[#E6EAF0] bg-white text-center text-[13px] outline-none focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  inputMode="numeric"
                  maxLength={2}
                  value={padTwo(parts.hour)}
                  onChange={(event) =>
                    updateTime({
                      hour: clampTimeUnit(event.target.value, 23),
                    })
                  }
                />
                <span className="text-[13px] font-semibold text-[#6B7280]">:</span>
                <input
                  aria-label={t("meetingNoteCreate.timeMinute")}
                  className="h-9 w-12 rounded-md border border-[#E6EAF0] bg-white text-center text-[13px] outline-none focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                  inputMode="numeric"
                  maxLength={2}
                  value={padTwo(parts.minute)}
                  onChange={(event) =>
                    updateTime({
                      minute: clampTimeUnit(event.target.value, 59),
                    })
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
  );

  if (variant === "panel") {
    return (
      <MeetingNoteCreatePanelProperty
        error={errorMessage}
        errorId={errorId}
        label={label}
      >
        {field}
      </MeetingNoteCreatePanelProperty>
    );
  }

  return (
    <ModalFieldGroup
      className="gap-1.5"
      error={errorMessage}
      id={groupId}
      label={label}
    >
      {field}
    </ModalFieldGroup>
  );
}

// 기능 : 여러 줄 텍스트 입력 필드를 렌더링합니다.
function TextAreaField({
  id,
  label,
  register,
  errorMessage,
  rows,
  value,
  variant = "modal",
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly register?: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly rows: number;
  readonly value?: string;
  readonly variant?: MeetingNoteCreateFieldVariant;
  readonly onChange?: (value: string) => void;
}) {
  const registrationProps = register ?? {};
  const errorId =
    variant === "panel" ? `${id}-message` : `${id}-message`;

  const field = (
      <textarea
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={Boolean(errorMessage)}
        aria-label={label}
        className={textareaClassName}
        id={id}
        rows={rows}
        value={value}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : register?.onChange
        }
        {...registrationProps}
      />
  );

  if (variant === "panel") {
    return (
      <MeetingNoteCreatePanelProperty
        error={errorMessage}
        errorId={errorId}
        label={label}
      >
        {field}
      </MeetingNoteCreatePanelProperty>
    );
  }

  return (
    <ModalFieldGroup
      className="gap-1.5"
      error={errorMessage}
      id={id}
      label={label}
    >
      {field}
    </ModalFieldGroup>
  );
}

// 기능 : 연결 엔티티 다중 선택 필드를 렌더링합니다.
export function EntityMultiSelectField({
  id,
  label,
  options,
  selectedIds,
  isLoading,
  errorMessage,
  emptyText,
  icon: Icon,
  variant = "modal",
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly options: readonly EntitySelectOption[];
  readonly selectedIds: readonly string[];
  readonly isLoading: boolean;
  readonly errorMessage?: string;
  readonly emptyText: string;
  readonly icon: LucideIcon;
  readonly variant?: MeetingNoteCreateFieldVariant;
  readonly onChange: (ids: string[]) => void;
}) {
  const { t } = useAppI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const placement = useDropdownPlacement({
    estimatedHeight: 220,
    isOpen,
    triggerRef: wrapperRef,
  });
  const selectedIdSet = new Set(selectedIds);
  const selectedOptions = options.filter((option) =>
    selectedIdSet.has(option.id)
  );
  const hasSelection = selectedOptions.length > 0;
  const triggerText = isLoading
    ? t("common.loading")
    : hasSelection
      ? selectedOptions.length === 1
        ? selectedOptions[0]?.label
        : t("meetingNoteCreate.selectedMore", {
            values: {
              count: selectedOptions.length - 1,
              label: selectedOptions[0]?.label ?? label,
            },
          })
      : t("meetingNoteCreate.selectLabel", { values: { label } });
  const errorId =
    variant === "panel" ? `${id}-message` : `${id}-message`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 기능 : 회의록 화면의 사용자 이벤트를 처리합니다.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // 기능 : 회의록 화면의 열림 또는 선택 상태를 전환합니다.
  const toggleOption = (optionId: string) => {
    if (selectedIdSet.has(optionId)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== optionId));
      return;
    }

    onChange([...selectedIds, optionId]);
  };

  const field = (
      <div ref={wrapperRef} className="relative">
        <button
          aria-describedby={errorMessage ? errorId : undefined}
          aria-expanded={isOpen}
          aria-invalid={Boolean(errorMessage)}
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-md border bg-white px-3 text-[13px] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]",
            isOpen || hasSelection ? "border-[#4880EE]" : "border-[#E6EAF0]",
            isOpen && "ring-1 ring-[#4880EE]",
            hasSelection ? "text-[#111827]" : "text-[#9CA3AF]"
          )}
          disabled={isLoading}
          id={id}
          type="button"
          onClick={() => setIsOpen((value) => !value)}
        >
          <Icon className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          <span className="min-w-0 flex-1 truncate text-left">{triggerText}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen ? (
          <div
            className={cn(
              "absolute left-0 right-0 z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
              placement === "up"
                ? "bottom-[calc(100%+4px)]"
                : "top-[calc(100%+4px)]"
            )}
          >
            <div className="max-h-[176px] overflow-y-auto py-1">
              {isLoading ? (
                <p className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
                  {t("common.loading")}
                </p>
              ) : options.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-[#9CA3AF]">
                  {emptyText}
                </p>
              ) : (
                options.map((option) => {
                  const isSelected = selectedIdSet.has(option.id);

                  return (
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-[#F9FAFB]",
                        isSelected && "bg-[#EFF6FF]"
                      )}
                      key={option.id}
                    >
                      <input
                        checked={isSelected}
                        className="h-3.5 w-3.5 shrink-0 accent-[#4880EE]"
                        type="checkbox"
                        onChange={() => toggleOption(option.id)}
                      />
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="truncate text-[#374151]">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="truncate text-[11px] text-[#9CA3AF]">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>
  );

  if (variant === "panel") {
    return (
      <MeetingNoteCreatePanelProperty
        error={errorMessage}
        errorId={errorId}
        label={label}
      >
        {field}
      </MeetingNoteCreatePanelProperty>
    );
  }

  return (
    <ModalFieldGroup
      className="gap-1.5"
      error={errorMessage}
      id={id}
      label={label}
    >
      {field}
    </ModalFieldGroup>
  );
}

type DateTimeParts = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
};

// 기능 : 날짜 시간 입력값을 파싱합니다.
function parseDateTimeValue(value: string): DateTimeParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);

  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5]),
    };
  }

  const fallback = new Date();

  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
    hour: fallback.getHours(),
    minute: fallback.getMinutes(),
  };
}

// 기능 : 날짜 시간 입력값으로 변환합니다.
function toDateTimeValue(parts: DateTimeParts): string {
  return [
    `${parts.year}-${padTwo(parts.month)}-${padTwo(parts.day)}`,
    `${padTwo(parts.hour)}:${padTwo(parts.minute)}`,
  ].join("T");
}

// 기능 : 날짜 시간 라벨 표시 문구를 생성합니다.
function formatDateTimeLabel(parts: DateTimeParts, locale: AppLocale): string {
  const date = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// 기능 : 캘린더 날짜 목록을 생성합니다.
function createCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month - 1, 1 - startOffset + index);

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  });
}

// 기능 : 날짜 선택기 상단 월 표기를 현재 앱 locale 기준으로 변환합니다.
function formatCalendarMonthLabel(
  year: number,
  month: number,
  locale: AppLocale,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

// 기능 : 달력 요일 헤더를 현재 앱 locale의 짧은 요일명으로 만듭니다.
function getWeekdayLabels(locale: AppLocale) {
  const formatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
  });

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(2026, 7, 2 + index)),
  );
}

// 기능 : 브라우저 locale을 Intl formatting에 사용할 값으로 정규화합니다.
function getIntlLocale(locale: AppLocale) {
  return locale === "ko-KR" ? "ko-KR" : "en-US";
}

// 기능 : 시간 입력 단위를 허용 범위 안으로 제한합니다.
function clampTimeUnit(value: string, max: number): number {
  const digits = value.replace(/\D/g, "").slice(0, 2);

  if (!digits) {
    return 0;
  }

  return Math.min(max, Number(digits));
}

// 기능 : 숫자 값을 두 자리 문자열로 맞춥니다.
function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}
