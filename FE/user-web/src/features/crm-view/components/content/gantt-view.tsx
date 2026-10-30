import type { ViewContentProps } from "./view-content-shared";
import { ViewEmpty } from "./view-content-shared";
import { DateBars, DateExceptions } from "./view-date-shared";
// 기능 : Gantt의 진행률과 현재 페이지 의존 관계를 같은 시간 축에 표시합니다.
export function GanttView({
  response,
  scope,
  request,
}: ViewContentProps<"GANTT">) {
  const { data } = response;
  return (
    <section data-testid="view-gantt">
      {data.tasks.length ? (
        <DateBars
          events={data.tasks}
          range={data.range}
          dependencies={data.dependencies}
          groups={data.groups}
          timeScale={String(data.presentation.timeScale)}
        />
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
