import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.get('/auth/google/status');
      if (response.data.configured) {
        window.location.href = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
      } else {
        toast.error('Google Sign-In is not configured in this development environment.');
      }
    } catch (error) {
      toast.error('Google Sign-In is not configured in this development environment.');
    } finally {
      setIsSubmitting(false);
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

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full h-14 relative flex items-center justify-center border border-slate-200 dark:border-[#374151] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-zinc-700 dark:text-[#f9fafb] rounded-xl font-bold text-sm transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="absolute left-5 flex items-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.99 0 12 0 7.354 0 3.307 2.67 1.332 6.577L5.266 9.765z" />
            <path fill="#4285F4" d="M23.49 12.275c0-.825-.075-1.616-.211-2.385H12v4.512h6.446c-.277 1.464-1.102 2.705-2.345 3.541l3.647 2.827c2.132-1.966 3.738-4.858 3.738-8.495z" />
            <path fill="#FBBC05" d="M5.266 14.235L1.332 17.42c1.975 3.91 6.022 6.58 10.668 6.58 3.036 0 5.823-1.004 7.828-2.732l-3.647-2.827c-1.164.78-2.65 1.25-4.181 1.25-3.328 0-6.141-2.254-7.147-5.266L5.266 14.235z" />
            <path fill="#34A853" d="M12 24c5.4 0 9.932-1.79 13.245-4.858l-3.647-2.827c-1.102.739-2.518 1.185-4.181 1.185-3.328 0-6.141-2.254-7.147-5.266L1.332 6.577C3.307 10.485 7.354 13.09 12 13.09z" transform="matrix(1 0 0 -1 0 24)" />
          </svg>
        </div>
        <span>Continue with Google</span>
      </button>

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
