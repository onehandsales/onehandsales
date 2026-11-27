import type { Project } from "../model/project-types";
// 기능 : 원본의 기존 활동을 생성 이력과 구분해 소유자와 협업자에게 같은 저장된 기록으로 표시한다.
export function ProjectActivity({ project }: { project: Project }) {
  if (!project.recordedOverview) return <p><span aria-hidden="true">◦</span> {project.created.actor} created project <strong>{project.created.name}.</strong><time>{project.created.at}</time></p>;
  return <ul className="collaboration-activity">{project.recordedOverview.activities.map(activity => <li key={activity.id}>{activity.actor} {activity.action === "completed" ? <>marked <strong>"{activity.title}"</strong> as complete.</> : <>archived <strong>"{activity.title}"</strong>.</>}<time>{activity.at}</time></li>)}</ul>;
}
