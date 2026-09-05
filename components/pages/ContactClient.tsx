"use client";

import { useState } from "react";
import { inquiryCities, inquiryIntents, officeHours, offices } from "@/data/contact";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  intent: string;
  city: string;
  website: string;
}
interface ContactClientProps {
  businessName?: string;
  heading?: string | null;
  intro?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  officeItems?: { id: string; city: string | null; address: string }[];
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function ContactClient({
  businessName = "Estate Brothers",
  heading,
  intro,
  email,
  phone,
  whatsapp,
  instagram,
  officeItems,
}: ContactClientProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
    intent: "Buying",
    city: "Lahore",
    website: "",
  });
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valid = form.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email.trim());
  const set = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;
  const whatsappNumber = (whatsapp ?? phone)?.replace(/\D/g, "");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json() as { error?: string; ref?: string };
      if (!response.ok || !result.ref) throw new Error(result.error || "Unable to send your inquiry.");
      setReference(result.ref);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send your inquiry.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="contact-hero">
        <div className="wrap contact-hero-grid">
          <div>
            <div className="eyebrow">Contact · Estate Brothers</div>
            <h1>{heading || "Let’s discuss your property plans."}</h1>
          </div>
          <p>{intro || "Buying, selling, valuation, or investment guidance—send a short inquiry and our Lahore team will respond directly."}</p>
        </div>
      </section>

      <section className="contact-body">
        <div className="wrap contact-grid">
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="contact-section-head">
              <span className="eyebrow">Your inquiry</span>
              <p>Required fields are marked with an asterisk.</p>
            </div>

            {reference ? (
              <div className="success" role="status">
                <div className="h">Thank you, {form.name.split(" ")[0]}.</div>
                <p className="p">Your inquiry is saved and ready for our team to review.</p>
                <span className="ref">Reference · {reference}</span>
              </div>
            ) : (
              <>
                <fieldset className="choice-group">
                  <legend>I am interested in</legend>
                  <div className="chips">
                    {inquiryIntents.map((intent) => (
                      <button type="button" key={intent} className={`chip${form.intent === intent ? " active" : ""}`} onClick={() => set("intent", intent)} aria-pressed={form.intent === intent}>
                        {intent}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="choice-group">
                  <legend>City</legend>
                  <div className="chips">
                    {inquiryCities.map((city) => (
                      <button type="button" key={city} className={`chip${form.city === city ? " active" : ""}`} onClick={() => set("city", city)} aria-pressed={form.city === city}>
                        {city}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="field-row">
                  <Field id="contact-name" label="Name *">
                    <input id="contact-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your full name" value={form.name} onChange={(event) => set("name", event.target.value)} />
                  </Field>
                  <Field id="contact-email" label="Email *">
                    <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={form.email} onChange={(event) => set("email", event.target.value)} />
                  </Field>
                </div>

                <Field id="contact-phone" label="Phone / WhatsApp">
                  <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+92 3__ _______" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
                </Field>
                <Field id="contact-message" label="How can we help?">
                  <textarea id="contact-message" name="message" maxLength={3000} placeholder="Property, location, budget, or service required" value={form.message} onChange={(event) => set("message", event.target.value)} />
                </Field>
                <div className="contact-honeypot" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => set("website", event.target.value)} />
                </div>
                {error && <p className="contact-error" role="alert">{error}</p>}
                <div className="submit-row">
                  <button type="submit" className="submit-btn" disabled={!valid || pending}>{pending ? "Sending…" : "Send inquiry"}<span aria-hidden>→</span></button>
                  <span className="submit-note">Your details stay private and are visible only to the Estate Brothers admin team.</span>
                </div>
              </>
            )}
          </form>

          <aside className="contact-aside" aria-label="Direct contact details">
            <div className="contact-methods">
              <span className="eyebrow">Contact directly</span>
              {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"><span>WhatsApp</span><strong>Start a chat</strong></a>}
              {phone && phoneHref && <a href={phoneHref}><span>Call</span><strong>{phone}</strong></a>}
              {email && <a href={`mailto:${email}`}><span>Email</span><strong>{email}</strong></a>}
              {instagram && <a href={instagram} target="_blank" rel="noreferrer"><span>Instagram</span><strong>View profile</strong></a>}
            </div>

            <div className="contact-offices">
              <span className="eyebrow">Visit us</span>
              {(officeItems?.length ? officeItems : offices.map((office) => ({ id: office.city, city: office.city, address: office.addr }))).map((office) => (
                <div className="contact-office" key={office.id}>
                  <strong>{office.city || businessName}</strong>
                  <span>{office.address}</span>
                </div>
              ))}
            </div>

            <div className="contact-hours">
              <span className="eyebrow">Availability</span>
              {officeHours.map(([day, hours]) => <div key={day}><span>{day}</span><strong>{hours}</strong></div>)}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
