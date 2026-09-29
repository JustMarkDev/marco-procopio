import { ProjectPage, projectMetadata, projectParams } from "@/components/project-page";

export const dynamicParams = false;
export const generateStaticParams = projectParams;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return projectMetadata("en", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <ProjectPage lang="en" slug={(await params).slug} />;
}
