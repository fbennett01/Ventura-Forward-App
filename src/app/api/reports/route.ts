import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  category: z.enum(["trash", "graffiti", "pothole", "abandoned", "hazard", "other"]),
  description: z.string().max(500).optional().nullable(),
  photo_path: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  reporter_device_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      category: parsed.data.category,
      description: parsed.data.description,
      photo_path: parsed.data.photo_path,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      reporter_device_id: parsed.data.reporter_device_id,
    })
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to insert report" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, status: data.status }, { status: 201 });
}