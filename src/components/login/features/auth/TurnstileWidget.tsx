'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

type TurnstileWidgetProps = {
  siteKey: string;
  resetKey: number;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
};

type TurnstileInstance = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'auto' | 'light' | 'dark';
      size?: 'normal' | 'flexible' | 'compact';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

export default function TurnstileWidget({
  siteKey,
  resetKey,
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const verifyRef = useRef(onVerify);
  const expireRef = useRef(onExpire);
  const errorRef = useRef(onError);

  useEffect(() => {
    verifyRef.current = onVerify;
    expireRef.current = onExpire;
    errorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'auto',
        size: 'flexible',
        callback: (token) => verifyRef.current(token),
        'expired-callback': () => expireRef.current(),
        'error-callback': () => errorRef.current(),
      });
    };

    renderWidget();

    const retryId = window.setInterval(() => {
      renderWidget();

      if (widgetIdRef.current) {
        window.clearInterval(retryId);
      }
    }, 250);

    return () => {
      window.clearInterval(retryId);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) return;
    window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div className="flex w-full justify-center">
        <div ref={containerRef} className="min-h-[65px] w-full" />
      </div>
    </>
  );
}
