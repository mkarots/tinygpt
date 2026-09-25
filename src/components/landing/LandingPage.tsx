'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthProvider';

const serif = '[font-family:var(--font-landing-serif),Georgia,serif]';
const sans = '[font-family:var(--font-landing-sans),Helvetica_Neue,sans-serif]';

export function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/admin');
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <div className={`${sans} min-h-screen flex items-center justify-center bg-[#F6F1E8] text-sm text-[#5E554A]`}>
        Loading…
      </div>
    );
  }

  return (
    <div className={`${sans} min-h-screen overflow-x-clip bg-[#F6F1E8] text-[#1F1B16]`}>
      <header className="flex items-center justify-between gap-3 px-6 py-6 md:px-10 lg:px-[120px] lg:py-7">
        <Link href="/" className={`${serif} shrink-0 text-2xl font-semibold tracking-tight`}>
          TinyGPT
        </Link>
        <nav className="flex min-w-0 items-center gap-4 text-[15px] font-medium md:gap-9">
          <a href="#how" className="hidden hover:text-[#8F3E1C] sm:inline">
            How it works
          </a>
          <a href="/login" className="hover:text-[#8F3E1C]">
            Log in
          </a>
          <a
            href="/login"
            className="hidden rounded-full bg-[#1F1B16] px-4 py-2.5 text-[#FFFDF8] sm:inline"
          >
            Build my agent
          </a>
        </nav>
      </header>

      <section className="grid grid-cols-1 items-center gap-12 px-6 pb-20 pt-6 md:px-10 lg:grid-cols-2 lg:gap-16 lg:px-[120px] lg:pb-28 lg:pt-16">
        <div className="flex min-w-0 max-w-xl flex-col gap-7">
          <span className="w-fit rounded-full border border-[#D9CEBC] px-3.5 py-2 text-sm font-semibold text-[#5E554A]">
            Customer support, on your website
          </span>
          <h1 className={`${serif} text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-[76px]`}>
            Support that <span className="text-[#B4532A]">lives on your site.</span>
          </h1>
          <p className="max-w-[520px] text-lg leading-relaxed text-[#5E554A] md:text-[21px] text-pretty">
            Paste your site or a few text files. The chat answers from that, and stays on your pages.
          </p>
          <SiteForm />
        </div>
        <Storefront />
      </section>

      <section className="flex flex-col gap-12 bg-[#EFE6D7] px-6 py-20 md:px-10 lg:px-[120px] lg:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <h2 className={`${serif} text-4xl font-semibold tracking-tight md:text-5xl`}>
            It answers from the pages you already have.
          </h2>
          <p className="text-lg leading-relaxed text-[#5E554A] md:text-xl">
            The customer stays on your site. The reply comes from your policies, not a script we wrote.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[20px] border border-[#E3DACB] bg-[#FFFDF8] p-6 md:p-8">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#5E554A]">
              On your site
            </span>
            <Bubble side="customer">The bowl arrived chipped. What do I do?</Bubble>
            <Bubble side="shop">
              Email us within 14 days with your order number and a photo. Damaged items are refunded.
            </Bubble>
            <Bubble side="customer">Thank you. I’ll send the photo.</Bubble>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[#E3DACB] bg-[#FFFDF8]">
            <div className="border-b border-[#EDE5D8] px-6 py-6 md:px-8">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#5E554A]">
                From your returns page
              </span>
            </div>
            <p className="px-6 py-8 text-lg leading-relaxed md:px-8">
              Damaged items: email us within 14 days with your order number and a photo. We’ll refund the item.
            </p>
            <p className="border-t border-[#EDE5D8] px-6 py-5 text-sm text-[#5E554A] md:px-8">
              hartwell.example/pages/returns
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-10 px-6 py-20 md:px-10 lg:grid-cols-3 lg:px-[120px] lg:py-28">
        <Feature title="Knows your pages">
          We read your site and any text files you add. When those pages change, crawl them again.
        </Feature>
        <Feature title="Sits in the corner">
          One snippet. The chat stays on your website while people look at your products.
        </Feature>
        <Feature title="Sounds like you">
          You set the name, the greeting, and the questions customers ask first.
        </Feature>
      </section>

      <section id="how" className="flex flex-col gap-12 px-6 pb-20 md:px-10 lg:px-[120px] lg:pb-28">
        <h2 className={`${serif} text-4xl font-semibold tracking-tight md:text-5xl`}>
          Live on your site today.
        </h2>
        <div className="grid gap-10 lg:grid-cols-3">
          <Step n="1" title="Paste your website">
            Or drop in a text file. We draft an agent from your products and policies.
          </Step>
          <Step n="2" title="Set the greeting">
            Name, tone, and the questions people already ask.
          </Step>
          <Step n="3" title="Add one line">
            Paste the snippet, match your colour, and customers ask from your pages.
          </Step>
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10 lg:px-[120px] lg:pb-28">
        <div className="flex flex-col items-center gap-7 rounded-[28px] bg-[#1F1B16] px-6 py-16 text-center text-[#FFFDF8] md:px-16 md:py-20">
          <h2 className={`${serif} text-4xl font-semibold leading-tight tracking-tight md:text-6xl`}>
            Put it on your site tonight.
          </h2>
          <p className="text-lg text-[#CFC6B8] md:text-xl">
            See it answer from your own pages.
          </p>
          <SiteForm dark />
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-[#E3DACB] px-6 py-10 text-[15px] text-[#5E554A] md:px-10 lg:px-[120px]">
        <span className={`${serif} text-[22px] font-semibold text-[#1F1B16]`}>TinyGPT</span>
        <a href="/login" className="hover:text-[#8F3E1C]">
          Log in
        </a>
      </footer>
    </div>
  );
}

function SiteForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    router.push(trimmed ? `/login?site=${encodeURIComponent(trimmed)}` : '/login');
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-[540px] flex-col gap-2.5 text-left">
      <label htmlFor={dark ? 'url-close' : 'url-hero'} className={`text-sm font-semibold ${dark ? 'sr-only' : ''}`}>
        Your website
      </label>
      <div className={`flex flex-col gap-2 rounded-2xl p-2 sm:flex-row ${dark ? 'bg-[#FFFDF8]' : 'border border-[#D9CEBC] bg-[#FFFDF8]'}`}>
        <input
          id={dark ? 'url-close' : 'url-hero'}
          type="text"
          inputMode="url"
          name="site"
          placeholder="yourstore.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-lg text-[#1F1B16] outline-none"
        />
        <button
          type="submit"
          className="rounded-[10px] bg-[#B4532A] px-5 py-4 text-[17px] font-semibold text-[#FFFDF8]"
        >
          Build my agent
        </button>
      </div>
      {dark ? null : (
        <span className="text-sm text-[#5E554A]">
          Sign in with Google, then add your site. No card.
        </span>
      )}
    </form>
  );
}

function Storefront() {
  return (
    <div className="relative mx-auto w-full max-w-[640px] lg:h-[600px]">
      <div className="overflow-hidden rounded-[20px] border border-[#E3DACB] bg-[#FFFDF8] lg:absolute lg:left-0 lg:top-0 lg:h-[540px] lg:w-[520px]">
        <div className="flex items-center justify-between gap-3 border-b border-[#EDE5D8] px-5 py-4">
          <span className={`${serif} min-w-0 text-xl font-semibold`}>Hartwell Ceramics</span>
          <div className="flex shrink-0 gap-3 text-[13px] text-[#5E554A]">
            <span>Shop</span>
            <span className="hidden sm:inline">About</span>
            <span>Cart (1)</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5">
          <Product name="Stoneware Mug, Oat" price="£24" swatch="#E9DFCF" />
          <Product name="Stoneware Mug, Slate Blue" price="£24" swatch="#D6DDE0" />
          <Product name="Serving Bowl" price="£48" swatch="#E4D5C3" />
          <Product name="Bud Vase Set" price="£36" swatch="#DCD3C6" />
        </div>
      </div>

      <div className="relative z-10 -mt-8 ml-auto w-[min(100%,360px)] overflow-hidden rounded-[20px] border border-[#E3DACB] bg-[#FFFDF8] shadow-[0_24px_60px_rgba(31,27,22,0.18)] lg:absolute lg:bottom-0 lg:right-0 lg:mt-0">
        <div className="flex items-center justify-between bg-[#1F1B16] px-4 py-4 text-[#FFFDF8]">
          <span className="text-[15px] font-semibold">Ask Hartwell</span>
          <span className="text-xs text-[#CFC6B8]">On this page</span>
        </div>
        <div className="flex flex-col gap-2.5 px-4 pb-3 pt-4">
          <Bubble side="customer" small>Do you ship to Leeds?</Bubble>
          <Bubble side="shop" small>Yes. Orders placed before 2pm leave the same day.</Bubble>
          <Bubble side="customer" small>What’s your return window?</Bubble>
          <Bubble side="shop" small>14 days. Unused, in the original packaging.</Bubble>
        </div>
        <div className="flex gap-2 border-t border-[#EDE5D8] px-4 py-3">
          <input
            type="text"
            readOnly
            aria-label="Message the shop"
            placeholder="Type a message"
            className="min-w-0 flex-1 rounded-[10px] border border-[#E3DACB] bg-[#FFFDF8] px-3 py-2.5 text-sm"
          />
          <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#B4532A] text-[#FFFDF8]" aria-hidden>
            →
          </span>
        </div>
      </div>
    </div>
  );
}

function Product({ name, price, swatch }: { name: string; price: string; swatch: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-24 rounded-xl sm:h-36" style={{ background: swatch }} />
      <span className="text-sm font-semibold leading-snug">{name}</span>
      <span className="text-[13px] text-[#5E554A]">{price}</span>
    </div>
  );
}

function Bubble({
  side,
  children,
  small = false,
}: {
  side: 'customer' | 'shop';
  children: string;
  small?: boolean;
}) {
  const customer = side === 'customer';
  return (
    <p
      className={`max-w-[270px] leading-snug ${small ? 'px-3.5 py-2.5 text-sm' : 'max-w-[420px] px-4 py-3 text-base'} ${
        customer
          ? 'self-end rounded-[14px] rounded-br-[4px] bg-[#1F1B16] text-[#FFFDF8]'
          : 'self-start rounded-[14px] rounded-bl-[4px] bg-[#F1E9DC] text-[#1F1B16]'
      }`}
    >
      {children}
    </p>
  );
}

function Feature({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={`${serif} text-3xl font-semibold`}>{title}</h3>
      <p className="text-lg leading-relaxed text-[#5E554A]">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <div className="flex flex-col gap-3 border-t-2 border-[#1F1B16] pt-6">
      <span className={`${serif} text-4xl text-[#B4532A]`}>{n}</span>
      <span className="text-[22px] font-semibold">{title}</span>
      <span className="text-[17px] leading-relaxed text-[#5E554A]">{children}</span>
    </div>
  );
}
