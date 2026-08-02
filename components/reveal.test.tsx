import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal } from "./reveal";

describe("Reveal", () => {
  it("keeps server-rendered content visible before hydration", () => {
    const html = renderToStaticMarkup(
      <Reveal className="profile">
        <h1>Marco Procopio</h1>
      </Reveal>,
    );

    expect(html).toContain("Marco Procopio");
    expect(html).not.toContain("opacity:0");
  });
});
