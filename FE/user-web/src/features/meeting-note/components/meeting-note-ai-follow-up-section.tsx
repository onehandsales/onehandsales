import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clipboard,
  Loader2,
  Mail,
  MessageSquareText,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/state";
import { useToast } from "@/components/ui/use-toast";
import { useCreateFollowingActionLogMutation } from "@/features/deal/hooks/use-deal-mutations";
import {
  useCreateMeetingNoteFollowUpDraftMutation,
  useCreateMeetingNoteNextActionDraftMutation,
} from "@/features/meeting-note/hooks/use-meeting-note-mutations";
import type {
  MeetingNote,
  MeetingNoteContact,
  MeetingNoteDeal,
  MeetingNoteFollowUpDraftChannel,
  MeetingNoteFollowUpDraftResponse,
  MeetingNoteFollowUpDraftSuggestedRecipient,
  MeetingNoteFollowUpDraftTone,
  MeetingNoteNextActionDraftConfidence,
  MeetingNoteNextActionDraftItem,
} from "@/features/meeting-note/types/meeting-note";
import { getApiErrorMessage, isApiErrorRetryable } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

type MeetingNoteAiFollowUpSectionProps = {
  readonly detail: MeetingNote;
};

type EditableNextActionCandidate = {
  readonly clientSuggestionId: string;
  title: string;
  readonly memo: string | null;
  readonly recommendedDueDate: string | null;
  dealId: string | null;
  readonly confidence: MeetingNoteNextActionDraftConfidence;
  readonly reason: string | null;
};

type EditableFollowUpDraft = {
  readonly channel: MeetingNoteFollowUpDraftChannel;
  subject: string;
  body: string;
  copyableText: string;
  readonly suggestedRecipient: MeetingNoteFollowUpDraftSuggestedRecipient | null;
};

type PanelErrorSource = "client" | "copy" | "draft" | "save";

type PanelErrorState = {
  readonly message: string;
  readonly source: PanelErrorSource;
};

const FOLLOW_UP_CHANNEL_OPTIONS = [
  { label: "이메일", value: "EMAIL" },
  { label: "SMS", value: "SMS" },
] satisfies readonly {
  readonly label: string;
  readonly value: MeetingNoteFollowUpDraftChannel;
}[];

const FOLLOW_UP_TONE_OPTIONS = [
  { label: "정중하게", value: "POLITE" },
  { label: "부드럽게", value: "FRIENDLY" },
  { label: "격식 있게", value: "FORMAL" },
] satisfies readonly {
  readonly label: string;
  readonly value: MeetingNoteFollowUpDraftTone;
}[];

const controlButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#D8E0EA] bg-white px-3 text-[13px] font-semibold text-[#1F2937] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60";
const primaryButtonClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#4880EE] bg-[#4880EE] px-3 text-[13px] font-semibold text-white transition hover:bg-[#1F4EF5] disabled:cursor-not-allowed disabled:opacity-60";
const inputClassName =
  "h-9 w-full rounded-md border border-[#D8E0EA] bg-white px-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]";
const textareaClassName =
  "w-full resize-none rounded-md border border-[#D8E0EA] bg-white px-3 py-2 text-[13px] leading-6 text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]";

// 기능 : 회의록 상세에서 AI 다음 행동 후보와 follow-up 초안을 생성/편집합니다.
export function MeetingNoteAiFollowUpSection({
  detail,
}: MeetingNoteAiFollowUpSectionProps) {
  const nextActionDraftMutation = useCreateMeetingNoteNextActionDraftMutation();
  const followUpDraftMutation = useCreateMeetingNoteFollowUpDraftMutation();
  const createFollowingActionMutation = useCreateFollowingActionLogMutation();
  const { toast, node: toastNode } = useToast();
  const activeDeals = useMemo(
    () => toActiveMeetingNoteDeals(detail.deals),
    [detail.deals],
  );
  const activeContacts = useMemo(
    () => toActiveMeetingNoteContacts(detail.contacts),
    [detail.contacts],
  );
  const [selectedDealId, setSelectedDealId] = useState(
    () => activeDeals[0]?.dealId ?? "",
  );
  const [selectedContactId, setSelectedContactId] = useState(
    () => activeContacts[0]?.contactId ?? "",
  );
  const [nextActionCandidates, setNextActionCandidates] = useState<
    EditableNextActionCandidate[]
  >([]);
  const [savedCandidateIds, setSavedCandidateIds] = useState<string[]>([]);
  const [savingCandidateId, setSavingCandidateId] = useState<string | null>(null);
  const [nextActionError, setNextActionError] =
    useState<PanelErrorState | null>(null);
  const [followUpChannel, setFollowUpChannel] =
    useState<MeetingNoteFollowUpDraftChannel>("EMAIL");
  const [followUpTone, setFollowUpTone] =
    useState<MeetingNoteFollowUpDraftTone>("POLITE");
  const [followUpDraft, setFollowUpDraft] =
    useState<EditableFollowUpDraft | null>(null);
  const [followUpError, setFollowUpError] = useState<PanelErrorState | null>(
    null,
  );

  useEffect(() => {
    setSelectedDealId((current) =>
      activeDeals.some((deal) => deal.dealId === current)
        ? current
        : activeDeals[0]?.dealId ?? "",
    );
  }, [activeDeals]);

  useEffect(() => {
    setSelectedContactId((current) =>
      activeContacts.some((contact) => contact.contactId === current)
        ? current
        : activeContacts[0]?.contactId ?? "",
    );
  }, [activeContacts]);

  useEffect(() => {
    setNextActionCandidates([]);
    setSavedCandidateIds([]);
    setNextActionError(null);
    setFollowUpDraft(null);
    setFollowUpError(null);
  }, [detail.id]);

  const selectedDeal = activeDeals.find((deal) => deal.dealId === selectedDealId);
  const selectedContact = activeContacts.find(
    (contact) => contact.contactId === selectedContactId,
  );
  const isNextActionDraftPending = nextActionDraftMutation.isPending;
  const isFollowUpDraftPending = followUpDraftMutation.isPending;

  // 기능 : 딜 context 변경 시 이전 AI 후보와 follow-up 초안을 비웁니다.
  const onSelectDealContext = (dealId: string) => {
    setSelectedDealId(dealId);
    setNextActionCandidates([]);
    setSavedCandidateIds([]);
    setNextActionError(null);
    setFollowUpDraft(null);
    setFollowUpError(null);
  };

  // 기능 : 수신자 context 변경 시 이전 follow-up 초안을 비웁니다.
  const onSelectContactContext = (contactId: string) => {
    setSelectedContactId(contactId);
    setFollowUpDraft(null);
    setFollowUpError(null);
  };

  // 기능 : follow-up 어조 변경 시 이전 channel 초안을 비웁니다.
  const onChangeFollowUpTone = (tone: MeetingNoteFollowUpDraftTone) => {
    setFollowUpTone(tone);
    setFollowUpDraft(null);
    setFollowUpError(null);
  };

  // 기능 : 저장된 회의록과 선택된 딜 맥락으로 다음 행동 후보를 생성합니다.
  const onCreateNextActionDrafts = async () => {
    if (activeDeals.length === 0) {
      setNextActionError({
        message: "딜을 연결하면 다음 행동 후보를 만들 수 있어요.",
        source: "client",
      });
      return;
    }

    setNextActionError(null);
    setSavedCandidateIds([]);
    nextActionDraftMutation.reset();

    try {
      const response = await nextActionDraftMutation.mutateAsync({
        dealId: selectedDealId || undefined,
        maxCandidates: 3,
        meetingNoteId: detail.id,
      });

      setNextActionCandidates(
        response.items.map((candidate) =>
          toEditableNextActionCandidate(candidate, selectedDealId, activeDeals),
        ),
      );
    } catch (error) {
      setNextActionError({
        message: getApiErrorMessage(error),
        source: "draft",
      });
    }
  };

  // 기능 : 사용자가 확인한 후보만 기존 딜 다음 행동 API로 저장합니다.
  const onSaveNextActionCandidate = async (
    candidate: EditableNextActionCandidate,
  ) => {
    const followingAction = candidate.title.trim();
    const dealId = resolveCandidateDealId(candidate, selectedDealId, activeDeals);

    if (!followingAction) {
      setNextActionError({
        message: "다음 행동을 입력해 주세요.",
        source: "client",
      });
      return;
    }

    if (!dealId) {
      setNextActionError({
        message: "딜을 선택하면 저장할 수 있어요.",
        source: "client",
      });
      return;
    }

    setNextActionError(null);
    setSavingCandidateId(candidate.clientSuggestionId);

    try {
      await createFollowingActionMutation.mutateAsync({
        dealId,
        followingAction,
      });
      setSavedCandidateIds((current) => [
        ...new Set([...current, candidate.clientSuggestionId]),
      ]);
      toast({ message: "다음 행동을 저장했어요.", variant: "success" });
    } catch (error) {
      setNextActionError({
        message: getApiErrorMessage(error),
        source: "save",
      });
    } finally {
      setSavingCandidateId(null);
    }
  };

  // 기능 : 사용자가 수정 중인 다음 행동 후보의 저장 대상과 문구를 갱신합니다.
  const updateNextActionCandidate = (
    clientSuggestionId: string,
    patch: Partial<Pick<EditableNextActionCandidate, "dealId" | "title">>,
  ) => {
    setNextActionCandidates((current) =>
      current.map((candidate) =>
        candidate.clientSuggestionId === clientSuggestionId
          ? { ...candidate, ...patch }
          : candidate,
      ),
    );
  };

  // 기능 : 선택한 채널/수신자/딜 맥락으로 follow-up 문안 초안을 생성합니다.
  const onCreateFollowUpDraft = async () => {
    setFollowUpError(null);
    followUpDraftMutation.reset();

    try {
      const response = await followUpDraftMutation.mutateAsync({
        channel: followUpChannel,
        dealId: selectedDealId || undefined,
        language: getDraftLanguage(),
        meetingNoteId: detail.id,
        recipientContactId: selectedContactId || undefined,
        tone: followUpTone,
      });

      setFollowUpDraft(toEditableFollowUpDraft(response));
    } catch (error) {
      setFollowUpError({
        message: getApiErrorMessage(error),
        source: "draft",
      });
    }
  };

  // 기능 : 편집된 follow-up 초안을 클립보드에 복사합니다.
  const onCopyFollowUpDraft = async () => {
    if (!followUpDraft) {
      return;
    }

    const copyText = toFollowUpCopyText(followUpDraft);

    if (!copyText.trim()) {
      setFollowUpError({
        message: "복사할 문안을 입력해 주세요.",
        source: "copy",
      });
      return;
    }

    try {
      await copyTextToClipboard(copyText);
      toast({ message: "초안을 복사했어요.", variant: "success" });
    } catch {
      setFollowUpError({
        message: "복사하지 못했어요. 문안을 직접 선택해 주세요.",
        source: "copy",
      });
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="grid gap-3 border-b border-[#E5E7EB] px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,auto)] lg:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#4880EE]" />
            <h2 className="truncate text-[14px] font-extrabold text-[#111827]">
              AI 후속 작업
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <MeetingNoteAiContextChip
              icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
              label="딜"
              value={selectedDeal?.dealNameSnapshot ?? "연결 딜 없음"}
            />
            <MeetingNoteAiContextChip
              icon={<UserRound className="h-3.5 w-3.5" />}
              label="수신자"
              value={selectedContact?.contactUsernameSnapshot ?? "수신자 없음"}
            />
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          <MeetingNoteAiSelect
            ariaLabel="AI 후속 작업 딜 선택"
            disabled={activeDeals.length === 0}
            options={activeDeals.map((deal) => ({
              label: deal.dealNameSnapshot,
              value: deal.dealId,
            }))}
            placeholder="딜 없음"
            value={selectedDealId}
            onChange={onSelectDealContext}
          />
          <MeetingNoteAiSelect
            ariaLabel="Follow-up 수신자 선택"
            disabled={activeContacts.length === 0}
            options={activeContacts.map((contact) => ({
              label: contact.contactUsernameSnapshot,
              value: contact.contactId,
            }))}
            placeholder="수신자 없음"
            value={selectedContactId}
            onChange={onSelectContactContext}
          />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="min-w-0 border-b border-[#E5E7EB] p-4 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-[13px] font-extrabold text-[#111827]">
                다음 행동 후보
              </h3>
              <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                확인한 후보만 딜에 저장해요.
              </p>
            </div>
            <button
              className={primaryButtonClassName}
              disabled={isNextActionDraftPending || activeDeals.length === 0}
              type="button"
              onClick={() => void onCreateNextActionDrafts()}
            >
              {isNextActionDraftPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              만들기
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {nextActionError ? (
              <ErrorState
                className="flex-wrap"
                message={nextActionError.message}
                onRetry={
                  nextActionError.source === "draft" &&
                  isApiErrorRetryable(nextActionDraftMutation.error)
                    ? () => void onCreateNextActionDrafts()
                    : undefined
                }
                title={getNextActionErrorTitle(nextActionError.source)}
                variant="inline"
              />
            ) : null}

            {nextActionCandidates.length === 0 ? (
              <MeetingNoteAiEmptyState
                text={
                  activeDeals.length === 0
                    ? "딜을 연결하면 다음 행동을 저장할 수 있어요."
                    : "후보를 만들면 여기에서 확인할 수 있어요."
                }
              />
            ) : (
              <div className="divide-y divide-[#EEF2F7] border-y border-[#EEF2F7]">
                {nextActionCandidates.map((candidate) => {
                  const candidateDealId = resolveCandidateDealId(
                    candidate,
                    selectedDealId,
                    activeDeals,
                  );
                  const isSaved = savedCandidateIds.includes(
                    candidate.clientSuggestionId,
                  );
                  const isSaving =
                    savingCandidateId === candidate.clientSuggestionId;

                  return (
                    <div
                      className="grid min-w-0 gap-3 py-3"
                      key={candidate.clientSuggestionId}
                    >
                      <textarea
                        aria-label="다음 행동 후보"
                        className={textareaClassName}
                        rows={2}
                        value={candidate.title}
                        onChange={(event) =>
                          updateNextActionCandidate(
                            candidate.clientSuggestionId,
                            { title: event.target.value },
                          )
                        }
                      />

                      <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#6B7280]">
                        <span className="rounded-full bg-[#F3F4F6] px-2 py-1">
                          {getConfidenceLabel(candidate.confidence)}
                        </span>
                        {candidate.recommendedDueDate ? (
                          <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-1">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {formatDate(candidate.recommendedDueDate)}
                            </span>
                          </span>
                        ) : null}
                        {activeDeals.length > 1 ? (
                          <select
                            aria-label="후보 저장 딜"
                            className="h-8 max-w-full rounded-md border border-[#D8E0EA] bg-white px-2 text-[12px] outline-none focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
                            value={candidateDealId}
                            onChange={(event) =>
                              updateNextActionCandidate(
                                candidate.clientSuggestionId,
                                { dealId: event.target.value },
                              )
                            }
                          >
                            {activeDeals.map((deal) => (
                              <option key={deal.dealId} value={deal.dealId}>
                                {deal.dealNameSnapshot}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="min-w-0 truncate">
                            딜 {formatDealName(candidateDealId, activeDeals)}
                          </span>
                        )}
                      </div>

                      {formatCandidateSupportText(candidate) ? (
                        <p className="whitespace-pre-wrap break-words text-[12px] leading-5 text-[#6B7280]">
                          {formatCandidateSupportText(candidate)}
                        </p>
                      ) : null}

                      <div className="flex justify-end">
                        <button
                          className={controlButtonClassName}
                          disabled={
                            isSaving ||
                            isSaved ||
                            !candidate.title.trim() ||
                            !candidateDealId
                          }
                          type="button"
                          onClick={() =>
                            void onSaveNextActionCandidate(candidate)
                          }
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isSaved ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <BriefcaseBusiness className="h-4 w-4" />
                          )}
                          {isSaved ? "저장했어요" : "저장"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-[13px] font-extrabold text-[#111827]">
                  Follow-up 초안
                </h3>
                <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                  문안을 다듬고 복사해요.
                </p>
              </div>
              <button
                className={primaryButtonClassName}
                disabled={isFollowUpDraftPending}
                type="button"
                onClick={() => void onCreateFollowUpDraft()}
              >
                {isFollowUpDraftPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                만들기
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_148px]">
              <div className="grid grid-cols-2 gap-1 rounded-md bg-[#F3F4F6] p-1">
                {FOLLOW_UP_CHANNEL_OPTIONS.map((option) => {
                  const Icon =
                    option.value === "EMAIL" ? Mail : MessageSquareText;
                  const isSelected = followUpChannel === option.value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-[12px] font-semibold transition",
                        isSelected
                          ? "bg-white text-[#1F4EF5] shadow-sm"
                          : "text-[#6B7280] hover:bg-white/70",
                      )}
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFollowUpChannel(option.value);
                        setFollowUpDraft(null);
                        setFollowUpError(null);
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <select
                aria-label="Follow-up 어조"
                className={inputClassName}
                value={followUpTone}
                onChange={(event) =>
                  onChangeFollowUpTone(
                    event.target.value as MeetingNoteFollowUpDraftTone,
                  )
                }
              >
                {FOLLOW_UP_TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {followUpError ? (
              <ErrorState
                className="flex-wrap"
                message={followUpError.message}
                onRetry={
                  followUpError.source === "draft" &&
                  isApiErrorRetryable(followUpDraftMutation.error)
                    ? () => void onCreateFollowUpDraft()
                    : undefined
                }
                title={getFollowUpErrorTitle(followUpError.source)}
                variant="inline"
              />
            ) : null}

            {!followUpDraft ? (
              <MeetingNoteAiEmptyState text="초안을 만들면 여기에서 수정하고 복사할 수 있어요." />
            ) : (
              <div className="grid gap-3 border-y border-[#EEF2F7] py-3">
                {followUpDraft.suggestedRecipient ? (
                  <MeetingNoteAiContextChip
                    icon={<UserRound className="h-3.5 w-3.5" />}
                    label="추천 수신자"
                    value={followUpDraft.suggestedRecipient.displayName}
                  />
                ) : null}

                {followUpDraft.channel === "EMAIL" ? (
                  <input
                    aria-label="Follow-up 이메일 제목"
                    className={inputClassName}
                    value={followUpDraft.subject}
                    onChange={(event) =>
                      setFollowUpDraft((current) =>
                        current
                          ? { ...current, subject: event.target.value }
                          : current,
                      )
                    }
                  />
                ) : null}

                <textarea
                  aria-label="Follow-up 본문"
                  className={textareaClassName}
                  rows={followUpDraft.channel === "EMAIL" ? 8 : 4}
                  value={followUpDraft.body}
                  onChange={(event) =>
                    setFollowUpDraft((current) =>
                      current
                        ? {
                            ...current,
                            body: event.target.value,
                            copyableText: event.target.value,
                          }
                        : current,
                    )
                  }
                />

                <div className="flex justify-end">
                  <button
                    className={controlButtonClassName}
                    disabled={!toFollowUpCopyText(followUpDraft).trim()}
                    type="button"
                    onClick={() => void onCopyFollowUpDraft()}
                  >
                    <Clipboard className="h-4 w-4" />
                    복사
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastNode}
    </section>
  );
}

// 기능 : AI 후속 작업에서 선택된 CRM record 맥락을 작은 chip으로 표시합니다.
function MeetingNoteAiContextChip({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[12px] font-semibold text-[#374151]">
      <span className="shrink-0 text-[#4880EE]">{icon}</span>
      <span className="shrink-0 text-[#9CA3AF]">{label}</span>
      <span className="min-w-0 truncate">{value}</span>
    </span>
  );
}

// 기능 : 딜과 수신자 선택을 모바일에서도 고정 높이로 표시합니다.
function MeetingNoteAiSelect({
  ariaLabel,
  disabled,
  options,
  placeholder,
  value,
  onChange,
}: {
  readonly ariaLabel: string;
  readonly disabled: boolean;
  readonly options: readonly { readonly label: string; readonly value: string }[];
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={ariaLabel}
      className={inputClassName}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.length === 0 ? (
        <option value="">{placeholder}</option>
      ) : (
        <>
          {value ? null : <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      )}
    </select>
  );
}

// 기능 : AI 후보/초안이 아직 없을 때 다음 행동을 짧게 안내합니다.
function MeetingNoteAiEmptyState({ text }: { readonly text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#D8E0EA] px-3 py-4 text-[13px] leading-5 text-[#6B7280]">
      {text}
    </div>
  );
}

// 기능 : 저장 가능한 활성 딜 snapshot만 AI 후속 작업 context로 사용합니다.
function toActiveMeetingNoteDeals(
  deals: readonly MeetingNoteDeal[],
): MeetingNoteDeal[] {
  return deals.filter((deal) => !deal.isDeleted);
}

// 기능 : 저장 가능한 활성 담당자 snapshot만 follow-up 수신자 context로 사용합니다.
function toActiveMeetingNoteContacts(
  contacts: readonly MeetingNoteContact[],
): Array<MeetingNoteContact & { readonly contactId: string }> {
  return contacts.filter(
    (contact): contact is MeetingNoteContact & { readonly contactId: string } =>
      Boolean(contact.contactId) && !contact.isDeleted,
  );
}

// 기능 : Backend 후보 응답을 사용자가 편집 가능한 화면 상태로 변환합니다.
function toEditableNextActionCandidate(
  candidate: MeetingNoteNextActionDraftItem,
  selectedDealId: string,
  activeDeals: readonly MeetingNoteDeal[],
): EditableNextActionCandidate {
  return {
    clientSuggestionId: candidate.clientSuggestionId,
    confidence: candidate.confidence,
    dealId: resolveDraftDealId(candidate.dealId, selectedDealId, activeDeals),
    memo: candidate.memo,
    reason: candidate.reason,
    recommendedDueDate: candidate.recommendedDueDate,
    title: candidate.title,
  };
}

// 기능 : 후보의 딜 ID가 현재 회의록 연결 딜 안에 있을 때만 저장 대상으로 확정합니다.
function resolveDraftDealId(
  candidateDealId: string | null,
  selectedDealId: string,
  activeDeals: readonly MeetingNoteDeal[],
) {
  const activeDealIds = new Set(activeDeals.map((deal) => deal.dealId));

  if (candidateDealId && activeDealIds.has(candidateDealId)) {
    return candidateDealId;
  }

  if (selectedDealId && activeDealIds.has(selectedDealId)) {
    return selectedDealId;
  }

  return activeDeals[0]?.dealId ?? null;
}

// 기능 : 후보 저장 시 화면 선택값을 반영해 최종 딜 ID를 결정합니다.
function resolveCandidateDealId(
  candidate: EditableNextActionCandidate,
  selectedDealId: string,
  activeDeals: readonly MeetingNoteDeal[],
) {
  return resolveDraftDealId(candidate.dealId, selectedDealId, activeDeals) ?? "";
}

// 기능 : follow-up API 응답을 subject/body 편집 상태로 변환합니다.
function toEditableFollowUpDraft(
  draft: MeetingNoteFollowUpDraftResponse,
): EditableFollowUpDraft {
  return {
    body: draft.body,
    channel: draft.channel,
    copyableText: draft.copyableText,
    subject: draft.subject ?? "",
    suggestedRecipient: draft.suggestedRecipient,
  };
}

// 기능 : 현재 화면 언어를 follow-up draft API language 값으로 정규화합니다.
function getDraftLanguage() {
  const documentLanguage =
    typeof document !== "undefined" ? document.documentElement.lang : "";
  const browserLanguage =
    typeof navigator !== "undefined" ? navigator.language : "";
  const [language] = (documentLanguage || browserLanguage || "ko").split("-");

  return language || "ko";
}

// 기능 : 사용자가 편집한 subject/body를 클립보드에 들어갈 텍스트로 합칩니다.
function toFollowUpCopyText(draft: EditableFollowUpDraft) {
  const body = draft.body.trim() || draft.copyableText.trim();
  const subject = draft.subject.trim();

  if (draft.channel === "EMAIL" && subject) {
    return `제목: ${subject}\n\n${body}`;
  }

  return body;
}

// 기능 : 딜 ID를 화면에 표시할 snapshot 이름으로 변환합니다.
function formatDealName(dealId: string, deals: readonly MeetingNoteDeal[]) {
  return deals.find((deal) => deal.dealId === dealId)?.dealNameSnapshot ?? "-";
}

// 기능 : 후보의 보조 설명을 memo와 reason 순서로 합쳐 판단 근거를 표시합니다.
function formatCandidateSupportText(candidate: EditableNextActionCandidate) {
  return [candidate.memo, candidate.reason].filter(Boolean).join("\n");
}

// 기능 : 다음 행동 영역의 실패 위치에 맞는 오류 제목을 반환합니다.
function getNextActionErrorTitle(source: PanelErrorSource) {
  return source === "save" ? "다음 행동 저장 실패" : "다음 행동 생성 실패";
}

// 기능 : follow-up 영역의 실패 위치에 맞는 오류 제목을 반환합니다.
function getFollowUpErrorTitle(source: PanelErrorSource) {
  return source === "copy" ? "초안 복사 실패" : "초안 생성 실패";
}

// 기능 : AI 후보 신뢰도를 사용자에게 보이는 짧은 label로 변환합니다.
function getConfidenceLabel(confidence: MeetingNoteNextActionDraftConfidence) {
  switch (confidence) {
    case "HIGH":
      return "근거 높음";
    case "MEDIUM":
      return "근거 보통";
    case "LOW":
      return "근거 낮음";
  }
}

// 기능 : 최신 브라우저 Clipboard API와 fallback command로 초안 복사를 처리합니다.
async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Copy command failed.");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
