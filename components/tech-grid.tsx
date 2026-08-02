import { AiMagicIcon, CodeIcon, DatabaseIcon, FigmaIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";

const technologies = [
  { label: "TypeScript", mark: "TS", className: "typescript" },
  { label: "React", mark: "⚛", className: "react" },
  { label: "Vercel", mark: "▲", className: "vercel" },
  { label: "Tailwind CSS", mark: "TW", className: "tailwind" },
  { label: "SQLite", icon: DatabaseIcon, className: "sqlite" },
  { label: "Vite+", mark: "V+", className: "vite" },
  { label: "Codex", icon: CodeIcon, className: "codex" },
  { label: "Figma", icon: FigmaIcon, className: "figma" },
  { label: "Claude", icon: AiMagicIcon, className: "claude" },
] as const;

export function TechGrid() {
  return (
    <ul className="tech-grid">
      {technologies.map((technology) => (
        <li key={technology.label}>
          <span className={`tech-mark ${technology.className}`} aria-hidden="true">
            {"icon" in technology && technology.icon ? (
              <Icon icon={technology.icon} size={31} />
            ) : "mark" in technology ? (
              technology.mark
            ) : null}
          </span>
          <span>{technology.label}</span>
        </li>
      ))}
    </ul>
  );
}
