import { useHelpFeedback } from "../hooks/use-help-feedback";
// 기능 : 원본 세 가지 평가 선택과 명시적인 로컬 처리 상태를 표시한다.
export function HelpFeedback({ articleId }: { articleId: string }) {
  const feedback = useHelpFeedback(articleId);
  return <section className="help-feedback" aria-label="Article feedback"><p>Did this answer your question?</p><div>{([['negative','Not helpful'],['neutral','Somewhat helpful'],['positive','Helpful']] as const).map(([value,label]) => <button key={value} type="button" aria-label={label} aria-pressed={feedback.choice === value} onClick={() => feedback.submit(value)}><img src={`/bonsai-help/reaction-${value}.png`} alt="" /></button>)}</div>
    {feedback.status === "pending" && <p role="status">Saving your preview choice… <button type="button" className="help-text-button" onClick={feedback.cancel}>Cancel feedback</button></p>}
    {feedback.status === "saved" && <p role="status">Thanks — your choice is saved in this local preview.</p>}
    {feedback.status === "error" && <p role="alert">Your choice could not be saved. <button type="button" className="help-text-button" onClick={() => feedback.choice && feedback.submit(feedback.choice)}>Try again</button></p>}
  </section>;
}
