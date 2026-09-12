import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 기능 : cn 기능을 수행합니다.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
