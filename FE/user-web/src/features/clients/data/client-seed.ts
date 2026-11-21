import type { ClientData } from "../model/client-types";
// 기능 : 운영 회사와 분리된 고객 회사·연락처·태그 ID를 작업공간마다 준비한다.
export function clientSeed(workspaceId: string): ClientData {
  const tags = [{ id: `${workspaceId}:client-tag-client`, name: "Client" }, { id: `${workspaceId}:client-tag-lead`, name: "Lead" }];
  const contacts = [{ id: `${workspaceId}:contact-jane`, workspaceId, name: "Jane Doe", email: "janesmith1.mobbin@gmail.com" }, { id: `${workspaceId}:contact-sample`, workspaceId, name: "Sample Client", email: "sampleclient@hellobonsai.com" }];
  return { tags, contacts, fields: ["Company Title (Pre-filled on documents)", "Phone Number", "Website"].map((name, index) => ({ id: `${workspaceId}:client-field-${index}`, name, revision: 0, image: null, imageRevision: 0 })), fieldValues: [], clients: contacts.map((contact, index) => ({ id: `${workspaceId}:client-${index === 0 ? "doe" : "sample"}`, workspaceId, companyName: index === 0 ? "Doe Company" : "Sample Client", displayName: index === 0 ? "Doe Company" : "Sample Client", contactIds: [contact.id], defaultContactId: contact.id, tagIds: index === 0 ? [tags[0]!.id] : [], status: "active", revision: 0, image: null, imageRevision: 0 })) };
}
