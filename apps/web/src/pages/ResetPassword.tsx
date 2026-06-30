import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string({ message: 'Confirm Password is required' })
      .min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract reset token & email from query params
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password') || '';

  // Password strength helper (Updated to match min 8 chars, 1 letter, 1 number)
  const evaluatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: 'None', color: 'bg-zinc-200 dark:bg-zinc-800' };
    if (pass.length >= 8) score++;
    if (/[a-zA-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;

    const levels = [
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Medium', color: 'bg-amber-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
    ];

    return {
      score,
      label: levels[score - 1]?.label || 'Weak',
      color: levels[score - 1]?.color || 'bg-red-500',
    };
  };

  const strength = evaluatePasswordStrength(password);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || !email) {
      toast.error('Invalid password reset session. Please request a new link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password: data.password,
      });

      toast.success(response.data.message || 'Password reset successful!');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          setError(err.field as any, {
            type: 'server',
            message: err.message,
          });
        });
        toast.error('Please fix validation errors.');
      } else {
        const errMsg =
          error.response?.data?.message || 'Failed to reset password. Link may be expired.';
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Choose a new password
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 font-medium">
          Set your new password to restore account access
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              className={`w-full pl-11 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-650 dark:hover:text-[#f9fafb] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 && (
            <div className="mt-2.5 space-y-1.5 p-2.5 bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-[#374151] rounded-xl">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Password Strength:
                </span>
                <span className="font-bold text-zinc-700 dark:text-[#f9fafb]">
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {errors.password && (
            <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <Lock className="w-4.5 h-4.5" />
            </span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              className={`w-full pl-11 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-650 dark:hover:text-[#f9fafb] transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6366f1] hover:bg-indigo-650 disabled:opacity-75 disabled:hover:bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-md shadow-[#6366f1]/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#6366f1]/25 transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
