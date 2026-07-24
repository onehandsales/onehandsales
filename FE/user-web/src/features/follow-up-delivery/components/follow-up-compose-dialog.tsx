import {
  AlertCircle,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Send,
  Settings,
  WandSparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import type { AiWeeklyReportSuggestion } from "@/features/ai-weekly-report";
import { useDealContactOptions } from "@/features/deal/hooks/use-deal-entity-options";
import type { DealContactOption } from "@/features/deal/types/deal";
import {
  useAcknowledgeFollowUpConsentNoticeMutation,
  useCreateFollowUpDraftMutation,
  useRetryFollowUpMessageMutation,
  useSendFollowUpMessageMutation,
  useUpdateFollowUpMessageMutation,
} from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-mutations";
import { useFollowUpDeliverySettings } from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-queries";
import type {
  FollowUpDeliveryChannel,
  FollowUpMessage,
} from "@/features/follow-up-delivery/types/follow-up-delivery";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type FollowUpComposeDialogProps = {
  readonly open: boolean;
  readonly reportId: string;
  readonly suggestion: AiWeeklyReportSuggestion | null;
  readonly initialChannel: FollowUpDeliveryChannel;
  readonly onCompleted?: () => void;
  readonly onOpenChange: (open: boolean) => void;
};

const languageOptions = [
  { value: "ko-KR", label: "한국어" },
  { value: "en-US", label: "English" },
  { value: "ja-JP", label: "日本語" },
  { value: "zh-TW", label: "繁體中文" },
] as const;

export function FollowUpComposeDialog({
  initialChannel,
  onCompleted,
  onOpenChange,
  open,
  reportId,
  suggestion,
}: FollowUpComposeDialogProps) {
  const [channel, setChannel] =
    useState<FollowUpDeliveryChannel>(initialChannel);
  const [languageTag, setLanguageTag] = useState("ko-KR");
  const [recipientContactId, setRecipientContactId] = useState("");
  const [draft, setDraft] = useState<FollowUpMessage | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [bodyConfirmed, setBodyConfirmed] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const settingsQuery = useFollowUpDeliverySettings({ enabled: open });
  const contactOptionsQuery = useDealContactOptions({ enabled: open });
  const createDraftMutation = useCreateFollowUpDraftMutation();
  const updateMessageMutation = useUpdateFollowUpMessageMutation();
  const sendMessageMutation = useSendFollowUpMessageMutation();
  const retryMessageMutation = useRetryFollowUpMessageMutation();
  const acknowledgeConsentMutation =
    useAcknowledgeFollowUpConsentNoticeMutation();
  const sourceSuggestionId =
    suggestion?.sourceSuggestionId ?? suggestion?.id ?? null;
  const settings = settingsQuery.data ?? null;
  const recipientOptions = useMemo(
    () =>
      getRecipientOptions(
        contactOptionsQuery.data ?? [],
        channel,
        suggestion
      ),
    [channel, contactOptionsQuery.data, suggestion]
  );
  const selectedRecipient = useMemo(
    () =>
      recipientOptions.find((contact) => contact.id === recipientContactId) ??
      null,
    [recipientContactId, recipientOptions]
  );
  const emailReady = Boolean(
    settings?.emailConnections.some(
      (connection) => connection.status === "CONNECTED"
    )
  );
  const smsReady = Boolean(
    settings?.smsSenderNumbers.some(
      (senderNumber) => senderNumber.status === "VERIFIED"
    )
  );
  const channelReady = channel === "EMAIL" ? emailReady : smsReady;
  const consentAcknowledged = Boolean(
    settings?.consentNotices.some((notice) => notice.channel === channel)
  );
  const smsInfo = getSmsSegmentInfo(body);
  const canEditDraft = draft !== null && draft.status !== "SENT";
  const isBusy =
    createDraftMutation.isPending ||
    updateMessageMutation.isPending ||
    sendMessageMutation.isPending ||
    retryMessageMutation.isPending ||
    acknowledgeConsentMutation.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    setChannel(initialChannel);
    setLanguageTag(getDefaultLanguageTag());
    setRecipientContactId("");
    setDraft(null);
    setSubject("");
    setBody("");
    setBodyConfirmed(false);
    setActionError(null);
    setConsentOpen(false);
  }, [initialChannel, open, suggestion?.key]);

  useEffect(() => {
    if (!open || recipientContactId || recipientOptions.length === 0) {
      return;
    }

    setRecipientContactId(recipientOptions[0]?.id ?? "");
  }, [open, recipientContactId, recipientOptions]);

  const clearDraft = () => {
    setDraft(null);
    setSubject("");
    setBody("");
    setBodyConfirmed(false);
    setActionError(null);
  };

  const createDraft = async () => {
    if (!suggestion || !sourceSuggestionId || !recipientContactId) {
      setActionError("후속 연락 초안을 만들 제안과 수신자를 확인해 주세요.");
      return;
    }

    if (!channelReady) {
      setActionError(getMissingSenderMessage(channel));
      return;
    }

    setActionError(null);

    try {
      const message = await createDraftMutation.mutateAsync({
        sourceReportId: reportId,
        sourceSuggestionId,
        channel,
        languageTag,
        recipientContactId,
      });
      setDraft(message);
      setSubject(message.subject ?? "");
      setBody(message.body);
      setBodyConfirmed(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const requestSend = () => {
    if (!draft) {
      setActionError("먼저 AI 초안을 만들어 주세요.");
      return;
    }

    if (!bodyConfirmed) {
      setActionError("본문을 확인한 뒤 체크해 주세요.");
      return;
    }

    if (channel === "SMS" && smsInfo.overLimit) {
      setActionError("문자는 2개 세그먼트 이내로 줄여 주세요.");
      return;
    }

    if (draft.status === "FAILED" && !draft.retryable) {
      setActionError("이 실패 건은 재시도할 수 없어요.");
      return;
    }

    if (!consentAcknowledged) {
      setActionError(null);
      setConsentOpen(true);
      return;
    }

    void sendDraft();
  };

  const confirmConsentAndSend = async () => {
    try {
      await acknowledgeConsentMutation.mutateAsync({ channel });
      setConsentOpen(false);
      await settingsQuery.refetch();
      await sendDraft();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
      setConsentOpen(false);
    }
  };

  const sendDraft = async () => {
    if (!draft) {
      return;
    }

    setActionError(null);

    try {
      const updated = await updateMessageMutation.mutateAsync({
        messageId: draft.id,
        recipientContactId,
        subject: channel === "EMAIL" ? subject : null,
        body,
      });
      const sent =
        draft.status === "FAILED" && draft.retryable
          ? await retryMessageMutation.mutateAsync(updated.id)
          : await sendMessageMutation.mutateAsync(updated.id);
      setDraft(sent);
      setSubject(sent.subject ?? "");
      setBody(sent.body);
      setBodyConfirmed(sent.status === "SENT");
      onCompleted?.();
    } catch (error) {
      if (isConsentRequiredError(error)) {
        setConsentOpen(true);
        return;
      }

      setActionError(getApiErrorMessage(error));
    }
  };

  const close = () => {
    if (!isBusy) {
      onOpenChange(false);
    }
  };

  const title = channel === "EMAIL" ? "이메일 후속 연락" : "문자 후속 연락";

  return (
    <>
      <ModalShell
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button disabled={isBusy} onClick={close} type="button">
              닫기
            </Button>
            {draft ? (
              <Button
                disabled={
                  isBusy ||
                  draft.status === "SENT" ||
                  (draft.status === "FAILED" && !draft.retryable) ||
                  !bodyConfirmed ||
                  (channel === "SMS" && smsInfo.overLimit)
                }
                isPending={
                  updateMessageMutation.isPending ||
                  sendMessageMutation.isPending ||
                  retryMessageMutation.isPending
                }
                onClick={requestSend}
                type="button"
                variant="primary"
              >
                <Send className="h-4 w-4" />
                {draft.status === "FAILED" && draft.retryable ? "재시도" : "보내기"}
              </Button>
            ) : (
              <Button
                disabled={
                  isBusy ||
                  !sourceSuggestionId ||
                  !recipientContactId ||
                  !channelReady
                }
                isPending={createDraftMutation.isPending}
                onClick={() => void createDraft()}
                type="button"
                variant="primary"
              >
                <WandSparkles className="h-4 w-4" />
                AI 초안 만들기
              </Button>
            )}
          </>
        }
        onOpenChange={close}
        open={open}
        placement="bottom"
        size="lg"
        title={title}
      >
        <div className="grid gap-4">
          {suggestion ? <SuggestionSummary suggestion={suggestion} /> : null}

          <div className="grid gap-3 md:grid-cols-3">
            <Field label="채널">
              <div className="grid grid-cols-2 gap-1 rounded-md border border-[#D7DCE5] bg-[#F8FAFC] p-1">
                <ChannelButton
                  active={channel === "EMAIL"}
                  disabled={draft !== null || isBusy}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="이메일"
                  onClick={() => {
                    setChannel("EMAIL");
                    clearDraft();
                  }}
                />
                <ChannelButton
                  active={channel === "SMS"}
                  disabled={draft !== null || isBusy}
                  icon={<MessageSquareText className="h-3.5 w-3.5" />}
                  label="문자"
                  onClick={() => {
                    setChannel("SMS");
                    clearDraft();
                  }}
                />
              </div>
            </Field>
            <Field label="언어">
              <select
                className="h-9 w-full rounded-md border border-[#D7DCE5] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                disabled={draft !== null || isBusy}
                onChange={(event) => {
                  setLanguageTag(event.target.value);
                  clearDraft();
                }}
                value={languageTag}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="수신자">
              <select
                className="h-9 w-full rounded-md border border-[#D7DCE5] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                disabled={recipientOptions.length === 0 || isBusy}
                onChange={(event) => {
                  setRecipientContactId(event.target.value);
                  setBodyConfirmed(false);
                }}
                value={recipientContactId}
              >
                {recipientOptions.length === 0 ? (
                  <option value="">수신자가 없어요</option>
                ) : (
                  recipientOptions.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {formatContactOption(contact, channel)}
                    </option>
                  ))
                )}
              </select>
            </Field>
          </div>

          {!sourceSuggestionId ? (
            <InlineAlert message="이 제안에는 저장된 제안 ID가 아직 없어서 초안을 만들 수 없어요. 리포트를 다시 생성한 뒤 시도해 주세요." />
          ) : null}

          {!channelReady ? (
            <SettingsGuidance channel={channel} />
          ) : null}

          {selectedRecipient ? (
            <p className="rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-5 text-[#64748B]">
              AI 리포트 제안 맥락 안에 있는 연락처만 전송할 수 있어요. 맞지
              않는 수신자는 전송 전에 안전하게 막아요.
            </p>
          ) : null}

          {draft ? (
            <DraftEditor
              body={body}
              bodyConfirmed={bodyConfirmed}
              canEdit={canEditDraft}
              channel={channel}
              onBodyChange={(value) => {
                setBody(value);
                setBodyConfirmed(false);
              }}
              onBodyConfirmedChange={setBodyConfirmed}
              onSubjectChange={(value) => {
                setSubject(value);
                setBodyConfirmed(false);
              }}
              smsInfo={smsInfo}
              status={draft.status}
              subject={subject}
            />
          ) : (
            <p className="rounded-md border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-[13px] text-[#64748B]">
              수신자와 채널을 확인한 뒤 AI 초안을 만들어요. 생성한 초안은 보내기
              전까지 제목과 본문을 수정할 수 있어요.
            </p>
          )}

          {draft?.status === "SENT" ? (
            <SuccessNotice message="후속 연락을 보냈어요. 이력은 리포트와 관련 레코드 타임라인에 남아요." />
          ) : null}

          {draft?.status === "FAILED" && draft.safeErrorMessage ? (
            <InlineAlert message={draft.safeErrorMessage} />
          ) : null}

          {actionError ? <InlineAlert message={actionError} /> : null}
        </div>
      </ModalShell>

      <ModalShell
        footer={
          <>
            <Button
              disabled={acknowledgeConsentMutation.isPending}
              onClick={() => setConsentOpen(false)}
              type="button"
            >
              닫기
            </Button>
            <Button
              disabled={acknowledgeConsentMutation.isPending}
              isPending={acknowledgeConsentMutation.isPending}
              onClick={() => void confirmConsentAndSend()}
              type="button"
              variant="primary"
            >
              확인하고 보내기
            </Button>
          </>
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !acknowledgeConsentMutation.isPending) {
            setConsentOpen(false);
          }
        }}
        open={consentOpen}
        placement="bottom"
        size="md"
        title="첫 전송 안내"
      >
        <p className="text-[13px] leading-6 text-[#374151]">
          {channel === "EMAIL" ? "이메일" : "문자"}는 선택한 외부 발신 수단으로
          즉시 전송돼요. 수신자, 제목, 본문을 확인한 뒤 보내 주세요.
        </p>
      </ModalShell>
    </>
  );
}

function SuggestionSummary({
  suggestion,
}: {
  readonly suggestion: AiWeeklyReportSuggestion;
}) {
  return (
    <section className="grid gap-2 rounded-md border border-[#E2E5EC] bg-[#F8FAFC] px-3 py-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="rounded border border-[#BFDBFE] bg-[#EFF6FF] px-1.5 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
          {toPriorityLabel(suggestion.priority)}
        </span>
        {suggestion.targetLabel ? (
          <span className="min-w-0 break-words text-[12px] text-[#64748B]">
            {suggestion.targetLabel}
          </span>
        ) : null}
      </div>
      <h3 className="break-words text-sm font-semibold text-[#111827]">
        {suggestion.title}
      </h3>
      <p className="break-words text-[13px] leading-5 text-[#374151]">
        {suggestion.body}
      </p>
    </section>
  );
}

function Field({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-[12px] font-medium text-[#64748B]">{label}</span>
      {children}
    </label>
  );
}

function ChannelButton({
  active,
  disabled,
  icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly disabled: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1 rounded text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        active ? "bg-white text-[#1D4ED8] shadow-sm" : "text-[#64748B]"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function DraftEditor({
  body,
  bodyConfirmed,
  canEdit,
  channel,
  onBodyChange,
  onBodyConfirmedChange,
  onSubjectChange,
  smsInfo,
  status,
  subject,
}: {
  readonly body: string;
  readonly bodyConfirmed: boolean;
  readonly canEdit: boolean;
  readonly channel: FollowUpDeliveryChannel;
  readonly onBodyChange: (value: string) => void;
  readonly onBodyConfirmedChange: (value: boolean) => void;
  readonly onSubjectChange: (value: string) => void;
  readonly smsInfo: SmsSegmentInfo;
  readonly status: FollowUpMessage["status"];
  readonly subject: string;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#111827]">초안 편집</h3>
        <StatusBadge status={status} />
      </div>
      {channel === "EMAIL" ? (
        <Field label="제목">
          <input
            className="h-9 w-full rounded-md border border-[#D7DCE5] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] disabled:bg-[#F8FAFC]"
            disabled={!canEdit}
            maxLength={200}
            onChange={(event) => onSubjectChange(event.target.value)}
            value={subject}
          />
        </Field>
      ) : null}
      <Field label="본문">
        <textarea
          className="min-h-56 w-full resize-y rounded-md border border-[#D7DCE5] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-[#93C5FD] disabled:bg-[#F8FAFC]"
          disabled={!canEdit}
          onChange={(event) => onBodyChange(event.target.value)}
          value={body}
        />
      </Field>
      {channel === "SMS" ? (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-[12px] font-medium",
            smsInfo.overLimit
              ? "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
              : "border-[#E2E5EC] bg-[#F8FAFC] text-[#64748B]"
          )}
        >
          <span>
            {smsInfo.segmentCount} / 2 세그먼트 · {body.length} /{" "}
            {smsInfo.maxLength}자
          </span>
          {smsInfo.overLimit ? <span>본문을 줄여 주세요.</span> : null}
        </div>
      ) : null}
      <label className="flex min-w-0 items-start gap-2 rounded-md border border-[#E2E5EC] bg-white px-3 py-3 text-[13px] font-medium text-[#374151]">
        <input
          checked={bodyConfirmed}
          className="mt-0.5 h-4 w-4 shrink-0"
          disabled={!canEdit}
          onChange={(event) => onBodyConfirmedChange(event.target.checked)}
          type="checkbox"
        />
        <span>수신자와 본문을 확인했어요.</span>
      </label>
    </section>
  );
}

function SettingsGuidance({
  channel,
}: {
  readonly channel: FollowUpDeliveryChannel;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-3 text-[13px] text-[#92400E] sm:flex-row sm:items-center sm:justify-between">
      <span>{getMissingSenderMessage(channel)}</span>
      <Link
        className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md border border-[#F59E0B] bg-white px-3 text-[12px] font-semibold text-[#92400E] transition hover:bg-[#FFF7ED]"
        to="/app/settings"
      >
        <Settings className="h-3.5 w-3.5" />
        설정 열기
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { readonly status: FollowUpMessage["status"] }) {
  const className = {
    DRAFT: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    FAILED: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
    SENDING: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
    SENT: "border-[#BBF7D0] bg-[#F0FDF4] text-[#047857]",
  }[status];

  return (
    <span
      className={`inline-flex h-6 items-center rounded border px-2 text-[11px] font-semibold ${className}`}
    >
      {toStatusLabel(status)}
    </span>
  );
}

function InlineAlert({ message }: { readonly message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">{message}</span>
      </div>
    </div>
  );
}

function SuccessNotice({ message }: { readonly message: string }) {
  return (
    <div className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[13px] font-medium text-[#047857]">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">{message}</span>
      </div>
    </div>
  );
}

type SmsSegmentInfo = {
  readonly segmentCount: number;
  readonly maxLength: number;
  readonly overLimit: boolean;
};

function getSmsSegmentInfo(body: string): SmsSegmentInfo {
  const ascii = [...body].every((character) => character.charCodeAt(0) <= 127);
  const singleSegmentLength = ascii ? 160 : 70;
  const maxLength = ascii ? 306 : 134;
  const segmentCount =
    body.length <= singleSegmentLength ? 1 : Math.min(2, Math.ceil(body.length / singleSegmentLength));

  return {
    segmentCount,
    maxLength,
    overLimit: body.length > maxLength,
  };
}

function getRecipientOptions(
  contacts: readonly DealContactOption[],
  channel: FollowUpDeliveryChannel,
  suggestion: AiWeeklyReportSuggestion | null
) {
  const activeContacts = contacts.filter((contact) => !contact.isDeleted);
  const reachableContacts = activeContacts.filter((contact) =>
    channel === "EMAIL"
      ? contact.email.trim().length > 0
      : contact.mobile.trim().length > 0
  );
  const targetId =
    suggestion?.targetType?.toUpperCase() === "CONTACT"
      ? suggestion.targetId
      : null;

  if (!targetId) {
    return reachableContacts;
  }

  return reachableContacts.sort((first, second) => {
    if (first.id === targetId) {
      return -1;
    }

    if (second.id === targetId) {
      return 1;
    }

    return first.username.localeCompare(second.username);
  });
}

function formatContactOption(
  contact: DealContactOption,
  channel: FollowUpDeliveryChannel
) {
  const destination = channel === "EMAIL" ? contact.email : contact.mobile;
  const companyName = contact.company?.companyName ?? "";

  return [contact.username, companyName, destination].filter(Boolean).join(" · ");
}

function getMissingSenderMessage(channel: FollowUpDeliveryChannel) {
  return channel === "EMAIL"
    ? "연결된 이메일 발신 계정이 필요해요."
    : "인증된 문자 발신번호가 필요해요.";
}

function getDefaultLanguageTag() {
  const browserLanguage =
    navigator.languages[0] ?? navigator.language ?? "ko-KR";

  return languageOptions.some((option) => option.value === browserLanguage)
    ? browserLanguage
    : "ko-KR";
}

function toPriorityLabel(priority: AiWeeklyReportSuggestion["priority"]) {
  const labels = {
    HIGH: "높음",
    LOW: "낮음",
    MEDIUM: "중간",
  } as const;

  return labels[priority];
}

function toStatusLabel(status: FollowUpMessage["status"]) {
  const labels = {
    DRAFT: "초안",
    FAILED: "실패",
    SENDING: "전송 중",
    SENT: "전송됨",
  } as const;

  return labels[status];
}

function isConsentRequiredError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.code === "FollowUpConsentNoticeRequired"
  );
}
