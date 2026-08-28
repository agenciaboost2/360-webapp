import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/getProfile";
import { notFound } from "next/navigation";
import ClientBoard from "@/components/ClientBoard";
import CreativeAccountBoard from "@/components/CreativeAccountBoard";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  if (client.is_creative) {
    const { user, profile } = await getUserAndProfile();
    const { data: items } = await supabase
      .from("creative_content")
      .select("*")
      .eq("client_id", id)
      .order("estimated_date", { ascending: true, nullsFirst: false });
    return <CreativeAccountBoard client={client} items={items || []} userId={user?.id} userName={profile?.full_name} />;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, slides(*)")
    .eq("client_id", id)
    .order("post_date");

  const { data: ejes } = await supabase.from("ejes").select("*").eq("client_id", id);

  return <ClientBoard client={client} initialPosts={posts || []} initialEjes={ejes || []} />;
}
