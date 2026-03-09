import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;
}

export function getLargeFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w640/${countryCode.toLowerCase()}.png`;
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
