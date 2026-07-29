import { createClient } from "@/lib/supabase/server";

export async function getUserAndProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    const defaultName = user.email ? user.email.split("@")[0] : "";
    await supabase.from("profiles").upsert({ id: user.id, full_name: defaultName });
    profile = { id: user.id, full_name: defaultName, avatar_url: "", notes: "" };
  }
  return { user, profile };
}
