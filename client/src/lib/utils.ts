import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function formatFileSize(sizeInBytes: number, decimals: number = 2): string {
  if (sizeInBytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const k = 1024; // 1 KB = 1024 Bytes
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
  const size = sizeInBytes / Math.pow(k, i);

  return `${size.toFixed(decimals)} ${sizes[i]}`;
}