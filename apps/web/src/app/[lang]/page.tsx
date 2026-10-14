import { Rise, Words } from "@/components/reveal";
import { TrackLine } from "@/components/track-line";
import { getNowPlaying } from "@/lib/lastfm";
import { asLang, copy } from "@/lib/copy";

// The track is refreshed client-side; this only bounds how stale the first paint is.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = copy[lang];
  const track = await getNowPlaying();

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col justify-end pt-16 md:justify-center md:pt-0">
        <h1 className="font-display text-[clamp(4.5rem,12vw,10.75rem)] leading-[0.82] font-semibold tracking-[-0.047em]">
          <span className="block">
            <Words text="Marco" />
          </span>
          <span className="block">
            <Words text="Procopio" delay={0.1} />
          </span>
        </h1>
        <Rise delay={0.3}>
          <p className="mt-8 max-w-[520px] text-xl leading-[1.4] md:text-2xl">{t.index.line}</p>
        </Rise>
      </main>
      <TrackLine initial={track} more={t.index.more} />
    </div>
  );
}
