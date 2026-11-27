import { Tag } from "lucide-react";
import { ClientFieldDefinitions } from "./client-field-definitions";
import { ClientAutomationsTab, ClientPortalTab } from "./client-overview-tabs";
import type { ClientData } from "../model/client-types";

// 기능 : 관찰된 고객 탭과 태그 정의 조회를 조합하고 필드 편집의 소유권을 별도 유지한다.
export function ClientTabs({ tab, data, onUnavailable }: { tab: string; data: ClientData; onUnavailable: (name: string) => void }) {
  if (tab === "portal") return <ClientPortalTab onUnavailable={onUnavailable} />;
  if (tab === "automations") return <ClientAutomationsTab onUnavailable={onUnavailable} />;
  return <div className="clients-body client-settings"><section>
    <div className="client-panel-title"><h2>Client Tags</h2><button className="client-primary" onClick={() => onUnavailable("New Client Tag")}>New Client Tag</button></div>
    <div className="client-definition-table client-tag-table"><header><span>Tag Name</span><span>{data.tags.length} Tags</span></header>
      {data.tags.map(tag => {
        const count = data.clients.filter(client => client.tagIds.includes(tag.id)).length;
        return <div key={tag.id} className="client-tag-row"><span className="client-tag"><Tag size={12} aria-hidden="true" />{tag.name}</span><span className="client-definition-count">{count} {count === 1 ? "Client" : "Clients"}</span>
          <span className="client-tag-row-actions"><button aria-label={`Edit tag ${tag.name}`} onClick={() => onUnavailable("Edit client tag")}>Edit</button><button className="client-delete" aria-label={`Delete tag ${tag.name}`} onClick={() => onUnavailable("Delete client tag")}>Delete</button></span>
        </div>;
      })}
    </div>
  </section><ClientFieldDefinitions fields={data.fields} /></div>;
}
