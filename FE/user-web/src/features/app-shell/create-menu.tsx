import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Users, Folder, MailOpen, Send, FileText, FilePenLine, Receipt } from "lucide-react";
// 기능 : 전역 신규 메뉴에서 고객은 같은 화면의 모달로, 후속 업무는 로컬 인계로 연결한다.
export function CreateMenu() {
  const location = useLocation(); const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const menu = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(location.search); params.set("create", "client");
  // 기능 : 새 경로에서는 메뉴를 닫고 이전 열린 상태를 남기지 않는다.
  useEffect(function closeRoute() { setOpen(false); }, [location.key]);
  // 기능 : 열린 메뉴의 초점과 바깥 클릭 구독을 해당 수명에 연결한다.
  useEffect(function followOpen() { if (!open) return; menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    // 기능 : 메뉴 밖 클릭 시 포커스를 강제로 이동하지 않고 메뉴만 닫는다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", outside); return function cleanup() { document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <div className="app-create-menu" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => { if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); trigger.current?.focus(); } if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const links = Array.from(menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []); const index = links.findIndex(link => link === document.activeElement); links[event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + links.length) % links.length]?.focus(); } }}><button ref={trigger} className="app-new" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (!open && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}><Plus size={21} aria-hidden="true" /><span>New</span></button>{open && <div ref={menu} role="menu" aria-label="Create new"><Link role="menuitem" to={{ pathname: location.pathname, search: params.toString(), hash: location.hash }} preventScrollReset onClick={() => trigger.current?.focus()}><Users size={21} />Client</Link>{[{ name: "Project", path: "projects", Icon: Folder }, { name: "Invoice", path: "invoices", Icon: MailOpen }, { name: "Proposal", path: "proposals", Icon: Send }, { name: "Contract", path: "contracts", Icon: FileText }, { name: "Form", path: "forms", Icon: FilePenLine }, { name: "Expense", path: "expenses", Icon: Receipt }].map(({ name, path, Icon }) => <Link key={name} role="menuitem" to={`/app/pending/${path}`}><Icon size={21} />{name}</Link>)}</div>}</div>;
}
