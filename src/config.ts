import { z } from "zod";
import type { GhostChatConfig } from "./types";

/**
 * Zod schemas for runtime config validation
 */

const GhostFeaturesSchema = z
  .object({
    includePromptToolbar: z.boolean().optional(),
    includeModelSelection: z.boolean().optional(),
    includeFileUpload: z.boolean().optional(),
    includeSuggestions: z.boolean().optional(),
  })
  .optional();

const GhostI18nSchema = z
  .object({
    locale: z.string().optional(),
    strings: z.record(z.string()).optional(),
  })
  .optional();

const GhostThemeSchema = z
  .object({
    accentColor: z.string().optional(),
    button: z
      .object({
        right: z.number().optional(),
        bottom: z.number().optional(),
        size: z.number().min(40).max(64).optional(),
        dragAndDrop: z.boolean().optional(),
        iconColor: z.string().optional(),
        customIconSrc: z.string().url().optional(),
        autoWindowOpen: z
          .object({
            autoOpen: z.boolean().optional(),
            openDelay: z.number().min(0).optional(),
            autoOpenOnMobile: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    tooltip: z
      .object({
        show: z.boolean().optional(),
        message: z.string().optional(),
      })
      .optional(),
    window: z
      .object({
        title: z.string().optional(),
        titleAvatarSrc: z.string().url().optional(),
        height: z.number().min(420).optional(),
        width: z.number().min(320).optional(),
        fontSize: z.number().min(12).max(24).optional(),
        darkMode: z.boolean().optional(),
        showTitle: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

const GhostChatConfigSchema = z.object({
  apiHost: z.string().url("apiHost must be a valid URL"),
  chatId: z.string().optional(),
  conversationId: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  theme: GhostThemeSchema,
  features: GhostFeaturesSchema,
  i18n: GhostI18nSchema,
  domainAllowlist: z.array(z.string()).optional(),
  telemetry: z
    .object({
      enabled: z.boolean().optional(),
      endpoint: z.string().url().optional(),
    })
    .optional(),
});

/**
 * Validates and returns a GhostChatConfig with defaults applied
 */
export function validateConfig(
  config: unknown
): GhostChatConfig {
  try {
    const validated = GhostChatConfigSchema.parse(config);
    return applyDefaults(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (e) => `  - ${e.path.join(".")}: ${e.message}`
      );
      throw new Error(
        `[GhostChat] Invalid configuration:\n${messages.join("\n")}`
      );
    }
    throw error;
  }
}

/**
 * Apply default values to config
 */
function applyDefaults(config: GhostChatConfig): GhostChatConfig {
  return {
    ...config,
    theme: {
      accentColor: config.theme?.accentColor ?? "#3B81F6",
      button: {
        right: config.theme?.button?.right ?? 20,
        bottom: config.theme?.button?.bottom ?? 20,
        size: config.theme?.button?.size ?? 48,
        dragAndDrop: config.theme?.button?.dragAndDrop ?? true,
        iconColor: config.theme?.button?.iconColor ?? "#ffffff",
        customIconSrc: config.theme?.button?.customIconSrc,
        autoWindowOpen: {
          autoOpen: config.theme?.button?.autoWindowOpen?.autoOpen ?? false,
          openDelay: config.theme?.button?.autoWindowOpen?.openDelay ?? 1000,
          autoOpenOnMobile:
            config.theme?.button?.autoWindowOpen?.autoOpenOnMobile ?? false,
        },
      },
      tooltip: {
        show: config.theme?.tooltip?.show ?? true,
        message: config.theme?.tooltip?.message ?? "Hi there 👋",
      },
      window: {
        title: config.theme?.window?.title ?? "Chat",
        titleAvatarSrc: config.theme?.window?.titleAvatarSrc,
        height: config.theme?.window?.height ?? 640,
        width: config.theme?.window?.width ?? 380,
        fontSize: config.theme?.window?.fontSize ?? 16,
        darkMode: config.theme?.window?.darkMode ?? false,
        showTitle: config.theme?.window?.showTitle ?? true,
      },
    },
    features: {
      includePromptToolbar: config.features?.includePromptToolbar ?? false,
      includeModelSelection: config.features?.includeModelSelection ?? false,
      includeFileUpload: config.features?.includeFileUpload ?? false,
      includeSuggestions: config.features?.includeSuggestions ?? true,
    },
    i18n: {
      locale: config.i18n?.locale ?? "en",
      strings: config.i18n?.strings ?? {},
    },
    telemetry: {
      enabled: config.telemetry?.enabled ?? false,
      endpoint: config.telemetry?.endpoint,
    },
  };
}
