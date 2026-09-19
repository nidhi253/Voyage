import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { colors as c } from '../theme';

type Mode = 'sign-in' | 'sign-up';

export default function Login() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === 'sign-up') {
      setCheckEmail(true);
    }
  }

  return (
    <div
      className="body-font min-h-screen flex items-center justify-center px-5"
      style={{ background: c.bg }}
    >
      <div className="w-full max-w-[360px]">
        <p className="display text-3xl mb-2 whitespace-pre-line" style={{ color: c.ink }}>
          {mode === 'sign-in' ? 'Welcome\nback' : 'Create your\naccount'}
        </p>
        <p className="body-font text-sm mb-8" style={{ color: c.slate }}>
          {mode === 'sign-in'
            ? 'Sign in to keep planning.'
            : 'Temporary dev login — phone/OTP comes later.'}
        </p>

        {checkEmail ? (
          <p className="body-font text-sm" style={{ color: c.ink }}>
            Check your email to confirm your account, then sign in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{ background: c.surface, border: `1px solid ${c.hairline}`, color: c.ink }}
            />
            <input
              type="password"
              required
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="body-font w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: c.surface,
                border: `1px solid ${error ? c.red : c.hairline}`,
                color: c.ink,
              }}
            />

            {error && (
              <p className="body-font text-xs" style={{ color: c.red }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="body-font font-semibold w-full py-3.5 rounded-xl text-sm mt-2 disabled:opacity-50"
              style={{ background: c.ink, color: c.surface }}
            >
              {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
        )}

        <button
          onClick={() => {
            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
            setError(null);
            setCheckEmail(false);
          }}
          className="body-font text-sm mt-5 text-center w-full"
          style={{ color: c.slate }}
        >
          {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
