import { useParams } from "react-router-dom";
import { ScheduleDetailScreen } from "@/features/schedule";

export function ScheduleDetailPage() {
  const { scheduleId } = useParams();

  return <ScheduleDetailScreen scheduleId={scheduleId ?? ""} />;
}
