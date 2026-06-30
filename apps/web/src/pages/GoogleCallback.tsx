import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error('Google authentication failed. No token received.');
        navigate('/login');
        return;
      }

      try {
        // Fetch user profile using the newly received token (using headers parameter)
        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Set login details in context
        login(token, response.data.user);
        toast.success('Successfully authenticated with Google!');
        navigate('/profile');
      } catch (error) {
        toast.error('Failed to retrieve user profile after Google login.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Completing Google Sign In
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Syncing profile metadata from Google, please hold on...
        </p>
      </div>
    </div>
  );
};
