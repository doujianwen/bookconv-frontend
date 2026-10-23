'use client';

import { useEffect, useState } from 'react';
import { trackGAEvent } from '@/lib/ga';
import { chrome } from '@/lib/ui-chrome';

interface FeedbackContext {
  sourceFormat?: string;
  targetFormat?: string;
  errorCode?: string;
}

interface FeedbackWidgetProps {
  variant?: 'floating' | 'inline';
  context?: FeedbackContext;
  /** M5-7：西语页 chrome 本地化开关 */
  isEs?: boolean;
}

const MAX_LEN = 1000;

export function FeedbackWidget({ variant = 'floating', context, isEs = false }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function submit() {
    if (!message.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim().slice(0, MAX_LEN),
          email: email.trim(),
          sourceFormat: context?.sourceFormat || '',
          targetFormat: context?.targetFormat || '',
          errorCode: context?.errorCode || '',
          path: typeof window !== 'undefined' ? window.location.pathname : '',
          // Honeypot: kept empty for real users; bots that autofill it get dropped.
          company: '',
        }),
      });
      if (!res.ok) throw new Error('bad status');
      trackGAEvent('feedback_submitted', {
        source_format: context?.sourceFormat || 'n/a',
        target_format: context?.targetFormat || 'n/a',
        has_error_code: Boolean(context?.errorCode),
        variant,
      });
      setStatus('done');
      setMessage('');
      setEmail('');
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
      }, 2500);
    } catch {
      setStatus('error');
    }
  }

  const title = chrome(variant === 'inline' ? 'fwReportIssue' : 'fwSendFeedback', isEs);
  const subtitle = chrome(variant === 'inline' ? 'fwInlineSubtitle' : 'fwFloatingSubtitle', isEs);

  const modal = open && (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={chrome('fwClose', isEs)}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {(context?.sourceFormat || context?.targetFormat || context?.errorCode) && (
          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {context?.sourceFormat && context?.targetFormat
              ? `${context.sourceFormat.toUpperCase()} → ${context.targetFormat.toUpperCase()}`
              : null}
            {context?.errorCode ? ` · code: ${context.errorCode}` : ''}
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_LEN}
          rows={4}
          placeholder={chrome('fwPlaceholder', isEs)}
          className="mt-4 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={chrome('fwEmailPlaceholder', isEs)}
          className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        <p className="mt-2 text-xs text-gray-400">
          {chrome('fwPrivacy', isEs)}
        </p>

        {status === 'error' && (
          <p className="mt-2 text-sm text-red-600">
            {chrome('fwError', isEs)}
          </p>
        )}
        {status === 'done' && (
          <p className="mt-2 text-sm text-green-600">{chrome('fwThanks', isEs)}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={status === 'sending' || !message.trim()}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'sending' ? chrome('fwSending', isEs) : chrome('fwSend', isEs)}
        </button>
      </div>
    </div>
  );

  if (variant === 'inline') {
    const trigger = (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-base font-semibold text-amber-900">{chrome('fwDidntWork', isEs)}</h3>
        <p className="mt-1 text-sm text-amber-800">
          {chrome('fwTellUs', isEs)}
          {context?.errorCode ? ` Reference code: ${context.errorCode}.` : ''}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          {chrome('fwReportBtn', isEs)}
        </button>
      </div>
    );
    return (
      <>
        {!open && trigger}
        {modal}
      </>
    );
  }

  const floatingTrigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Feedback"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-blue-700"
    >
      <span aria-hidden="true">💬</span> Feedback
    </button>
  );

  return (
    <>
      {!open && floatingTrigger}
      {modal}
    </>
  );
}
