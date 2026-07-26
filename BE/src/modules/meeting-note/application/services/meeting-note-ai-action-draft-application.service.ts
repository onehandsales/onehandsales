import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_AI_ACTION_DRAFT_PROVIDER,
  MeetingNoteFollowUpChannelValue,
  MeetingNoteFollowUpToneValue,
  MeetingNoteNextActionConfidenceValue,
  type MeetingNoteAiActionContext,
  type MeetingNoteAiActionDraftProvider,
  type MeetingNoteFollowUpDraftContent,
  type MeetingNoteNextActionDraftCandidate,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-action-draft.provider";
import {
  MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY,
  type MeetingNoteAiProviderCallLogRepository,
  type MeetingNoteAiProviderCallMetadata,
  type MeetingNoteAiProviderCallOperationValue,
  type MeetingNoteAiProviderInfo,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-provider-call-log.repository";
import {
  MEETING_NOTE_REPOSITORY,
  type MeetingNoteContactRecord,
  type MeetingNoteDealRecord,
  type MeetingNoteRecord,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
  MeetingNoteNotFoundError,
  RelatedContactNotFoundError,
  RelatedDealNotFoundError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const DEFAULT_MAX_NEXT_ACTION_CANDIDATES = 3;
const MAX_NEXT_ACTION_CANDIDATES = 3;
const NEXT_ACTION_TITLE_MAX_LENGTH = 160;
const NEXT_ACTION_MEMO_MAX_LENGTH = 300;
const NEXT_ACTION_REASON_MAX_LENGTH = 300;
const FOLLOW_UP_SUBJECT_MAX_LENGTH = 120;
const FOLLOW_UP_EMAIL_BODY_MAX_LENGTH = 4000;
const FOLLOW_UP_SMS_BODY_MAX_LENGTH = 300;
const FOLLOW_UP_COPYABLE_TEXT_MAX_LENGTH = 4200;
const MEETING_NOTE_TARGET_TYPE = "MEETING_NOTE";
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LANGUAGE_PATTERN = /^[a-z]{2}(?:[-_][a-zA-Z]{2})?$/;

// 역할 : CreateMeetingNoteNextActionDraftCommand 다음 행동 후보 생성 요청 command를 정의합니다.
export interface CreateMeetingNoteNextActionDraftCommand {
  readonly dealId?: string | null;
  readonly maxCandidates?: number | null;
}

// 역할 : CreateMeetingNoteFollowUpDraftCommand follow-up 문안 생성 요청 command를 정의합니다.
export interface CreateMeetingNoteFollowUpDraftCommand {
  readonly channel: MeetingNoteFollowUpChannelValue;
  readonly recipientContactId?: string | null;
  readonly dealId?: string | null;
  readonly tone?: MeetingNoteFollowUpToneValue | null;
  readonly language?: string | null;
}

// 역할 : MeetingNoteNextActionDraftResponse 다음 행동 후보 생성 API 응답 구조를 정의합니다.
export interface MeetingNoteNextActionDraftResponse {
  readonly items: MeetingNoteNextActionDraftItemResponse[];
}

// 역할 : MeetingNoteNextActionDraftItemResponse 다음 행동 후보 응답 item 구조를 정의합니다.
export interface MeetingNoteNextActionDraftItemResponse {
  readonly clientSuggestionId: string;
  readonly title: string;
  readonly memo: string | null;
  readonly recommendedDueDate: string | null;
  readonly dealId: string | null;
  readonly confidence: MeetingNoteNextActionConfidenceValue;
  readonly reason: string | null;
}

// 역할 : MeetingNoteFollowUpSuggestedRecipientResponse follow-up 추천 수신자 응답 구조를 정의합니다.
export interface MeetingNoteFollowUpSuggestedRecipientResponse {
  readonly contactId: string;
  readonly displayName: string;
}

// 역할 : MeetingNoteFollowUpDraftResponse follow-up 문안 생성 API 응답 구조를 정의합니다.
export interface MeetingNoteFollowUpDraftResponse {
  readonly channel: MeetingNoteFollowUpChannelValue;
  readonly subject: string | null;
  readonly body: string;
  readonly suggestedRecipient: MeetingNoteFollowUpSuggestedRecipientResponse | null;
  readonly copyableText: string;
}

// 역할 : MeetingNoteAiActionDraftApplicationService 저장된 회의록 기반 AI 후속 작업 use case를 조율합니다.
@Injectable()
export class MeetingNoteAiActionDraftApplicationService {
  // 기능 : 회의록 저장소, AI 후속 작업 provider, provider call log 저장소를 주입받습니다.
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository,
    @Inject(MEETING_NOTE_AI_ACTION_DRAFT_PROVIDER)
    private readonly aiActionDraftProvider: MeetingNoteAiActionDraftProvider,
    @Inject(MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY)
    private readonly providerCallLogRepository: MeetingNoteAiProviderCallLogRepository
  ) {}

  // 기능 : 저장된 회의록에서 다음 행동 후보만 생성하고 업무 DB에는 저장하지 않습니다.
  async createNextActionDraft(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    input: CreateMeetingNoteNextActionDraftCommand
  ): Promise<MeetingNoteNextActionDraftResponse> {
    // 1. 회의록 소유권과 선택 딜 연결 상태를 검증합니다.
    const maxCandidates = this.normalizeMaxCandidates(input.maxCandidates);
    const meetingNote = await this.findMeetingNoteOrThrow(
      currentUser.id,
      meetingNoteId
    );
    const targetDealId = this.resolveLinkedDealId(meetingNote, input.dealId);
    const context = this.toProviderContext(meetingNote);

    // 2. provider 호출을 회의록 대상 provider call log로 감싸서 실행합니다.
    const result = await this.executeLoggedProviderCall(
      currentUser.id,
      "MEETING_NOTE_NEXT_ACTION_DRAFT",
      meetingNote.id,
      this.aiActionDraftProvider.getMetadata(),
      this.createNextActionLogMetadata(meetingNote, targetDealId, maxCandidates),
      () =>
        this.aiActionDraftProvider.createNextActionDraft({
          context,
          targetDealId,
          maxCandidates,
        })
    );

    // 3. AI 후보를 저장 가능한 문자열 후보로 정규화하되 자동 저장하지 않습니다.
    return {
      items: this.normalizeNextActionCandidates(
        result.items,
        meetingNote,
        targetDealId,
        maxCandidates
      ),
    };
  }

  // 기능 : 저장된 회의록에서 follow-up 문안만 생성하고 저장/발송은 수행하지 않습니다.
  async createFollowUpDraft(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    input: CreateMeetingNoteFollowUpDraftCommand
  ): Promise<MeetingNoteFollowUpDraftResponse> {
    // 1. 회의록 소유권과 선택 담당자/딜 연결 상태를 검증합니다.
    const channel = this.normalizeChannel(input.channel);
    const tone = this.normalizeTone(input.tone);
    const language = this.normalizeLanguage(input.language);
    const meetingNote = await this.findMeetingNoteOrThrow(
      currentUser.id,
      meetingNoteId
    );
    const recipientContactId = this.resolveLinkedContactId(
      meetingNote,
      input.recipientContactId
    );
    const dealId = this.resolveLinkedDealId(meetingNote, input.dealId);
    const context = this.toProviderContext(meetingNote);

    // 2. provider 호출을 회의록 대상 provider call log로 감싸서 실행합니다.
    const result = await this.executeLoggedProviderCall(
      currentUser.id,
      "MEETING_NOTE_FOLLOW_UP_DRAFT",
      meetingNote.id,
      this.aiActionDraftProvider.getMetadata(),
      this.createFollowUpLogMetadata(
        meetingNote,
        channel,
        tone,
        language,
        recipientContactId,
        dealId
      ),
      () =>
        this.aiActionDraftProvider.createFollowUpDraft({
          context,
          channel,
          recipientContactId,
          dealId,
          tone,
          language,
        })
    );

    // 3. 문안 본문을 채널별 응답 형태로 정규화하되 DB 저장과 발송은 하지 않습니다.
    return this.normalizeFollowUpDraft(
      result.draft,
      channel,
      this.findActiveContact(meetingNote, recipientContactId)
    );
  }

  // 기능 : 현재 사용자 소유의 삭제되지 않은 회의록을 조회하고 없으면 NotFound로 차단합니다.
  private async findMeetingNoteOrThrow(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord> {
    const meetingNote = await this.meetingNoteRepository.findMeetingNote(
      userId,
      meetingNoteId
    );

    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    return meetingNote;
  }

  // 기능 : provider 호출을 PENDING/SUCCEEDED/FAILED 로그로 감싸고 safe failure로 변환합니다.
  private async executeLoggedProviderCall<
    T extends { readonly providerCall: MeetingNoteAiProviderCallMetadata },
  >(
    userId: string,
    operation: MeetingNoteAiProviderCallOperationValue,
    meetingNoteId: string,
    providerInfo: MeetingNoteAiProviderInfo,
    metadataJson: Record<string, unknown>,
    work: () => Promise<T>
  ): Promise<T> {
    const startedAt = new Date();
    const callLog = await this.providerCallLogRepository.createProviderCallLog({
      userId,
      operation,
      targetType: MEETING_NOTE_TARGET_TYPE,
      targetId: meetingNoteId,
      provider: providerInfo.provider,
      model: providerInfo.model,
      startedAt,
      metadataJson,
    });

    try {
      const result = await work();
      const completedAt = new Date();

      await this.providerCallLogRepository.markProviderCallSucceeded({
        userId,
        providerCallLogId: callLog.id,
        completedAt,
        latencyMs: this.calculateLatencyMs(startedAt, completedAt),
        ...result.providerCall,
      });

      return result;
    } catch (error) {
      const failedAt = new Date();
      const safeFailure = this.toSafeProviderFailure(error);

      await this.providerCallLogRepository.markProviderCallFailed({
        userId,
        providerCallLogId: callLog.id,
        failedAt,
        latencyMs: this.calculateLatencyMs(startedAt, failedAt),
        safeErrorCode: safeFailure.error.code,
        safeErrorMessage: safeFailure.error.message,
        retryable: safeFailure.retryable,
      });

      throw safeFailure.error;
    }
  }

  // 기능 : provider 오류를 사용자 응답과 DB log에 안전한 오류로 정규화합니다.
  private toSafeProviderFailure(error: unknown): {
    readonly error:
      | MeetingNoteAiDraftFailedError
      | MeetingNoteAiDraftProviderUnavailableError;
    readonly retryable: boolean;
  } {
    if (error instanceof MeetingNoteAiDraftProviderUnavailableError) {
      return {
        error,
        retryable: false,
      };
    }

    if (error instanceof MeetingNoteAiDraftFailedError) {
      return {
        error,
        retryable: this.readRetryable(error),
      };
    }

    const fallbackError = new MeetingNoteAiDraftFailedError();

    return {
      error: fallbackError,
      retryable: false,
    };
  }

  // 기능 : 도메인 오류 detail에서 retryable 여부만 안전하게 읽습니다.
  private readRetryable(error: MeetingNoteAiDraftFailedError): boolean {
    return typeof error.details?.["retryable"] === "boolean"
      ? error.details["retryable"]
      : false;
  }

  // 기능 : provider 호출 latency를 ms 단위의 0 이상 정수로 계산합니다.
  private calculateLatencyMs(startedAt: Date, finishedAt: Date): number {
    return Math.max(finishedAt.getTime() - startedAt.getTime(), 0);
  }

  // 기능 : 다음 행동 후보 생성 개수를 API 계약 범위로 정규화합니다.
  private normalizeMaxCandidates(value: number | null | undefined): number {
    if (value === undefined || value === null) {
      return DEFAULT_MAX_NEXT_ACTION_CANDIDATES;
    }

    if (!Number.isInteger(value) || value < 1 || value > MAX_NEXT_ACTION_CANDIDATES) {
      throw new ValidationDomainError("maxCandidates must be between 1 and 3");
    }

    return value;
  }

  // 기능 : follow-up 채널 값을 EMAIL 또는 SMS로 검증합니다.
  private normalizeChannel(
    value: MeetingNoteFollowUpChannelValue
  ): MeetingNoteFollowUpChannelValue {
    if (!Object.values(MeetingNoteFollowUpChannelValue).includes(value)) {
      throw new ValidationDomainError("channel is invalid");
    }

    return value;
  }

  // 기능 : follow-up 톤 값을 기본 POLITE와 허용 enum으로 정규화합니다.
  private normalizeTone(
    value: MeetingNoteFollowUpToneValue | null | undefined
  ): MeetingNoteFollowUpToneValue {
    if (value === undefined || value === null) {
      return MeetingNoteFollowUpToneValue.POLITE;
    }

    if (!Object.values(MeetingNoteFollowUpToneValue).includes(value)) {
      throw new ValidationDomainError("tone is invalid");
    }

    return value;
  }

  // 기능 : follow-up 언어 코드를 provider 입력용 language tag로 정규화합니다.
  private normalizeLanguage(value: string | null | undefined): string {
    if (value === undefined || value === null || value.trim().length === 0) {
      return "ko";
    }

    const normalized = value.trim();

    if (!LANGUAGE_PATTERN.test(normalized)) {
      throw new ValidationDomainError("language is invalid");
    }

    const parts = normalized.replace("_", "-").split("-");
    const language = parts[0];
    const region = parts[1];

    if (!language) {
      throw new ValidationDomainError("language is invalid");
    }

    return region
      ? `${language.toLowerCase()}-${region.toUpperCase()}`
      : language.toLowerCase();
  }

  // 기능 : 선택 또는 기본 딜이 회의록에 연결된 active 딜인지 검증합니다.
  private resolveLinkedDealId(
    meetingNote: MeetingNoteRecord,
    requestedDealId: string | null | undefined
  ): string | null {
    const normalizedDealId = this.normalizeOptionalId(requestedDealId, "dealId");

    if (!normalizedDealId) {
      return this.findActiveDeal(meetingNote, null)?.dealId ?? null;
    }

    const deal = this.findActiveDeal(meetingNote, normalizedDealId);

    if (!deal) {
      throw new RelatedDealNotFoundError();
    }

    return deal.dealId;
  }

  // 기능 : 선택 또는 기본 담당자가 회의록에 연결된 active 담당자인지 검증합니다.
  private resolveLinkedContactId(
    meetingNote: MeetingNoteRecord,
    requestedContactId: string | null | undefined
  ): string | null {
    const normalizedContactId = this.normalizeOptionalId(
      requestedContactId,
      "recipientContactId"
    );

    if (!normalizedContactId) {
      return this.findActiveContact(meetingNote, null)?.contactId ?? null;
    }

    const contact = this.findActiveContact(meetingNote, normalizedContactId);

    if (!contact?.contactId) {
      throw new RelatedContactNotFoundError();
    }

    return contact.contactId;
  }

  // 기능 : optional UUID 문자열을 trim하고 빈 문자열은 선택 없음으로 처리합니다.
  private normalizeOptionalId(
    value: string | null | undefined,
    fieldName: string
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  // 기능 : 회의록에 연결된 active 딜 중 요청 ID 또는 첫 번째 딜을 찾습니다.
  private findActiveDeal(
    meetingNote: MeetingNoteRecord,
    dealId: string | null
  ): MeetingNoteDealRecord | null {
    return (
      meetingNote.deals.find(
        (deal) => !deal.isDeleted && (!dealId || deal.dealId === dealId)
      ) ?? null
    );
  }

  // 기능 : 회의록에 연결된 active 담당자 중 요청 ID 또는 첫 번째 담당자를 찾습니다.
  private findActiveContact(
    meetingNote: MeetingNoteRecord,
    contactId: string | null
  ): MeetingNoteContactRecord | null {
    return (
      meetingNote.contacts.find(
        (contact) =>
          !contact.isDeleted &&
          contact.contactId !== null &&
          (!contactId || contact.contactId === contactId)
      ) ?? null
    );
  }

  // 기능 : 저장된 회의록 snapshot을 provider에 전달할 redacted action context로 변환합니다.
  private toProviderContext(meetingNote: MeetingNoteRecord): MeetingNoteAiActionContext {
    return {
      meetingNoteId: meetingNote.id,
      title: meetingNote.title,
      meetingAt: meetingNote.meetingAt?.toISOString() ?? null,
      details: meetingNote.details,
      nextPlan: meetingNote.nextPlan,
      requiredAction: meetingNote.requiredAction,
      companies: meetingNote.companies
        .filter((company) => !company.isDeleted)
        .map((company) => ({
          companyId: company.companyId,
          name: company.companyNameSnapshot,
          field: company.companyFieldSnapshot,
          region: company.companyRegionSnapshot,
        })),
      contacts: meetingNote.contacts
        .filter((contact) => !contact.isDeleted)
        .map((contact) => ({
          contactId: contact.contactId,
          companyId: contact.companyId,
          name: contact.contactUsernameSnapshot,
          companyName: contact.contactCompanyNameSnapshot,
          department: contact.contactDepartmentSnapshot,
          jobGrade: contact.contactJobGradeSnapshot,
        })),
      products: meetingNote.products
        .filter((product) => !product.isDeleted)
        .map((product) => ({
          productId: product.productId,
          name: product.productNameSnapshot,
          price: product.productPriceSnapshot,
          category: product.productCategorySnapshot,
          status: product.productStatusSnapshot,
        })),
      deals: meetingNote.deals
        .filter((deal) => !deal.isDeleted)
        .map((deal) => ({
          dealId: deal.dealId,
          name: deal.dealNameSnapshot,
          status: deal.dealStatusSnapshot,
          cost: deal.dealCostSnapshot,
          expectedEndDate: deal.dealExpectedEndDateSnapshot
            .toISOString()
            .slice(0, 10),
        })),
    };
  }

  // 기능 : next action provider log metadata를 원문 없이 길이와 선택 상태만으로 구성합니다.
  private createNextActionLogMetadata(
    meetingNote: MeetingNoteRecord,
    targetDealId: string | null,
    maxCandidates: number
  ): Record<string, unknown> {
    return {
      feature: "meeting-note",
      source: "detail-ai-panel",
      maxCandidates,
      hasDealContext: Boolean(targetDealId),
      ...this.createMeetingNoteLengthMetadata(meetingNote),
      relationCounts: this.createRelationCounts(meetingNote),
    };
  }

  // 기능 : follow-up provider log metadata를 문안 본문 없이 채널/언어/선택 상태로 구성합니다.
  private createFollowUpLogMetadata(
    meetingNote: MeetingNoteRecord,
    channel: MeetingNoteFollowUpChannelValue,
    tone: MeetingNoteFollowUpToneValue,
    language: string,
    recipientContactId: string | null,
    dealId: string | null
  ): Record<string, unknown> {
    return {
      feature: "meeting-note",
      source: "detail-ai-panel",
      channel,
      tone,
      language,
      hasRecipient: Boolean(recipientContactId),
      hasDealContext: Boolean(dealId),
      ...this.createMeetingNoteLengthMetadata(meetingNote),
      relationCounts: this.createRelationCounts(meetingNote),
    };
  }

  // 기능 : 회의록 본문을 저장하지 않고 provider log에 필요한 길이 정보만 반환합니다.
  private createMeetingNoteLengthMetadata(meetingNote: MeetingNoteRecord) {
    return {
      detailsLength: meetingNote.details.length,
      nextPlanLength: meetingNote.nextPlan?.length ?? 0,
      requiredActionLength: meetingNote.requiredAction?.length ?? 0,
    };
  }

  // 기능 : provider log에 원문이 섞이지 않도록 연결 snapshot 개수만 반환합니다.
  private createRelationCounts(meetingNote: MeetingNoteRecord) {
    return {
      companies: meetingNote.companies.filter((company) => !company.isDeleted)
        .length,
      contacts: meetingNote.contacts.filter((contact) => !contact.isDeleted)
        .length,
      products: meetingNote.products.filter((product) => !product.isDeleted)
        .length,
      deals: meetingNote.deals.filter((deal) => !deal.isDeleted).length,
    };
  }

  // 기능 : provider가 반환한 다음 행동 후보를 API 응답 계약에 맞게 최대 3개로 정규화합니다.
  private normalizeNextActionCandidates(
    candidates: readonly MeetingNoteNextActionDraftCandidate[],
    meetingNote: MeetingNoteRecord,
    targetDealId: string | null,
    maxCandidates: number
  ): MeetingNoteNextActionDraftItemResponse[] {
    const allowedDealIds = new Set(
      meetingNote.deals
        .filter((deal) => !deal.isDeleted)
        .map((deal) => deal.dealId)
    );
    const items: MeetingNoteNextActionDraftItemResponse[] = [];

    for (const candidate of candidates) {
      const title = this.normalizeProviderText(
        candidate.title,
        NEXT_ACTION_TITLE_MAX_LENGTH
      );

      if (!title) {
        continue;
      }

      items.push({
        clientSuggestionId: `na_${String(items.length + 1).padStart(2, "0")}`,
        title,
        memo: this.normalizeProviderText(
          candidate.memo,
          NEXT_ACTION_MEMO_MAX_LENGTH
        ),
        recommendedDueDate: this.normalizeDateOnly(
          candidate.recommendedDueDate
        ),
        dealId: this.normalizeCandidateDealId(
          candidate.dealId,
          allowedDealIds,
          targetDealId
        ),
        confidence: this.normalizeConfidence(candidate.confidence),
        reason: this.normalizeProviderText(
          candidate.reason,
          NEXT_ACTION_REASON_MAX_LENGTH
        ),
      });

      if (items.length >= maxCandidates) {
        break;
      }
    }

    return items;
  }

  // 기능 : provider가 반환한 follow-up 문안을 채널별 API 응답 계약으로 정규화합니다.
  private normalizeFollowUpDraft(
    draft: MeetingNoteFollowUpDraftContent,
    channel: MeetingNoteFollowUpChannelValue,
    recipient: MeetingNoteContactRecord | null
  ): MeetingNoteFollowUpDraftResponse {
    const bodyMaxLength =
      channel === MeetingNoteFollowUpChannelValue.SMS
        ? FOLLOW_UP_SMS_BODY_MAX_LENGTH
        : FOLLOW_UP_EMAIL_BODY_MAX_LENGTH;
    const body = this.normalizeProviderText(draft.body, bodyMaxLength);

    if (!body) {
      throw new MeetingNoteAiDraftFailedError(
        "Meeting note follow-up draft body was empty"
      );
    }

    const copyableText =
      this.normalizeProviderText(
        draft.copyableText,
        FOLLOW_UP_COPYABLE_TEXT_MAX_LENGTH
      ) ?? body;
    const subject =
      channel === MeetingNoteFollowUpChannelValue.EMAIL
        ? this.normalizeProviderText(
            draft.subject,
            FOLLOW_UP_SUBJECT_MAX_LENGTH
          ) ?? "오늘 미팅 내용 정리드립니다"
        : null;

    return {
      channel,
      subject,
      body,
      suggestedRecipient: recipient?.contactId
        ? {
            contactId: recipient.contactId,
            displayName: recipient.contactUsernameSnapshot,
          }
        : null,
      copyableText,
    };
  }

  // 기능 : provider 문자열 필드를 trim하고 너무 긴 값은 응답 계약 길이로 자릅니다.
  private normalizeProviderText(
    value: string | null | undefined,
    maxLength: number
  ): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    return normalized.length > maxLength
      ? normalized.slice(0, maxLength)
      : normalized;
  }

  // 기능 : provider 추천 날짜가 실제 ISO date인지 확인하고 아니면 제거합니다.
  private normalizeDateOnly(value: string | null | undefined): string | null {
    const normalized = this.normalizeProviderText(value, 10);

    if (!normalized) {
      return null;
    }

    const match = ISO_DATE_PATTERN.exec(normalized);

    if (!match) {
      return null;
    }

    const yearValue = match[1];
    const monthValue = match[2];
    const dayValue = match[3];

    if (!yearValue || !monthValue || !dayValue) {
      return null;
    }

    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? normalized
      : null;
  }

  // 기능 : provider가 반환한 딜 ID가 허용된 연결 딜인지 확인하고 아니면 기본 딜을 사용합니다.
  private normalizeCandidateDealId(
    candidateDealId: string | null,
    allowedDealIds: ReadonlySet<string>,
    fallbackDealId: string | null
  ): string | null {
    if (candidateDealId && allowedDealIds.has(candidateDealId)) {
      return candidateDealId;
    }

    return fallbackDealId && allowedDealIds.has(fallbackDealId)
      ? fallbackDealId
      : null;
  }

  // 기능 : provider 신뢰도 값이 허용 enum이 아니면 MEDIUM으로 보정합니다.
  private normalizeConfidence(
    value: MeetingNoteNextActionConfidenceValue
  ): MeetingNoteNextActionConfidenceValue {
    return Object.values(MeetingNoteNextActionConfidenceValue).includes(value)
      ? value
      : MeetingNoteNextActionConfidenceValue.MEDIUM;
  }
}
