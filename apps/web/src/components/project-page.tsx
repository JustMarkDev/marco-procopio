import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Github01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GlassButton, Reveal } from "@/components/motion";
import { home, links, projects, ui, workPath, type Lang } from "@/lib/content";

export const projectParams = () => projects.map((p) => ({ slug: p.slug }));

export function projectMetadata(lang: Lang, slug: string): Metadata {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary[lang],
    alternates: {
      canonical: workPath(lang, slug),
      languages: { en: workPath("en", slug), it: workPath("it", slug) },
    },
  };
}

export function ProjectPage({ lang, slug }: { lang: Lang; slug: string }) {
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const next = projects[(index + 1) % projects.length]!;
  const t = ui[lang];

  return (
    <main className="mx-auto max-w-[60rem] px-5 pt-28 pb-16 md:pt-40">
      <Reveal onLoad>
        <Link
          href={`${home(lang)}#work` as Route}
          className="group -ml-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-fast hover:bg-foreground/5 hover:text-foreground"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={16}
            strokeWidth={1.8}
            className="transition-transform duration-fast group-hover:-translate-x-0.5"
          />
          {t.allWork}
        </Link>
        <h1 className="mt-6 text-5xl font-semibold tracking-tighter md:text-7xl">{project.name}</h1>
        <p className="mt-3 text-xl text-muted-foreground md:text-2xl">{project.kind[lang]}</p>
      </Reveal>

      <Reveal onLoad delay={0.1} className="mt-12 md:-mx-6">
        <figure>
          <div className="panel rounded-3xl p-2">
            <Image
              src={project.image.src}
              alt={project.image.alt[lang]}
              width={project.image.width}
              height={project.image.height}
              priority
              sizes="(min-width: 768px) 968px, 100vw"
              className="w-full rounded-2xl"
            />
          </div>
          {project.image.note && (
            <figcaption className="mt-3 px-6 text-xs text-muted-foreground">
              {project.image.note[lang]}
            </figcaption>
          )}
        </figure>
      </Reveal>

      <div className="mt-16 grid gap-12 md:grid-cols-[1fr_14rem] md:gap-16">
        <div>
          <Reveal>
            <p className="max-w-[65ch] text-xl leading-relaxed">{project.overview[lang]}</p>
          </Reveal>
          <Reveal className="mt-14">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.whatIBuilt}</h2>
            <ul className="grid max-w-[65ch] gap-4 leading-relaxed">
              {project.highlights[lang].map((h) => (
                <li
                  key={h}
                  className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:rounded-full before:bg-ring"
                >
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="md:sticky md:top-28 md:self-start">
          <aside className="grid gap-8">
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-1">
              {project.stats.map((s) => (
                <div key={s.value} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-muted-foreground">{s.label[lang]}</dt>
                  <dd className="font-mono text-4xl tracking-tight text-ring">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="font-mono text-xs text-muted-foreground">{project.stack.join(" / ")}</p>
            {(project.repo || project.site) && (
              <div className="flex flex-wrap gap-3">
                {project.site && (
                  <GlassButton href={project.site} icon={Globe02Icon} primary>
                    {t.website}
                  </GlassButton>
                )}
                {project.repo && (
                  <GlassButton
                    href={`${links.github}/${project.repo}`}
                    icon={Github01Icon}
                    primary={!project.site}
                  >
                    GitHub
                  </GlassButton>
                )}
              </div>
            )}
          </aside>
        </Reveal>
      </div>

      <Reveal className="mt-24 md:-mx-6">
        <Link
          href={workPath(lang, next.slug) as Route}
          className="panel group flex items-center justify-between gap-6 rounded-3xl p-2 pr-6 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
        >
          <span className="flex items-center gap-5">
            <Image
              src={next.image.src}
              alt=""
              width={next.image.width}
              height={next.image.height}
              sizes="160px"
              className="aspect-[16/10] w-28 rounded-2xl object-cover sm:w-40"
            />
            <span>
              <span className="block text-sm text-muted-foreground">{t.next}</span>
              <span className="block text-xl font-semibold tracking-tight">{next.name}</span>
            </span>
          </span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            strokeWidth={1.8}
            className="shrink-0 transition-transform duration-fast group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </main>
  );
}
