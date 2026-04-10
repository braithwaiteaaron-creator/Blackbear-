import { createClient } from "@supabase/supabase-js";

async function checkSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Try to get the schema from information_schema
  const { data, error } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "jobs");

  if (error) {
    console.log("Error:", error);
    return;
  }

  console.log("Jobs table columns:", data);
}

checkSchema().catch(console.error);
