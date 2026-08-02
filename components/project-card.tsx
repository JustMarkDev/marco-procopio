import { ArrowUpRight01Icon, GithubIcon, Image01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";

type ProjectCardProps = {
  title: string;
  eyebrow: string;
  tags: readonly string[];
  href: string;
  footer: string;
  preview: "placeholder" | "github";
  description: string;
  action: string;
  previewLabel: string;
  technologiesLabel: string;
};

export function ProjectCard({
  title,
  eyebrow,
  tags,
  href,
  footer,
  preview,
  description,
  action,
  previewLabel,
  technologiesLabel,
}: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className={`project-preview ${preview === "github" ? "github-preview" : ""}`}>
        {preview === "github" ? (
          <>
            <Icon icon={GithubIcon} size={52} />
            <span>@JustMarkDev</span>
          </>
        ) : (
          <>
            <Icon icon={Image01Icon} size={28} />
            <span>{previewLabel}</span>
          </>
        )}
      </div>
      <div className="project-title-row">
        <h3>{title}</h3>
        <span>{eyebrow}</span>
      </div>
      <p>{description}</p>
      <ul className="tag-list" aria-label={technologiesLabel}>
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <div className="project-footer">
        <a href={href} target="_blank" rel="noreferrer">
          {action}
          <Icon icon={ArrowUpRight01Icon} size={13} />
        </a>
        <span>{footer}</span>
      </div>
    </article>
  );
}
