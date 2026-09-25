import type { Metadata } from 'next';
import ShareAgentPage from '../../../../components/views/admin/ShareAgentPage';

export const metadata: Metadata = {
  title: 'Share',
};

export default function Page() {
  return <ShareAgentPage />;
}
