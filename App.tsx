import React, { useState, useEffect } from 'react';
import { PenTool, Moon, Sun, Settings, X, LogOut, BookOpen, Users, Compass, CheckCircle2 } from 'lucide-react';
import { RoleSelection } from './components/RoleSelection';
import { StudentWorkspace } from './components/StudentWorkspace';
import { TeacherDashboard } from './components/TeacherDashboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from './lib/firebase';
import { ClassSession, getSession } from './lib/db';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // Routing State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  
  const [sessionData, setSessionData] = useState<ClassSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey) setCustomApiKey(savedKey);

    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      setIsLoadingSession(true);
      getSession(currentSessionId).then((sess) => {
        if (sess) setSessionData(sess);
        setIsLoadingSession(false);
      }).catch(err => {
        console.error(err);
        setIsLoadingSession(false);
      });

      const unsub = onSnapshot(doc(firestore, 'sessions', currentSessionId), (docSnap) => {
        if (docSnap.exists()) {
          setSessionData({ id: docSnap.id, ...docSnap.data() } as ClassSession);
        }
        setIsLoadingSession(false);
      });
      return () => unsub();
    } else {
      setSessionData(null);
    }
  }, [currentSessionId]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleJoinSession = (sessionId: string, studentId: string) => {
    setCurrentSessionId(sessionId);
    setCurrentStudentId(studentId);
    setIsTeacher(false);
  };

  const handleCreateSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setCurrentStudentId(null);
    setIsTeacher(true);
  };

  const handleLogout = () => {
    setCurrentSessionId(null);
    setCurrentStudentId(null);
    setIsTeacher(false);
    setSessionData(null);
  };

  return (
    <div className="min-h-screen bg-academic-50 dark:bg-[#0C0D0E] text-academic-900 dark:text-stone-100 selection:bg-burgundy-800 selection:text-white transition-colors duration-200">
      
      {/* 3-Zone Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#121316]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Branding */}
          <div className="flex items-center shrink-0">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-stone-900 dark:text-white">Kitabah Insya'</span>
          </div>

          {/* Zone 2: Navigation / Active Context (Unboxed metadata) */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-stone-600 dark:text-stone-300">
            {currentSessionId && (
              <div className="flex items-center gap-1.5 sm:gap-2 font-medium">
                <span className="text-stone-500 dark:text-stone-400 hidden xs:inline">Kelas:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{currentSessionId}</span>
                <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">·</span>
                <span className="text-stone-700 dark:text-stone-300 truncate max-w-[60px] sm:max-w-none">{isTeacher ? 'Guru' : 'Siswa'}</span>
                {sessionData?.themeId && (
                  <>
                    <span className="text-stone-300 dark:text-stone-700" aria-hidden="true">·</span>
                    <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">{sessionData.themeId}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {currentSessionId && (
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-burgundy-700 dark:hover:text-burgundy-400 rounded-lg transition-colors"
                title="Keluar ke Menu Utama"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Keluar</span>
              </button>
            )}
            
            <button 
              onClick={toggleDarkMode} 
              className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white rounded-lg transition-colors"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-1.5 sm:p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white rounded-lg transition-colors"
              title="Pengaturan Kunci API"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-12">
        {!currentSessionId ? (
          <RoleSelection onJoinSession={handleJoinSession} onCreateSession={handleCreateSession} />
        ) : isTeacher ? (
          sessionData ? (
            <TeacherDashboard session={sessionData} isDarkMode={isDarkMode} onExit={handleLogout} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-stone-300 border-t-burgundy-800 rounded-full animate-spin" />
              <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                Menghubungkan ke Studio Pengajaran...
              </p>
            </div>
          )
        ) : (
          currentStudentId && (
            <StudentWorkspace 
              sessionId={currentSessionId} 
              studentId={currentStudentId} 
              isDarkMode={isDarkMode} 
              onExit={handleLogout}
            />
          )
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800">
            <div className="p-6 pb-3 flex justify-between items-center border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-semibold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-stone-500" /> Pengaturan Sistem
              </h2>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Custom Gemini API Key (Opsional)
                </label>
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={customApiKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomApiKey(val);
                    localStorage.setItem('geminiApiKey', val);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30 font-mono text-xs"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
                  Secara default aplikasi menggunakan proxy backend server. Kunci disimpan lokal di browser jika Anda ingin menggunakan kuota mandiri.
                </p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-semibold text-xs transition-colors"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
