import type { CSSProperties } from "react";
import { taskStatuses } from "./task-types";
import type { TaskStatusDefinition, TaskStatusSettings } from "./task-types";

// 의미 : 원본 팔레트를 시각 추정한 값이며 서비스의 정확한 색상 token은 미확인이다.
export const taskStatusPalette = ["#99a49f", "#fac33e", "#78a3ed", "#e68850", "#55aa2d", "#df3e68", "#e83c66", "#4c16ad"];
// 기능 : 변경 가능한 이름·색·순서를 고정 상태 ID와 분리한 workspace 초기값을 만든다.
export function initialTaskStatuses(): TaskStatusSettings {
  return { revision: 0, items: [{ id: "To Do", name: "To Do", color: "#4c16ad" }, { id: "In Progress", name: "In Progress", color: "#78a3ed" }, { id: "Done", name: "Done", color: "#55aa2d" }] };
}
// 기능 : 미수록 추가·삭제를 막고 기존 ID·완료 의미를 보존한 표시 정의만 검증한다.
export function validateTaskStatuses(input: TaskStatusDefinition[]) {
  const items = input.map(item => ({ id: item.id, name: item.name.trim(), color: item.color }));
  if (items.length !== 3 || !taskStatuses.every(id => items.filter(item => item.id === id).length === 1) || items.at(-1)?.id !== "Done") throw new Error("Keep the three existing statuses and Done last.");
  if (items.some(item => !item.name || item.name.length > 40)) throw new Error("Enter a status name of 1–40 characters.");
  if (new Set(items.map(item => item.name.toLowerCase())).size !== items.length) throw new Error("Use distinct status names.");
  if (items.some(item => !taskStatusPalette.includes(item.color))) throw new Error("Choose an available status color.");
  return items;
}
// 기능 : 상태 배지의 점과 연한 배경을 같은 정의에서 계산한다.
export function taskStatusStyle(item: TaskStatusDefinition): CSSProperties {
  return { "--task-status-color": item.color, backgroundColor: item.color + "20" } as CSSProperties;
}
