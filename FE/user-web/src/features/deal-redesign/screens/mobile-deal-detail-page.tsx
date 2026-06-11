import { ArrowLeft, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DealActivitySection } from "@/features/deal/components/deal-activity-section";
import {
  useDealActivities,
  useDealDetail,
} from "@/features/deal/hooks/use-deal-detail";
import {
  useChangeDealStageMutation,
  useCompleteDealNextActionMutation,
} from "@/features/deal/hooks/use-deal-mutations";
import type { DealStage } from "@/features/deal/types/deal";
import { StageBadge } from "@/features/deal-redesign/components/stage-badge";
import {
  formatDealLikelihood,
  formatDealNextAction,
  getLikelihoodClass,
} from "@/features/deal/utils/deal-display";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";

type MobileDealDetailPageProps = {
  readonly dealId: string;
};

export function MobileDealDetailPage({ dealId }: MobileDealDetailPageProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const detailQuery = useDealDetail(dealId);
  const activitiesQuery = useDealActivities(dealId, { page: 1, pageSize: 20 });
  const changeStageMutation = useChangeDealStageMutation();
  const completeNextActionMutation = useCompleteDealNextActionMutation();

  if (detailQuery.isLoading) {
    return (
      <div className="grid gap-4 px-4 py-5 md:hidden">
        <div className="h-12 animate-pulse rounded-[20px] bg-white/70" />
        <div className="h-52 animate-pulse rounded-[28px] bg-white/70" />
        <div className="h-64 animate-pulse rounded-[28px] bg-white/70" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="px-4 py-5 md:hidden">
        <div className="rounded-[28px] border border-destructive/15 bg-panel p-6 shadow-soft">
          <div className="flex items-center gap-3 text-destructive">
            <CircleAlert className="h-5 w-5" />
            <p className="text-sm font-semibold">딜 상세를 불러오지 못했습니다.</p>
          </div>
          <Link className="mt-5 inline-flex text-sm font-medium text-primary" to="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { activities, deal, memos, products, schedulesSummary } = detailQuery.data;
  const visibleActivities = activitiesQuery.data?.items ?? activities;
  const actionError =
    changeStageMutation.error ?? completeNextActionMutation.error ?? null;

  const onStageChange = async (stage: DealStage) => {
    if (stage === deal.stage) {
      return;
    }

    await changeStageMutation.mutateAsync({
      dealId: deal.id,
      stage,
    });
    setNotice("딜 단계가 변경되었습니다.");
  };

  const onCompleteNextAction = async () => {
    await completeNextActionMutation.mutateAsync({
      dealId: deal.id,
      completedAt: new Date().toISOString(),
    });
    setNotice("다음 행동이 완료되었습니다.");
  };

  return (
    <>
      <section className="px-4 py-4 md:hidden">
        <header className="rounded-[28px] bg-sidebar px-5 py-5 text-sidebar-foreground shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <Link
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"
              to="/"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <StageBadge stage={deal.stage} />
          </div>
          <p className="mt-5 text-xs font-medium text-sidebar-foreground/60">
            {deal.companyName ?? "미지정 회사"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {deal.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={getLikelihoodClass(deal.likelihoodStatus)}>
              {formatDealLikelihood(deal)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-sidebar-foreground">
              {deal.contactName ?? "담당자 미지정"}
            </span>
          </div>
        </header>

        <div className="mt-4 grid gap-4">
          {notice ? (
            <p className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}

          {actionError ? (
            <p className="rounded-[20px] border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive">
              {getApiErrorMessage(actionError)}
            </p>
          ) : null}

          <DetailCard>
            <DetailRow label="예상 금액" value={formatMoney(deal.amount, deal.currency)} />
            <DetailRow
              label="다음 액션"
              value={formatDealNextAction(deal)}
            />
            <DetailRow
              label="목표 종료일"
              value={formatDate(deal.expectedCloseDate, { fallback: "-" })}
            />
            <DetailRow
              label="최근 수정"
              value={formatDateTime(deal.updatedAt, { includeYear: true })}
            />
          </DetailCard>

          <DetailCard title="관리 액션">
            <label className="grid gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                단계 변경
              </span>
              <select
                className="h-11 rounded-[16px] border border-border bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                disabled={changeStageMutation.isPending}
                onChange={(event) =>
                  void onStageChange(event.target.value as DealStage)
                }
                value={deal.stage}
              >
                <option value="INITIAL_CONTACT">초기 접촉</option>
                <option value="IN_DISCUSSION">논의 중</option>
                <option value="WON">성사</option>
                <option value="LOST">실패</option>
              </select>
            </label>
            <button
              className="h-11 rounded-[16px] bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                completeNextActionMutation.isPending ||
                deal.nextActionStatus === "DONE" ||
                deal.nextActionStatus === "NONE"
              }
              onClick={() => void onCompleteNextAction()}
              type="button"
            >
              다음 행동 완료
            </button>
          </DetailCard>

          <DetailCard title="연결 정보">
            <DetailRow label="연결 제품" value={`${products.length}개`} />
            <DetailRow label="활동 기록" value={`${activities.length}건`} />
            <DetailRow label="메모" value={`${memos.length}개`} />
            <DetailRow label="예정 일정" value={`${schedulesSummary.upcomingCount}건`} />
          </DetailCard>

          <DetailCard title="최근 활동">
            {visibleActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">기록된 활동이 없습니다.</p>
            ) : (
              <div className="grid gap-3">
                {visibleActivities.slice(0, 3).map((activity) => (
                  <div
                    className="rounded-[20px] bg-panel-muted p-3"
                    key={activity.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.occurredAt, { includeYear: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {activity.content ?? "상세 내용 없음"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>

          <DetailCard title="활동 추가">
            <DealActivitySection
              activities={visibleActivities}
              dealId={deal.id}
              error={activitiesQuery.error}
              isLoading={activitiesQuery.isLoading}
              onChanged={setNotice}
              onRetry={() => void activitiesQuery.refetch()}
            />
          </DetailCard>

          <DetailCard title="메모 요약">
            {memos.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 메모가 없습니다.</p>
            ) : (
              <div className="grid gap-3">
                {memos.slice(0, 2).map((memo) => (
                  <div className="rounded-[20px] bg-panel-muted p-3" key={memo.id}>
                    <p className="text-sm font-semibold text-foreground">
                      {memo.title ?? "제목 없음"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {memo.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DetailCard>
        </div>
      </section>

      <div className="hidden md:block">
        <div className="rounded-[28px] border border-border/70 bg-panel p-8 shadow-soft">
          <p className="text-sm text-muted-foreground">
            모바일 상세 레이아웃은 모바일 뷰에서 확인합니다.
          </p>
        </div>
      </div>
    </>
  );
}

function DetailCard({
  children,
  title,
}: {
  readonly children: ReactNode;
  readonly title?: string;
}) {
  return (
    <section className="rounded-[28px] border border-border/70 bg-panel p-4 shadow-soft">
      {title ? (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
      ) : null}
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] bg-panel-muted px-4 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
