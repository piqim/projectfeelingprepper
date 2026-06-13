interface OfflineBannerProps {
  visible: boolean;
}

const OfflineBanner = ({ visible }: OfflineBannerProps) => {
  return (
    <div
      className={`fixed top-14 left-0 right-0 z-40 bg-red-500 text-white text-center text-sm font-semibold py-2 px-4 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      No internet connection
    </div>
  );
};

export default OfflineBanner;
