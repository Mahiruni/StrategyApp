"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { NewTradeDialog } from "@/components/new-trade-dialog";

type Toast = { id: number; message: string; tone: "success" | "info" };

type AppContextValue = {
  theme: "dark" | "light";
  toggleTheme: () => void;
  openNewTrade: () => void;
  notify: (message: string, tone?: Toast["tone"]) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tradeOpen, setTradeOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    const saved = window.localStorage.getItem("meridian-theme");
    if (saved === "light") setTheme("light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("meridian-theme", theme);
  }, [theme]);

  const notify = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = ++toastId.current;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(
        () =>
          setToasts((current) => current.filter((toast) => toast.id !== id)),
        3200,
      );
    },
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => (current === "dark" ? "light" : "dark")),
      openNewTrade: () => setTradeOpen(true),
      notify,
    }),
    [notify, theme],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <NewTradeDialog open={tradeOpen} onOpenChange={setTradeOpen} />
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 flex-col gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass pointer-events-auto flex min-w-64 items-center gap-3 rounded-xl px-4 py-3 shadow-float"
          >
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold ${
                toast.tone === "success"
                  ? "bg-mint text-[#04130d]"
                  : "bg-[var(--blue)] text-white"
              }`}
            >
              ✓
            </span>
            <span className="text-[12.5px] text-ink">{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
