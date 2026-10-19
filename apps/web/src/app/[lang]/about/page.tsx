import type { Metadata } from "next";

import { preloadArt } from "@/components/art-image";
import { CopyEmail } from "@/components/copy-email";
import { LinkTiles } from "@/components/link-tiles";
import { Rise, Words } from "@/components/reveal";
import { cvs } from "@/lib/content";
import { asLang, copy } from "@/lib/copy";

export const metadata: Metadata = { title: "About" };

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  preloadArt("about");
  const lang = asLang((await params).lang);
  const t = copy[lang].about;

  return (
    <main className="flex flex-col gap-14 pt-14 pb-[42vh] md:flex-row md:justify-between md:gap-12 md:pt-[53px] md:pb-[40vh]">
      <section className="max-w-[560px]">
        <h1 className="font-display text-[clamp(3.5rem,6.7vw,6rem)] leading-[0.9] font-semibold tracking-[-0.042em]">
          <Words text={t.title} />
        </h1>
        <Rise delay={0.15}>
          <p className="mt-6 max-w-[520px] text-lg leading-[1.55]">{t.bio}</p>
        </Rise>
        <Rise delay={0.25}>
          <p className="mt-6 max-w-[520px] text-lg leading-[1.55] text-dz-text-2">{t.bio2}</p>
        </Rise>
      </section>
      <section className="flex w-full flex-col gap-[60px] md:w-[540px] md:shrink-0">
        <Rise delay={0.2}>
          <h2 className="text-sm text-dz-text-3">{t.email}</h2>
          <div className="mt-3">
            <CopyEmail copy={t.copy} copied={t.copied} />
          </div>
        </Rise>
        <div>
          <Rise delay={0.3}>
            <h2 className="text-sm text-dz-text-3">{t.elsewhere}</h2>
          </Rise>
          <LinkTiles cv={t.cv} cvHref={cvs[lang]} />
        </div>
      </section>
    </main>
  );
}
