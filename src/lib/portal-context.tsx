import { createContext, useContext, type ReactNode } from "react";

interface PortalContextValue {
  container: HTMLElement | null;
}

const PortalContext = createContext<PortalContextValue>({ container: null });

export function PortalProvider({
  children,
  container,
}: {
  children: ReactNode;
  container: HTMLElement | null;
}) {
  return (
    <PortalContext.Provider value={{ container }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortalContainer() {
  const context = useContext(PortalContext);
  return context.container;
}
