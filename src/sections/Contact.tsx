import { useState, type FormEvent } from "react";
import { links, profile } from "../data/profile";
import { Section } from "../components/Section";

const contacts = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: "M4 5h16v14H4z M4 6l8 6 8-6" },
  { label: "Personal Email", value: profile.personalEmail, href: `mailto:${profile.personalEmail}`, icon: "M4 5h16v14H4z M4 6l8 6 8-6" },
  { label: "Phone", value: "+91 9165792222", href: "tel:+919165792222", icon: "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2C10 21 3 14 3 5c0-1 1-2 2-2z" },
  { label: "GitHub", value: "nishantchourasia", href: links.find((link) => link.label === "GitHub")!.href!, icon: "M9 19c-4 1-4-2-6-2 M15 22v-4c0-1-.3-2-1-2 3-.4 6-1.5 6-6a5 5 0 0 0-1.4-3.5A5 5 0 0 0 18.5 3S17 3 15 4a13 13 0 0 0-6 0C7 3 5.5 3 5.5 3a5 5 0 0 0-.1 3.5A5 5 0 0 0 4 10c0 4.5 3 5.6 6 6-.7.5-1 1.3-1 2v4" },
  { label: "LinkedIn", value: "nishant-chourasia-5ab996173", href: links.find((link) => link.label === "LinkedIn")!.href!, icon: "M4 9v11 M4 4v.1 M9 20V9h4v2c1-3 7-3 7 2v7 M13 20v-7" },
  { label: "Location", value: "Jodhpur, Rajasthan, India", href: null, icon: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
] as const;

export function Contact() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setStatus("Please fill in your name, email, and message.");
      return;
    }
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    setStatus("Email draft requested. Nothing has been sent yet. Review and send it in your email app. If no app opens, use the Email card to contact me directly.");
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  return (
    <Section id="contact" index="05" eyebrow="Contact" title="Get In Touch"
      lede="Feel free to reach out if you'd like to discuss systems, computer architecture, AI/ML, software engineering, or any of the projects on this site.">
      <div className="contact">
        <div className="contact__info" aria-labelledby="contact-info-title">
          <h3 className="contact__heading" id="contact-info-title">Contact Info</h3>
          <ul className="contact__cards">
            {contacts.map((contact) => {
              const content = <>
                <span className="contact__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={contact.icon} /></svg>
                </span>
                <span className="contact__details"><span className="contact__label">{contact.label}</span><span className="contact__value">{contact.value}</span></span>
              </>;
              return <li key={contact.label}>
                {contact.href ? <a className="contact__card" href={contact.href} {...(contact.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a> : <div className="contact__card">{content}</div>}
              </li>;
            })}
          </ul>
          <a className="btn btn--ghost contact__resume" href={links.find((link) => link.label === "Resume")!.href!} target="_blank" rel="noopener noreferrer">View Resume <span aria-hidden="true">↗</span></a>
        </div>
        <div className="contact__message" aria-labelledby="contact-message-title">
          <h3 className="contact__heading" id="contact-message-title">Send a Message</h3>
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__field">
              <label htmlFor="contact-name">Your Name</label>
              <input id="contact-name" name="name" autoComplete="name" placeholder="Your name" required maxLength={120} />
            </div>
            <div className="contact__field">
              <label htmlFor="contact-email">Your Email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} />
            </div>
            <div className="contact__field">
              <label htmlFor="contact-message">Your Message</label>
              <textarea id="contact-message" name="message" placeholder="What would you like to discuss?" rows={6} required maxLength={4000} />
            </div>
            <p className="contact__hint" id="contact-form-help">Opens a draft in your email app. Review it there and send when ready.</p>
            <button className="btn contact__submit" type="submit" aria-describedby="contact-form-help">Send Message <span aria-hidden="true">↗</span></button>
            <p className="contact__status" role="status">{status}</p>
          </form>
        </div>
      </div>
    </Section>
  );
}
