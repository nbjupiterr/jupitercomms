import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Dedupes auth.getUser() within a single server request (layout + page). */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
