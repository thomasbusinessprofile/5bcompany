import { company } from "./company";

export function WhatsAppButton() {
  const phone = company.whatsapp.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hi 5B Trading — I'd like to discuss a sourcing project."
  )}`;
  return (
    <a
      aria-label="Chat with us on WhatsApp"
      className="whatsapp-fab"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span aria-hidden="true">💬</span>
      <span className="whatsapp-fab-label">WhatsApp</span>
    </a>
  );
}
