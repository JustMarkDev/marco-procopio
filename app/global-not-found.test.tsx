/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GlobalNotFound from "./global-not-found";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GlobalNotFound", () => {
  it("helps visitors return to the portfolio from an unknown route", () => {
    render(<GlobalNotFound />);

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeTruthy();
    expect(screen.getByText("Page not found.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to portfolio" }).getAttribute("href")).toBe(
      "/en",
    );
  });
});
