const otpStore = new Map<string, { code: string; expiry: number }>();

export const sendOtp = async (email: string, code: string) => {
  otpStore.set(email, {
    code,
    expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  // TODO: Send email via SES/SendGrid
  console.log(`📧 OTP sent to ${email}: ${code}`);
};

export const verifyOtpCode = async (email: string, code: string): Promise<boolean> => {
  const otp = otpStore.get(email);
  if (!otp || otp.expiry < Date.now()) {
    return false;
  }
  if (otp.code === code) {
    otpStore.delete(email);
    return true;
  }
  return false;
};

export const generateOTP = (): string => {
  return Math.random().toString().slice(2, 8);
};

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  // TODO: Implement email service
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  }
  return true;
};

export const validateOTP = (provided: string, stored: string): boolean => {
  return provided === stored;
};
