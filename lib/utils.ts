import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 여러 Tailwind CSS 클래스를 조건부로 안전하게 결합해 주는 도우미 함수입니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
