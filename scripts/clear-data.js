import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllData() {
  try {
    console.log("Starting data clear process...");

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

    for (const table of tables) {
      console.log(`Clearing ${table}...`);
      const { error } = await supabase.from(table).delete().neq("id", "");
      
      if (error) {
        console.error(`Error clearing ${table}:`, error.message);
      } else {
        console.log(`✓ Cleared ${table}`);
      }
    }

    console.log("\n✅ All data cleared successfully!");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

clearAllData();
