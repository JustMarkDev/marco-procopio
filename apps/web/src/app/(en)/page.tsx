import { HomePage } from "@/components/home-page";

// Refresh GitHub activity once a day.
export const revalidate = 86400;

export default function Page() {
  return <HomePage lang="en" />;
}
