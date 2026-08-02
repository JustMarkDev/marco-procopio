import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/visit-counter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const visitId =
    typeof body === "object" && body !== null && "visitId" in body ? body.visitId : undefined;

  if (typeof visitId !== "string" || !/^[0-9a-f-]{36}$/i.test(visitId)) {
    return NextResponse.json({ error: "Invalid visit ID" }, { status: 400 });
  }

  try {
    const count = await recordPageView(visitId);
    return NextResponse.json(
      { count },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to record page view", error);
    return NextResponse.json({ error: "Counter unavailable" }, { status: 503 });
  }
}
