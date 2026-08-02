import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/site";

export default async function LanguageRedirect() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("portfolio-locale")?.value;

  if (savedLocale && isLocale(savedLocale)) redirect(`/${savedLocale}`);

  const country = (await headers()).get("x-vercel-ip-country");
  redirect(country === "IT" ? "/it" : "/en");
}
