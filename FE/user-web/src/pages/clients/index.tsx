import { ClientProjects } from "@/features/projects";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigationType, useParams, useSearchParams } from "react-router-dom";
import { ClientDetail, ClientList, ClientTabs, ClientTools, useClients } from "@/features/clients";
import { Dialog } from "@/components/ui/dialog";
import "@/styles/clients.css";
// 기능 : 고객 경로·탭·목록·상세와 미수록 행동 안내를 실제 navigation으로 조합한다.
export function ClientsPage() {
  const { clientId } = useParams(); const [params] = useSearchParams(); const location = useLocation(); const clients = useClients(); const [unavailable, setUnavailable] = useState(""); const [dismissed, setDismissed] = useState("");
  const navigationType = useNavigationType();
  // 기능 : 같은 경로의 새 이력에서도 편집 초안·디코딩·요청 수명을 종료한다.
  const entryKey = `${location.key}:${clients.state.scenario}`;
  const tab = ["portal", "automations", "settings"].includes(params.get("tab") ?? "") ? params.get("tab")! : "clients";
  // 기능 : 경로를 바꾸면 이전 고객의 안내 모달을 폐기한다.
  useEffect(function clearRoute() { setUnavailable(""); }, [location.key]);
  const client = clients.data?.clients.find(value => value.id === clientId); const created = (location.state as { createdClientId?: string } | null)?.createdClientId;
  return <section className="clients-page">{!clientId && <header className="clients-heading"><h1>Clients</h1><nav aria-label="Client sections">{[["clients", "Clients"], ["portal", "Client Portal"], ["automations", "Automations"], ["settings", "Settings"]].map(([id, label]) => <Link key={id} to={id === "clients" ? "/app/clients" : `/app/clients?tab=${id}`} aria-current={tab === id ? "page" : undefined}>{label}</Link>)}</nav></header>}
    {clients.isPending ? <p role="status" className="clients-read-state">Loading clients…</p> : clients.isError ? <div role="alert" className="clients-read-state"><h1>Clients unavailable</h1><p>{clients.error.message}</p><button onClick={() => void clients.refetch()}>Retry clients</button></div> : clientId ? client ? <ClientDetail key={`${entryKey}:${client.id}`} client={client} data={clients.data} onUnavailable={setUnavailable} onUpdated={() => setDismissed(client.id)} projectPanel={<ClientProjects clientId={client.id} />} /> : <div className="clients-read-state"><h1>Client not found</h1><p>This client does not exist in the current workspace.</p><Link to="/app/clients">Return to clients</Link></div> : tab === "clients" ? <ClientList data={clients.data} onUnavailable={setUnavailable} /> : <ClientTabs key={entryKey} tab={tab} data={clients.data} onUnavailable={setUnavailable} />}
    <ClientTools />{unavailable && <Dialog title={unavailable} onClose={() => setUnavailable("")}><p>This preview does not include the next recorded screen for this action. Client data is unchanged.</p><button onClick={() => setUnavailable("")}>Return to clients</button></Dialog>}
    {created && created === client?.id && created !== dismissed && navigationType !== "POP" && <div role="status" className="client-notice"><span aria-hidden="true">✓</span> You successfully added 1 client.<button aria-label="Dismiss client message" onClick={() => setDismissed(created)}>×</button></div>}
  </section>;
}
