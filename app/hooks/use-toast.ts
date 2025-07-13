import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = (++toastCount).toString();
    const newToast: Toast = { ...props, id };
    
    setToasts((current) => [...current, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5000);
    
    return { id };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((current) => current.filter((t) => t.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}

// For now, we'll use a simple alert as fallback
export const toast = (props: Omit<Toast, "id">) => {
  if (props.variant === "destructive") {
    alert(`Error: ${props.title}${props.description ? `\n${props.description}` : ""}`);
  } else {
    alert(`${props.title}${props.description ? `\n${props.description}` : ""}`);
  }
};