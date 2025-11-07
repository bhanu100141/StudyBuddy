'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, X } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
};

export default function FocusModePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access Focus Mode');
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (settings.soundEnabled) {
      playSound();
    }

    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      if (newSessionsCompleted % settings.longBreakInterval === 0) {
        toast.success('Focus session complete! Time for a long break');
        if (settings.autoStartBreaks) {
          switchMode('longBreak', true);
        } else {
          switchMode('longBreak', false);
        }
      } else {
        toast.success('Focus session complete! Time for a short break');
        if (settings.autoStartBreaks) {
          switchMode('shortBreak', true);
        } else {
          switchMode('shortBreak', false);
        }
      }
    } else {
      toast.success('Break complete! Ready for another focus session?');
      if (settings.autoStartFocus) {
        switchMode('focus', true);
      } else {
        switchMode('focus', false);
      }
    }
  };

  const playSound = () => {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const switchMode = (newMode: TimerMode, autoStart: boolean = false) => {
    setMode(newMode);
    setIsRunning(false);

    let newTime;
    switch (newMode) {
      case 'focus':
        newTime = settings.focusTime * 60;
        break;
      case 'shortBreak':
        newTime = settings.shortBreakTime * 60;
        break;
      case 'longBreak':
        newTime = settings.longBreakTime * 60;
        break;
    }

    setTimeLeft(newTime);

    if (autoStart) {
      setTimeout(() => setIsRunning(true), 100);
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    let newTime;
    switch (mode) {
      case 'focus':
        newTime = settings.focusTime * 60;
        break;
      case 'shortBreak':
        newTime = settings.shortBreakTime * 60;
        break;
      case 'longBreak':
        newTime = settings.longBreakTime * 60;
        break;
    }
    setTimeLeft(newTime);
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    handleReset();
    toast.success('Settings saved');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let totalTime;
    switch (mode) {
      case 'focus':
        totalTime = settings.focusTime * 60;
        break;
      case 'shortBreak':
        totalTime = settings.shortBreakTime * 60;
        break;
      case 'longBreak':
        totalTime = settings.longBreakTime * 60;
        break;
    }
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return 'bg-blue-600';
      case 'shortBreak':
        return 'bg-green-600';
      case 'longBreak':
        return 'bg-purple-600';
    }
  };

  const getModeTextColor = () => {
    switch (mode) {
      case 'focus':
        return 'text-blue-600';
      case 'shortBreak':
        return 'text-green-600';
      case 'longBreak':
        return 'text-purple-600';
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="dark:bg-slate-900 bg-white shadow border-b dark:border-slate-800 border-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">Focus Mode</h1>
              <p className="mt-2 text-sm dark:text-gray-400 text-gray-600">Pomodoro timer to boost your productivity</p>
            </div>
            <button
              onClick={() => { router.back(); }}
              className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="dark:bg-slate-900 bg-white rounded-2xl shadow-xl dark:shadow-slate-950 p-8 sm:p-12 border dark:border-slate-800 border-transparent">
          {/* Mode Tabs */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <button
              onClick={() => switchMode('focus')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                mode === 'focus'
                  ? 'bg-blue-600 text-white'
                  : 'dark:bg-slate-800 bg-gray-100 dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-200'
              }`}
            >
              <Brain className="w-5 h-5 inline mr-2" />
              Focus
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                mode === 'shortBreak'
                  ? 'bg-green-600 text-white'
                  : 'dark:bg-slate-800 bg-gray-100 dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-200'
              }`}
            >
              <Coffee className="w-5 h-5 inline mr-2" />
              Short Break
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                mode === 'longBreak'
                  ? 'bg-purple-600 text-white'
                  : 'dark:bg-slate-800 bg-gray-100 dark:text-gray-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-200'
              }`}
            >
              <Coffee className="w-5 h-5 inline mr-2" />
              Long Break
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative mb-12">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
              {/* Progress Circle */}
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={getModeColor().replace('bg-', '#')}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * (0.45 * (window.innerWidth > 640 ? 320 : 256))}`}
                  strokeDashoffset={`${
                    2 * Math.PI * (0.45 * (window.innerWidth > 640 ? 320 : 256)) * (1 - getProgress() / 100)
                  }`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    stroke: mode === 'focus' ? '#2563EB' : mode === 'shortBreak' ? '#10B981' : '#9333EA',
                  }}
                />
              </svg>

              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-6xl sm:text-7xl font-bold ${getModeTextColor()}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="dark:text-gray-400 text-gray-500 text-lg mt-2 capitalize">{mode.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleStartPause}
              className={`${getModeColor()} hover:opacity-90 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Start
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="dark:bg-slate-700 bg-gray-200 dark:hover:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-800 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <RotateCcw className="w-6 h-6" />
              Reset
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="dark:bg-slate-700 bg-gray-200 dark:hover:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-800 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="text-center">
            <p className="dark:text-gray-400 text-gray-600 text-lg">
              Focus sessions completed: <span className="font-bold dark:text-white text-gray-900">{sessionsCompleted}</span>
            </p>
            <p className="text-sm dark:text-gray-500 text-gray-500 mt-2">
              {sessionsCompleted > 0 && sessionsCompleted % settings.longBreakInterval === 0
                ? 'Great job! Time for a long break'
                : `${settings.longBreakInterval - (sessionsCompleted % settings.longBreakInterval)} more until long break`}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 dark:bg-black/70 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg shadow-xl max-w-md w-full border dark:border-slate-800 border-transparent">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white text-gray-900">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="dark:text-gray-400 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Focus Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.focusTime}
                    onChange={(e) => setSettings({ ...settings, focusTime: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    min="1"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.shortBreakTime}
                    onChange={(e) => setSettings({ ...settings, shortBreakTime: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakTime}
                    onChange={(e) => setSettings({ ...settings, longBreakTime: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    min="1"
                    max="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Long Break Interval
                  </label>
                  <input
                    type="number"
                    value={settings.longBreakInterval}
                    onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    min="1"
                    max="10"
                  />
                  <p className="text-xs dark:text-gray-500 text-gray-500 mt-1">Number of focus sessions before long break</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoStartBreaks"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                    className="w-4 h-4 text-blue-600 dark:border-slate-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoStartBreaks" className="ml-2 text-sm dark:text-gray-300 text-gray-700">
                    Auto-start breaks
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoStartFocus"
                    checked={settings.autoStartFocus}
                    onChange={(e) => setSettings({ ...settings, autoStartFocus: e.target.checked })}
                    className="w-4 h-4 text-blue-600 dark:border-slate-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoStartFocus" className="ml-2 text-sm dark:text-gray-300 text-gray-700">
                    Auto-start focus sessions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 dark:border-slate-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="soundEnabled" className="ml-2 text-sm dark:text-gray-300 text-gray-700">
                    Play sound when timer ends
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 dark:bg-primary-600 bg-blue-600 dark:hover:bg-primary-700 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 dark:bg-slate-700 bg-gray-200 dark:hover:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-800 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
