import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Script from 'next/script';
import '../styles/globals.css';
import { useAuthStore } from '../lib/store/authStore';

export default function App({ Component, pageProps }: AppProps) {
  const { restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
}
