"use client";

import { Menu } from "@base-ui/react/menu";
import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { useEffect, useState, type MouseEvent } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { dictionary } from "@/content/portfolio";
import type { Locale } from "@/lib/site";

const themes = [
  { value: "system", icon: ComputerIcon },
  { value: "light", icon: Sun03Icon },
  { value: "dark", icon: Moon02Icon },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = dictionary[locale];
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const otherLocale = locale === "it" ? "en" : "it";

  useEffect(() => setMounted(true), []);

  const switchLocale = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.cookie = `portfolio-locale=${otherLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.assign(`/${otherLocale}${window.location.hash}`);
  };

  const selectedTheme = themes.find(({ value }) => value === theme) ?? themes[0];
  const SelectedThemeIcon = mounted ? selectedTheme.icon : ComputerIcon;

  return (
    <header className="site-header">
      <nav
        className="pixel-nav"
        aria-label={locale === "it" ? "Navigazione principale" : "Main navigation"}
      >
        <a className="monogram" href="#intro" aria-label="Marco Procopio">
          MP
        </a>
        <div className="nav-links">
          <a href="#intro">{t.nav.intro}</a>
          <a href="#projects">{t.nav.projects}</a>
          <a href="#technologies">{t.nav.technologies}</a>
        </div>
        <div className="nav-actions">
          <a
            className="language-switch"
            href={`/${otherLocale}`}
            onClick={switchLocale}
            hrefLang={otherLocale}
            aria-label={t.language}
          >
            {otherLocale.toUpperCase()}
          </a>
          <Menu.Root>
            <Menu.Trigger render={<Button aria-label={t.theme.label} />} className="theme-trigger">
              <Icon icon={SelectedThemeIcon} size={17} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={8} align="end" className="menu-positioner">
                <Menu.Popup className="theme-menu">
                  <Menu.RadioGroup value={theme ?? "system"} onValueChange={setTheme}>
                    {themes.map((item) => (
                      <Menu.RadioItem
                        key={item.value}
                        value={item.value}
                        closeOnClick
                        className="theme-menu-item"
                      >
                        <Icon icon={item.icon} size={16} />
                        {t.theme[item.value]}
                        <span className="theme-check" aria-hidden="true" />
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioGroup>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </nav>
    </header>
  );
}
