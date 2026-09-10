export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  supabaseRedirectUrl:
    import.meta.env.VITE_SUPABASE_REDIRECT_URL ??
    "http://localhost:5173/auth/callback"
};
