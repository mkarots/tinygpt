import { Figtree, Fraunces } from 'next/font/google';
import { LandingPage } from '../components/landing/LandingPage';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-landing-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-landing-serif' });

export default function Page() {
  return (
    <div className={`${figtree.variable} ${fraunces.variable}`}>
      <LandingPage />
    </div>
  );
}
