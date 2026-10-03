'use client';

// src/components/auth/AuthForm.tsx
//
// 登录 / 注册表单的共享实现。此前只有 src/app/auth/page.tsx 一个入口，
// 且该页挂在根路径（无 locale 段），导致 /es/auth 返回 404——而运营台在
// /es/admin 之下，运营者在西语站点上找不到登录入口，属真实可达性缺口。
//
// 抽成组件后由两条路由共用：
//   src/app/auth/page.tsx        → /auth      （英文，无前缀）
//   src/app/[locale]/auth/page.tsx → /es/auth （西语）
// 两页文案随 locale 切换，避免「西语站点里嵌一个纯英文登录框」。

import { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

type Mode = 'login' | 'register';

interface Copy {
  signIn: string;
  createAccount: string;
  welcomeBack: string;
  joinBlurb: string;
  email: string;
  password: string;
  passwordNew: string;
  signInBtn: string;
  signUpBtn: string;
  noAccount: string;
  haveAccount: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  passwordNewPlaceholder: string;
  minLengthHint: string;
  loginOk: string;
  registerOk: string;
  networkError: string;
  requestFailed: string;
  back: string;
}

const COPY: Record<string, Copy> = {
  en: {
    signIn: 'Sign In',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome back! Sign in to your account.',
    joinBlurb: 'Join BookConv for batch conversion.',
    email: 'Email address',
    password: 'Password',
    passwordNew: 'New password',
    signInBtn: 'Sign In',
    signUpBtn: 'Create Account',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: 'Enter your password',
    passwordNewPlaceholder: 'At least 8 characters',
    minLengthHint: 'Must be at least 8 characters',
    loginOk: 'Login successful! Redirecting...',
    registerOk: 'Account created! You are now logged in.',
    networkError: 'Network error. Please try again.',
    requestFailed: 'Request failed',
    back: 'Back to BookConv',
  },
  es: {
    signIn: 'Iniciar sesión',
    createAccount: 'Crear cuenta',
    welcomeBack: '¡Bienvenido de nuevo! Inicia sesión en tu cuenta.',
    joinBlurb: 'Únete a BookConv para conversión por lotes.',
    email: 'Correo electrónico',
    password: 'Contraseña',
    passwordNew: 'Nueva contraseña',
    signInBtn: 'Iniciar sesión',
    signUpBtn: 'Crear cuenta',
    noAccount: '¿No tienes cuenta?',
    haveAccount: '¿Ya tienes cuenta?',
    emailPlaceholder: 'tu@ejemplo.com',
    passwordPlaceholder: 'Introduce tu contraseña',
    passwordNewPlaceholder: 'Mínimo 8 caracteres',
    minLengthHint: 'Debe tener al menos 8 caracteres',
    loginOk: '¡Sesión iniciada! Redirigiendo...',
    registerOk: '¡Cuenta creada! Ya has iniciado sesión.',
    networkError: 'Error de red. Inténtalo de nuevo.',
    requestFailed: 'La solicitud falló',
    back: 'Volver a BookConv',
  },
};

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const locale = useLocale();
  const t = COPY[locale] ?? COPY.en;

  // 登录态下访问 /auth 直接回首页
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) window.location.href = locale === 'es' ? '/es' : '/';
      })
      .catch(() => {});
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || t.requestFailed);
        return;
      }

      if (mode === 'login') {
        setSuccess(t.loginOk);
        setTimeout(() => {
          window.location.href = locale === 'es' ? '/es' : '/';
        }, 1000);
      } else {
        setSuccess(t.registerOk);
        setTimeout(() => {
          window.location.href = locale === 'es' ? '/es' : '/';
        }, 1000);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <Link href={locale === 'es' ? '/es' : '/'} className="flex items-center gap-2 mb-8 justify-center text-blue-600">
          <span className="text-2xl font-bold tracking-tight">BookConv</span>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? t.signIn : t.createAccount}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {mode === 'login' ? t.welcomeBack : t.joinBlurb}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                {mode === 'register' ? t.passwordNew : t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={mode === 'register' ? t.passwordNewPlaceholder : t.passwordPlaceholder}
                  minLength={mode === 'register' ? 8 : undefined}
                />
              </div>
              {mode === 'register' && <p className="mt-1.5 text-xs text-gray-500">{t.minLengthHint}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  {t.signInBtn}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t.signUpBtn}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'login' ? t.noAccount : t.haveAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setSuccess('');
              }}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {mode === 'login' ? t.signUpBtn : t.signInBtn}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href={locale === 'es' ? '/es' : '/'} className="text-blue-600 hover:underline">
            ← {t.back}
          </Link>
        </p>
      </div>
    </div>
  );
}
