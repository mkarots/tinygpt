import type { Metadata } from 'next';
import App from '../../../../App';

export const metadata: Metadata = {
  title: 'New agent',
};

export default function NewAgentPage() {
  return <App />;
}
