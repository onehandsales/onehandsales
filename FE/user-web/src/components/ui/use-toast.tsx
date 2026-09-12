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
  // 1. 화면 상태와 동작에 필요한 [current, setCurrent] 값을 준비한다.
  const [current, setCurrent] = useState<ToastState | null>(null);

  // 기능 : toast 형식으로 변환합니다.
  // 2. 이후 처리에 사용할 toast을 계산한다.
  const toast = (options: ToastOptions) => {
    nextId += 1;
    setCurrent({ ...options, id: nextId });
  };

  // 기능 : dismiss 기능을 수행합니다.
  // 3. 이후 처리에 사용할 dismiss을 계산한다.
  const dismiss = () => {
    setCurrent(null);
  };

  // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (!current) {
      return;
    }

    // 2. 이후 처리에 사용할 duration을 계산한다.
    const duration = current.duration ?? 3000;
    // 3. 이후 처리에 사용할 timer을 계산한다.
    const timer = setTimeout(() => {
      setCurrent(null);
    }, duration);

    // 4. 계산된 결과를 호출자에게 반환한다.
    return () => {
      clearTimeout(timer);
    };
  }, [current]);

  // 5. 이후 처리에 사용할 node을 계산한다.
  const node = current ? (
    <Toast
      key={current.id}
      description={current.description}
      message={current.message}
      variant={current.variant}
      onClose={dismiss}
    />
  ) : null;

  // 6. 계산된 결과를 호출자에게 반환한다.
  return { toast, dismiss, node };
}
