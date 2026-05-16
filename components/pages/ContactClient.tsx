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
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function ContactClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
    intent: "Buying",
    city: "Lahore",
  });
  const [sent, setSent] = useState(false);

  const valid = form.name.trim() && form.email.includes("@");
  const ref = `EB-${String(Date.now()).slice(-6)}`;
  const set = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setSent(true);
  }

  return (
    <>
      <section className="page-hd">
        <div className="wrap">
          <div className="l">
            <div className="eyebrow">Contact · Estate Brothers</div>
            <div className="mono page-note">Always open</div>
          </div>
          <div className="t">
            <h1>
              Begin a <span className="serif-i">private</span> conversation.
            </h1>
            <p>
              Speak with our team for property services, investment guidance, buying, selling, or
              valuation support. Estate Brothers is available 24/7 from our DHA Phase 6 Lahore
              office and branch network.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-body">
        <div className="wrap">
          <form className="form reveal" onSubmit={submit} noValidate>
            <p className="lead">
              Your trusted real estate partner for secure investments, smart opportunities, and
              property decisions you can make with confidence.
            </p>

            {sent ? (
              <div className="success">
                <div className="h">Thank you, {form.name.split(" ")[0]}.</div>
                <p className="p">
                  Your inquiry has been received. A member of the Estate Brothers team will contact
                  you from our {form.city} network as soon as possible.
                </p>
                <span className="ref">Reference · {ref}</span>
              </div>
            ) : (
              <>
                <Field label="I am">
                  <div className="chips">
                    {inquiryIntents.map((intent) => (
                      <button
                        type="button"
                        key={intent}
                        className={`chip${form.intent === intent ? " active" : ""}`}
                        onClick={() => set("intent", intent)}
                      >
                        {intent}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="City of interest">
                  <div className="chips">
                    {inquiryCities.map((city) => (
                      <button
                        type="button"
                        key={city}
                        className={`chip${form.city === city ? " active" : ""}`}
                        onClick={() => set("city", city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="field-row">
                  <Field label="Name">
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(event) => set("name", event.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) => set("email", event.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    placeholder="+92 ___ _______"
                    value={form.phone}
                    onChange={(event) => set("phone", event.target.value)}
                  />
                </Field>

                <Field label="Tell us a little">
                  <textarea
                    placeholder="Tell us about the property, investment, location, price range, or service you need."
                    value={form.message}
                    onChange={(event) => set("message", event.target.value)}
                  />
                </Field>

                <div className="submit-row">
                  <button type="submit" className="submit-btn" disabled={!valid}>
                    <span>Send inquiry</span>
                    <span className="arrow">→</span>
                  </button>
                  <span className="submit-note">
                    Always open. Your details are handled privately by the Estate Brothers team.
                  </span>
                </div>
              </>
            )}
          </form>

          <aside className="aside reveal">
            <div className="aside-block">
              <h3>Speak with us</h3>
              <div className="v">
                Estate Brothers <span className="serif-i">Real Estate</span>
              </div>
              <div className="meta">
                estatebrothers786@gmail.com
                <br />
                0325 2222330
                <br />
                Instagram: estatebrothers1
              </div>
            </div>

            <div className="aside-block">
              <h3>Offices</h3>
              <div className="offices">
                {offices.map((office) => (
                  <div className="office" key={office.city}>
                    <div className="city">
                      <span className="dot" />
                      {office.city}
                    </div>
                    <div className="addr">
                      {office.addr.split("\n").map((line) => (
                        <span key={line}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hours">
              <h3>Hours</h3>
              <table>
                <tbody>
                  {officeHours.map(([day, hours]) => (
                    <tr key={day}>
                      <td>{day}</td>
                      <td>{hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
