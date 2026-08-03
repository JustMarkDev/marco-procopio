/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageViewCounter } from "./page-view-counter";

const fetchMock = vi.fn<typeof fetch>();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function renderCounter() {
  vi.stubGlobal("crypto", { randomUUID: () => "visit-1" });
  vi.stubGlobal("fetch", fetchMock);
  return render(<PageViewCounter label="views" locale="en" />);
}

async function waitForRequestToSettle() {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("PageViewCounter", () => {
  it("renders the recorded page-view count", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 1234 }),
    } as Response);

    renderCounter();

    expect(await screen.findByText("1,234")).toBeTruthy();
  });

  it.each([
    [
      "the response is not successful",
      () => fetchMock.mockResolvedValue({ ok: false } as Response),
    ],
    ["the request fails", () => fetchMock.mockRejectedValue(new Error("offline"))],
  ])("silently keeps the placeholder when %s", async (_scenario, arrangeFailure) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    arrangeFailure();

    renderCounter();
    await waitForRequestToSettle();

    expect(screen.getByText("—")).toBeTruthy();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("aborts the request on unmount without logging", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const { unmount } = renderCounter();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleError).not.toHaveBeenCalled();
  });
});
