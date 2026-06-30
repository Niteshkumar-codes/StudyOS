import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Compass,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from 'lucide-react';

const PREPARATION_OPTIONS = [
  'Placement Preparation',
  'GATE',
  'Semester Exam',
  'CAT',
  'UPSC',
  'SSC',
  'Banking',
  'Railway',
  'State PSC',
  'CUET',
  'Other',
];

const registerSchema = z
  .object({
    name: z
      .string({ message: 'Full Name is required' })
      .min(2, 'Please enter your full name (at least 2 characters)'),
    username: z
      .string({ message: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
    email: z
      .string({ message: 'Email address is required' })
      .email('Please enter a valid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z
      .string({ message: 'Confirm Password is required' })
      .min(1, 'Confirm Password is required'),
    preparationTypes: z
      .array(z.string(), { message: 'Please select at least one preparation type' })
      .min(1, 'Please select at least one preparation type'),
    customPrepType: z.string().optional(),
    termsAcceptance: z
      .boolean({ message: 'Please accept Terms & Conditions' })
      .refine((val) => val === true, 'Please accept Terms & Conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.preparationTypes.includes('Other')) {
        return !!data.customPrepType && data.customPrepType.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Please enter custom exam name',
      path: ['customPrepType'],
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Username availability state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      preparationTypes: [],
      customPrepType: '',
      termsAcceptance: false,
    },
  });

  const username = watch('username');
  const password = watch('password') || '';
  const selectedPreps = watch('preparationTypes') || [];

  // 1. Debounced Username Availability Check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await api.get(`/auth/check-username?username=${username}`);
        setUsernameAvailable(response.data.available);
      } catch (err) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // 2. Password Strength Evaluation (Updated for min 8 chars, 1 letter, 1 number)
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

  const togglePrepType = (prep: string) => {
    if (selectedPreps.includes(prep)) {
      setValue(
        'preparationTypes',
        selectedPreps.filter((p) => p !== prep),
        { shouldValidate: true },
      );
    } else {
      setValue('preparationTypes', [...selectedPreps, prep], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (usernameAvailable === false) {
      toast.error('Username is already taken. Please choose another.');
      setError('username', { type: 'manual', message: 'Username is already taken' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Map 'Other' option to custom exam name if selected
      const mappedPreps = data.preparationTypes.map((p) =>
        p === 'Other' ? data.customPrepType || 'Other' : p,
      );

      // Pass ALL required fields to the backend body to make registration succeed
      const response = await api.post('/auth/register', {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        preparationTypes: mappedPreps,
        termsAcceptance: data.termsAcceptance,
      });

      if (response.data.smtpConfigured === false) {
        toast.success(
          'Verification email is not configured in development. OTP has been logged to the backend console.',
          { duration: 6000 },
        );
      } else {
        toast.success('Registration initiated. OTP code sent to your email!');
      }

      // Redirect to OTP verification page
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error: any) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: any) => {
          setError(err.field as any, {
            type: 'server',
            message: err.message,
          });
        });
        toast.error('Please fix the highlighted errors in the form.');
      } else {
        const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
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
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create your account</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 font-medium">
          Join StudyOS to organize your preparation blocks
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
          or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <User className="w-4.5 h-4.5" />
            </span>
            <input
              id="name"
              type="text"
              {...register('name')}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="e.g. Aarav Mehta"
            />
          </div>
          {errors.name && (
            <p id="name-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
              <Compass className="w-4.5 h-4.5" />
            </span>
            <input
              id="username"
              type="text"
              {...register('username')}
              disabled={isSubmitting}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className={`w-full pl-11 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.username
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="aarav_m"
            />
            {/* Real-time username check state */}
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {checkingUsername && <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" />}
              {!checkingUsername && username && usernameAvailable === true && (
                <Check className="w-4.5 h-4.5 text-emerald-500" />
              )}
              {!checkingUsername && username && usernameAvailable === false && (
                <X className="w-4.5 h-4.5 text-red-500" />
              )}
            </span>
          </div>
          {errors.username && (
            <p id="username-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.username.message}
            </p>
          )}
          {!errors.username && username && username.length >= 3 && usernameAvailable === true && (
            <p className="text-emerald-500 text-xs mt-1.5 font-medium">Username is available</p>
          )}
          {!errors.username && username && username.length >= 3 && usernameAvailable === false && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">Username is already taken</p>
          )}
        </div>

        {/* Email */}
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
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="aarav@studyos.com"
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            Password
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
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`w-full pl-11 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
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
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-[#f9fafb] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Password strength indicator */}
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
              <ul className="text-[10px] grid grid-cols-2 gap-x-3 gap-y-1 text-zinc-400 dark:text-zinc-500 mt-1">
                <li className={password.length >= 8 ? 'text-emerald-500 font-semibold' : ''}>
                  ✓ Min 8 characters
                </li>
                <li className={/[a-zA-Z]/.test(password) ? 'text-emerald-500 font-semibold' : ''}>
                  ✓ At least one letter
                </li>
                <li className={/[0-9]/.test(password) ? 'text-emerald-500 font-semibold' : ''}>
                  ✓ At least one number
                </li>
              </ul>
            </div>
          )}
          {errors.password && (
            <p id="password-error" role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
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
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
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
            <p
              id="confirmPassword-error"
              role="alert"
              className="text-red-500 text-xs mt-1.5 font-medium"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Preparation Types Selector */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-450 mb-2 uppercase tracking-wider">
            Target Examinations (Select Multiple)
          </label>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="group"
            aria-label="Target examinations"
          >
            {PREPARATION_OPTIONS.map((prep) => {
              const selected = selectedPreps.includes(prep);
              return (
                <button
                  key={prep}
                  type="button"
                  onClick={() => togglePrepType(prep)}
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#6366f1]/25 ${
                    selected
                      ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-sm shadow-[#6366f1]/10'
                      : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] text-zinc-600 dark:text-zinc-400 hover:border-[#6366f1] dark:hover:border-[#6366f1]'
                  }`}
                >
                  {prep}
                </button>
              );
            })}
          </div>
          {errors.preparationTypes && (
            <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
              {errors.preparationTypes.message}
            </p>
          )}
        </div>

        {/* Custom Exam Input */}
        {selectedPreps.includes('Other') && (
          <div className="animate-fade-in-up duration-150">
            <label
              htmlFor="customPrepType"
              className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
            >
              Custom Exam Name
            </label>
            <input
              id="customPrepType"
              type="text"
              disabled={isSubmitting}
              {...register('customPrepType')}
              aria-invalid={!!errors.customPrepType}
              aria-describedby={errors.customPrepType ? 'customPrep-error' : undefined}
              className={`w-full px-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/20 focus:border-[#6366f1] ${
                errors.customPrepType
                  ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                  : 'border-slate-200 dark:border-[#374151]'
              }`}
              placeholder="e.g. GRE, GMAT, IELTS"
            />
            {errors.customPrepType && (
              <p
                id="customPrep-error"
                role="alert"
                className="text-red-500 text-xs mt-1.5 font-medium"
              >
                {errors.customPrepType.message}
              </p>
            )}
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="termsAcceptance"
            {...register('termsAcceptance')}
            disabled={isSubmitting}
            aria-invalid={!!errors.termsAcceptance}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-[#374151] text-[#6366f1] focus:ring-[#6366f1]/25 accent-[#6366f1] bg-white dark:bg-[#111827]"
          />
          <label
            htmlFor="termsAcceptance"
            className="text-xs text-zinc-550 dark:text-zinc-400 leading-normal select-none font-medium"
          >
            I accept the{' '}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#6366f1] hover:underline font-semibold"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#6366f1] hover:underline font-semibold"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.termsAcceptance && (
          <p role="alert" className="text-red-500 text-xs mt-1 font-medium">
            {errors.termsAcceptance.message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6366f1] hover:bg-indigo-650 disabled:opacity-75 disabled:hover:bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-md shadow-[#6366f1]/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#6366f1]/25 transition-all duration-150"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              Registering Account...
            </>
          ) : (
            <>
              Register Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Redirect Footer */}
      <div className="text-center pt-3.5 border-t border-slate-100 dark:border-[#374151]/60">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6366f1] hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
