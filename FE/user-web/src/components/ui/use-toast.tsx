import { useEffect, useState } from "react";
import { Toast, type ToastVariant } from "@/components/ui/toast";

type ToastOptions = {
  readonly variant?: ToastVariant;
  readonly message: string;
  readonly description?: string;
  readonly duration?: number;
};

type ToastState = ToastOptions & { readonly id: number };

let nextId = 0;

// 기능 : Toast hook으로 상태와 동작을 제공합니다.
export function useToast() {
  const [current, setCurrent] = useState<ToastState | null>(null);

  // 기능 : toast 형식으로 변환합니다.
  const toast = (options: ToastOptions) => {
    nextId += 1;
    setCurrent({ ...options, id: nextId });
  };

  // 기능 : dismiss 기능을 수행합니다.
  const dismiss = () => {
    setCurrent(null);
  };

  useEffect(() => {
    if (!current) {
      return;
    }

    const duration = current.duration ?? 3000;
    const timer = setTimeout(() => {
      setCurrent(null);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [current]);

  const node = current ? (
    <Toast
      key={current.id}
      description={current.description}
      message={current.message}
      variant={current.variant}
      onClose={dismiss}
    />
  ) : null;

  return { toast, dismiss, node };
}
