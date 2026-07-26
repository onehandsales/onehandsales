import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_AI_DRAFT_PROVIDER,
  type MeetingNoteAiDraftProvider,
  type MeetingNoteDraftContent,
  type MeetingNoteDraftContext,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-draft.provider";
import {
  MEETING_NOTE_STT_PROVIDER,
  type MeetingNoteDraftAudioFile,
  type MeetingNoteSttProvider,
} from "@/modules/meeting-note/application/ports/meeting-note-stt.provider";
import {
  MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY,
  type MeetingNoteAiProviderCallLogRepository,
  type MeetingNoteAiProviderCallMetadata,
  type MeetingNoteAiProviderCallOperationValue,
  type MeetingNoteAiProviderInfo,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-provider-call-log.repository";
import {
  MEETING_NOTE_REPOSITORY,
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type DealSnapshotRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
  RelatedCompanyNotFoundError,
  RelatedContactNotFoundError,
  RelatedDealNotFoundError,
  RelatedProductNotFoundError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const MAX_TEXT_LENGTH = 60000;
const MAX_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MEETING_NOTE_DRAFT_TARGET_TYPE = "MEETING_NOTE_DRAFT";
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/aac",
  "audio/flac",
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "application/octet-stream",
]);

// 역할 : DateTimeParts local date-time 유효성 검증에 사용할 구성 요소를 정의합니다.
interface DateTimeParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

// 역할 : MeetingNoteAiDraftContextCommand AI/STT 초안 생성에 필요한 사용자 선택 맥락 command를 정의합니다.
export interface MeetingNoteAiDraftContextCommand {
  readonly meetingLocalDateTime: string;
  readonly companies: string[];
  readonly contacts: string[];
  readonly products?: string[];
  readonly deals?: string[];
}

// 역할 : CreateMeetingNoteTextAiDraftCommand 텍스트 기반 AI 초안 생성 command를 정의합니다.
export interface CreateMeetingNoteTextAiDraftCommand
  extends MeetingNoteAiDraftContextCommand {
  readonly text: string;
}

// 역할 : CreateMeetingNoteSttAiDraftCommand 음성 기반 STT+AI 초안 생성 command를 정의합니다.
export interface CreateMeetingNoteSttAiDraftCommand
  extends MeetingNoteAiDraftContextCommand {
  readonly audioFile?: MeetingNoteDraftAudioFile | undefined;
}

// 역할 : MeetingNoteAiDraftResponse FE가 회의록 생성 모달에 반영할 초안 응답을 정의합니다.
export interface MeetingNoteAiDraftResponse {
  readonly sourceType: MeetingNoteSourceTypeValue.TEXT_AI | MeetingNoteSourceTypeValue.STT_AI;
  readonly transcript: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
}

// 역할 : MeetingNoteAiDraftApplicationService 회의록 AI/STT 초안 생성 use case를 조율합니다.
@Injectable()
export class MeetingNoteAiDraftApplicationService {
  // 기능 : 회의록 저장소, provider port, provider call log 저장소를 주입받습니다.
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository,
    @Inject(MEETING_NOTE_AI_DRAFT_PROVIDER)
    private readonly aiDraftProvider: MeetingNoteAiDraftProvider,
    @Inject(MEETING_NOTE_STT_PROVIDER)
    private readonly sttProvider: MeetingNoteSttProvider,
    @Inject(MEETING_NOTE_AI_PROVIDER_CALL_LOG_REPOSITORY)
    private readonly providerCallLogRepository: MeetingNoteAiProviderCallLogRepository
  ) {}

  // 기능 : 회의 원문 텍스트와 선택 맥락을 검증한 뒤 AI 초안 필드만 반환합니다.
  async createTextAiDraft(
    currentUser: CurrentUserContext,
    input: CreateMeetingNoteTextAiDraftCommand
  ): Promise<MeetingNoteAiDraftResponse> {
    // 1. 회의 원문 텍스트와 사용자 선택 맥락을 검증합니다.
    const rawText = this.normalizeRequiredText(input.text, "text");
    const context = await this.buildContext(currentUser.id, input);

    // 2. 외부 provider 호출을 원문 없는 provider call log로 감싸서 실행합니다.
    const draftResult = await this.executeLoggedProviderCall(
      currentUser.id,
      "MEETING_NOTE_TEXT_DRAFT",
      this.aiDraftProvider.getMetadata(),
      this.createTextDraftMetadata(rawText, context),
      () =>
        this.aiDraftProvider.createTextDraft({
          rawText,
          context,
        })
    );

    // 3. FE가 기존 회의록 생성 form에 채울 수 있는 응답으로 변환합니다.
    return {
      sourceType: MeetingNoteSourceTypeValue.TEXT_AI,
      transcript: null,
      ...this.normalizeGeneratedDraft(draftResult.draft),
    };
  }

  // 기능 : 음성 파일과 선택 맥락을 검증한 뒤 transcript와 AI 초안 필드만 반환합니다.
  async createSttAiDraft(
    currentUser: CurrentUserContext,
    input: CreateMeetingNoteSttAiDraftCommand
  ): Promise<MeetingNoteAiDraftResponse> {
    // 1. 업로드 음성 파일과 사용자 선택 맥락을 검증합니다.
    const audioFile = this.normalizeAudioFile(input.audioFile);
    const context = await this.buildContext(currentUser.id, input);

    // 2. STT provider 호출을 음성/원문 없는 provider call log로 감싸서 실행합니다.
    const transcription = await this.executeLoggedProviderCall(
      currentUser.id,
      "MEETING_NOTE_STT_TRANSCRIPTION",
      this.sttProvider.getMetadata(),
      this.createSttMetadata(audioFile, context),
      async () => {
        const result = await this.sttProvider.transcribe({
          audioFile,
        });

        return {
          transcript: this.normalizeGeneratedRequiredText(
            result.transcript,
            "transcript"
          ),
          providerCall: result.providerCall,
        };
      }
    );
    const normalizedTranscript = transcription.transcript;

    // 3. transcript 기반 AI draft 호출도 transcript 원문 없는 별도 log로 기록합니다.
    const draftResult = await this.executeLoggedProviderCall(
      currentUser.id,
      "MEETING_NOTE_STT_DRAFT",
      this.aiDraftProvider.getMetadata(),
      this.createTranscriptDraftMetadata(normalizedTranscript, context),
      () =>
        this.aiDraftProvider.createTextDraft({
          rawText: normalizedTranscript,
          context,
        })
    );

    // 4. FE가 transcript 확인과 초안 적용을 함께 처리할 수 있는 응답으로 변환합니다.
    return {
      sourceType: MeetingNoteSourceTypeValue.STT_AI,
      transcript: normalizedTranscript,
      ...this.normalizeGeneratedDraft(draftResult.draft),
    };
  }

  // 기능 : provider 호출을 PENDING/SUCCEEDED/FAILED 로그로 감싸고 safe failure로 변환합니다.
  private async executeLoggedProviderCall<
    T extends { readonly providerCall: MeetingNoteAiProviderCallMetadata },
  >(
    userId: string,
    operation: MeetingNoteAiProviderCallOperationValue,
    providerInfo: MeetingNoteAiProviderInfo,
    metadataJson: Record<string, unknown>,
    work: () => Promise<T>
  ): Promise<T> {
    const startedAt = new Date();
    const callLog = await this.providerCallLogRepository.createProviderCallLog({
      userId,
      operation,
      targetType: MEETING_NOTE_DRAFT_TARGET_TYPE,
      targetId: null,
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

  // 기능 : text draft log metadata를 원문 없이 길이와 선택 맥락 count만으로 구성합니다.
  private createTextDraftMetadata(
    rawText: string,
    context: MeetingNoteDraftContext
  ): Record<string, unknown> {
    return {
      feature: "meeting-note",
      source: "create-dialog",
      inputKind: "text",
      textLength: rawText.length,
      contextCounts: this.createContextCounts(context),
    };
  }

  // 기능 : STT log metadata를 음성 원문 없이 mime type과 크기 구간만으로 구성합니다.
  private createSttMetadata(
    audioFile: MeetingNoteDraftAudioFile,
    context: MeetingNoteDraftContext
  ): Record<string, unknown> {
    return {
      feature: "meeting-note",
      source: "create-dialog",
      inputKind: "audio",
      audio: {
        mimeType: audioFile.mimeType,
        sizeBucket: this.toAudioSizeBucket(audioFile.size),
      },
      contextCounts: this.createContextCounts(context),
    };
  }

  // 기능 : STT transcript 기반 AI draft log metadata를 transcript 원문 없이 구성합니다.
  private createTranscriptDraftMetadata(
    transcript: string,
    context: MeetingNoteDraftContext
  ): Record<string, unknown> {
    return {
      feature: "meeting-note",
      source: "create-dialog",
      inputKind: "stt_transcript",
      transcriptLength: transcript.length,
      contextCounts: this.createContextCounts(context),
    };
  }

  // 기능 : provider metadata에 원문이 섞이지 않도록 선택 맥락의 개수만 반환합니다.
  private createContextCounts(context: MeetingNoteDraftContext) {
    return {
      companies: context.companies.length,
      contacts: context.contacts.length,
      products: context.products.length,
      deals: context.deals.length,
    };
  }

  // 기능 : 음성 파일 크기를 원문 없는 운영 metadata 구간으로 변환합니다.
  private toAudioSizeBucket(size: number): string {
    const mb = 1024 * 1024;

    if (size <= mb) {
      return "0mb_1mb";
    }

    if (size <= 10 * mb) {
      return "1mb_10mb";
    }

    return "10mb_25mb";
  }

  // 기능 : 사용자 선택 ID 목록을 소유권 검증된 prompt 맥락으로 변환합니다.
  private async buildContext(
    userId: string,
    input: MeetingNoteAiDraftContextCommand
  ): Promise<MeetingNoteDraftContext> {
    const meetingLocalDateTime = this.normalizeMeetingLocalDateTime(
      input.meetingLocalDateTime
    );
    const companyIds = this.normalizeRequiredIdArray(
      input.companies,
      "companies"
    );
    const contactIds = this.normalizeRequiredIdArray(
      input.contacts,
      "contacts"
    );
    const productIds = this.normalizeOptionalIdArray(input.products, "products");
    const dealIds = this.normalizeOptionalIdArray(input.deals, "deals");

    const [companyMap, contactMap, productMap, dealMap] = await Promise.all([
      this.findCompanyMap(userId, companyIds),
      this.findContactMap(userId, contactIds),
      this.findProductMap(userId, productIds),
      this.findDealMap(userId, dealIds),
    ]);

    return {
      meetingLocalDateTime,
      companies: companyIds.map((companyId) =>
        this.toCompanyContext(companyId, companyMap)
      ),
      contacts: contactIds.map((contactId) =>
        this.toContactContext(contactId, contactMap)
      ),
      products: productIds.map((productId) =>
        this.toProductContext(productId, productMap)
      ),
      deals: dealIds.map((dealId) => this.toDealContext(dealId, dealMap)),
    };
  }

  // 기능 : 회사 ID 목록을 현재 사용자 소유 회사 snapshot map으로 조회합니다.
  private async findCompanyMap(
    userId: string,
    companyIds: readonly string[]
  ): Promise<Map<string, CompanySnapshotRecord>> {
    if (companyIds.length === 0) {
      return new Map();
    }

    const companies = await this.meetingNoteRepository.findCompaniesByIds(
      userId,
      companyIds
    );

    if (companies.length !== companyIds.length) {
      throw new RelatedCompanyNotFoundError();
    }

    return new Map(companies.map((company) => [company.id, company]));
  }

  // 기능 : 담당자 ID 목록을 현재 사용자 소유 담당자 snapshot map으로 조회합니다.
  private async findContactMap(
    userId: string,
    contactIds: readonly string[]
  ): Promise<Map<string, ContactSnapshotRecord>> {
    if (contactIds.length === 0) {
      return new Map();
    }

    const contacts = await this.meetingNoteRepository.findContactsByIds(
      userId,
      contactIds
    );

    if (contacts.length !== contactIds.length) {
      throw new RelatedContactNotFoundError();
    }

    return new Map(contacts.map((contact) => [contact.id, contact]));
  }

  // 기능 : 제품 ID 목록을 현재 사용자 소유 제품 snapshot map으로 조회합니다.
  private async findProductMap(
    userId: string,
    productIds: readonly string[]
  ): Promise<Map<string, ProductSnapshotRecord>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const products = await this.meetingNoteRepository.findProductsByIds(
      userId,
      productIds
    );

    if (products.length !== productIds.length) {
      throw new RelatedProductNotFoundError();
    }

    return new Map(products.map((product) => [product.id, product]));
  }

  // 기능 : 딜 ID 목록을 현재 사용자 소유 딜 snapshot map으로 조회합니다.
  private async findDealMap(
    userId: string,
    dealIds: readonly string[]
  ): Promise<Map<string, DealSnapshotRecord>> {
    if (dealIds.length === 0) {
      return new Map();
    }

    const deals = await this.meetingNoteRepository.findDealsByIds(userId, dealIds);

    if (deals.length !== dealIds.length) {
      throw new RelatedDealNotFoundError();
    }

    return new Map(deals.map((deal) => [deal.id, deal]));
  }

  // 기능 : 회사 snapshot을 provider prompt에 필요한 회사 맥락으로 변환합니다.
  private toCompanyContext(
    companyId: string,
    companyMap: ReadonlyMap<string, CompanySnapshotRecord>
  ) {
    const company = companyMap.get(companyId);

    if (!company) {
      throw new RelatedCompanyNotFoundError();
    }

    return {
      id: company.id,
      name: company.companyName,
      field: company.companyField,
      region: company.companyRegion,
    };
  }

  // 기능 : 담당자 snapshot을 provider prompt에 필요한 담당자 맥락으로 변환합니다.
  private toContactContext(
    contactId: string,
    contactMap: ReadonlyMap<string, ContactSnapshotRecord>
  ) {
    const contact = contactMap.get(contactId);

    if (!contact) {
      throw new RelatedContactNotFoundError();
    }

    return {
      id: contact.id,
      companyId: contact.companyId,
      name: contact.username,
      email: contact.email,
      mobile: contact.mobile,
      companyName: contact.companyName,
      department: contact.departmentName,
      jobGrade: contact.jobGradeName,
    };
  }

  // 기능 : 제품 snapshot을 provider prompt에 필요한 제품 맥락으로 변환합니다.
  private toProductContext(
    productId: string,
    productMap: ReadonlyMap<string, ProductSnapshotRecord>
  ) {
    const product = productMap.get(productId);

    if (!product) {
      throw new RelatedProductNotFoundError();
    }

    return {
      id: product.id,
      name: product.productName,
      price: product.productPrice,
      category: product.categoryName,
      status: product.statusName,
    };
  }

  // 기능 : 딜 snapshot을 provider prompt에 필요한 딜 맥락으로 변환합니다.
  private toDealContext(
    dealId: string,
    dealMap: ReadonlyMap<string, DealSnapshotRecord>
  ) {
    const deal = dealMap.get(dealId);

    if (!deal) {
      throw new RelatedDealNotFoundError();
    }

    return {
      id: deal.id,
      name: deal.dealName,
      status: deal.dealStatus,
      cost: deal.dealCost,
      expectedEndDate: deal.expectedEndDate.toISOString().slice(0, 10),
    };
  }

  // 기능 : 필수 문자열 입력을 trim하고 길이 제한을 검증합니다.
  private normalizeRequiredText(value: unknown, fieldName: string): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    if (normalized.length > MAX_TEXT_LENGTH) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  // 기능 : 필수 ID 배열 입력을 정규화하고 빈 배열을 차단합니다.
  private normalizeRequiredIdArray(value: unknown, fieldName: string): string[] {
    const normalized = this.normalizeIdArray(value, fieldName);

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} must not be empty`);
    }

    return normalized;
  }

  // 기능 : 선택 ID 배열 입력을 정규화하고 없으면 빈 배열로 처리합니다.
  private normalizeOptionalIdArray(value: unknown, fieldName: string): string[] {
    if (value === undefined || value === null) {
      return [];
    }

    return this.normalizeIdArray(value, fieldName);
  }

  // 기능 : ID 배열 입력의 타입, 빈 값, 중복을 검증합니다.
  private normalizeIdArray(value: unknown, fieldName: string): string[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError(`${fieldName} must be an array`);
    }

    const normalized = value.map((item) => {
      if (typeof item !== "string") {
        throw new ValidationDomainError(`${fieldName} must contain strings`);
      }

      return item.trim();
    });

    if (normalized.some((item) => item.length === 0)) {
      throw new ValidationDomainError(`${fieldName} must not contain empty IDs`);
    }

    if (new Set(normalized).size !== normalized.length) {
      throw new ValidationDomainError(`${fieldName} must not contain duplicates`);
    }

    return normalized;
  }

  // 기능 : 사용자가 선택한 local date-time 문자열을 초안 맥락용 표준 형식으로 정규화합니다.
  private normalizeMeetingLocalDateTime(value: unknown): string {
    const normalized = this.normalizeRequiredText(
      value,
      "meetingLocalDateTime"
    );
    const match = LOCAL_DATE_TIME_PATTERN.exec(normalized);

    if (!match) {
      throw new ValidationDomainError(
        "meetingLocalDateTime must be a valid local date-time"
      );
    }

    const yearValue = match[1];
    const monthValue = match[2];
    const dayValue = match[3];
    const hourValue = match[4];
    const minuteValue = match[5];

    if (
      !yearValue ||
      !monthValue ||
      !dayValue ||
      !hourValue ||
      !minuteValue
    ) {
      throw new ValidationDomainError(
        "meetingLocalDateTime must be a valid local date-time"
      );
    }

    const parts: DateTimeParts = {
      year: Number(yearValue),
      month: Number(monthValue),
      day: Number(dayValue),
      hour: Number(hourValue),
      minute: Number(minuteValue),
      second: match[6] ? Number(match[6]) : 0,
    };

    if (!this.isValidDateTimeParts(parts)) {
      throw new ValidationDomainError(
        "meetingLocalDateTime must be a valid local date-time"
      );
    }

    return [
      this.pad(parts.year, 4),
      "-",
      this.pad(parts.month, 2),
      "-",
      this.pad(parts.day, 2),
      "T",
      this.pad(parts.hour, 2),
      ":",
      this.pad(parts.minute, 2),
      ":",
      this.pad(parts.second, 2),
    ].join("");
  }

  // 기능 : local date-time 구성 요소가 실제 calendar 값인지 확인합니다.
  private isValidDateTimeParts(parts: DateTimeParts): boolean {
    const date = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second
      )
    );

    return (
      date.getUTCFullYear() === parts.year &&
      date.getUTCMonth() === parts.month - 1 &&
      date.getUTCDate() === parts.day &&
      date.getUTCHours() === parts.hour &&
      date.getUTCMinutes() === parts.minute &&
      date.getUTCSeconds() === parts.second
    );
  }

  // 기능 : 숫자를 지정한 길이의 0 padding 문자열로 변환합니다.
  private pad(value: number, length: number): string {
    return String(value).padStart(length, "0");
  }

  // 기능 : STT 업로드 파일의 buffer, 크기, mime type을 검증합니다.
  private normalizeAudioFile(
    audioFile: MeetingNoteDraftAudioFile | undefined
  ): MeetingNoteDraftAudioFile {
    if (!audioFile) {
      throw new ValidationDomainError("audio file is required");
    }

    if (!Buffer.isBuffer(audioFile.buffer)) {
      throw new ValidationDomainError("audio file buffer is required");
    }

    if (audioFile.size <= 0 || audioFile.buffer.length === 0) {
      throw new ValidationDomainError("audio file must not be empty");
    }

    if (audioFile.size > MAX_AUDIO_FILE_SIZE_BYTES) {
      throw new ValidationDomainError("audio file is too large");
    }

    const mimeType = audioFile.mimeType.trim().toLowerCase();

    if (
      !mimeType.startsWith("audio/") &&
      !ALLOWED_AUDIO_MIME_TYPES.has(mimeType)
    ) {
      throw new ValidationDomainError("audio file type is not supported");
    }

    return {
      buffer: audioFile.buffer,
      fileName:
        audioFile.fileName.trim().length > 0 ? audioFile.fileName.trim() : "audio",
      mimeType,
      size: audioFile.size,
    };
  }

  // 기능 : provider가 반환한 초안 필드를 API 응답 가능한 값으로 정규화합니다.
  private normalizeGeneratedDraft(
    draft: MeetingNoteDraftContent
  ): MeetingNoteDraftContent {
    return {
      details: this.normalizeGeneratedRequiredText(draft.details, "details"),
      nextPlan: this.normalizeGeneratedOptionalText(draft.nextPlan),
      requiredAction: this.normalizeGeneratedOptionalText(draft.requiredAction),
    };
  }

  // 기능 : provider가 반드시 생성해야 하는 문자열 필드를 검증합니다.
  private normalizeGeneratedRequiredText(value: string, fieldName: string): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new MeetingNoteAiDraftFailedError(`${fieldName} was not generated`);
    }

    return normalized;
  }

  // 기능 : provider가 비워도 되는 문자열 필드를 null 또는 trim 문자열로 정규화합니다.
  private normalizeGeneratedOptionalText(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }
}
