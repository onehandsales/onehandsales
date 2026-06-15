import { useParams } from "react-router-dom";
import { MeetingNoteEditorScreen } from "@/features/meeting-note";

// 기능 : 회의록 상세 page를 렌더링합니다.
export function MeetingNoteDetailPage() {
  const { meetingNoteId } = useParams();

  return <MeetingNoteEditorScreen meetingNoteId={meetingNoteId ?? ""} />;
}
