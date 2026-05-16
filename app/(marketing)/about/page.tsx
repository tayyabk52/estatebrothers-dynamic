import Image from "next/image";
import { AboutVideoShowcase } from "@/components/ui/AboutVideoShowcase";
import {
  aboutStats,
  branchNotes,
  credibilityPosts,
  officeLocations,
  operatingPoints,
  servicePillars,
  teamMembers,
} from "@/data/about";
import { buildMetadata } from "@/lib/seo/metadata";
import "@/styles/about.css";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn about Estate Brothers — 10+ years of trusted real estate services in DHA Lahore. Meet our team, offices, and values.",
  canonicalPath: "/about",
});

function AboutHero() {
  return (
    <section className="about-hero">
      <div className="wrap">
        <div className="about-hero-copy reveal">
          <div className="eyebrow">About Estate Brothers</div>
          <h1>
            A reliable real estate team built around{" "}
            <span className="serif-i">trust, market knowledge, and results.</span>
          </h1>
          <p>
            For over a decade, Estate Brothers has supported clients with property services,
            investment guidance, and transparent real estate decisions from its DHA Phase 6 Lahore
            office and wider branch network.
          </p>
        </div>

        <div className="about-hero-media reveal">
          <Image
            src="/images/team/ceo-tajamal-hussain.jpg"
            alt="Tajamal Hussain at the Estate Brothers office"
            width={600}
            height={700}
            priority
          />
          <div className="about-media-caption">
            <span className="mono">Chief Executive Officer</span>
            <strong>Tajamal Hussain</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutProof() {
  return (
    <section className="about-proof" aria-label="Estate Brothers operating highlights">
      <div className="wrap">
        {aboutStats.map((stat) => (
          <div className="proof-cell reveal" key={stat.label}>
            <span className="value">{stat.value}</span>
            <span className="label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OfficeLocations() {
  return (
    <section className="about-section about-offices" aria-labelledby="about-offices-title">
      <div className="wrap">
        <header className="about-section-head reveal">
          <div className="eyebrow">Office locations</div>
          <div>
            <h2 id="about-offices-title">
              Real offices, visible presence, and a team clients can visit.
            </h2>
            <p>
              Estate Brothers operates through DHA Lahore locations that support private meetings,
              client advisory, documentation, and site coordination.
            </p>
          </div>
        </header>

        <div className="office-grid">
          {officeLocations.map((office) => (
            <article className="office-card reveal" key={office.id}>
              <div className="office-photo">
                {office.image && (
                  <Image
                    src={office.image}
                    alt={`${office.name} - ${office.location}`}
                    width={600}
                    height={400}
                    loading="lazy"
                  />
                )}
                <span className="office-status">{office.status}</span>
              </div>
              <div className="office-copy">
                <h3>{office.name}</h3>
                <p>{office.detail}</p>
                <span className="mono">{office.location}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCarousel() {
  return (
    <section className="about-section about-team" aria-labelledby="about-team-title">
      <div className="wrap">
        <header className="about-section-head reveal">
          <div className="eyebrow">Our team</div>
          <div>
            <h2 id="about-team-title">
              The people clients speak with, meet, and trust through the process.
            </h2>
            <p>
              A working team across leadership, branch management, sales direction, and client
              advisory.
            </p>
          </div>
        </header>
      </div>

      <div className="about-carousel" aria-label="Estate Brothers team members">
        {teamMembers.map((member) => (
          <article className="team-card reveal" key={member.id}>
            <div className="team-avatar">
              {member.image ? (
                <Image src={member.image} alt={member.name} width={80} height={80} loading="lazy" />
              ) : (
                <span>{member.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2)}</span>
              )}
            </div>
            <div className="team-copy">
              <span className="role">{member.role}</span>
              <h3>{member.name}</h3>
              <a href={`tel:${member.phone.replace(/\s/g, "")}`}>{member.phone}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CredibilityPosts() {
  return (
    <section className="about-section about-posts" aria-labelledby="about-posts-title">
      <div className="wrap">
        <header className="about-section-head reveal">
          <div className="eyebrow">MOU & recognition</div>
          <div>
            <h2 id="about-posts-title">
              Posts that document partnerships, milestones, and field credibility.
            </h2>
            <p>
              This section is prepared as an editable media feed for MOU images, event posts,
              success stories, and future company updates.
            </p>
          </div>
        </header>
      </div>

      <div className="about-carousel posts-carousel" aria-label="Estate Brothers credibility posts">
        {credibilityPosts.map((post) => (
          <article className="post-card reveal" key={post.id}>
            <div className="post-image">
              {post.image && (
                <Image src={post.image} alt={post.title} width={400} height={300} loading="lazy" />
              )}
              <span>{post.category}</span>
            </div>
            <div className="post-copy">
              <div className="mono">{post.date}</div>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicePillars() {
  return (
    <section className="about-section about-services" aria-labelledby="about-services-title">
      <div className="wrap">
        <header className="about-section-head reveal">
          <div className="eyebrow">Core services</div>
          <div>
            <h2 id="about-services-title">
              Focused support for every property decision.
            </h2>
            <p>
              From property services to investment guidance, the team keeps the process clear,
              documented, and aligned with each client&apos;s goal.
            </p>
          </div>
        </header>

        <div className="pillar-grid">
          {servicePillars.map((pillar, index) => (
            <article className="pillar reveal" key={pillar.title}>
              <span className="mono">0{index + 1}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatingModel() {
  return (
    <section className="about-operating" aria-labelledby="about-operating-title">
      <div className="wrap">
        <div className="operating-title reveal">
          <div className="eyebrow">Operating model</div>
          <h2 id="about-operating-title">
            Built for careful work, fast communication, and long-term client confidence.
          </h2>
        </div>

        <div className="operating-list">
          {operatingPoints.map((point, index) => (
            <div className="operating-row reveal" key={point}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BranchNetwork() {
  return (
    <section className="about-branches" aria-labelledby="about-branches-title">
      <div className="wrap">
        <div className="branch-panel reveal">
          <div>
            <div className="eyebrow">Branch network</div>
            <h2 id="about-branches-title">
              From a single vision to a growing real estate operation.
            </h2>
          </div>
          <div className="branch-list">
            {branchNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutProof />
      <OfficeLocations />
      <TeamCarousel />
      <CredibilityPosts />
      <ServicePillars />
      <AboutVideoShowcase />
      <OperatingModel />
      <BranchNetwork />
    </main>
  );
}
