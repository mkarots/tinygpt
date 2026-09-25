import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AgentDashboard } from '../../components/views/admin/AgentDashboard';
import { SupabaseAgentRepository } from '../../infrastructure/repositories/SupabaseAgentRepository';
import { createClient } from '../../lib/supabase-server';

export const metadata: Metadata = {
  title: 'Your agents',
};

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const agents = await new SupabaseAgentRepository(supabase).listByUser(user.id);
  return <AgentDashboard agents={agents} />;
}
