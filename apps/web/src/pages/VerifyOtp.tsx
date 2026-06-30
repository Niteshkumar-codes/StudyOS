/* eslint-disable no-undef */
import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, Loader2, RotateCcw, Clock } from 'lucide-react';

const verifyOtpSchema = z.object({
  email: z
    .string({ message: 'Email address is required' })
    .email('Please enter a valid email address'),
  code: z
    .string({ message: 'Verification code is required' })
    .length(6, 'Verification code must be exactly 6 digits'),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  // Read email passed from Register page, otherwise let them type or fallback
  const passedEmail = location.state?.email || '';

  // Expiration countdown (5 minutes = 300 seconds)
  const [expiresIn, setExpiresIn] = useState(300);
  // Resend cooldown (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(60);

  // 6 separate digit states
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: passedEmail || '',
      code: '',
    },
  });

  const emailValue = watch('email');

  // Timers Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Success bar animation trigger
  useEffect(() => {
    if (isSuccess) {
      const progressTimer = setTimeout(() => setProgress(100), 50);
      return () => clearTimeout(progressTimer);
    }
  }, [isSuccess]);

  // Autofocus first field on mount
  useEffect(() => {
    if (!isSuccess && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    if (!emailValue) {
      toast.error('Please enter your email address first');
      setError('email', { type: 'manual', message: 'Please enter your email' });
      return;
    }

    setIsResending(true);
    try {
      const response = await api.post('/auth/resend-otp', { email: emailValue });
      toast.success(response.data.message || 'Verification code resent!');

      // Reset otp boxes
      setOtpValues(Array(6).fill(''));
      setValue('code', '', { shouldValidate: false });

      // Reset countdowns
      setExpiresIn(300);
      setResendCooldown(60);

      // Focus first cell
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to resend code';
      toast.error(errMsg);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: VerifyOtpFormValues) => {
    if (expiresIn === 0) {
      toast.error('The verification code has expired. Please request a new one.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: data.email,
        code: data.code,
      });

      // Show success animation and trigger countdown redirect
      setIsSuccess(true);
      toast.success('Account verified successfully!');

      // Store session in context
      login(response.data.accessToken, response.data.user);

      // Redirect to dashboard after 2.5s
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (error: any) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          setError(err.field as any, {
            type: 'server',
            message: err.message,
          });
        });
        toast.error('Invalid verification details.');
      } else {
        const errMsg = error.response?.data?.message || 'Verification failed';
        toast.error(errMsg);
        setError('code', { type: 'manual', message: errMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation & digit logic
  const handleChange = (index: number, val: string) => {
    // Only accept numeric inputs
    const cleanValue = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = cleanValue;
    setOtpValues(newOtp);

    // Sync to form
    const finalCode = newOtp.join('');
    setValue('code', finalCode, { shouldValidate: true });

    // Focus next element if digit entered
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Empty box backspace, clear previous cell and focus it
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        setValue('code', newOtp.join(''), { shouldValidate: true });
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current cell
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
        setValue('code', newOtp.join(''), { shouldValidate: true });
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const digits = pastedData
      .replace(/[^0-9]/g, '')
      .slice(0, 6)
      .split('');

    if (digits.length > 0) {
      const newOtp = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtpValues(newOtp);
      const finalCode = newOtp.join('');
      setValue('code', finalCode, { shouldValidate: true });

      // Focus last pasted index or 6th cell
      const focusIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[focusIndex]?.focus();

      // Submit immediately if 6 digits pasted
      if (digits.length === 6) {
        handleSubmit(onSubmit)();
      }
    }
  };

  // Rendering Success State
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 animate-scale-up">
        {/* Animated Checkmark Badge */}
        <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              className="animate-draw"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Activation Successful!
          </h3>
          <p className="text-xs text-zinc-555 dark:text-zinc-400 max-w-xs leading-relaxed font-medium">
            Your StudyOS profile is verified. Initializing your study workspace and blocks...
          </p>
        </div>

        {/* Smooth loading bar */}
        <div className="w-48 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all ease-out"
            style={{ width: `${progress}%`, transitionDuration: '2400ms' }}
          ></div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-[#6366f1] hover:underline flex items-center gap-1.5 focus-visible:outline-none"
        >
          Go to Dashboard now
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Verify your email</h2>
        <p className="text-zinc-550 dark:text-zinc-400 text-xs mt-1.5 font-medium">
          Enter the 6-digit OTP code sent to your inbox
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <Mail className="w-4.5 h-4.5" />
            </span>
            <input
              id="email"
              type="email"
              {...register('email')}
              disabled={!!passedEmail || isSubmitting}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/10 focus:border-[#6366f1] disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="aarav@studyos.com"
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* OTP Input grid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">
              Verification Code
            </label>
            {expiresIn > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-500 select-none animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                Expires in {formatTime(expiresIn)}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-500 select-none">Code Expired</span>
            )}
          </div>

          {/* 6 Digit Box Grid */}
          <div className="grid grid-cols-6 gap-2" role="group" aria-label="OTP digits">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  disabled={isSubmitting || expiresIn === 0}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={otpValues[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  aria-label={`OTP Digit ${i + 1}`}
                  className={`w-full py-3 text-center text-xl font-bold font-mono border rounded-xl bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] focus-visible:ring-2 focus-visible:ring-indigo-500/15 focus:border-[#6366f1] transition-all ${
                    errors.code
                      ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                      : 'border-slate-200 dark:border-[#374151]'
                  }`}
                />
              ))}
          </div>
          {errors.code && (
            <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium text-center">
              {errors.code.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || expiresIn === 0 || watch('code').length !== 6}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6366f1] hover:bg-indigo-650 disabled:opacity-50 disabled:hover:bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500/25 transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Verifying Code...
            </>
          ) : (
            <>
              Verify Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend actions & timers */}
      <div className="pt-4 border-t border-slate-100 dark:border-[#374151]/60 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#6366f1] dark:text-[#6366f1] bg-[#6366f1]/[0.04] hover:bg-[#6366f1]/[0.08] active:scale-95 disabled:scale-100 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed border border-[#6366f1]/20 rounded-xl transition-all"
        >
          {isResending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          Resend Code {resendCooldown > 0 && `(${resendCooldown}s)`}
        </button>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-normal max-w-xs">
          Didn't receive the email? Check your spam folder or trigger a new code once the cooldown
          timer completes.
        </p>
      </div>
    </div>
  );
};
