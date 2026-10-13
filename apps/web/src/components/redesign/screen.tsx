import { Header, type Page } from "./header";

/** One full-viewport page: dither art behind, header on top, page content below. */
export function Screen({
  page,
  art,
  children,
}: {
  page: Page;
  art: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-dz-bg">
      <div className="absolute inset-0 -z-10">{art}</div>
      <div className="flex min-h-svh flex-col px-6 pt-8 md:px-[72px] md:pt-14">
        <Header current={page} />
        {children}
      </div>
    </div>
  );
}
