import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useClients } from "../hooks/use-clients";
import { NewClientDialog } from "./new-client-dialog";
// 기능 : 어느 내부 페이지에서도 같은 URL 기반 고객 모달을 열고 생성 성공에만 상세로 이동한다.
export function ClientCreateHost() {
  const clients = useClients(); const [params] = useSearchParams(); const navigate = useNavigate(); const location = useLocation();
  // 기능 : 생성 query만 제거하고 진입 페이지·검색·다른 선택은 보존한다.
  function close() { const next = new URLSearchParams(params); next.delete("create"); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state }); }
  if (clients.isError || !clients.data || clients.state.scenario === "empty") return <Dialog title="New Client" onClose={close}>{clients.state.scenario === "empty" ? <p>This is a read-only empty preview. Close this dialog and choose normal in Client preview controls to add a client.</p> : clients.isError ? <div role="alert"><p>{clients.error.message}</p><button type="button" onClick={() => void clients.refetch()}>Retry clients</button></div> : <p role="status">Preparing client form…</p>}</Dialog>;
  return <NewClientDialog store={clients.store} scope={clients.scope} tags={clients.data.tags} onClose={close} onCreated={client => void navigate(`/app/clients/${encodeURIComponent(client.id)}`, { replace: true, state: { createdClientId: client.id } })} />;
}
