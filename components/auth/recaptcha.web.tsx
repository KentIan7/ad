import React, { useEffect, useRef, useState } from 'react';
import { Colors, Spacing, Typography } from '@/constants/colors';

type RecaptchaProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (message: string) => void;
  onReset?: () => void;
  resetTrigger?: number;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const SCRIPT_ID = 'google-recaptcha-script';

const ensureRecaptchaScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.body.appendChild(script);
  });

const Recaptcha: React.FC<RecaptchaProps> = ({ siteKey, onVerify, onError, onReset, resetTrigger = 0 }) => {
  const widgetHostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (widgetIdRef.current !== null) {
      window.grecaptcha?.reset(widgetIdRef.current);
    }
    widgetIdRef.current = null;
    if (resetTrigger > 0) {
      setIsVerified(false);
      setIsOpen(false);
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (!isOpen || !widgetHostRef.current || widgetIdRef.current !== null) {
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    ensureRecaptchaScript()
      .then(() => {
        if (!isMounted || !widgetHostRef.current || !window.grecaptcha) {
          return;
        }

        widgetIdRef.current = window.grecaptcha.render(widgetHostRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            setIsVerified(true);
            onVerify(token);
          },
          'expired-callback': () => {
            setIsVerified(false);
            window.grecaptcha?.reset(widgetIdRef.current ?? undefined);
            onReset?.();
          },
          'error-callback': () => {
            setIsVerified(false);
            onError?.('reCAPTCHA failed to load. Please try again.');
          },
        });
      })
      .catch((error: Error) => {
        onError?.(error.message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, onError, onReset, onVerify, siteKey]);

  return (
    <div
      style={{
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (isVerified) {
            window.grecaptcha?.reset(widgetIdRef.current ?? undefined);
            widgetIdRef.current = null;
            setIsVerified(false);
            setIsOpen(false);
            onReset?.();
            return;
          }

          setIsOpen(true);
        }}
        style={{
          width: '100%',
          borderRadius: 8,
          border: `1px solid ${isVerified ? Colors.approved : Colors.border}`,
          background: isVerified ? `${Colors.approved}12` : Colors.surface,
          padding: `${Spacing.md}px`,
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: Typography.body.fontSize,
          color: Colors.text,
          fontWeight: 600,
        }}
      >
        {isVerified ? 'reCAPTCHA completed. Tap to reset.' : 'Complete reCAPTCHA before signing in'}
      </button>

      {isOpen ? (
        <div
          style={{
            marginTop: Spacing.sm,
            borderRadius: 8,
            border: `1px solid ${Colors.border}`,
            background: '#ffffff',
            padding: Spacing.md,
          }}
        >
          {isLoading ? (
            <p style={{ margin: 0, color: Colors.textLight }}>Loading reCAPTCHA...</p>
          ) : null}
          <div ref={widgetHostRef} />
        </div>
      ) : null}
    </div>
  );
};

export default Recaptcha;
