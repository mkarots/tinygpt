import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import App from '../../../../App';
import { SupabaseAgentRepository } from '../../../infrastructure/repositories/SupabaseAgentRepository';
import { ownedAgentForEdit } from '../../../lib/ownedAgentForEdit';
import { createClient } from '../../../lib/supabase-server';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}): Promise<Metadata> {
  const { agent } = await searchParams;
  return { title: agent ? 'Edit agent' : 'New agent' };
}

export default async function NewAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>;
}) {
  const { agent: agentId } = await searchParams;
  if (!agentId) {
    return <App />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const initialAgent = await ownedAgentForEdit(
    new SupabaseAgentRepository(supabase),
    user.id,
    agentId
  );
  return <App initialAgent={initialAgent} />;
}
