import {
  ArrowUpRight01Icon,
  Attachment01Icon,
  GithubIcon,
  Linkedin01Icon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { PageViewCounter } from "@/components/page-view-counter";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { TechGrid } from "@/components/tech-grid";
import { dictionary, getProjects } from "@/content/portfolio";
import { emailUrl, isLocale, profileUrl, sourceUrl } from "@/lib/site";

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = dictionary[locale];
  const projects = getProjects(locale);

  return (
    <>
      <a className="skip-link" href="#content">
        {locale === "it" ? "Vai al contenuto" : "Skip to content"}
      </a>
      <SiteHeader locale={locale} />
      <main id="content" className="page-shell">
        <Reveal className="profile" id="intro">
          <div className="avatar-frame">
            <Image
              src="/images/marco-avatar.png"
              alt={
                locale === "it"
                  ? "Illustrazione di Marco Procopio"
                  : "Illustration of Marco Procopio"
              }
              width={118}
              height={118}
              priority
            />
          </div>
          <div className="profile-copy">
            <PageViewCounter locale={locale} label={t.profile.viewsLabel} />
            <h1>Marco Procopio</h1>
            <p>{t.profile.ageRole}</p>
            <span className="status">
              <i aria-hidden="true" />
              {t.profile.status}
            </span>
          </div>
        </Reveal>

        <Reveal className="content-section about-section">
          <h2>{t.about.title}</h2>
          <div className="about-copy">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-section contacts-section" id="contacts">
          <h2>{t.contacts}</h2>
          <div className="contact-list">
            <a href={profileUrl} target="_blank" rel="noreferrer">
              <Icon icon={GithubIcon} size={16} />
              {t.links.github}
            </a>
            <span
              className="contact-placeholder"
              role="link"
              aria-disabled="true"
              title={t.links.comingSoon}
            >
              <Icon icon={NewTwitterIcon} size={16} />
              {t.links.twitter}
            </span>
            <span
              className="contact-placeholder"
              role="link"
              aria-disabled="true"
              title={t.links.comingSoon}
            >
              <Icon icon={Linkedin01Icon} size={16} />
              {t.links.linkedin}
            </span>
            <a href={emailUrl}>
              <Icon icon={Mail01Icon} size={16} />
              {t.links.email}
            </a>
            <span
              className="contact-placeholder"
              role="link"
              aria-disabled="true"
              title={t.links.comingSoon}
            >
              <Icon icon={Attachment01Icon} size={16} />
              {t.links.cv}
            </span>
          </div>
        </Reveal>

        <Reveal className="content-section projects-section" id="projects">
          <h2>{t.projects}</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                previewLabel={t.preview}
                technologiesLabel={t.nav.technologies}
              />
            ))}
          </div>
        </Reveal>

        <Reveal className="content-section technology-section" id="technologies">
          <h2>{t.stack}</h2>
          <TechGrid />
        </Reveal>
      </main>

      <footer className="site-footer">
        <div>
          <span>© 2026 Marco Procopio</span>
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            {t.footer.source}
            <Icon icon={ArrowUpRight01Icon} size={12} />
          </a>
        </div>
        <details id="privacy">
          <summary>{t.footer.privacy}</summary>
          <p>{t.footer.privacyCopy}</p>
        </details>
        <span>{t.footer.made}</span>
      </footer>
    </>
  );
}
