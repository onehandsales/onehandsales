import { encodeRecordValue, recordValueKey } from "./record-value-codec";
import type { RecordAttributeValueType } from "./ports/record-definition-list-query.port";
const id = "00000000-0000-4000-8000-000000000001";
// 기능 : 저장 타입 경계와 정밀도·날짜·빈 값의 의미를 검증합니다.
describe("Record value input contract", () => {
  it.each<[RecordAttributeValueType, unknown, string, unknown]>([
    ["Text", "", "textValue", ""], ["Domain", "openai.com", "textValue", "openai.com"],
    ["EmailAddress", "a@example.com", "textValue", "a@example.com"], ["PhoneNumber", "+821000000000", "textValue", "+821000000000"],
    ["Number", "9007199254740992.0000000002", "numberValue", "9007199254740992.0000000002"],
    ["Currency", "000.00", "numberValue", "0"], ["Rating", "-0", "numberValue", "0"],
    ["Checkbox", false, "booleanValue", false], ["Date", "2024-02-29", "dateValue", new Date("2024-02-29T00:00:00Z")],
    ["Timestamp", "2026-11-12T09:30:00+09:00", "timestampValue", new Date("2026-11-12T00:30:00Z")],
    ["Select", { selectOptionId: id }, "selectOptionId", id], ["Status", { statusOptionId: id }, "statusOptionId", id],
    ["ActorReference", { targetActorId: id }, "targetActorId", id], ["RecordReference", { targetRecordDefinitionId: id }, "targetRecordDefinitionId", id],
    ["PersonalName", { displayName: "Sample" }, "textValue", "Sample"], ["Location", { text: "Seoul" }, "textValue", "Seoul"],
    ["Interaction", { summary: "Call", occurredAt: "2026-11-12T00:00:00Z" }, "timestampValue", new Date("2026-11-12T00:00:00Z")],
  ])("encodes %s using the intended column", (type, input, field, value) => {
    expect(encodeRecordValue(type, input)).toHaveProperty(field, value);
  });
  it.each<[RecordAttributeValueType, unknown]>([
    ["Text", 3], ["Number", 1.1], ["Number", "100000000000000000000"], ["Currency", "1.00000000001"],
    ["Date", "2023-02-29"], ["Date", "2026-13-01"], ["Timestamp", "2026-11-12T12:00:00"],
    ["Timestamp", "2026-02-30T12:00:00Z"],
    ["Checkbox", "false"], ["Select", { label: "Wrong" }], ["Status", { statusOptionId: "bad" }],
    ["RecordReference", { targetRecordDefinitionId: id, id: "00000000-0000-4000-8000-000000000002" }],
    ["ActorReference", []], ["PersonalName", []], ["Interaction", { occurredAt: "bad" }],
  ])("rejects invalid %s input", (type, value) => expect(() => encodeRecordValue(type, value)).toThrow());
  it("distinguishes null, zero, false and normalizes object key order", () => {
    expect(recordValueKey(encodeRecordValue("Currency", null))).not.toEqual(recordValueKey(encodeRecordValue("Currency", "0")));
    expect(recordValueKey(encodeRecordValue("Checkbox", null))).not.toEqual(recordValueKey(encodeRecordValue("Checkbox", false)));
    expect(recordValueKey(encodeRecordValue("PersonalName", { givenName: "A", familyName: "B" })))
      .toEqual(recordValueKey(encodeRecordValue("PersonalName", { familyName: "B", givenName: "A" })));
  });
});
