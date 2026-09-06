import { getSiteSettings } from "@/lib/db/site";

export async function WhatsAppButton() {
  const settings = await getSiteSettings();
  const number = (settings?.whatsapp?.trim() || settings?.phone || "").replace(/\D/g, "");
  if (!number) return null;

  return (
    <a className="whatsapp-float" href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with Estate Brothers on WhatsApp">
      <svg viewBox="0 0 24 24" width="25" height="25" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.95 11.95 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.47-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.47 4.45-9.92 9.9-9.92a9.85 9.85 0 0 1 7.02 2.9 9.85 9.85 0 0 1 2.9 7.02c0 5.46-4.45 9.91-9.92 9.91Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.48-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
      </svg>
      <span className="whatsapp-float-label" aria-hidden="true">Chat on WhatsApp</span>
    </a>
  );
}
