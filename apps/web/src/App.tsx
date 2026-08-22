import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './router';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { GoogleCallback } from './pages/GoogleCallback';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Exams } from './pages/Exams';
import { ExamDetails } from './pages/ExamDetails';
import { Subjects } from './pages/Subjects';
import { Planner } from './pages/Planner';
import { StudyTimer } from './pages/StudyTimer';
import { Analytics } from './pages/Analytics';
import { NotesWorkspace } from './pages/NotesWorkspace';
import { ExamProvider } from './contexts/ExamContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ExamProvider>
            <BrowserRouter>
            <Routes>
              {/* Public Routes with AuthLayout (forms) */}
              <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {/* OTP verification removed from normal flow */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/google-callback" element={<GoogleCallback />} />
                </Route>
              </Route>

              {/* Protected Routes with AppLayout (header, level, streak info) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/exams" element={<Exams />} />
                  <Route path="/exams/:examId" element={<ExamDetails />} />
                  <Route path="/subjects" element={<Subjects />} />
                  <Route path="/syllabus" element={<Subjects />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/timer" element={<StudyTimer />} />
                  <Route path="/notes" element={<NotesWorkspace />} />
                  <Route path="/mock-tests" element={<PlaceholderPage title="Mock Tests" description="Practice with simulated test environments and previous year papers." />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/reports" element={<PlaceholderPage title="Reports" description="Generate performance reports and study log summaries." />} />
                  <Route path="/settings" element={<PlaceholderPage title="Settings" description="Customize your profile, notification rules, and system theme preferences." />} />
                </Route>
              </Route>

              {/* Development-only preview route */}
              {((import.meta as any).env?.DEV) && (
                <Route element={<AppLayout />}>
                  <Route path="/dev/dashboard" element={<Dashboard />} />
                </Route>
              )}

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>

          {/* Toast Notification Provider */}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                'dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-800/80',
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
          </ExamProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
