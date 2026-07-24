import { Injectable } from "@nestjs/common";
import type {
  AiWeeklySalesReportOutput,
  AiWeeklySalesReportProvider,
  AiWeeklySalesReportProviderMetadata,
  AiWeeklySalesReportProviderResult,
  GenerateAiWeeklySalesReportInput,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";

const PROVIDER = "deterministic";
const MODEL = "ai-weekly-sales-report-dev-v1";

@Injectable()
export class DeterministicAiWeeklySalesReportProvider
  implements AiWeeklySalesReportProvider
{
  getMetadata(): AiWeeklySalesReportProviderMetadata {
    return {
      provider: PROVIDER,
      model: MODEL,
    };
  }

  async generateReport(
    input: GenerateAiWeeklySalesReportInput
  ): Promise<AiWeeklySalesReportProviderResult> {
    const output = this.createOutput(input);
    const approximateInputTokens = Math.max(
      Math.ceil(JSON.stringify(input.inputSnapshot).length / 4),
      1
    );
    const approximateOutputTokens = Math.max(
      Math.ceil(JSON.stringify(output).length / 4),
      1
    );

    return {
      provider: PROVIDER,
      model: MODEL,
      requestId: `det-${input.reportId}`,
      output,
      usage: {
        inputTokenCount: approximateInputTokens,
        outputTokenCount: approximateOutputTokens,
        totalTokenCount: approximateInputTokens + approximateOutputTokens,
        estimatedCostAmount: "0",
        costCurrency: "USD",
      },
    };
  }

  private createOutput(
    input: GenerateAiWeeklySalesReportInput
  ): AiWeeklySalesReportOutput {
    const schedules = getSnapshotArray(input.inputSnapshot, "schedules");
    const deals = getSnapshotArray(input.inputSnapshot, "deals");
    const meetingNotes = getSnapshotArray(input.inputSnapshot, "meetingNotes");
    const linkedDealIds = new Set<string>();

    for (const schedule of schedules) {
      for (const deal of getSnapshotArray(schedule, "deals")) {
        const id = getString(deal, "id");

        if (id) {
          linkedDealIds.add(id);
        }
      }
    }

    const totalDealCost = deals.reduce(
      (total, deal) => total + getNumber(deal, "dealCost"),
      0
    );
    const missingSignals = this.createMissingSignals(schedules, deals, meetingNotes);
    const statusCounts = this.createStatusCounts(deals);

    return {
      executiveSummary: {
        headline: this.createHeadline(input.weekStart, input.weekEnd),
        narrative: [
          `${schedules.length} schedules, ${deals.length} active or due deals, and ${meetingNotes.length} meeting notes were reviewed.`,
          missingSignals.length > 0
            ? `Data quality signals need attention: ${missingSignals.join(", ")}.`
            : "The weekly source data is sufficient for a first sales review.",
        ].join(" "),
        wins: this.createWins(schedules, deals, meetingNotes),
        concerns: missingSignals,
      },
      pipelineSummary: {
        narrative: `Open and due pipeline value is ${totalDealCost}. Review deals without next actions before the next sales cycle.`,
        totalDealCost,
        statusCounts,
      },
      riskSignals: this.createRiskSignals(deals),
      nextWeekActions: this.createNextWeekActions(deals, schedules),
      followUpDrafts: this.createFollowUpDrafts(meetingNotes),
      dataCleanupSuggestions: this.createCleanupSuggestions(
        schedules,
        deals,
        meetingNotes
      ),
      dataCoverage: {
        scheduleCount: schedules.length,
        dealCount: deals.length,
        meetingNoteCount: meetingNotes.length,
        linkedDealCount: linkedDealIds.size,
        missingSignals,
      },
    };
  }

  private createHeadline(weekStart: string, weekEnd: string): string {
    return `Weekly sales report for ${weekStart} to ${weekEnd}`;
  }

  private createWins(
    schedules: readonly Record<string, unknown>[],
    deals: readonly Record<string, unknown>[],
    meetingNotes: readonly Record<string, unknown>[]
  ): string[] {
    const wins: string[] = [];

    if (schedules.length > 0) {
      wins.push("Customer-facing schedule activity exists for the week.");
    }

    if (deals.length > 0) {
      wins.push("Pipeline records are available for AI review.");
    }

    if (meetingNotes.length > 0) {
      wins.push("Meeting notes provide qualitative context.");
    }

    return wins.length > 0 ? wins : ["No weekly activity was found yet."];
  }

  private createMissingSignals(
    schedules: readonly Record<string, unknown>[],
    deals: readonly Record<string, unknown>[],
    meetingNotes: readonly Record<string, unknown>[]
  ): string[] {
    const signals: string[] = [];

    if (schedules.length === 0) {
      signals.push("NO_WEEKLY_SCHEDULES");
    }

    if (deals.length === 0) {
      signals.push("NO_ACTIVE_OR_DUE_DEALS");
    }

    if (meetingNotes.length === 0) {
      signals.push("NO_WEEKLY_MEETING_NOTES");
    }

    if (deals.some((deal) => getSnapshotArray(deal, "nextFollowingActions").length === 0)) {
      signals.push("DEAL_NEXT_ACTION_MISSING");
    }

    return [...new Set(signals)];
  }

  private createStatusCounts(
    deals: readonly Record<string, unknown>[]
  ): { readonly status: string; readonly count: number }[] {
    const counts = new Map<string, number>();

    for (const deal of deals) {
      const status = getString(deal, "dealStatus") ?? "UNKNOWN";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return [...counts.entries()].map(([status, count]) => ({ status, count }));
  }

  private createRiskSignals(deals: readonly Record<string, unknown>[]) {
    return deals
      .filter((deal) => getSnapshotArray(deal, "nextFollowingActions").length === 0)
      .slice(0, 5)
      .map((deal, index) => {
        const targetId = getString(deal, "id");
        const targetLabel = getString(deal, "dealName") ?? "Deal";

        return {
          key: `risk-next-action-${targetId ?? index}`,
          priority: "HIGH" as const,
          title: "Deal has no open next action",
          body: `${targetLabel} needs a clear owner and next step before the next weekly review.`,
          reason: "No incomplete following action was found in the snapshot.",
          targetType: "DEAL",
          targetId,
          targetPath: targetId ? `/deals/${targetId}` : null,
          targetLabel,
          payload: {},
        };
      });
  }

  private createNextWeekActions(
    deals: readonly Record<string, unknown>[],
    schedules: readonly Record<string, unknown>[]
  ) {
    const dueDealActions = deals.slice(0, 5).map((deal, index) => {
      const targetId = getString(deal, "id");
      const targetLabel = getString(deal, "dealName") ?? "Deal";

      return {
        key: `next-week-deal-${targetId ?? index}`,
        priority: "MEDIUM" as const,
        title: "Confirm next step",
        body: `Review ${targetLabel} and schedule the next sales action.`,
        reason: "The deal is active or due in the weekly pipeline snapshot.",
        targetType: "DEAL",
        targetId,
        targetPath: targetId ? `/deals/${targetId}` : null,
        targetLabel,
        payload: {},
      };
    });

    if (dueDealActions.length > 0) {
      return dueDealActions;
    }

    return schedules.slice(0, 3).map((schedule, index) => {
      const targetId = getString(schedule, "id");
      const targetLabel = getString(schedule, "scheduleTitle") ?? "Schedule";

      return {
        key: `next-week-schedule-${targetId ?? index}`,
        priority: "LOW" as const,
        title: "Review meeting outcome",
        body: `Check the outcome of ${targetLabel} and add follow-up records if needed.`,
        reason: "Schedule activity exists but no active deal was available.",
        targetType: "SCHEDULE",
        targetId,
        targetPath: targetId ? `/schedules/${targetId}` : null,
        targetLabel,
        payload: {},
      };
    });
  }

  private createFollowUpDrafts(meetingNotes: readonly Record<string, unknown>[]) {
    return meetingNotes.slice(0, 3).map((note, index) => {
      const targetId = getString(note, "id");
      const targetLabel = getString(note, "title") ?? "Meeting note";

      return {
        key: `follow-up-${targetId ?? index}`,
        priority: "MEDIUM" as const,
        title: "Follow-up draft",
        body: `Thanks for the meeting. I will follow up on the discussed next steps and share updates shortly.`,
        reason: "A weekly meeting note includes follow-up context.",
        targetType: "MEETING_NOTE",
        targetId,
        targetPath: targetId ? `/meeting-notes/${targetId}` : null,
        targetLabel,
        payload: {
          emailDraft:
            "Thanks for the meeting. I will follow up on the discussed next steps and share updates shortly.",
          smsDraft: "Thanks for the meeting. I will follow up shortly.",
        },
      };
    });
  }

  private createCleanupSuggestions(
    schedules: readonly Record<string, unknown>[],
    deals: readonly Record<string, unknown>[],
    meetingNotes: readonly Record<string, unknown>[]
  ) {
    const suggestions = [];

    if (schedules.some((schedule) => getSnapshotArray(schedule, "deals").length === 0)) {
      suggestions.push({
        key: "cleanup-unlinked-schedules",
        priority: "MEDIUM" as const,
        title: "Link schedules to deals",
        body: "Some weekly schedules are not linked to deals, which weakens pipeline analysis.",
        reason: "At least one schedule has no linked deal in the snapshot.",
        targetType: null,
        targetId: null,
        targetPath: null,
        targetLabel: null,
        payload: {},
      });
    }

    if (meetingNotes.length === 0 && deals.length > 0) {
      suggestions.push({
        key: "cleanup-missing-meeting-notes",
        priority: "LOW" as const,
        title: "Add meeting notes",
        body: "Add meeting notes for major sales conversations to improve future AI report quality.",
        reason: "Deals exist but no meeting notes were captured this week.",
        targetType: null,
        targetId: null,
        targetPath: null,
        targetLabel: null,
        payload: {},
      });
    }

    return suggestions;
  }
}

function getSnapshotArray(
  value: Record<string, unknown>,
  key: string
): Record<string, unknown>[] {
  const item = value[key];

  if (!Array.isArray(item)) {
    return [];
  }

  return item.filter(
    (entry): entry is Record<string, unknown> =>
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
  );
}

function getString(value: Record<string, unknown>, key: string): string | null {
  const item = value[key];

  return typeof item === "string" && item.trim().length > 0
    ? item.trim()
    : null;
}

function getNumber(value: Record<string, unknown>, key: string): number {
  const item = value[key];

  return typeof item === "number" && Number.isFinite(item) ? item : 0;
}
