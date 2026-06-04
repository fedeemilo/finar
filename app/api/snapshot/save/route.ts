import { NextRequest, NextResponse } from "next/server";
import { saveSnapshot, type SnapshotKind } from "@/lib/db";

export const dynamic = "force-dynamic";

// Solo permitimos los kinds que escribe n8n. Los del repo (analisis, noticias-home)
// se guardan en su propio /revalidate endpoint con cotizaciones incluidas.
const ALLOWED_KINDS: SnapshotKind[] = ["noticias-diarias", "noticias-tech"];

interface Body {
  kind?: string;
  payload?: unknown;
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("Authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.kind || body.payload === undefined) {
    return NextResponse.json({ error: "Missing kind or payload" }, { status: 400 });
  }

  if (!ALLOWED_KINDS.includes(body.kind as SnapshotKind)) {
    return NextResponse.json(
      { error: `Invalid kind. Allowed: ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    await saveSnapshot(body.kind as SnapshotKind, body.payload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error guardando snapshot:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
