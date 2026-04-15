import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    console.log("[v0] Starting data clear process...");

    // Tables in order of deletion (respecting foreign key constraints)
    const tables = [
      "spotted_damage",
      "route_stops",
      "transactions",
      "leads",
      "jobs",
      "referrers",
      "merchandise",
      "agents",
      "customers",
    ];

    const results: Record<string, boolean> = {};

    for (const table of tables) {
      console.log(`[v0] Clearing ${table}...`);
      const { error } = await supabase.from(table).delete().neq("id", "");

      if (error) {
        console.error(`[v0] Error clearing ${table}:`, error.message);
        results[table] = false;
      } else {
        console.log(`[v0] ✓ Cleared ${table}`);
        results[table] = true;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "All data cleared successfully!",
        results,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[v0] Error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Error clearing data",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
