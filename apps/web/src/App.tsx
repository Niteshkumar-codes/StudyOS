import { Button, Card } from '@studyos/ui';
import { calculateSM2 } from '@studyos/utils';
import type { User } from '@studyos/types';

export default function App() {
  // Demo data matching types package declarations
  const mockUser: User = {
    id: '1',
    name: 'Aarav Mehta',
    email: 'aarav@studyos.com',
    xp: 250,
    level: 2,
    streakCount: 12,
    createdAt: new Date().toISOString(),
  };

  // Demo calculation using utils package
  const sm2Result = calculateSM2(4, 1, 2.5, 3);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-indigo-400">StudyOS</h1>
          <p className="text-slate-400 mt-2">Your Complete Preparation Operating System</p>
        </header>

        <Card glass={true} className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-semibold">{mockUser.name}</h2>
              <p className="text-sm text-slate-400">{mockUser.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
                Level {mockUser.level}
              </span>
              <p className="text-xs text-slate-500 mt-1">{mockUser.xp} XP total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-slate-400">Current Streak</p>
              <p className="text-lg font-bold text-amber-400">🔥 {mockUser.streakCount} Days</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-xs text-slate-400">SM-2 Spaced Repetition Test</p>
              <p className="text-sm font-semibold text-emerald-400">
                Next Review: {sm2Result.intervalDays} days (EF: {sm2Result.easeFactor})
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary">Settings</Button>
            <Button variant="primary">Start Study Block</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
