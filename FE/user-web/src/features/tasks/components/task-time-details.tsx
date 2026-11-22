import { ChevronDown, Clock3 } from "lucide-react";
import type { ProjectView } from "@/features/projects";
import type { TeamRow } from "@/features/team";
type Entries = ProjectView["timeEntries"];
// 기능 : 저장된 초 합계를 시간·분·초로 표시하며 완료·보관으로 기록을 증감하지 않는다.
function duration(value: number) { return [Math.floor(value / 3600), Math.floor(value % 3600 / 60), value % 60].map(part => String(part).padStart(2, "0")).join(":"); }
// 기능 : 같은 작업 ID의 기록 합계와 펼침 상태만 표시하고 시간 생성·정산은 제공하지 않는다.
export function TaskTimeToggle({ entries, expanded, onToggle }: { entries: Entries; expanded: boolean; onToggle: () => void }) {
  const seconds = entries.reduce((sum, entry) => sum + entry.seconds, 0);
  return <button type="button" className="task-property task-time-toggle" aria-label="Recorded task time" aria-expanded={expanded} disabled={!entries.length} onClick={onToggle}><Clock3 size={19} />{entries.length ? duration(seconds) : "No hours added"}{!!entries.length && <ChevronDown size={15} />}</button>;
}
// 기능 : 기존 기록의 멤버·시간·날짜를 읽기 전용으로 펼치고 다른 동명 작업의 기록은 합치지 않는다.
export function TaskTimeRecords({ entries, members }: { entries: Entries; members: TeamRow[] }) {
  return <div className="task-time-records">{entries.map(entry => { const member = members.find(item => item.id === entry.memberId); return <div key={entry.id} data-time-entry-id={entry.id}><strong><span className="task-avatar">{member?.name.slice(0, 2).toUpperCase() ?? "—"}</span>{member?.name ?? "Recorded member"}</strong><span>{duration(entry.seconds)}</span><small>{new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(entry.day + "T00:00:00Z"))}</small></div>; })}</div>;
}
