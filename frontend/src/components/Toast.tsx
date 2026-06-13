interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
}

const Toast = ({ message, type = "info", visible }: ToastProps) => {
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-primary-light";

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-white font-semibold text-sm text-center max-w-[85vw] transition-all duration-300 ${bgColor} ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
