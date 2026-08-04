/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import LocaleNotFound from "./not-found";

afterEach(cleanup);

describe("LocaleNotFound", () => {
  it("offers Italian visitors a localized route back to the portfolio", () => {
    render(<LocaleNotFound />);

    expect(screen.getByText("Pagina non trovata.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Torna al portfolio" }).getAttribute("href")).toBe(
      "/it",
    );
  });
});
