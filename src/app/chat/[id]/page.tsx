import PublicAgentChat from '../../../components/PublicAgentChat';
import { SupabaseAgentRepository } from '../../../infrastructure/repositories/SupabaseAgentRepository';
import { publicAgentMetadata } from '../../../lib/publicAgentTitle';
import { createClient as createServerSupabase } from '../../../lib/supabase-server';

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return params.then(({ id }) => publicAgentMetadata(id));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicAgentChat viewerOwnsAgent={await viewerOwnsAgent(id)} />;
}

/** True only when the signed-in user owns this agent. Visitors stay false. */
async function viewerOwnsAgent(agentId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    const owned = await new SupabaseAgentRepository(supabase).listByUser(data.user.id);
    return owned.some((row) => row.id === agentId);
  } catch {
    return false;
  }
}
