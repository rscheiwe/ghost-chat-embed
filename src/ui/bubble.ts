import type { GhostChatConfig } from "../types";
import { createElement } from "../utils/dom";
import { getString } from "../i18n";

/**
 * Create the chat bubble button
 */
export function createBubble(
  config: GhostChatConfig,
  onClick: () => void
): HTMLElement {
  const { theme, i18n } = config;

  const button = createElement("button", [
    "gc-bubble",
    "fixed",
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "shadow-lg",
    "transition-all",
    "duration-200",
    "hover:scale-110",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-primary",
    "focus:ring-offset-2",
    "cursor-pointer",
    "z-50",
  ]);

  // Apply theme positioning
  button.style.right = `${theme?.button?.right ?? 20}px`;
  button.style.bottom = `${theme?.button?.bottom ?? 20}px`;
  button.style.width = `${theme?.button?.size ?? 48}px`;
  button.style.height = `${theme?.button?.size ?? 48}px`;
  button.style.backgroundColor = theme?.accentColor ?? "#3B81F6";
  button.style.color = theme?.button?.iconColor ?? "#ffffff";
  button.style.pointerEvents = "auto";

  // ARIA attributes
  button.setAttribute("aria-label", getString("open", i18n ?? {}));
  button.setAttribute("role", "button");
  button.setAttribute("type", "button");

  // Icon (SVG chat bubble icon)
  if (theme?.button?.customIconSrc) {
    const img = createElement("img", ["w-6", "h-6"]);
    img.src = theme.button.customIconSrc;
    img.alt = "Chat";
    button.appendChild(img);
  } else {
    // Default SVG chat icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
  }

  // Click handler
  button.addEventListener("click", onClick);

  // Drag and drop if enabled
  if (theme?.button?.dragAndDrop) {
    makeDraggable(button);
  }

  return button;
}

/**
 * Create tooltip for bubble
 */
export function createTooltip(config: GhostChatConfig): HTMLElement | null {
  const { theme } = config;

  if (!theme?.tooltip?.show) return null;

  const tooltip = createElement(
    "div",
    [
      "gc-tooltip",
      "absolute",
      "bg-card",
      "text-card-foreground",
      "px-3",
      "py-2",
      "rounded-lg",
      "shadow-lg",
      "text-sm",
      "whitespace-nowrap",
      "pointer-events-none",
      "animate-fade-in",
    ],
    {
      role: "tooltip",
    }
  );

  tooltip.textContent = theme.tooltip.message ?? "Hi there 👋";
  tooltip.style.right = `${(theme.button?.size ?? 48) + 16}px`;
  tooltip.style.bottom = `${(theme.button?.bottom ?? 20) + ((theme.button?.size ?? 48) - 40) / 2}px`;
  tooltip.style.position = "fixed";
  tooltip.style.pointerEvents = "auto";

  return tooltip;
}

/**
 * Make an element draggable
 */
function makeDraggable(element: HTMLElement): void {
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let initialX = 0;
  let initialY = 0;

  element.addEventListener("mousedown", dragStart);
  element.addEventListener("touchstart", dragStart, { passive: false });

  function dragStart(e: MouseEvent | TouchEvent): void {
    if (e.type === "touchstart") {
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;
      initialX = touch.clientX - currentX;
      initialY = touch.clientY - currentY;
    } else {
      initialX = (e as MouseEvent).clientX - currentX;
      initialY = (e as MouseEvent).clientY - currentY;
    }

    isDragging = true;
    element.style.cursor = "grabbing";

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", dragEnd);
  }

  function drag(e: MouseEvent | TouchEvent): void {
    if (!isDragging) return;

    e.preventDefault();

    if (e.type === "touchmove") {
      const touch = (e as TouchEvent).touches[0];
      if (!touch) return;
      currentX = touch.clientX - initialX;
      currentY = touch.clientY - initialY;
    } else {
      currentX = (e as MouseEvent).clientX - initialX;
      currentY = (e as MouseEvent).clientY - initialY;
    }

    element.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }

  function dragEnd(): void {
    isDragging = false;
    element.style.cursor = "grab";

    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", dragEnd);
  }
}
