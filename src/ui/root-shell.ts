import type { GhostChatConfig } from "../types";
import { createBubble, createTooltip } from "./bubble";
import { createWindow, showWindow, hideWindow } from "./window";
import { telemetry } from "../telemetry";
import { getDirection } from "../i18n";
import { mountIntoShadow } from "../mount";

/**
 * Simplified root shell controller
 * Manages vanilla bubble + window shell, delegates inner chat to React
 */
export class RootShellController {
  private config: GhostChatConfig;
  private shadow: ShadowRoot;
  private isOpen = false;
  private unmountReact?: () => void;

  // UI elements
  private bubble!: HTMLElement;
  private window!: HTMLElement;
  private reactContainer!: HTMLElement;

  constructor(shadow: ShadowRoot, config: GhostChatConfig) {
    this.shadow = shadow;
    this.config = config;
    this.init();
  }

  private init(): void {
    // Set text direction based on locale
    const dir = getDirection(this.config.i18n?.locale);
    const container = this.shadow.querySelector(".gc-container");
    if (container) {
      container.setAttribute("dir", dir);
    }

    // Apply font to shadow root for all elements
    const fontFamily =
      '"Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

    // Create bubble
    this.bubble = createBubble(this.config, () => this.toggleWindow());
    this.bubble.style.fontFamily = fontFamily;
    this.shadow.appendChild(this.bubble);

    // Create tooltip
    const tooltip = createTooltip(this.config);
    if (tooltip) {
      this.shadow.appendChild(tooltip);
      // Auto-hide tooltip after a few seconds
      setTimeout(() => tooltip.remove(), 5000);
    }

    // Create window shell (vanilla)
    this.window = createWindow(this.config, () => this.closeWindow());
    this.window.style.fontFamily = fontFamily;
    this.shadow.appendChild(this.window);

    // Create React container inside the window
    // Replace the .gc-messages and .gc-input-area with a single React root
    const messagesArea = this.window.querySelector(".gc-messages");
    const inputArea = this.window.querySelector(".gc-input-area");

    if (messagesArea && inputArea) {
      // Create React container
      this.reactContainer = document.createElement("div");
      this.reactContainer.className =
        "gc-react-root flex-1 flex flex-col gc-app h-full min-h-0";
      this.reactContainer.id = "gc-react-root";

      // Replace both areas with React container
      messagesArea.replaceWith(this.reactContainer);
      inputArea.remove();

      // Mount React app
      this.unmountReact = mountIntoShadow(this.reactContainer, {
        config: this.config,
      });
    }

    // Auto-open if configured
    this.handleAutoOpen();
  }

  private toggleWindow(): void {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  private openWindow(): void {
    this.isOpen = true;
    showWindow(this.window);
    telemetry.track("gc.open");
  }

  private closeWindow(): void {
    this.isOpen = false;
    hideWindow(this.window);
    telemetry.track("gc.close");
  }

  private handleAutoOpen(): void {
    const autoOpen = this.config.theme?.button?.autoWindowOpen;
    if (!autoOpen?.autoOpen) return;

    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !autoOpen.autoOpenOnMobile) return;

    // Open after delay
    setTimeout(() => {
      if (!this.isOpen) {
        this.openWindow();
      }
    }, autoOpen.openDelay ?? 1000);
  }

  public destroy(): void {
    if (this.unmountReact) {
      this.unmountReact();
    }
  }
}
