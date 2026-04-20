import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://txdvsunxzjsbhrfgxxsh.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZHZzdW54empzYmhyZmd4eHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4ODE1MDYsImV4cCI6MjA4ODQ1NzUwNn0.FQGxeaviR96QZkhqOQ8pnw49anqqoq_ZNYcRmACkG_g"

export const supabase = createClient(supabaseUrl, supabaseKey)