'use client'

import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase-config'
import { Button } from '../../components/core/button/Button'
import { Heading } from '../../components/core/typography/Heading'
import { SIGN_IN_CTA } from '../../lib/signInCopy'

export default function LoginPage() {
  const configured = isSupabaseConfigured()

  const handleLogin = async () => {
    if (!configured) return
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6 text-ink">
      <div className="bg-cream border border-rule p-8 rounded-[20px] max-w-md w-full text-center">
        <Link
          href="/"
          className="inline-block mb-6 font-serif text-2xl font-semibold tracking-tight text-ink hover:text-terracotta"
        >
          TinyGPT
        </Link>

        <Heading level={1} className="mb-2">
          Welcome to TinyGPT
        </Heading>
        <p className="text-stone mb-8">{SIGN_IN_CTA}</p>

        {configured ? (
        <Button 
          onClick={handleLogin}
          className="w-full justify-center py-6 text-base"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        ) : (
          <p className="text-sm text-amber-900 bg-[#EFE6D7] border border-rule rounded-lg p-3">
            Add NEXT_PUBLIC_SUPABASE_URL and a public key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable Google sign-in.
          </p>
        )}
      </div>
    </div>
  )
}
