import type { Metadata } from 'next';
import { documentTitle } from '../../lib/pageTitle';

export const metadata: Metadata = {
  title: { absolute: documentTitle('Log in') },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
