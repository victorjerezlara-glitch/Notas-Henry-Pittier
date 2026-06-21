// Reemplaza con tus claves reales
const SUPABASE_URL = "https://slwbzfxwrxrsnlizapps.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9yQQumW9JF5A-NjFjtp3Og_7HBfSDpr";

// Crear cliente correctamente SIN colisión de nombres
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exponerlo como supabase global
window.supabase = client;
