import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email address is required' })
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      toast.success(response.data.message || 'Reset link sent!');
      setSubmitted(true);
    } catch (error: any) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          setError(err.field as any, {
            type: 'server',
            message: err.message,
          });
        });
        toast.error('Please resolve validation errors.');
      } else {
        const errMsg = error.response?.data?.message || 'Failed to request password reset link';
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reset your password</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 font-medium">
          We'll send you an email with instructions to reset your password
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-405 mb-1.5 uppercase tracking-wider"
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
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/25 focus:border-[#6366f1] ${
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6366f1] hover:bg-indigo-650 disabled:opacity-75 disabled:hover:bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500/25 transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 animate-scale-up">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">Check your inbox</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed font-medium">
              We've dispatched a secure recovery link. Follow the URL inside to configure a new
              password.
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="text-center pt-3.5 border-t border-slate-100 dark:border-[#374151]/60">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#6366f1] dark:hover:text-[#6366f1] font-bold transition-colors focus-visible:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};
