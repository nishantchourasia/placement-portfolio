import { Section } from "../components/Section";

const certificates = [
  {
    image: "/gallery/codeadept-runner-up.png",
    title: "CodeAdept 8.0",
    distinction: "Runner-Up",
    description: "The Ultimate Coding Showdown · UIT, RGPV, Bhopal",
    date: "19 November 2024",
    alt: "Certificate of achievement awarded to Nishant Chourasia as Runner-Up in CodeAdept 8.0 at UIT RGPV, Bhopal.",
  },
  {
    image: "/gallery/adobe-hackathon-participation.png",
    title: "Adobe University Hackathon",
    distinction: "Participation",
    description: "Adobe · Indian Institute of Technology, Jodhpur",
    date: "9 August 2026",
    alt: "Adobe University Hackathon certificate of participation for Nishant Chourasia from IIT Jodhpur, dated 9 August 2026.",
  },
];

export function Gallery() {
  return (
    <Section id="gallery" index="05" eyebrow="Gallery" title="Milestones, documented"
      lede="A personal portrait and certificates from coding competitions and university hackathons.">
      <div className="certificate-gallery">
        {certificates.map((certificate) => (
          <a className="certificate-card" key={certificate.image} href={certificate.image}
            target="_blank" rel="noopener noreferrer"
            aria-label={`View ${certificate.title} ${certificate.distinction} certificate (opens in a new tab)`}>
            <div className="certificate-card__image">
              <img src={certificate.image} alt={certificate.alt} loading="lazy" decoding="async" />
            </div>
            <div className="certificate-card__body">
              <p className="certificate-card__meta"><span>{certificate.distinction}</span><span>{certificate.date}</span></p>
              <h3>{certificate.title}</h3>
              <p>{certificate.description}</p>
              <span className="certificate-card__action">View certificate <span aria-hidden="true">↗</span></span>
            </div>
          </a>
        ))}
        <a className="certificate-card certificate-card--portrait" href="/gallery/nishant-chourasia.jpg"
          target="_blank" rel="noopener noreferrer"
          aria-label="View Nishant Chourasia's portrait (opens in a new tab)">
          <div className="certificate-card__image certificate-card__image--portrait">
            <img src="/gallery/nishant-chourasia.jpg" alt="Portrait of Nishant Chourasia"
              loading="lazy" decoding="async" />
          </div>
          <div className="certificate-card__body">
            <p className="certificate-card__meta"><span>Portrait</span></p>
            <h3>Nishant Chourasia</h3>
            <span className="certificate-card__action">View photo <span aria-hidden="true">↗</span></span>
          </div>
        </a>
      </div>
    </Section>
  );
}
