import { useState, useRef, useEffect } from "react";

type ToastType = "success" | "error" | "info";

/**
 * Lightweight, self-contained toast queue for a single in-flight notification.
 *
 * @returns
 *   - `message` / `type` / `visible` — bind directly to `<Toast />`
 *   - `showToast(msg, type?, duration?)` — display a toast; calling again before
 *     the timer fires cancels the previous one so only the latest message shows.
 */
export const useToast = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  // Ref (not state) so timer ID updates don't trigger re-renders.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * @param msg       Text to display.
   * @param toastType Visual style — "success" | "error" | "info". Defaults to "info".
   * @param duration  Auto-dismiss delay in ms. Defaults to 3000.
   */
  const showToast = (msg: string, toastType: ToastType = "info", duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), duration);
  };

  // Guard against state updates after unmount if a toast fires during navigation.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { message, type, visible, showToast };
};
