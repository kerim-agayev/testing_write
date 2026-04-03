'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="w-full max-w-[420px] bg-surface-card border border-border rounded-lg p-10 shadow-2">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-primary tracking-tight">ScriptFlow</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-txt-muted mt-1">The Cinematic Archive</p>
      </div>

      <h2 className="text-2xl font-semibold text-txt-primary mb-1">Welcome back</h2>
      <p className="text-sm text-txt-secondary mb-6">Please enter your details to continue your work.</p>

      {error && (
        <div className="mb-4 p-3 rounded bg-[#FEECEC] text-danger text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1">
            <button type="button" className="text-xs text-txt-link hover:underline">
              Forgot password?
            </button>
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Continue
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-txt-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-txt-link font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
