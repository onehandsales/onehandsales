// 역할 : ORM과 독립적으로 저장된 JSON 원본을 표현합니다.
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key in string]?: JsonValue };
