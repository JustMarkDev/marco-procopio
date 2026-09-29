import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Download04Icon,
  Github01Icon,
  GitPullRequestIcon,
  Globe02Icon,
  Linkedin02Icon,
  LockIcon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { CopyButton, GlassButton, Reveal } from "@/components/motion";
import {
  SITE_URL,
  contributions,
  links,
  projects,
  ui,
  workPath,
  type Dict,
  type Lang,
  type Project,
} from "@/lib/content";
import { getRepoActivity } from "@/lib/github";

export async function HomePage({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const activity = await getRepoActivity();
  const monthYear = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric" });

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Marco Procopio",
    jobTitle: t.role,
    url: SITE_URL,
    image: `${SITE_URL}/portrait.webp`,
    email: `mailto:${links.emailAddress}`,
    address: { "@type": "PostalAddress", addressLocality: "Milan", addressCountry: "IT" },
    alumniOf: "University of Milan-Bicocca",
    sameAs: [links.github, links.linkedin, links.x],
  };

  return (
    <main id="top" className="mx-auto max-w-2xl px-5 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />

      <section className="pt-32 pb-16 md:pt-40">
        <div className="flex items-start justify-between gap-6">
          <Reveal onLoad>
            <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">{t.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{t.role}</p>
          </Reveal>
          <Reveal onLoad delay={0.05} className="shrink-0">
            <Image
              src="/portrait.webp"
              alt={t.portraitAlt}
              width={640}
              height={800}
              priority
              sizes="128px"
              className="h-24 w-20 rounded-2xl object-cover shadow-[0_10px_30px_-12px_rgb(24_24_27/0.35)] sm:h-40 sm:w-32"
            />
          </Reveal>
        </div>
        <Reveal onLoad delay={0.1}>
          <p className="mt-8 text-lg leading-relaxed">{t.bio}</p>
          <p className="mt-4 text-sm text-muted-foreground">{t.now}</p>
        </Reveal>
        <Reveal onLoad delay={0.2} className="mt-8 flex flex-wrap gap-3">
          <GlassButton href={links.email} icon={Mail01Icon} primary>
            {t.emailMe}
          </GlassButton>
          <GlassButton href={links.github} icon={Github01Icon}>
            GitHub
          </GlassButton>
          <GlassButton href={links.cv} icon={Download04Icon} download>
            {t.cv}
          </GlassButton>
        </Reveal>
      </section>

      <Section id="work" title={t.work}>
        <div className="grid gap-4">
          {projects.map((project) => (
            <Reveal key={project.slug} className="md:-mx-6">
              <ProjectCard
                project={project}
                lang={lang}
                t={t}
                updated={
                  project.repo && activity.has(project.repo)
                    ? monthYear.format(activity.get(project.repo))
                    : undefined
                }
              />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title={t.openSource}>
        <Reveal>
          <p className="-mt-2 mb-6 text-muted-foreground">{t.openSourceIntro}</p>
          <ul className="-mx-4 grid gap-1">
            {contributions.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors duration-fast hover:bg-foreground/5 active:bg-foreground/10"
                >
                  <HugeiconsIcon
                    icon={GitPullRequestIcon}
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{c.title}</span>
                    <span className="block text-sm text-muted-foreground">{c.project}</span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 text-muted-foreground transition-transform duration-fast ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section id="about" title={t.about}>
        <Reveal className="space-y-4 leading-relaxed text-muted-foreground">
          {t.aboutText.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="mt-10 grid gap-5">
            {t.timeline.map((item) => (
              <div key={item.role} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-4">
                <dt>
                  <span className="font-medium">{item.role}</span>
                  <span className="block text-sm text-muted-foreground">{item.place}</span>
                </dt>
                <dd className="font-mono text-sm text-muted-foreground">{item.period}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      <Section id="contact" title={t.contact}>
        <Reveal>
          <p className="leading-relaxed text-muted-foreground">{t.contactText}</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
          <GlassButton href={links.email} icon={Mail01Icon} primary>
            {t.emailMe}
          </GlassButton>
          <GlassButton href={links.linkedin} icon={Linkedin02Icon}>
            LinkedIn
          </GlassButton>
          <GlassButton href={links.x} icon={NewTwitterIcon} label="X" />
          <CopyButton value={links.emailAddress} label={t.copyEmail} copiedLabel={t.copied} />
        </Reveal>
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-12 md:py-16">
      <Reveal>
        <h2 className="mb-6 text-sm font-medium text-muted-foreground">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}

function ProjectCard({
  project,
  lang,
  t,
  updated,
}: {
  project: Project;
  lang: Lang;
  t: Dict;
  updated?: string;
}) {
  const href = workPath(lang, project.slug) as Route;
  return (
    <article className="panel group rounded-3xl p-2 transition-transform duration-500 ease-out-expo hover:-translate-y-1">
      {/* Inner radius = card radius (24px) minus padding (8px). */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className="block aspect-[16/10] overflow-hidden rounded-2xl bg-foreground/5"
      >
        <Image
          src={project.image.src}
          alt=""
          width={project.image.width}
          height={project.image.height}
          sizes="(min-width: 768px) 664px, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />
      </Link>
      <div className="px-4 pt-5 pb-4">
        <h3 className="text-lg font-semibold tracking-tight">
          <Link href={href} className="hover:underline hover:underline-offset-4">
            {project.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{project.kind[lang]}</p>
        <p className="mt-4 leading-relaxed">{project.summary[lang]}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          {project.stats.map((s) => (
            <div key={s.value} className="flex flex-col-reverse">
              <dt className="text-xs text-muted-foreground">{s.label[lang]}</dt>
              <dd className="font-mono text-xl tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs text-muted-foreground">
          <span className="font-mono">{project.stack.join(" / ")}</span>
          {updated && (
            <span className="block sm:inline sm:before:content-['_·_']">
              {t.updated} {updated}
            </span>
          )}
        </p>

        <div className="mt-3 -mx-3 flex flex-wrap items-center gap-1 text-sm">
          <CardLink href={href} icon={ArrowRight01Icon} label={t.caseStudy} />
          <span className="mr-auto" />
          {project.site && <CardLink href={project.site} icon={Globe02Icon} label={t.website} />}
          {project.repo ? (
            <CardLink href={`${links.github}/${project.repo}`} icon={Github01Icon} label="GitHub" />
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground">
              <HugeiconsIcon icon={LockIcon} size={16} strokeWidth={1.8} />
              {t.private}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CardLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: typeof Github01Icon;
  label: string;
}) {
  const external = href.startsWith("http");
  const className =
    "group/link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors duration-fast hover:bg-foreground/5 active:bg-foreground/10";
  const glyph = (
    <HugeiconsIcon
      icon={icon}
      size={16}
      strokeWidth={1.8}
      className="transition-transform duration-fast group-hover/link:translate-x-0.5"
    />
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
      {label}
    </a>
  ) : (
    <Link href={href as Route} className={className}>
      {label}
      {glyph}
    </Link>
  );
}
