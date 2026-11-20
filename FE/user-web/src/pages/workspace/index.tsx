import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { ItemEditor, PreviewError, usePreviewEnvironment, usePreviewItem } from "@/features/preview";
import { Button } from "@/components/ui/button";
import { StatusPanel } from "@/components/ui/status-panel";

// 기능 : 내부 기반 항목을 목록과 상세에서 같은 ID로 조회하고 편집 결과를 확인한다.
export function WorkspacePage() {
  const { itemId } = useParams();
  const { state } = usePreviewEnvironment();
  const { list, detail } = usePreviewItem(itemId);
  const [editing, setEditing] = useState(false);
  const query = itemId ? detail : list;
  const workspace = state.session?.workspaces.find((entry) => entry.id === state.workspaceId);
  // 기능 : 현재 조회만 다시 실행해 일시적 목 실패를 복구한다.
  function handleRetry() { void query.refetch(); }
  return <div className="page-content">
    <p className="eyebrow">{workspace?.name} · {state.session?.name}</p>
    <h1>{itemId ? "Preview item" : "Workspace preview"}</h1>
    <p className="intro">A sample item for checking shared state.</p>
    {itemId && <Link to="/app" className="back-link">← Back to items</Link>}
    {query.isPending ? <StatusPanel title="Loading…" /> :
      query.isError ? <StatusPanel
        title={query.error instanceof PreviewError && query.error.kind === "denied" ? "Access restricted" : "Preview unavailable"}
        message={query.error.message} onRetry={query.error instanceof PreviewError && ["denied", "missing"].includes(query.error.kind) ? undefined : handleRetry} /> :
      itemId && detail.data ? <article className="item-card">
        <p className="eyebrow">Sample item · {detail.data.id}</p><h2>{detail.data.name}</h2>
        <p>Updated <time dateTime={detail.data.updatedAt}>{detail.data.updatedAt}</time></p>
        <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden="true" />Edit name</Button>
        {editing && <ItemEditor key={detail.data.id} item={detail.data} onClose={() => setEditing(false)} />}
      </article> :
      list.data?.length ? <ul className="item-list">{list.data.map((item) => <li key={item.id}>
        <Link to={"/app/items/" + item.id}><strong>{item.name}</strong><span>View item →</span></Link>
      </li>)}</ul> : <StatusPanel title="No preview items" message="Choose Normal in preview controls to restore the sample." />}
  </div>;
}
