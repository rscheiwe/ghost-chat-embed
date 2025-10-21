import type { GhostChatConfig } from "../types";
import { createBubble, createTooltip } from "./bubble";
import { createWindow, showWindow, hideWindow, toggleFullscreen } from "./window";
import { telemetry } from "../telemetry";
import { getDirection } from "../i18n";
import { mountIntoShadow } from "../mount";
import { createElement } from "../utils/dom";

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
  private overlay!: HTMLElement;
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

    // Create overlay for fullscreen mode
    this.overlay = createElement("div", ["gc-overlay"]);
    this.overlay.style.cssText =
      "display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 40; pointer-events: auto;";
    this.overlay.addEventListener("click", () => this.exitFullscreen());
    this.shadow.appendChild(this.overlay);

    // Create window shell (vanilla)
    this.window = createWindow(
      this.config,
      () => this.closeWindow(),
      () => this.toggleFullscreen()
    );
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

      // Create portal container for Radix UI portals (keeps them in shadow DOM)
      const portalContainer = document.createElement("div");
      portalContainer.id = "gc-portal-container";
      portalContainer.style.cssText = "position: fixed; z-index: 9999;";
      this.shadow.appendChild(portalContainer);

      // Mount React app
      this.unmountReact = mountIntoShadow(this.reactContainer, {
        config: this.config,
        portalContainer,
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
    this.exitFullscreen(); // Exit fullscreen if active
    hideWindow(this.window);
    telemetry.track("gc.close");
  }

  private toggleFullscreen(): void {
    toggleFullscreen(this.window, this.overlay);
  }

  private exitFullscreen(): void {
    if (this.window.classList.contains("gc-fullscreen")) {
      this.window.classList.remove("gc-fullscreen");

      // Animate overlay out
      this.overlay.classList.remove("gc-animating-in");
      this.overlay.classList.add("gc-animating-out");

      setTimeout(() => {
        this.overlay.style.display = "none";
        this.overlay.classList.remove("gc-animating-out");
      }, 150); // Match overlay animation duration
    }
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
