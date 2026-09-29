import { SiteShell, siteMetadata } from "@/components/site-shell";

export const metadata = siteMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
