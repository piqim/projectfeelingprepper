import { useState, useRef, useEffect } from "react";

type ToastType = "success" | "error" | "info";

export const useToast = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, toastType: ToastType = "info", duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), duration);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { message, type, visible, showToast };
};
