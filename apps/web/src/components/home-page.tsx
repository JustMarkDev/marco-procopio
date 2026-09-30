import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Download04Icon,
  Github01Icon,
  GitPullRequestIcon,
  Globe02Icon,
  LockIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Favorites } from "@/components/favorites";
import { GlassButton, Reveal } from "@/components/motion";
import { NowPlaying } from "@/components/now-playing";
import {
  SITE_URL,
  contributions,
  links,
  profiles,
  projects,
  ui,
  workPath,
  type Dict,
  type Lang,
  type Project,
} from "@/lib/content";
import { ENV } from "@/env.server";
import { getFavorites, type Shelf } from "@/lib/favorites";
import { getPullStatuses, getRepoActivity } from "@/lib/github";

export async function HomePage({ lang }: { lang: Lang }) {
  const t = ui[lang];
  const [activity, pulls, favorites] = await Promise.all([
    getRepoActivity(),
    getPullStatuses(contributions.map((c) => c.href)),
    getFavorites(),
  ]);
  // Development only: show what each empty source still needs, instead of hiding it.
  const dev = ENV.NODE_ENV === "development";
  const hints: Partial<Record<Shelf | "music", string>> = dev
    ? {
        music: ENV.LASTFM_API_KEY ? undefined : "Add LASTFM_API_KEY to show what's playing.",
        films: ENV.TRAKT_CLIENT_ID
          ? "No rated films on Trakt yet."
          : "Add TRAKT_CLIENT_ID to load your top rated films.",
        series: ENV.TRAKT_CLIENT_ID
          ? "No rated series on Trakt yet."
          : "Add TRAKT_CLIENT_ID to load your top rated series.",
        anime: "Watch anime on AniList to fill this shelf.",
        manga: "Read manga on AniList to fill this shelf.",
        games: ENV.STEAM_API_KEY
          ? "No played games on Steam."
          : "Add STEAM_API_KEY to load your most played games.",
      }
    : {};
  const offClock =
    dev || profiles.lastfm || Object.values(favorites).some((list) => list.length > 0);
  const monthYear = new Intl.DateTimeFormat(lang, { month: "short", year: "numeric" });
  const compact = new Intl.NumberFormat(lang, { notation: "compact" });

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
    <main id="top" className="mx-auto max-w-[60rem] px-5 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />

      <section className="grid items-center gap-10 pt-28 pb-16 md:grid-cols-[1fr_auto] md:gap-16 md:pt-40 md:pb-8">
        <Reveal onLoad className="md:order-2">
          <Portrait alt={t.portraitAlt} />
        </Reveal>
        <div>
          <Reveal onLoad delay={0.05}>
            <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
              {/* Real state: open to work. */}
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-ring" />
              {t.now}
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tighter md:text-7xl">{t.title}</h1>
            <p className="mt-3 text-xl text-muted-foreground md:text-2xl">{t.role}</p>
          </Reveal>
          <Reveal onLoad delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed">{t.bio}</p>
          </Reveal>
          <Reveal onLoad delay={0.15} className="mt-10 flex flex-wrap gap-3">
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
        </div>
      </section>

      <Section id="work" title={t.work}>
        {/* Rhythm: wide, pair, wide reversed. Every third card spans the row. */}
        <div className="grid gap-6 md:-mx-6 md:grid-cols-2">
          {projects.map((project, i) => {
            const wide = i % 3 === 0;
            return (
              <Reveal key={project.slug} className={wide ? "md:col-span-2" : ""}>
                <ProjectCard
                  project={project}
                  lang={lang}
                  t={t}
                  layout={wide ? (i % 2 ? "wide-reverse" : "wide") : "tall"}
                  updated={
                    project.repo && activity.has(project.repo)
                      ? monthYear.format(activity.get(project.repo))
                      : undefined
                  }
                />
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section title={t.openSource} intro={t.openSourceIntro}>
        <Reveal>
          <ul className="-mx-4 grid gap-1">
            {contributions.map((c, i) => {
              const pr = pulls[i];
              const status =
                pr?.state === "merged" && pr.mergedAt
                  ? `${t.merged} ${monthYear.format(pr.mergedAt)}`
                  : pr?.state === "open"
                    ? t.open
                    : undefined;
              return (
                <li key={c.href}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors duration-fast hover:bg-foreground/5 active:bg-foreground/10"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/5 text-muted-foreground transition-colors duration-fast group-hover:text-ring">
                      <HugeiconsIcon icon={GitPullRequestIcon} size={18} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{c.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {c.project}
                        {status && ` · ${status}`}
                      </span>
                    </span>
                    {pr && (
                      <span className="hidden font-mono text-sm text-muted-foreground sm:block">
                        {compact.format(pr.stars)} {t.stars}
                      </span>
                    )}
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={18}
                      strokeWidth={1.8}
                      className="shrink-0 text-muted-foreground transition-transform duration-fast ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Section>

      <Section id="about" title={t.about}>
        <div className="grid gap-12 md:grid-cols-[3fr_2fr] md:gap-16">
          <Reveal className="max-w-[65ch] space-y-4 text-lg leading-relaxed text-muted-foreground">
            {t.aboutText.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="grid gap-6 border-l pl-6">
              {t.timeline.map((item) => (
                <div key={item.role} className="flex flex-col-reverse gap-1">
                  <dt>
                    <span className="font-medium">{item.role}</span>
                    <span className="block text-sm text-muted-foreground">{item.place}</span>
                  </dt>
                  <dd className="font-mono text-xs text-muted-foreground">{item.period}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      {offClock && (
        <Section id="off-the-clock" title={t.offClock} intro={t.offClockIntro}>
          <Reveal>
            <NowPlaying lang={lang} t={t} hint={hints.music} />
          </Reveal>
          <Reveal delay={0.1}>
            <Favorites data={favorites} label={t.offClock} labels={t.shelves} hints={hints} />
          </Reveal>
        </Section>
      )}
    </main>
  );
}

/** Dithered portrait (a 1-bit mask per theme, inked with the text colour); the photo shows on hover. */
function Portrait({ alt }: { alt: string }) {
  return (
    <div className="panel group relative aspect-[4/5] w-36 rounded-3xl p-1.5 md:w-72 md:p-2">
      <div className="relative h-full overflow-hidden rounded-[1.1rem] md:rounded-2xl">
        <div aria-hidden className="portrait-dots absolute inset-0" />
        <Image
          src="/portrait.webp"
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 288px, 144px"
          className="object-cover opacity-0 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
        />
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 md:py-24">
      <Reveal className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        {intro && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </Reveal>
      {children}
    </section>
  );
}

function ProjectCard({
  project,
  lang,
  t,
  layout,
  updated,
}: {
  project: Project;
  lang: Lang;
  t: Dict;
  layout: "wide" | "wide-reverse" | "tall";
  updated?: string;
}) {
  const href = workPath(lang, project.slug) as Route;
  const wide = layout !== "tall";
  return (
    <article
      className={`panel group flex h-full flex-col rounded-3xl p-2 transition-transform duration-500 ease-out-expo hover:-translate-y-1 ${
        wide ? "md:grid md:grid-cols-[3fr_2fr] md:items-center md:gap-2" : ""
      }`}
    >
      {/* Inner radius = card radius (24px) minus padding (8px). */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className={`block aspect-[16/10] overflow-hidden rounded-2xl bg-foreground/5 ${
          layout === "wide-reverse" ? "md:order-2" : ""
        }`}
      >
        <Image
          src={project.image.src}
          alt=""
          width={project.image.width}
          height={project.image.height}
          sizes={wide ? "(min-width: 768px) 560px, 100vw" : "(min-width: 768px) 460px, 100vw"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />
      </Link>
      <div className={`flex flex-1 flex-col px-4 pt-5 pb-4 ${wide ? "md:px-6 md:py-6" : ""}`}>
        <h3 className="text-xl font-semibold tracking-tight">
          <Link
            href={href}
            className="decoration-ring decoration-2 underline-offset-4 hover:underline"
          >
            {project.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{project.kind[lang]}</p>
        <p className="mt-4 leading-relaxed">{project.summary[lang]}</p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          {project.stats.map((s) => (
            <div key={s.value} className="flex flex-col-reverse">
              <dt className="text-xs text-muted-foreground">{s.label[lang]}</dt>
              <dd className="font-mono text-2xl tracking-tight text-ring">{s.value}</dd>
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

        <div className="mt-auto -mx-3 flex flex-wrap items-center gap-1 pt-3 text-sm">
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
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
      {label}
    </a>
  ) : (
    <Link href={href as Route} className={className}>
      {label}
      <HugeiconsIcon
        icon={icon}
        size={16}
        strokeWidth={1.8}
        className="transition-transform duration-fast group-hover/link:translate-x-0.5"
      />
    </Link>
  );
}
