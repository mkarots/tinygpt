import type { Metadata } from 'next';
import ProspectorPage from '../../../components/views/internal/ProspectorPage';

export const metadata: Metadata = {
  title: 'Prospector',
};

export default function Page() {
  return <ProspectorPage />;
}
