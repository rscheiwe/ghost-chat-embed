/**
 * GhostChat Embed
 *
 * Open-source, Tailwind/shadcn-styled, Shadow DOM-isolated chat bubble
 * built atop Vercel ai-elements chatbot.
 *
 * @license MIT
 * @version 1.0.0
 */

import { init } from "./init";
import type { GhostChatConfig } from "./types";

/**
 * GhostChat public API
 */
const GhostChat = {
  /**
   * Initialize GhostChat with configuration
   * @param config - GhostChat configuration object
   */
  init,
} as const;

// Export as default
export default GhostChat;

// Export types
export type { GhostChatConfig };
