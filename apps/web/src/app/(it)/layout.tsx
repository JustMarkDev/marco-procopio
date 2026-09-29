import { SiteShell, siteMetadata } from "@/components/site-shell";

export const metadata = siteMetadata("it");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="it">{children}</SiteShell>;
}
