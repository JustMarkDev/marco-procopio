import type { Metadata } from "next";

import { Rise, Words } from "@/components/redesign/reveal";
import { WorkList, type Row } from "@/components/redesign/work-list";
import { links, projects } from "@/lib/content";
import { asLang, copy } from "@/lib/redesign/copy";

export const metadata: Metadata = { title: "Work" };

const project = (slug: string) => projects.find((p) => p.slug === slug)!;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = copy[lang].work;
  const preview = (slug: string) => {
    const { src, width, height } = project(slug).image;
    return { src, width, height };
  };

  // The meta column names where the arrow goes: the repo, the live site or merged PRs.
  // Private projects have nowhere to go, so they get no link.
  const rows: Row[] = [
    {
      name: "Database Contatti",
      ...t.rows.db,
      preview: preview("database-contatti"),
    },
    {
      name: "Music Companion",
      ...t.rows.music,
      href: `${links.github}/${project("music-companion").repo}`,
      preview: preview("music-companion"),
    },
    {
      name: "sergioprocopio.it",
      ...t.rows.sergio,
      href: project("sergio-procopio").site!,
      preview: preview("sergio-procopio"),
    },
    {
      name: "Satisfactory Optimizer",
      ...t.rows.satisfactory,
      href: `${links.github}/${project("satisfactory-start-optimizer").repo}`,
      preview: preview("satisfactory-start-optimizer"),
    },
    {
      name: "T3 Code & Raycast",
      ...t.rows.oss,
      href: "https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3AJustMarkDev",
    },
  ];

  return (
    <main className="flex flex-1 flex-col pt-[30vh] pb-16 md:pt-[124px] md:pb-20">
      <div className="max-w-[820px]">
        <h1 className="font-display text-[clamp(3.5rem,6.7vw,6rem)] leading-[0.9] font-semibold tracking-[-0.042em]">
          <Words text={t.title} />
        </h1>
        <Rise delay={0.12}>
          <p className="mt-3 text-lg text-dz-text-2">{t.lede}</p>
        </Rise>
        <WorkList rows={rows} />
      </div>
    </main>
  );
}
