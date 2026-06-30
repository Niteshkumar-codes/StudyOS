import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  loginId: z
    .string({ message: 'Email or Username is required' })
    .min(1, 'Please enter your email or username'),
  password: z.string({ message: 'Password is required' }).min(1, 'Please enter your password'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: localStorage.getItem('rememberedEmail') || '',
      password: '',
      rememberMe: !!localStorage.getItem('rememberedEmail'),
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', {
        loginId: data.loginId,
        password: data.password,
      });

      // Save email for remember me
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.loginId);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('Welcome back to StudyOS!');

      // Store session in context
      login(response.data.accessToken, response.data.user);

      // Redirect to profile
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.verified === false) {
        // Redirect to OTP verify page
        toast.error('Your account is not verified yet. Sending a new verification code.');
        navigate('/verify-otp', { state: { email: error.response.data.email } });
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          setError(err.field as any, {
            type: 'server',
            message: err.message,
          });
        });
        toast.error('Please correct the validation errors.');
      } else if (error.response?.status === 401) {
        setError('loginId', { type: 'manual', message: 'Invalid credentials' });
        setError('password', {
          type: 'manual',
          message: 'Please check your email/username and password',
        });
        toast.error('Invalid credentials. Please try again.');
      } else {
        const errMsg =
          error.response?.data?.message || 'Login failed. Please check your credentials.';
        toast.error(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In missing credentials check
  const handleGoogleLogin = async () => {
    try {
      const response = await api.get('/auth/google/status');
      if (response.data.configured) {
        window.location.href = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
      } else {
        toast.error('Google Sign-In is not configured in this development environment.');
      }
    } catch (error) {
      toast.error('Google Sign-In is not configured in this development environment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sign in to StudyOS</h2>
        <p className="text-zinc-550 dark:text-zinc-400 text-xs mt-1.5 font-medium">
          Welcome back! Sign in to resume your study routines
        </p>
      </div>

      {/* Redesigned 56px Height Premium Google Auth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full h-14 relative flex items-center justify-center border border-slate-200 dark:border-[#374151] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-zinc-700 dark:text-[#f9fafb] rounded-xl font-bold text-sm transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="absolute left-5 flex items-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.307 2.67 1.332 6.577L5.266 9.765z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.275c0-.825-.075-1.616-.211-2.385H12v4.512h6.446c-.277 1.464-1.102 2.705-2.345 3.541l3.647 2.827c2.132-1.966 3.738-4.858 3.738-8.495z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 14.235L1.332 17.42c1.975 3.91 6.022 6.58 10.668 6.58 3.036 0 5.823-1.004 7.828-2.732l-3.647-2.827c-1.164.78-2.65 1.25-4.181 1.25-3.328 0-6.141-2.254-7.147-5.266L5.266 14.235z"
            />
            <path
              fill="#34A853"
              d="M12 24c5.4 0 9.932-1.79 13.245-4.858l-3.647-2.827c-1.102.739-2.518 1.185-4.181 1.185-3.328 0-6.141-2.254-7.147-5.266L1.332 6.577C3.307 10.485 7.354 13.09 12 13.09z"
              transform="matrix(1 0 0 -1 0 24)"
            />
          </svg>
        </div>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center py-0.5">
        <div className="border-t border-slate-200 dark:border-[#374151] w-full absolute"></div>
        <span className="relative bg-white dark:bg-[#1f2937] px-3.5 text-xs text-zinc-400 dark:text-zinc-500 font-bold select-none uppercase tracking-wider text-[9px]">
          or sign in with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label
            htmlFor="loginId"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Email or Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <Mail className="w-4.5 h-4.5" />
            </span>
            <input
              id="loginId"
              type="text"
              {...register('loginId')}
              disabled={isSubmitting}
              aria-invalid={!!errors.loginId}
              aria-describedby={errors.loginId ? 'loginId-error' : undefined}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.loginId
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-205 dark:border-[#374151]'
              }`}
              placeholder="Username or email"
            />
          </div>
          {errors.loginId && (
            <p id="loginId-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.loginId.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#6366f1] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
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
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full pl-11 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-205 dark:border-[#374151]'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-[#f9fafb] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-slate-300 dark:border-[#374151] text-[#6366f1] focus:ring-[#6366f1]/25 accent-[#6366f1] bg-white dark:bg-[#111827]"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2.5 text-xs text-zinc-500 dark:text-zinc-400 select-none font-medium"
          >
            Remember me
          </label>
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
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </form>

      {/* Register Redirect */}
      <div className="text-center pt-3.5 border-t border-slate-100 dark:border-[#374151]/60">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          New to StudyOS?{' '}
          <Link to="/register" className="text-[#6366f1] hover:underline font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
