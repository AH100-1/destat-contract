import { createClient } from "@supabase/supabase-js";

// .env 파일의 값을 사용 (키는 깃허브에 올리지 않음)
export const supabase = () =>
  createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
