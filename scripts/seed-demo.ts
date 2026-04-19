import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

loadEnv({ path: ".env.local", override: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const daysAgo = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
};

const reports: Database["public"]["Tables"]["reports"]["Insert"][] = [
  {
    id: "6d0b6f9a-2f71-4e4f-85dd-4ed24fcaf101",
    category: "graffiti",
    description: "Saw this on my morning walk, looks like it's been there a couple days",
    photo_path: "demo/graffiti-pier.jpg",
    latitude: 34.2701,
    longitude: -119.2964,
    created_at: daysAgo(3),
    status: "reviewing",
    reporter_device_id: "a0f2d5be-1fd1-43d3-9f6a-b4f1dd0b5001",
  },
  {
    id: "6d0b6f9a-2f71-4e4f-85dd-4ed24fcaf102",
    category: "pothole",
    description: "Big one right in the turning lane, caught my tire",
    photo_path: null,
    latitude: 34.28,
    longitude: -119.2933,
    created_at: daysAgo(1),
    status: "new",
    reporter_device_id: "a0f2d5be-1fd1-43d3-9f6a-b4f1dd0b5002",
  },
  {
    id: "6d0b6f9a-2f71-4e4f-85dd-4ed24fcaf103",
    category: "hazard",
    description: "Near the @downtownventura area, blocking the sidewalk",
    photo_path: null,
    latitude: 34.278,
    longitude: -119.292,
    created_at: daysAgo(6),
    status: "resolved",
    reporter_device_id: "a0f2d5be-1fd1-43d3-9f6a-b4f1dd0b5003",
  },
  {
    id: "6d0b6f9a-2f71-4e4f-85dd-4ed24fcaf104",
    category: "abandoned",
    description: null,
    photo_path: "demo/couch.jpg",
    latitude: 34.285,
    longitude: -119.27,
    created_at: daysAgo(2),
    status: "in_progress",
    reporter_device_id: "a0f2d5be-1fd1-43d3-9f6a-b4f1dd0b5004",
  },
];

async function run() {
  const { data, error } = await supabase
    .from("reports")
    .upsert(reports, { onConflict: "id" })
    .select("id, status, created_at");

  if (error) {
    throw new Error(`Seed failed: ${error.message}`);
  }

  console.log(`Seeded ${data.length} demo reports.`);
  for (const report of data) {
    console.log(`- ${report.id}: ${report.status} (${report.created_at})`);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seed failed.");
  process.exitCode = 1;
});