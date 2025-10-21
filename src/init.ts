import type { GhostChatConfig } from "./types";
import { validateConfig } from "./config";
import { RootShellController } from "./ui/root-shell";
import { telemetry } from "./telemetry";
import builtStyles from "./styles/build.css?inline";

// CSS will be inlined during build process, imported for dev
const styles = builtStyles;

/**
 * Initialize GhostChat
 */
export function init(userConfig: unknown): void {
  try {
    // Validate config
    const config = validateConfig(userConfig);

    // Check domain allowlist
    if (config.domainAllowlist && config.domainAllowlist.length > 0) {
      const currentDomain = window.location.hostname;
      if (!config.domainAllowlist.includes(currentDomain)) {
        console.warn(
          `[GhostChat] Domain "${currentDomain}" is not in allowlist. Chat disabled.`
        );
        return;
      }
    }

    // Check if already initialized
    if (document.getElementById("ghost-chat-root")) {
      console.warn("[GhostChat] Already initialized");
      return;
    }

    // Initialize telemetry
    telemetry.init(config);

    // Create host element
    const host = document.createElement("div");
    host.id = "ghost-chat-root";
    // Ensure host doesn't interfere with page layout
    host.style.cssText = "all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 999999;";
    document.body.appendChild(host);

    // Attach shadow root
    const shadow = host.attachShadow({ mode: "open" });

    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    shadow.appendChild(styleSheet);

    // Debug: log if styles were loaded
    if (!styles || styles.length === 0) {
      console.warn("[GhostChat] No styles loaded! Build CSS first with: pnpm build:css");
    } else {
      console.log("[GhostChat] Loaded", Math.round(styles.length / 1024), "KB of styles");
    }

    // Create container
    const container = document.createElement("div");
    container.className = "gc-container";
    // Ensure font family applies (Geist Sans with fallbacks)
    container.style.fontFamily = '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    shadow.appendChild(container);

    // Mount UI with React/Preact
    new RootShellController(shadow, config);

    // Log version banner
    logBanner();
  } catch (error) {
    console.error("[GhostChat] Initialization failed:", error);
  }
}

/**
 * Log console banner with version info
 */
function logBanner(): void {
  const version = "1.0.0"; // TODO: inject from package.json during build
  console.log(
    `%c GhostChat v${version} `,
    "background: #3B81F6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
  );
  console.log("GitHub: https://github.com/yourusername/ghost-chat-embed");
}
