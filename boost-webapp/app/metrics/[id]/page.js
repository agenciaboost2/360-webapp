import { createClient } from "@/lib/supabase/server";
import { getUserAndProfile } from "@/lib/getProfile";
import { notFound } from "next/navigation";
import AppNav from "@/components/AppNav";
import MetricsBoard from "@/components/MetricsBoard";

export const dynamic = "force-dynamic";

export default async function ClientMetricsPage({ params }) {
  const { id } = await params;
  const { user, profile } = await getUserAndProfile();
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  const { data: organic } = await supabase.from("organic_records").select("*").eq("client_id", id).order("month");
  const { data: campaigns } = await supabase.from("ad_campaigns").select("*").eq("client_id", id);
  const { data: posts } = await supabase.from("posts").select("*").eq("client_id", id).order("post_date", { ascending: false });
  const { data: history } = await supabase.from("post_performance_history").select("*").eq("client_id", id).order("post_date", { ascending: false });

  return (
    <>
      <AppNav current="metricas" profile={profile} userId={user?.id} />
      <MetricsBoard client={client} initialOrganic={organic || []} initialCampaigns={campaigns || []} initialPosts={posts || []} initialHistory={history || []} />
    </>
  );
}
