import { useObjectUrl } from "@/lib/use-object-url";
import type { ClientCompany } from "../model/client-types";
// 기능 : 목록과 상세가 같은 고객의 저장 이미지를 표시하고 없으면 목 이니셜을 사용한다.
export function ClientAvatar({ client }: { client: ClientCompany }) {
  const url = useObjectUrl(client.image?.file ?? null);
  return url ? <img src={url} alt={`${client.displayName} image`} /> : <span>{client.displayName.split(/\s+/).slice(0, 2).map(value => value[0]).join("")}</span>;
}
