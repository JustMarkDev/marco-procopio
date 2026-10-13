import type { Metadata } from "next";

import { CopyEmail } from "@/components/redesign/copy-email";
import { LinkTiles } from "@/components/redesign/link-tiles";
import { PageTransition } from "@/components/redesign/page-transition";
import { Rise, Words } from "@/components/redesign/reveal";
import { asLang, copy, credits } from "@/lib/redesign/copy";

export const metadata: Metadata = { title: "About" };

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = copy[lang].about;

  return (
    <PageTransition>
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
            <LinkTiles cv={t.cv} />
            <Rise delay={0.6}>
              <p className="mt-8 text-xs leading-relaxed text-white/45">
                {t.credits}:{" "}
                {credits.map((c, i) => (
                  <span key={c.href}>
                    {i > 0 && " · "}
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-white/20 underline-offset-2 transition-colors duration-150 hover:text-dz-text"
                    >
                      {c.what}
                    </a>{" "}
                    ({c.who}, {c.license})
                  </span>
                ))}
              </p>
            </Rise>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
