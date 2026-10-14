import type { Metadata } from "next";

import { Rise, Words } from "@/components/reveal";
import { WorkList, type Row } from "@/components/work-list";
import { projects } from "@/lib/content";
import { asLang, copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Work" };

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const t = copy[asLang((await params).lang)].work;
  const rows: Row[] = [
    { name: "Database Contatti", ...t.rows.db, ...projects.databaseContatti },
    { name: "Music Companion", ...t.rows.music, ...projects.musicCompanion },
    { name: "sergioprocopio.it", ...t.rows.sergio, ...projects.sergioProcopio },
    { name: "Satisfactory Optimizer", ...t.rows.satisfactory, ...projects.satisfactory },
    { name: "T3 Code & Raycast", ...t.rows.oss, ...projects.oss },
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
