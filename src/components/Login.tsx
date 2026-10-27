import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { colors as c } from '../theme';
import Logo from './Logo';

type Mode = 'sign-in' | 'sign-up';

// Supabase gives the same error for a wrong password and an unknown email (on purpose, so
// nobody can probe which emails have accounts), so the message has to cover both cases.
function friendlyError(code: string | undefined, message: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'That email and password don’t match an account. Check them, or sign up if you’re new.';
    case 'email_not_confirmed':
      return 'Please confirm your email first — check your inbox for the link.';
    case 'user_already_exists':
      return 'An account with this email already exists. Try signing in instead.';
    case 'weak_password':
      return 'That password is too weak. Use at least 6 characters.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Please wait a minute and try again.';
    default:
      return message;
  }
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorCode(undefined);
    setLoading(true);

    const { error } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(friendlyError(error.code, error.message));
      setErrorCode(error.code);
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
        <Logo size={40} className="mb-10" />
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
                {mode === 'sign-in' && errorCode === 'invalid_credentials' && (
                  <>
                    {' '}
                    <button
                      type="button"
                      className="underline font-semibold"
                      onClick={() => {
                        setMode('sign-up');
                        setError(null);
                      }}
                    >
                      Create an account
                    </button>
                  </>
                )}
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
