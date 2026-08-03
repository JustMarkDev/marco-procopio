/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageViewCounter } from "./page-view-counter";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  expect(console.error).not.toHaveBeenCalled();
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
    arrangeFailure();

    renderCounter();
    await waitForRequestToSettle();

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("aborts the request on unmount without logging", async () => {
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
  });
});
