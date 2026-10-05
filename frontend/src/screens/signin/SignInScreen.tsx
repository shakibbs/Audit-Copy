'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSend } from '@/api/queries';
import { DISCLOSURE } from '@/api/types';

/** Email and password sign-in, with a password-reset request. */
export function SignInScreen() {
  const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const send = useSend();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'reset') return send.mutate({ method: 'POST', path: '/session/reset', body: { email } });
    send.mutate({ method: 'POST', path: '/session/sign-in', body: { email, password } }, { onSuccess: () => router.push('/') });
  }
  function switchMode(next: 'sign-in' | 'reset') { setMode(next); send.reset(); }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-12 text-white lg:flex" style={{ background: 'linear-gradient(160deg, #0e1a21, #0a2428 60%, #0e4a45)' }}>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] font-display text-[14px] font-extrabold" style={{ background: 'linear-gradient(135deg, #13b5a2, #0e8c7f)' }}>iV</span>
          <span className="font-display text-[17px] font-bold">Comply iV</span>
        </div>
        <div>
          <h1 className="max-w-md text-[34px] leading-tight">Know where your calling and texting records stand.</h1>
          <p className="mt-4 max-w-md text-[14px] text-[#b9cccd]">Every contact measured, every record fingerprinted and kept, every finding traced to its source.</p>
        </div>
        <p className="max-w-md text-[11.5px] leading-relaxed text-[#7f9a9c]">{DISCLOSURE} Comply iV is not a law firm.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form className="card card-pad w-full max-w-[400px]" onSubmit={submit}>
          <h2 className="text-[21px]">{mode === 'sign-in' ? 'Sign in' : 'Reset your password'}</h2>
          <p className="mb-5 mt-1.5 text-[13px] text-txt-2">{mode === 'sign-in' ? 'Use the email your invitation was sent to.' : 'We will email you a link to choose a new password.'}</p>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === 'sign-in' && (
            <>
              <label className="label mt-4" htmlFor="password">Password</label>
              <input id="password" type="password" required autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </>
          )}
          {send.isError && <p className="mb-0 mt-3 text-[12.5px]" style={{ color: 'var(--bad-ink)' }} role="alert">{send.error.message}</p>}
          {mode === 'reset' && send.isSuccess && <p className="mb-0 mt-3 text-[12.5px]" role="status">If that email has an account, a reset link is on its way.</p>}
          <button type="submit" className="btn btn-primary mt-5 w-full justify-center" disabled={send.isPending}>{mode === 'sign-in' ? 'Sign in' : 'Send reset link'}</button>
          <button type="button" className="mt-4 w-full border-0 bg-transparent text-center text-[12.5px] font-semibold text-brand" onClick={() => switchMode(mode === 'sign-in' ? 'reset' : 'sign-in')}>
            {mode === 'sign-in' ? 'Forgot your password?' : 'Back to sign in'}
          </button>
          <p className="tiny mb-0 mt-5 text-center">Sample data: any email and password will sign you in.</p>
        </form>
      </div>
    </div>
  );
}
