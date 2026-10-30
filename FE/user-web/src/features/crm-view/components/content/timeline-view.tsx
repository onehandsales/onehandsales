import type { ViewContentProps } from "./view-content-shared";
import { ViewEmpty } from "./view-content-shared";
import { DateBars, DateExceptions } from "./view-date-shared";
// 기능 : Timeline의 기간 막대와 미설정 목록을 표시합니다.
export function TimelineView({
  response,
  scope,
  request,
}: ViewContentProps<"TIMELINE">) {
  const { data } = response;
  return (
    <section data-testid="view-timeline">
      {data.bars.length ? (
        <DateBars events={data.bars} range={data.range} groups={data.groups} timeScale={String(data.presentation.timeScale)} />
      ) : (
        <ViewEmpty />
      )}
      <DateExceptions
        scope={scope}
        request={request}
        unscheduledCount={data.unscheduledCount}
        invalidDateCount={data.invalidDateCount}
      />
    </section>
  );
}
