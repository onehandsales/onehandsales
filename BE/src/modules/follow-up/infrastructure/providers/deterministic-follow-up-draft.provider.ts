import { Injectable } from "@nestjs/common";
import type {
  FollowUpDraftProvider,
  FollowUpDraftProviderMetadata,
  FollowUpDraftProviderResult,
  GenerateFollowUpDraftInput,
} from "@/modules/follow-up/application/ports/follow-up-draft.provider";

const PROVIDER = "deterministic";
const MODEL = "follow-up-draft-dev-v1";

@Injectable()
export class DeterministicFollowUpDraftProvider
  implements FollowUpDraftProvider
{
  getMetadata(): FollowUpDraftProviderMetadata {
    return {
      provider: PROVIDER,
      model: MODEL,
    };
  }

  async generateDraft(
    input: GenerateFollowUpDraftInput
  ): Promise<FollowUpDraftProviderResult> {
    const body =
      input.channel === "EMAIL"
        ? this.createEmailBody(input)
        : this.createSmsBody(input);
    const subject =
      input.channel === "EMAIL" ? this.createEmailSubject(input) : null;
    const approximateInputTokens = Math.max(
      Math.ceil(JSON.stringify(this.toSafeInputMetadata(input)).length / 4),
      1
    );
    const approximateOutputTokens = Math.max(
      Math.ceil(`${subject ?? ""}${body}`.length / 4),
      1
    );

    return {
      provider: PROVIDER,
      model: MODEL,
      requestId: `det-follow-up-${input.suggestion.id}-${input.channel.toLowerCase()}`,
      subject,
      body,
      usage: {
        inputTokenCount: approximateInputTokens,
        outputTokenCount: approximateOutputTokens,
        totalTokenCount: approximateInputTokens + approximateOutputTokens,
        estimatedCostAmount: "0",
        costCurrency: "USD",
      },
    };
  }

  private createEmailSubject(input: GenerateFollowUpDraftInput): string {
    const targetLabel =
      input.suggestion.targetLabel ?? input.suggestion.title ?? "next steps";

    if (this.isKorean(input.languageTag)) {
      return `${targetLabel} 후속 안내`;
    }

    return `Follow-up on ${targetLabel}`;
  }

  private createEmailBody(input: GenerateFollowUpDraftInput): string {
    const payloadDraft = this.getPayloadText(input.suggestion.payloadJson, [
      "emailDraft",
      "emailBody",
      "draft",
    ]);

    if (payloadDraft) {
      return payloadDraft;
    }

    if (this.isKorean(input.languageTag)) {
      return [
        `${input.recipient.name}님, 안녕하세요.`,
        "",
        input.suggestion.body,
        input.suggestion.reason
          ? `이번 주 리포트에서 확인한 이유: ${input.suggestion.reason}`
          : "이번 주 리포트 내용을 바탕으로 후속 확인이 필요해 연락드립니다.",
        "",
        "확인 가능하실 때 의견 부탁드립니다.",
      ].join("\n");
    }

    return [
      `Hi ${input.recipient.name},`,
      "",
      input.suggestion.body,
      input.suggestion.reason
        ? `Reason from this week's report: ${input.suggestion.reason}`
        : "I am following up based on this week's sales report.",
      "",
      "Please let me know when you have a chance to review.",
    ].join("\n");
  }

  private createSmsBody(input: GenerateFollowUpDraftInput): string {
    const payloadDraft = this.getPayloadText(input.suggestion.payloadJson, [
      "smsDraft",
      "smsBody",
      "draft",
    ]);

    if (payloadDraft) {
      return payloadDraft;
    }

    if (this.isKorean(input.languageTag)) {
      return `${input.recipient.name}님, ${input.suggestion.title} 관련해 후속 확인 부탁드립니다.`;
    }

    return `${input.recipient.name}, following up on ${input.suggestion.title}. Please let me know when convenient.`;
  }

  private getPayloadText(
    payload: Record<string, unknown>,
    candidateKeys: readonly string[]
  ): string | null {
    for (const key of candidateKeys) {
      const value = payload[key];

      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }

    return null;
  }

  private isKorean(languageTag: string): boolean {
    return languageTag.trim().toLowerCase().startsWith("ko");
  }

  private toSafeInputMetadata(
    input: GenerateFollowUpDraftInput
  ): Record<string, unknown> {
    return {
      userId: input.userId,
      channel: input.channel,
      languageTag: input.languageTag,
      reportId: input.report.id,
      suggestionId: input.suggestion.id,
      recipientContactId: input.recipient.id,
      targetType: input.suggestion.targetType,
      targetId: input.suggestion.targetId,
    };
  }
}
