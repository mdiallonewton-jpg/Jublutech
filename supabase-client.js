// ===========================================================
// JubluTech — Configuration Supabase
// ===========================================================
const SUPABASE_URL = 'https://ydavbstvxtdogmdmtszz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qx-vtSI82VwB4YNnkjOpyQ_HTU6YSxD';

let supabaseClient;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase SDK non chargé depuis le CDN.');
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ error: { message: 'Supabase SDK non disponible.' } }),
      signUp: async () => ({ error: { message: 'Supabase SDK non disponible.' } }),
      signOut: async () => ({})
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: async () => ({ data: [], error: null })
        }),
        order: async () => ({ data: [], error: null })
      }),
      insert: async () => ({ error: { message: 'Supabase SDK non disponible.' } }),
      update: () => ({ eq: async () => ({ error: { message: 'Supabase SDK non disponible.' } }) })
    })
  };
}