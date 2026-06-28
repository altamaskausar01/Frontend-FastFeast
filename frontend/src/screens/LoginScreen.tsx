import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, ShieldCheck, UserRound, UtensilsCrossed } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { sendOtp, verifyOtp } from '@/services/auth';
import { extractErrorMessage } from '@/services/api';

export default function LoginScreen() {
  const { loginWithToken, showToast } = useApp();
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidIndianMobile = /^[6-9]\d{9}$/.test(mobileNumber);

  const handleMobileChange = (value: string) => {
    setMobileNumber(value.replace(/\D/g, '').slice(0, 10));
    setOtpSent(false);
    setOtp('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = userName.trim();

    if (name.length < 2) {
      showToast('Enter your user name', 'warning');
      return;
    }

    if (!isValidIndianMobile) {
      showToast('Enter a valid 10 digit Indian mobile number', 'warning');
      return;
    }

    setLoading(true);

    try {
      if (!otpSent) {
        await sendOtp({ phone: `+91 ${mobileNumber}` });
        setOtpSent(true);
        showToast(`OTP sent to +91 ${mobileNumber}`);
      } else {
        if (otp.length !== 6) {
          showToast('Enter the 6 digit OTP', 'warning');
          setLoading(false);
          return;
        }

        const res = await verifyOtp({
          phone: `+91 ${mobileNumber}`,
          otp,
          name,
        });

        const { user, token } = res.data;
        loginWithToken(token, {
          name: user.name,
          phone: user.phone,
          email: user.email,
        });
        showToast('Welcome to Fast Feast!');
      }
    } catch (error) {
      showToast(extractErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-surface h-full flex flex-col px-5 py-8 relative overflow-y-auto no-scrollbar">
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-gradient-to-b from-[#E83F4D]/15 via-[#B8303E]/6 to-transparent" />
      <div className="absolute top-[40%] right-[5%] w-[250px] h-[250px] rounded-full bg-[#E83F4D]/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[200px] h-[200px] rounded-full bg-[#1A1A2E]/6 blur-[70px] pointer-events-none" />

      <div className="relative flex-1 flex flex-col justify-center w-full max-w-[420px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="w-16 h-16 rounded-2xl food-gradient flex items-center justify-center shadow-glow-orange">
            <UtensilsCrossed size={30} className="text-white" />
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white leading-tight">
            Fast <span className="text-[#FF6B35]">Feast</span>
          </h1>
          <p className="mt-2 text-sm text-[#A0A0A0] leading-relaxed">
            Login to order your favorites faster.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <label className="block">
            <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">User Name</span>
            <div className="mt-2 h-14 rounded-2xl bg-card border border-white/[0.08] flex items-center gap-3 px-4 focus-within:border-[#FF6B35]/50 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.12)] transition-all">
              <UserRound size={19} className="text-[#FF6B35] flex-shrink-0" />
              <input
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="Enter your name"
                className="flex-1 min-w-0 bg-transparent outline-none text-white text-sm placeholder:text-[#6B6B6B]"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">Mobile Number</span>
            <div className="mt-2 h-14 rounded-2xl bg-card border border-white/[0.08] flex items-center gap-3 px-4 focus-within:border-[#FF6B35]/50 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.12)] transition-all">
              <Phone size={19} className="text-[#FF6B35] flex-shrink-0" />
              <span className="text-sm font-semibold text-white">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={mobileNumber}
                onChange={(event) => handleMobileChange(event.target.value)}
                placeholder="9876543210"
                className="flex-1 min-w-0 bg-transparent outline-none text-white text-sm placeholder:text-[#6B6B6B]"
              />
            </div>
            {mobileNumber.length > 0 && !isValidIndianMobile && (
              <p className="mt-1.5 text-[10px] text-amber-400">Use 10 digits starting with 6, 7, 8, or 9</p>
            )}
          </label>

          {otpSent && (
            <motion.label
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="block"
            >
              <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">OTP</span>
              <div className="mt-2 h-14 rounded-2xl bg-card border border-white/[0.08] flex items-center gap-3 px-4 focus-within:border-[#FF6B35]/50 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.12)] transition-all">
                <ShieldCheck size={19} className="text-[#FF6B35] flex-shrink-0" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6 digit OTP"
                  className="flex-1 min-w-0 bg-transparent outline-none text-white text-sm placeholder:text-[#6B6B6B] tracking-[0.28em]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtp('');
                  showToast(`OTP resent to +91 ${mobileNumber}`);
                }}
                className="mt-2 text-xs font-semibold text-[#FF6B35]"
              >
                Resend OTP
              </button>
            </motion.label>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-full food-gradient text-white font-semibold text-base shadow-glow-orange flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              'Processing...'
            ) : otpSent ? (
              <>Verify & Login <ArrowRight size={18} /></>
            ) : (
              <>Send OTP <ArrowRight size={18} /></>
            )}
          </motion.button>
        </motion.form>
      </div>
      <p className="relative mt-6 text-center text-[10px] font-medium text-[#8F817A]">
        © 2026 AKMH TEAM
      </p>
    </div>
  );
}
