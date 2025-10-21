/**
 * GhostChat configuration and type definitions
 */

export interface GhostChatConfig {
  /** Required: base URL to chat API */
  apiHost: string;
  /** Optional: backend chat/session id seed */
  chatId?: string;
  /** Optional: restore existing conversation */
  conversationId?: string;
  /** Optional: user identification */
  user?: {
    id?: string;
    email?: string;
  };
  /** Optional: theme configuration */
  theme?: GhostTheme;
  /** Optional: feature toggles */
  features?: GhostFeatures;
  /** Optional: internationalization settings */
  i18n?: GhostI18n;
  /** Optional: domains allowed to embed */
  domainAllowlist?: string[];
  /** Optional: telemetry configuration */
  telemetry?: {
    enabled?: boolean;
    endpoint?: string;
  };
}

export interface GhostTheme {
  /** Accent color (e.g., #3B81F6) */
  accentColor?: string;
  /** Chat bubble button configuration */
  button?: {
    right?: number;
    bottom?: number;
    size?: number;
    dragAndDrop?: boolean;
    iconColor?: string;
    customIconSrc?: string;
    autoWindowOpen?: {
      autoOpen?: boolean;
      openDelay?: number;
      autoOpenOnMobile?: boolean;
    };
  };
  /** Tooltip configuration */
  tooltip?: {
    show?: boolean;
    message?: string;
  };
  /** Chat window configuration */
  window?: {
    title?: string;
    titleAvatarSrc?: string;
    height?: number;
    width?: number;
    fontSize?: number;
    darkMode?: boolean;
    showTitle?: boolean;
  };
}

export interface GhostFeatures {
  /** Include prompt toolbar */
  includePromptToolbar?: boolean;
  /** Include model selection dropdown */
  includeModelSelection?: boolean;
  /** Include file upload functionality */
  includeFileUpload?: boolean;
  /** Include suggested prompts */
  includeSuggestions?: boolean;
}

export interface GhostI18n {
  /** Locale code (e.g., 'en', 'ar', 'es') */
  locale?: string;
  /** Custom string overrides */
  strings?: Record<string, string>;
}

/**
 * Internal message structure
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

/**
 * SSE event types
 */
export interface SSETokenEvent {
  text: string;
}

export interface SSEStatusEvent {
  loading: boolean;
}

export interface SSEDoneEvent {
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  messageId?: string;
}

/**
 * Chat API request payload
 */
export interface ChatRequest {
  message: string;
  chatId?: string;
  conversationId?: string;
  user?: {
    id?: string;
    email?: string;
  };
  features?: GhostFeatures;
}

/**
 * Telemetry event types
 */
export type TelemetryEvent =
  | "gc.open"
  | "gc.close"
  | "gc.send"
  | "gc.receive"
  | "gc.error";

export interface TelemetryData {
  event: TelemetryEvent;
  timestamp: number;
  data?: Record<string, unknown>;
}
