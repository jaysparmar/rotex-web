import { FaWhatsapp } from "react-icons/fa6";

export function WhatsAppButton({ config }: { config: PrismaJson.GlobalConfigData["whatsapp"] }) {
  if (!config?.enabled || !config.link) return null;

  return (
    <a
      href={config.link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <FaWhatsapp className="size-7" />
    </a>
  );
}
