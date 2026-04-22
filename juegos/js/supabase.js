import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://qrsibeyemstdtitpuazp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyc2liZXllbXN0ZHRpdHB1YXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODM4MDQsImV4cCI6MjA5MjQ1OTgwNH0.GoGeSRSdrIwXysSAoCjk9uU5Y7MWu96BGrlgLW8rJlk";

export const supabase = createClient(supabaseUrl, supabaseKey);
