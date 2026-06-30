import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Compass,
  Mail,
  Loader2,
  Sparkles,
  Flame,
  Award,
  Save,
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

const profileSchema = z
  .object({
    name: z
      .string({ message: 'Full Name is required' })
      .min(2, 'Please enter your name (at least 2 characters)'),
    username: z
      .string({ message: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed'),
    preparationTypes: z
      .array(z.string(), { message: 'Select at least one preparation type' })
      .min(1, 'Select at least one preparation type'),
    customPrepType: z.string().optional(),
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

type ProfileFormValues = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  // Separate standard options and custom options from existing user profile data
  const initialPreps = user?.preparationTypes || [];
  const standardOptions = PREPARATION_OPTIONS.filter((o) => o !== 'Other');

  const initialSelectedStandard = initialPreps.filter((p) => standardOptions.includes(p));
  const initialCustom = initialPreps.find((p) => !standardOptions.includes(p)) || '';

  const defaultSelectedPreps = [...initialSelectedStandard];
  if (initialCustom) {
    defaultSelectedPreps.push('Other');
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      preparationTypes: defaultSelectedPreps,
      customPrepType: initialCustom || '',
    },
  });

  const selectedPreps = watch('preparationTypes') || [];

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

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      // Map 'Other' back to the custom text field value
      const mappedPreps = data.preparationTypes.map((p) =>
        p === 'Other' ? data.customPrepType || 'Other' : p,
      );

      const response = await api.put('/profile', {
        name: data.name,
        username: data.username,
        preparationTypes: mappedPreps,
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
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
        const errMsg = error.response?.data?.message || 'Failed to update profile';
        toast.error(errMsg);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to extract user initials for avatar placeholder
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in text-zinc-900 dark:text-[#f9fafb]">
      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200/80 dark:border-[#374151] p-6 md:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 transition-colors duration-300">
        {/* Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#6366f1] to-pink-500 flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold shadow-md shadow-[#6366f1]/10 select-none">
          {getInitials(user.name)}
        </div>

        {/* Text Details */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-[#f9fafb]">
              {user.name}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">@{user.username}</p>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto md:mx-0">
            {/* Streak */}
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex flex-col items-center select-none">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-base font-extrabold mt-1 text-zinc-900 dark:text-[#f9fafb]">
                {user.streakCount}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Streak
              </span>
            </div>

            {/* Level */}
            <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex flex-col items-center select-none">
              <Award className="w-4 h-4 text-[#6366f1]" />
              <span className="text-base font-extrabold mt-1 text-zinc-900 dark:text-[#f9fafb]">
                {user.level}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Level
              </span>
            </div>

            {/* XP */}
            <div className="p-2.5 bg-purple-500/5 border border-purple-500/15 rounded-xl flex flex-col items-center select-none">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-base font-extrabold mt-1 text-zinc-900 dark:text-[#f9fafb]">
                {user.xp}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200/80 dark:border-[#374151] p-6 md:p-8 rounded-2xl shadow-sm transition-colors duration-300">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-[#f9fafb] mb-6">
          Profile Settings
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
                  <UserIcon className="w-4.5 h-4.5" />
                </span>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  disabled={isUpdating}
                  aria-invalid={!!errors.name}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/10 focus:border-[#6366f1] ${
                    errors.name
                      ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                      : 'border-slate-200 dark:border-[#374151]'
                  }`}
                  placeholder="Full name"
                />
              </div>
              {errors.name && (
                <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
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
                  disabled={isUpdating}
                  aria-invalid={!!errors.username}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/10 focus:border-[#6366f1] ${
                    errors.username
                      ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                      : 'border-slate-200 dark:border-[#374151]'
                  }`}
                  placeholder="Username"
                />
              </div>
              {errors.username && (
                <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-400 mb-1.5 uppercase tracking-wider select-none">
              Email Address (Cannot be modified)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none select-none">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-slate-200/60 dark:border-[#374151]/80 rounded-xl text-sm bg-slate-50 dark:bg-[#111827]/40 text-zinc-400 dark:text-zinc-550 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Preparation Types Selector */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-550 dark:text-zinc-400 mb-2.5 uppercase tracking-wider">
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
                    disabled={isUpdating}
                    aria-pressed={selected}
                    className={`py-2 px-2.5 text-xs font-semibold rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-[#6366f1]/25 ${
                      selected
                        ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-sm shadow-[#6366f1]/10'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] text-zinc-650 dark:text-zinc-400 hover:border-[#6366f1] dark:hover:border-[#6366f1]'
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
                className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
              >
                Custom Exam Name
              </label>
              <input
                id="customPrepType"
                type="text"
                disabled={isUpdating}
                {...register('customPrepType')}
                aria-invalid={!!errors.customPrepType}
                className={`w-full px-4 py-3 border rounded-xl text-sm bg-white dark:bg-[#111827] text-zinc-900 dark:text-[#f9fafb] placeholder-zinc-450 dark:placeholder-zinc-500 transition-colors focus-visible:ring-2 focus-visible:ring-[#6366f1]/10 focus:border-[#6366f1] ${
                  errors.customPrepType
                    ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500/10'
                    : 'border-slate-200 dark:border-[#374151]'
                }`}
                placeholder="e.g. GRE, GMAT, IELTS"
              />
              {errors.customPrepType && (
                <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.customPrepType.message}
                </p>
              )}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 py-3 px-6 bg-[#6366f1] hover:bg-indigo-650 disabled:opacity-75 disabled:hover:bg-[#6366f1] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/10 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500/25 transition-all"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
