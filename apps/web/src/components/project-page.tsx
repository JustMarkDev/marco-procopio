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
    <main className="mx-auto max-w-2xl px-5 pt-32 pb-16 md:pt-40">
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
        <h1 className="mt-6 text-4xl font-semibold tracking-tighter md:text-5xl">{project.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{project.kind[lang]}</p>
      </Reveal>

      <Reveal onLoad delay={0.1} className="mt-10 md:-mx-6">
        <figure>
          <div className="panel rounded-3xl p-2">
            <Image
              src={project.image.src}
              alt={project.image.alt[lang]}
              width={project.image.width}
              height={project.image.height}
              priority
              sizes="(min-width: 768px) 664px, 100vw"
              className="w-full rounded-2xl"
            />
          </div>
          {project.image.note && (
            <figcaption className="mt-3 px-6 text-xs text-muted-foreground md:px-6">
              {project.image.note[lang]}
            </figcaption>
          )}
        </figure>
      </Reveal>

      <Reveal className="mt-10">
        <p className="text-lg leading-relaxed">{project.overview[lang]}</p>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {project.stats.map((s) => (
            <div key={s.value} className="flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">{s.label[lang]}</dt>
              <dd className="font-mono text-3xl tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal className="mt-12">
        <h2 className="mb-6 text-sm font-medium text-muted-foreground">{t.whatIBuilt}</h2>
        <ul className="grid gap-4 leading-relaxed">
          {project.highlights[lang].map((h) => (
            <li
              key={h}
              className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:rounded-full before:bg-[var(--ring)]"
            >
              {h}
            </li>
          ))}
        </ul>
        <p className="mt-8 font-mono text-xs text-muted-foreground">{project.stack.join(" / ")}</p>
      </Reveal>

      {(project.repo || project.site) && (
        <Reveal className="mt-8 flex flex-wrap gap-3">
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
        </Reveal>
      )}

      <Reveal className="mt-16 md:-mx-6">
        <Link
          href={workPath(lang, next.slug) as Route}
          className="panel group flex items-center justify-between rounded-3xl px-6 py-5 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
        >
          <span>
            <span className="block text-sm text-muted-foreground">{t.next}</span>
            <span className="block text-lg font-semibold tracking-tight">{next.name}</span>
          </span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={20}
            strokeWidth={1.8}
            className="transition-transform duration-fast group-hover:translate-x-1"
          />
        </Link>
      </Reveal>
    </main>
  );
}
