import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ClientBoard from "@/components/ClientBoard";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, slides(*)")
    .eq("client_id", id)
    .order("post_date");

  const { data: ejes } = await supabase.from("ejes").select("*").eq("client_id", id);

  return <ClientBoard client={client} initialPosts={posts || []} initialEjes={ejes || []} />;
}
