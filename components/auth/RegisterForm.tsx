'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', { email, password, redirect: false });
      setLoading(false);

      if (result?.error) {
        setError('Account created but sign in failed. Please sign in manually.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-surface-card border border-border rounded-lg p-10 shadow-2">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-primary tracking-tight">ScriptFlow</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-txt-muted mt-1">The Cinematic Archive</p>
      </div>

      <h2 className="text-2xl font-semibold text-txt-primary mb-1">Create your account</h2>
      <p className="text-sm text-txt-secondary mb-6">Start your screenwriting journey today.</p>

      {error && (
        <div className="mb-4 p-3 rounded bg-[#FEECEC] text-danger text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email address"
          type="email"
          placeholder="director@filmmaker.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-txt-muted hover:text-txt-secondary"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          required
        />
        <p className="text-[11px] text-txt-muted">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-txt-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-txt-link font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
