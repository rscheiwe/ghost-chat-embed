import type { GhostI18n } from "./types";

/**
 * Default English strings
 */
export const defaultStrings: Record<string, string> = {
  welcome: "Welcome! How can I help you today?",
  placeholder: "Type your message...",
  send: "Send",
  close: "Close chat",
  minimize: "Minimize chat",
  dragTooltip: "Drag to move",
  errorConnection: "Connection error. Please try again.",
  errorRateLimit: "Too many requests. Please wait a moment.",
  errorGeneric: "Something went wrong. Please try again.",
  typing: "Typing...",
  thinking: "Thinking...",
};

/**
 * RTL languages
 */
const RTL_LOCALES = ["ar", "fa", "he", "ur"];

/**
 * Get localized string with fallback
 */
export function getString(
  key: string,
  i18n: GhostI18n
): string {
  return i18n.strings?.[key] ?? defaultStrings[key] ?? key;
}

/**
 * Check if locale requires RTL
 */
export function isRTL(locale?: string): boolean {
  if (!locale) return false;
  return RTL_LOCALES.includes(locale.toLowerCase().split("-")[0] ?? "");
}

/**
 * Get text direction for locale
 */
export function getDirection(locale?: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}
