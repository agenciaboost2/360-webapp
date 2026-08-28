import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/getProfile";
import AppNav from "@/components/AppNav";
import CreativeBoard from "@/components/CreativeBoard";

export const dynamic = "force-dynamic";

export default async function CreativePage() {
  const { user, profile } = await getUserAndProfile();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("creative_content")
    .select("*")
    .order("estimated_date", { ascending: true, nullsFirst: false });

  return (
    <>
      <AppNav current="creative" profile={profile} userId={user?.id} />
      <CreativeBoard items={items || []} userId={user?.id} userName={profile?.full_name} />
    </>
  );
}
