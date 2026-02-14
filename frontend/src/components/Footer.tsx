
const Footer = () => {
  return (
    <footer className="relative w-[430px] bg-dark shadow-inner px-4 py-3 flex flex-col items-center gap-2 text-sm text-gray-500">

      {/* App Info */}
      <p className="text-xs text-highlight">
        © {new Date().getFullYear()} FeelingPrepper · All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
