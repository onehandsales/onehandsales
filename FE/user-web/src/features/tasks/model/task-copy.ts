import type { Task } from "./task-types";
// 기능 : 작업의 가변 필드·하위·활동은 복사하고 불변 로컬 Blob만 유지한다.
export function copyTask<T extends Task>(task: T): T {
  if (!task.files) return structuredClone(task);
  const { files, ...rest } = task;
  return { ...structuredClone(rest), files: files.map(entry => ({ ...entry })) } as T;
}
