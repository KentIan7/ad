import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/colors';

type RecaptchaProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (message: string) => void;
  onReset?: () => void;
  resetTrigger?: number;
};

const buildRecaptchaPage = (siteKey: string, redirectUri: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>reCAPTCHA Verification</title>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        font-family: Arial, sans-serif;
        color: #082052;
      }
      .card {
        background: #ffffff;
        border: 1px solid #d9e2ec;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 25px rgba(8, 32, 82, 0.08);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Complete reCAPTCHA</h2>
      <p>Check the box below to continue signing in.</p>
      <div
        class="g-recaptcha"
        data-sitekey="${siteKey}"
        data-callback="onCaptchaSuccess"
        data-expired-callback="onCaptchaExpired"
        data-error-callback="onCaptchaError"
      ></div>
    </div>
    <script>
      function redirect(status, token) {
        var url = '${redirectUri}' + '?status=' + encodeURIComponent(status);
        if (token) {
          url += '&token=' + encodeURIComponent(token);
        }
        window.location.href = url;
      }
      function onCaptchaSuccess(token) {
        redirect('success', token);
      }
      function onCaptchaExpired() {
        redirect('expired', '');
      }
      function onCaptchaError() {
        redirect('error', '');
      }
    </script>
  </body>
</html>`;

const Recaptcha: React.FC<RecaptchaProps> = ({ siteKey, onVerify, onError, onReset, resetTrigger = 0 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const redirectUri = useMemo(() => Linking.createURL('recaptcha-callback'), []);

  React.useEffect(() => {
    if (resetTrigger > 0) {
      setIsVerified(false);
    }
  }, [resetTrigger]);

  const handleOpenChallenge = async () => {
    if (isVerified) {
      setIsVerified(false);
      onReset?.();
      return;
    }

    setIsLoading(true);

    try {
      const html = buildRecaptchaPage(siteKey, redirectUri);
      const url = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

      if (result.type !== 'success' || !result.url) {
        onError?.('reCAPTCHA was not completed.');
        return;
      }

      const parsed = Linking.parse(result.url);
      const status = parsed.queryParams?.status;
      const token = parsed.queryParams?.token;

      if (status === 'success' && typeof token === 'string' && token.length > 0) {
        setIsVerified(true);
        onVerify(token);
        return;
      }

      setIsVerified(false);
      onReset?.();
      onError?.('reCAPTCHA verification failed. Please try again.');
    } catch (error: any) {
      onError?.(error?.message || 'Unable to open reCAPTCHA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleOpenChallenge}
        style={[styles.button, isVerified && styles.buttonVerified]}
        activeOpacity={0.85}
        accessibilityRole="button"
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color={Colors.primary} /> : null}
        <Text style={styles.buttonText}>
          {isVerified ? 'reCAPTCHA completed. Tap to reset.' : 'Open reCAPTCHA challenge'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.helperText}>
        Sign in is enabled only after the reCAPTCHA checkbox is completed.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  buttonVerified: {
    borderColor: Colors.approved,
    backgroundColor: `${Colors.approved}12`,
  },
  buttonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});

export default Recaptcha;
