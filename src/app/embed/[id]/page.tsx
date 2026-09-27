import PublicAgentChat from '../../../components/PublicAgentChat';
import { publicAgentMetadata } from '../../../lib/publicAgentTitle';

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return params.then(({ id }) => publicAgentMetadata(id));
}

export default function EmbedPage() {
  return <PublicAgentChat />;
}
