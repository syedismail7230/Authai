import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuthStore } from '../../lib/store/authStore';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://authai.pro'}/api/auth/send-otp`, { email });
      setShowOtp(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAILED TO INITIATE SEQUENCE');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://authai.pro'}/api/auth/verify-otp`, {
        email,
        otp,
      });
      const { token, user } = response.data;
      setAuth(token, user);
      if (!user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/verify');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'INVALID AUTHORIZATION CODE');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://authai.pro'}/api/auth/google`, {
        credential: credentialResponse.credential,
      });
      const { token, user } = response.data;
      setAuth(token, user);
      router.push('/verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OAUTH HANDSHAKE FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-black selection:bg-black selection:text-white items-center justify-center p-4">

      <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-center">AUTHAI.PRO</h1>
        <div className="w-full h-1 bg-black mb-6"></div>
        <p className="font-mono text-sm text-center mb-8 uppercase font-bold">&gt;_ ACCESS SYSTEM DIRECTIVE</p>

        {error && (
          <div className="mb-6 p-3 border-2 border-black bg-[#ff6b6b] text-white font-mono text-xs font-bold uppercase">
            &gt; ERR: {error}
          </div>
        )}

        <form onSubmit={showOtp ? handleVerifyOtp : handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_USR_EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="&gt; INPUT_EMAIL_ADDRESS"
              disabled={showOtp}
              className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm placeholder-gray-400 uppercase disabled:opacity-50"
              required
            />
          </div>

          {showOtp && (
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_AUTH_CODE</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="&gt; INPUT_6_DIGIT_PIN"
                maxLength={6}
                className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm placeholder-gray-400 uppercase tracking-widest"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 border-4 border-black bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 text-sm shadow-[4px_4px_0_0_#000] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
          >
            {loading ? 'PROCESSING...' : showOtp ? 'VERIFY ACCESS CODE' : 'TRANSMIT AUTH REQUEST'}
          </button>
        </form>

        {!showOtp && (
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
            <p className="text-center font-mono text-xs uppercase text-gray-500 mb-4">&gt; ALTERNATIVE_PROTOCOL</p>

            <div className="flex justify-center w-full border-2 border-black p-2 bg-[#f9f9f9]">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('OAUTH_CLIENT_MISSING_OR_INVALID')}
                  useOneTap
                />
              ) : (
                <div className="text-center w-full font-mono text-xs p-2 text-red-600 font-bold bg-[#ffdddd]">
                  ERR 401: GOOGLE_CLIENT_ID NOT CONFIGURED
                </div>
              )}
            </div>
          </div>
        )}

        {showOtp && (
          <button
            onClick={() => setShowOtp(false)}
            className="w-full mt-6 py-2 border-2 border-black text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            [ RECONFIGURE_EMAIL_INPUT ]
          </button>
        )}

        <div className="mt-8 text-center border-t-4 border-black pt-4">
          <p className="font-mono text-xs uppercase font-bold">
            NEW_ENTITY?{' '}
            <a href="/auth/signup" className="underline hover:bg-black hover:text-white p-1 transition-colors">
              INITIALIZE_ACCOUNT
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
