import clsx from "clsx";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { AlertIcon, CheckIcon, CloseIcon } from "../icons";

import { Portal } from "./Portal";

import "./Toast.scss";

export type ToastKind = "info" | "success" | "error";

type ToastRecord = {
  id: number;
  message: React.ReactNode;
  kind: ToastKind;
};

type ToastContextValue = {
  showToast: (
    message: React.ReactNode,
    opts?: { kind?: ToastKind; duration?: number },
  ) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, opts) => {
      const id = ++counter.current;
      const kind = opts?.kind ?? "info";
      setToasts((prev) => [...prev.slice(-2), { id, message, kind }]);
      const duration = opts?.duration ?? (kind === "error" ? 8000 : 4000);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <Portal kind="popover" className="ProjectsApp-toasts">
          <div className="ToastStack" role="status" aria-live="polite">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={clsx("Island AppToast", `AppToast--${toast.kind}`)}
              >
                <div className="AppToast__icon" aria-hidden>
                  {toast.kind === "error" ? AlertIcon : CheckIcon}
                </div>
                <div className="AppToast__message">{toast.message}</div>
                <button
                  type="button"
                  className="AppToast__close"
                  aria-label="Dismiss"
                  onClick={() => dismiss(toast.id)}
                >
                  {CloseIcon}
                </button>
              </div>
            ))}
          </div>
        </Portal>
      )}
    </ToastContext.Provider>
  );
};
