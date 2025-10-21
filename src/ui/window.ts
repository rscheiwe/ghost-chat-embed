import type { GhostChatConfig } from "../types";
import { createElement } from "../utils/dom";
import { getString } from "../i18n";

/**
 * Create the chat window container
 */
export function createWindow(
  config: GhostChatConfig,
  onClose: () => void,
  onFullscreen?: () => void
): HTMLElement {
  const { theme, i18n } = config;

  const container = createElement(
    "div",
    [
      "gc-window",
      "fixed",
      "flex",
      "flex-col",
      "bg-background",
      "rounded-lg",
      "shadow-2xl",
      "overflow-hidden",
      "animate-fade-in",
      "z-50",
    ],
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": getString("chat", i18n ?? {}),
    }
  );

  // Apply dark mode if configured
  if (theme?.window?.darkMode) {
    container.classList.add("dark");
  }

  // Apply theme sizing
  const width = theme?.window?.width ?? 380;
  const height = theme?.window?.height ?? 640;
  const fontSize = theme?.window?.fontSize ?? 16;

  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.maxWidth = "calc(100vw - 32px)";
  container.style.maxHeight = "calc(100vh - 32px)";
  container.style.fontSize = `${fontSize}px`;

  // Position (bottom-right by default, matching bubble)
  container.style.right = `${theme?.button?.right ?? 20}px`;
  container.style.bottom = `${(theme?.button?.bottom ?? 20) + (theme?.button?.size ?? 48) + 16}px`;

  // Initially hidden
  container.style.display = "none";
  container.style.pointerEvents = "auto";

  // Header
  if (theme?.window?.showTitle !== false) {
    const header = createHeader(config, onClose, onFullscreen);
    container.appendChild(header);
  }

  // Messages container
  const messages = createElement(
    "div",
    [
      "gc-messages",
      "flex-1",
      "overflow-y-auto",
      "p-4",
      "space-y-4",
      "gc-scrollbar",
    ],
    {
      role: "log",
      "aria-live": "polite",
      "aria-atomic": "false",
    }
  );
  container.appendChild(messages);

  // Input area placeholder (will be populated later)
  const inputArea = createElement("div", ["gc-input-area"]);
  container.appendChild(inputArea);

  return container;
}

/**
 * Create the window header
 */
function createHeader(
  config: GhostChatConfig,
  onClose: () => void,
  onFullscreen?: () => void
): HTMLElement {
  const { theme, i18n } = config;

  const header = createElement("header", [
    "gc-header",
    "flex",
    "items-center",
    "justify-between",
    "px-4",
    "py-3",
    "border-b",
    "border-border",
    "bg-card",
  ]);

  // Title section
  const titleSection = createElement("div", ["flex", "items-center", "gap-3"]);

  if (theme?.window?.titleAvatarSrc) {
    const avatar = createElement("img", [
      "w-8",
      "h-8",
      "rounded-full",
      "object-cover",
    ]);
    avatar.src = theme.window.titleAvatarSrc;
    avatar.alt = "Assistant";
    titleSection.appendChild(avatar);
  }

  const title = createElement("h2", [
    "text-lg",
    "font-semibold",
    "text-foreground",
  ]);
  title.textContent = theme?.window?.title ?? "Chat";
  titleSection.appendChild(title);

  header.appendChild(titleSection);

  // Buttons container
  const buttonsContainer = createElement("div", ["flex", "items-center", "gap-2"]);

  // Fullscreen button
  if (onFullscreen) {
    const fullscreenBtn = createElement(
      "button",
      [
        "gc-fullscreen-btn",
        "flex",
        "items-center",
        "justify-center",
        "w-8",
        "h-8",
        "rounded-full",
        "hover:bg-muted",
        "transition-colors",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-primary",
      ],
      {
        type: "button",
        "aria-label": "Toggle fullscreen",
      }
    );

    fullscreenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
      </svg>
    `;

    fullscreenBtn.addEventListener("click", onFullscreen);
    buttonsContainer.appendChild(fullscreenBtn);
  }

  // Close button
  const closeBtn = createElement(
    "button",
    [
      "gc-close-btn",
      "flex",
      "items-center",
      "justify-center",
      "w-8",
      "h-8",
      "rounded-full",
      "hover:bg-muted",
      "transition-colors",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-primary",
    ],
    {
      type: "button",
      "aria-label": getString("close", i18n ?? {}),
    }
  );

  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  closeBtn.addEventListener("click", onClose);
  buttonsContainer.appendChild(closeBtn);

  header.appendChild(buttonsContainer);

  return header;
}

/**
 * Show the window with animation
 */
export function showWindow(window: HTMLElement): void {
  window.style.display = "flex";
  window.classList.remove("gc-animating-out");
  window.classList.add("gc-animating-in");
}

/**
 * Hide the window with animation
 */
export function hideWindow(window: HTMLElement): void {
  window.classList.remove("gc-animating-in");
  window.classList.add("gc-animating-out");

  // Wait for animation to complete before hiding
  setTimeout(() => {
    window.style.display = "none";
    window.classList.remove("gc-animating-out");
  }, 200); // Match animation duration
}

/**
 * Toggle fullscreen mode
 */
export function toggleFullscreen(window: HTMLElement, overlay: HTMLElement): void {
  const isFullscreen = window.classList.contains("gc-fullscreen");

  if (isFullscreen) {
    // Exit fullscreen
    window.classList.remove("gc-fullscreen");

    // Animate overlay out
    overlay.classList.remove("gc-animating-in");
    overlay.classList.add("gc-animating-out");

    setTimeout(() => {
      overlay.style.display = "none";
      overlay.classList.remove("gc-animating-out");
    }, 150);
  } else {
    // Enter fullscreen
    window.classList.add("gc-fullscreen");
    overlay.style.display = "block";
    overlay.classList.remove("gc-animating-out");
    overlay.classList.add("gc-animating-in");
  }
}
