import { createRoot } from "react-dom/client";
import ChatApp from "./ChatApp";
import type { GhostChatConfig } from "./types";

// Placeholder for compiled CSS - will be replaced during build
const GC_COMPILED_CSS = "";

export interface MountOptions {
  config: GhostChatConfig;
}

/**
 * Mount the React app into the Shadow DOM
 * (React will be aliased to Preact at build time via tsup)
 */
export function mountIntoShadow(
  container: HTMLElement,
  options: MountOptions
): () => void {
  // Create React root and render
  const root = createRoot(container);
  root.render(<ChatApp config={options.config} />);

  // Return unmount function
  return () => {
    root.unmount();
  };
}
