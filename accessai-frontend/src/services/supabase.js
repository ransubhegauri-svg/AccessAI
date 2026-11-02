import { createClient } from "@supabase/supabase-js";

// Working Supabase project configuration (matches .env.example)
const DEFAULT_SUPABASE_URL = "https://jxewucohfqzdrrdalyhv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZXd1Y29oZnF6ZHJyZGFseWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzczMjYsImV4cCI6MjEwOTAxMzMyNn0.qa5Akp7A3qFXN-EzZ-jC43tVsf1uR10MNykimfmVvpQ";

// Clean any trailing '/rest/v1' or slashes from user-provided URLs
const normalizeSupabaseUrl = (url) => {
  if (!url) return "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
};

const rawUrl = process.env.REACT_APP_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return false; // Skip live network calls during automated unit test runs
  }
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder-project") &&
    !supabaseAnonKey.includes("placeholder-anon-key")
  );
};

export const supabase = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
