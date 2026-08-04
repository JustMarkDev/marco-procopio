import Link from "next/link";

const eyebrowClass =
  "mb-[clamp(20px,4vw,42px)] text-[clamp(10px,1.5vw,13px)] tracking-[0.24em] text-[var(--muted)]";
const messageClass = "mt-[clamp(44px,8vw,76px)] text-[clamp(15px,2vw,19px)] text-[var(--muted)]";
const linkClass =
  "not-found-link mt-6 min-h-11 items-center justify-center border border-[var(--border-strong)] bg-[var(--surface)] px-[22px] text-[var(--foreground)]";

export function NotFoundPage() {
  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-background px-4 py-6 sm:p-16">
      <div className="not-found-backdrop" aria-hidden="true" />
      <section
        className="flex w-full max-w-[960px] flex-col items-center text-center"
        aria-labelledby="not-found-title"
      >
        <p className={`not-found-copy-en ${eyebrowClass}`}>LOST IN THE GRID</p>
        <p lang="it" className={`not-found-copy-it ${eyebrowClass}`}>
          FUORI PERCORSO
        </p>
        <h1 id="not-found-title" className="not-found-code">
          404
        </h1>
        <p className={`not-found-copy-en ${messageClass}`}>Page not found.</p>
        <p lang="it" className={`not-found-copy-it ${messageClass}`}>
          Pagina non trovata.
        </p>
        <Link className={`not-found-copy-en inline-flex ${linkClass}`} href="/en">
          Back to portfolio
        </Link>
        <Link lang="it" className={`not-found-copy-it ${linkClass}`} href="/it">
          Torna al portfolio
        </Link>
      </section>
    </main>
  );
}
