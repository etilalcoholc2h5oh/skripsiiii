import React, { useState, useEffect } from 'react';
import { createSession, joinSession, verifyTeacherAccess, subscribeToAllSessions, StudentProgress, ClassSession } from '../lib/db';
import { doc, getDoc, firestore } from '../lib/firebase';
import { THEMES } from '../data';
import { 
  Users, BookOpen, ArrowRight, AlertCircle, 
  Clock, Trash2, GraduationCap, PenTool, Eye, EyeOff,
  Search, MessageCircle
} from 'lucide-react';

interface RoleSelectionProps {
  onJoinSession: (sessionId: string, studentId: string) => void;
  onCreateSession: (sessionId: string) => void;
}

interface SavedSessionItem {
  sessionId: string;
  themeId: string;
  teacherName?: string;
  teacherPin?: string;
  studentName?: string;
  studentId?: string;
  timestamp: number;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onJoinSession, onCreateSession }) => {
  const [mainMode, setMainMode] = useState<'kbm' | 'mandiri'>('kbm');
  const [kbmRole, setKbmRole] = useState<'student' | 'teacher' | null>(null);
  const [teacherTab, setTeacherTab] = useState<'existing' | 'create'>('create');
  
  // Student KBM Form
  const [studentName, setStudentName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  
  // Teacher KBM Form - Create
  const [teacherName, setTeacherName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [teacherPin, setTeacherPin] = useState('3103');
  const [isCreating, setIsCreating] = useState(false);

  // Teacher KBM Form - Existing
  const [existingTeacherCode, setExistingTeacherCode] = useState('');
  const [existingTeacherPin, setExistingTeacherPin] = useState('');
  const [showExistingPin, setShowExistingPin] = useState(false);
  const [isEnteringExisting, setIsEnteringExisting] = useState(false);
  const [existingCodeError, setExistingCodeError] = useState<string | null>(null);

  // Mandiri (Solo) Form
  const [soloStudentName, setSoloStudentName] = useState('');
  const [soloFilter, setSoloFilter] = useState('');

  // Local Storage Saved Sessions with status
  const [savedTeacherSessions, setSavedTeacherSessions] = useState<SavedSessionItem[]>([]);
  const [savedStudentSessions, setSavedStudentSessions] = useState<SavedSessionItem[]>([]);
  const [savedSoloSessions, setSavedSoloSessions] = useState<SavedSessionItem[]>([]);
  const [soloReviews, setSoloReviews] = useState<Record<string, { status?: string; score?: number; hasNotes?: boolean }>>({});
  const [studentReviews, setStudentReviews] = useState<Record<string, { status?: string; score?: number; hasNotes?: boolean }>>({});

  // Real-time Firestore Live Sessions (for Teacher)
  const [allLiveSessions, setAllLiveSessions] = useState<ClassSession[]>([]);
  const [liveSessionFilter, setLiveSessionFilter] = useState<'all' | 'solo' | 'kbm'>('all');

  useEffect(() => {
    const unsub = subscribeToAllSessions((sessions) => {
      setAllLiveSessions(sessions);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const tSessions = JSON.parse(localStorage.getItem('kitabah_teacher_sessions') || '[]').filter(Boolean);
      const sSessions = JSON.parse(localStorage.getItem('kitabah_student_sessions') || '[]').filter(Boolean);
      const soloSessions = JSON.parse(localStorage.getItem('kitabah_solo_sessions') || '[]').filter(Boolean);
      const lastName = localStorage.getItem('kitabah_last_student_name') || '';
      
      setSavedTeacherSessions(tSessions);
      setSavedStudentSessions(sSessions);
      setSavedSoloSessions(soloSessions);
      
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('code') || urlParams.get('join') || urlParams.get('session');
      if (urlCode) {
        setJoinCode(urlCode.toUpperCase());
        setMainMode('kbm');
        setKbmRole('student');
      }

      if (lastName && lastName !== 'Siswa Mandiri') {
        setStudentName(lastName);
        setSoloStudentName(lastName);
      } else if (lastName === 'Siswa Mandiri') {
        localStorage.removeItem('kitabah_last_student_name');
        setSoloStudentName('');
      }

      if (tSessions.length > 0) {
        setTeacherTab('existing');
      }

      // Check for reviews in student class sessions
      sSessions.forEach(async (item: SavedSessionItem) => {
        if (item.sessionId && item.studentId) {
          try {
            const studentRef = doc(firestore, `sessions/${item.sessionId}/students`, item.studentId);
            const snap = await getDoc(studentRef);
            if (snap.exists()) {
              const data = snap.data() as StudentProgress;
              if (data.status === 'reviewed' || data.teacherNotes || data.rubricScores) {
                setStudentReviews(prev => ({ 
                  ...prev, 
                  [`${item.sessionId}_${item.studentId}`]: {
                    status: data.status,
                    score: data.rubricScores?.total,
                    hasNotes: !!data.teacherNotes
                  } 
                }));
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      });

      // Check for reviews in solo sessions
      soloSessions.forEach(async (item: SavedSessionItem) => {
        if (item.sessionId && item.studentId) {
          try {
            const studentRef = doc(firestore, `sessions/${item.sessionId}/students`, item.studentId);
            const snap = await getDoc(studentRef);
            if (snap.exists()) {
              const data = snap.data() as StudentProgress;
              if (data.teacherNotes || data.rubricScores || data.status === 'reviewed') {
                setSoloReviews(prev => ({ 
                  ...prev, 
                  [item.sessionId]: {
                    status: data.status,
                    score: data.rubricScores?.total,
                    hasNotes: !!data.teacherNotes
                  } 
                }));
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveTeacherSessionToHistory = (sessionId: string, themeId: string, tName: string, pin?: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_teacher_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => item.sessionId !== sessionId);
      const updated = [
        { sessionId, themeId, teacherName: tName, teacherPin: pin, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_teacher_sessions', JSON.stringify(updated));
      setSavedTeacherSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const saveStudentSessionToHistory = (sessionId: string, studentId: string, sName: string, themeId: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_student_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => !(item.sessionId === sessionId && item.studentId === studentId));
      const updated = [
        { sessionId, studentId, studentName: sName, themeId, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_student_sessions', JSON.stringify(updated));
      setSavedStudentSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSoloSessionToHistory = (sessionId: string, studentId: string, sName: string, themeId: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_solo_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => !(item.sessionId === sessionId && item.studentId === studentId));
      const updated = [
        { sessionId, studentId, studentName: sName, themeId, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_solo_sessions', JSON.stringify(updated));
      setSavedSoloSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const removeTeacherSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTeacherSessions.filter(s => s.sessionId !== sessionId);
    localStorage.setItem('kitabah_teacher_sessions', JSON.stringify(updated));
    setSavedTeacherSessions(updated);
  };

  const removeStudentSession = (studentId: string, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStudentSessions.filter(s => !(s.sessionId === sessionId && s.studentId === studentId));
    localStorage.setItem('kitabah_student_sessions', JSON.stringify(updated));
    setSavedStudentSessions(updated);
  };

  const removeSoloSession = (studentId: string, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSoloSessions.filter(s => !(s.sessionId === sessionId && s.studentId === studentId));
    localStorage.setItem('kitabah_solo_sessions', JSON.stringify(updated));
    setSavedSoloSessions(updated);
  };

  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !joinCode.trim()) return;
    
    setIsJoining(true);
    setJoinError(null);

    try {
      const cleanName = studentName.trim();
      localStorage.setItem('kitabah_last_student_name', cleanName);
      const result = await joinSession(joinCode.trim(), cleanName);
      saveStudentSessionToHistory(result.cleanSessionId, result.studentId, cleanName, result.themeId);
      onJoinSession(result.cleanSessionId, result.studentId);
    } catch (err: any) {
      console.error(err);
      setJoinError(err.message || 'Gagal masuk ke kelas. Pastikan kode kelas 6 karakter sudah sesuai.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleResumeStudentSession = (item: SavedSessionItem) => {
    if (!item.studentId) {
      alert("Format sesi lama tidak dapat dilanjutkan. Silakan mulai sesi baru.");
      return;
    }
    onJoinSession(item.sessionId, item.studentId);
  };

  const handleTeacherCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    setIsCreating(true);
    try {
      const cleanPin = teacherPin.trim() || '3103';
      const sessionId = await createSession(teacherName.trim(), selectedTheme, cleanPin, false);
      saveTeacherSessionToHistory(sessionId, selectedTheme, teacherName.trim(), cleanPin);
      onCreateSession(sessionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTeacherEnterExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingTeacherCode.trim()) return;

    setIsEnteringExisting(true);
    setExistingCodeError(null);

    const cleanCode = existingTeacherCode.trim().toUpperCase();
    try {
      const result = await verifyTeacherAccess(cleanCode, existingTeacherPin.trim());
      if (!result.valid) {
        setExistingCodeError(result.message || 'Akses ditolak. PIN Guru tidak sesuai.');
        return;
      }
      const session = result.session!;
      saveTeacherSessionToHistory(cleanCode, session?.themeId || "", session.teacherName || 'Guru', session.teacherPin);
      onCreateSession(cleanCode);
    } catch (err: any) {
      console.error(err);
      setExistingCodeError(err.message || 'Gagal membuka kelas guru.');
    } finally {
      setIsEnteringExisting(false);
    }
  };

  const handleResumeTeacherSession = async (item: SavedSessionItem) => {
    setIsEnteringExisting(true);
    setExistingCodeError(null);
    setExistingTeacherCode(item.sessionId);
    if (item.teacherPin) {
      setExistingTeacherPin(item.teacherPin);
    }
    try {
      const result = await verifyTeacherAccess(item.sessionId, item.teacherPin || '');
      if (!result.valid) {
        setTeacherTab('existing');
        setExistingCodeError(result.message || 'Silakan masukkan PIN Guru Anda untuk melanjutkan.');
        return;
      }
      onCreateSession(item.sessionId);
    } catch (err: any) {
      console.error(err);
      setExistingCodeError(err.message || 'Gagal membuka kelas guru.');
    } finally {
      setIsEnteringExisting(false);
    }
  };

  const handleStartSoloPractice = async (themeId: string) => {
    const trimmed = soloStudentName.trim();
    const sName = trimmed || 'Siswa Mandiri';
    if (trimmed) {
      localStorage.setItem('kitabah_last_student_name', trimmed);
    } else {
      localStorage.removeItem('kitabah_last_student_name');
    }
    setIsCreating(true);
    try {
      const sessionId = await createSession('Latihan Mandiri', themeId, '3103', true);
      const result = await joinSession(sessionId, sName);
      saveSoloSessionToHistory(sessionId, result.studentId, sName, themeId);
      onJoinSession(result.cleanSessionId, result.studentId);
    } catch (err) {
      console.error(err);
      alert('Gagal memulai latihan mandiri. Periksa koneksi internet Anda.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredSoloThemes = THEMES.filter(t => 
    t.titleIndo.toLowerCase().includes(soloFilter.toLowerCase()) ||
    t.titleArabic.includes(soloFilter) ||
    t.prompt.toLowerCase().includes(soloFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-white">
          Insya' Muwajjah
        </h1>
        <p className="text-xs sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed px-4">
          Pembelajaran menulis bahasa Arab berbasis pendekatan Process-Genre untuk Madrasah Aliyah.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl border border-stone-300/60 dark:border-stone-700">
          <button
            type="button"
            onClick={() => { setMainMode('kbm'); setKbmRole(null); setJoinError(null); setExistingCodeError(null); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
              mainMode === 'kbm'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <span>Mode Kelas (KBM)</span>
          </button>

          <button
            type="button"
            onClick={() => { setMainMode('mandiri'); setJoinError(null); setExistingCodeError(null); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
              mainMode === 'mandiri'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <span>Latihan Mandiri</span>
          </button>
        </div>
      </div>

      {/* ================= MODE KBM ================= */}
      {mainMode === 'kbm' && (
        <div className="space-y-8">
          {!kbmRole ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
              {/* Siswa Card */}
              <button 
                type="button"
                onClick={() => setKbmRole('student')} 
                className="group flex flex-col items-start text-left p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-xs hover:shadow-md transition-all"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-white mb-1 sm:mb-2">
                  Ruang Siswa
                </h2>
                <p className="text-[11px] sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4 sm:mb-6">
                  Masuk dengan 6 karakter kode kelas dari guru untuk mulai menyusun karangan terbimbing.
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-burgundy-800 dark:text-burgundy-400">
                  <span>Masuk Ruang Siswa</span>
                </div>
              </button>

              {/* Guru Card */}
              <button 
                type="button"
                onClick={() => setKbmRole('teacher')} 
                className="group flex flex-col items-start text-left p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 shadow-xs hover:shadow-md transition-all"
              >
                <h2 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-white mb-1 sm:mb-2">
                  Panel Guru
                </h2>
                <p className="text-[11px] sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4 sm:mb-6">
                  Buat ruang kelas baru, bagikan kode ke siswa, pantau proses penulisan live, dan beri skor rubrik.
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-burgundy-800 dark:text-burgundy-400">
                  <span>Buka Panel Guru</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto space-y-6">
              <button 
                type="button"
                onClick={() => { setKbmRole(null); setJoinError(null); setExistingCodeError(null); }} 
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                Kembali ke Pilihan Peran
              </button>

              {kbmRole === 'student' ? (
                /* STUDENT FORM */
                <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Masuk ke Ruang Siswa</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Masukkan nama lengkap dan 6 digit kode kelas dari guru Anda.</p>
                  </div>

                  {joinError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                      <span>{joinError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStudentJoin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                        Nama Lengkap Siswa
                      </label>
                      <input 
                        type="text" 
                        required
                        value={studentName === 'Siswa Mandiri' ? '' : studentName} 
                        onChange={e => setStudentName(e.target.value)} 
                        placeholder="Contoh: Muhammad Rayhan" 
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                        Kode Kelas Siswa (6 Karakter)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={joinCode} 
                        onChange={e => setJoinCode(e.target.value.toUpperCase())} 
                        placeholder="AB12CD" 
                        className="w-full px-3.5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono tracking-widest uppercase font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isJoining || !studentName.trim() || !joinCode.trim()} 
                      className="w-full py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                    >
                      {isJoining ? 'Menghubungkan ke Studio...' : 'Mulai Menulis'}
                    </button>
                  </form>

                      {/* Saved Student Sessions */}
                  {savedStudentSessions.length > 0 && (
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                      <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                        Draf Siswa Tersimpan di Perangkat Ini:
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {savedStudentSessions.map(item => {
                          const revKey = `${item.sessionId}_${item.studentId}`;
                          const revInfo = studentReviews[revKey];
                          const isReviewed = revInfo?.status === 'reviewed' || revInfo?.hasNotes || revInfo?.score !== undefined;

                          return (
                            <div 
                              key={`${item.sessionId}_${item.studentId}`}
                              className="p-2.5 sm:p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between text-xs transition-all"
                            >
                              <div className="truncate pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-stone-800 dark:text-stone-200">{item.studentName}</span>
                                  <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">({item.sessionId})</span>
                                  {isReviewed ? (
                                    <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-bold border border-stone-300 dark:border-stone-600">
                                      {revInfo?.score !== undefined ? `Nilai: ${revInfo.score}/100` : 'Sudah Dinilai Guru'}
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded text-[9px]">
                                      Draf
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleResumeStudentSession(item)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900"
                                >
                                  {isReviewed ? 'Lihat Hasil' : 'Lanjut'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => removeStudentSession(item.studentId!, item.sessionId, e)}
                                  className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  title="Hapus Sesi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TEACHER FORM */
                <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Panel Pengampu Guru</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Buat ruang kelas baru untuk materi KBM atau kelola kelas yang sudah ada.</p>
                  </div>

                  {/* Teacher Tab Switcher */}
                  <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setTeacherTab('create'); setExistingCodeError(null); }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                        teacherTab === 'create'
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                      }`}
                    >
                      Buat Kelas Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTeacherTab('existing'); setExistingCodeError(null); }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                        teacherTab === 'existing'
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                      }`}
                    >
                      Buka Kelas Lama
                    </button>
                  </div>

                  {existingCodeError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                      <span>{existingCodeError}</span>
                    </div>
                  )}

                  {teacherTab === 'create' ? (
                    <form onSubmit={handleTeacherCreate} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                          Nama Guru Pengampu
                        </label>
                        <input 
                          type="text" 
                          required
                          value={teacherName} 
                          onChange={e => setTeacherName(e.target.value)} 
                          placeholder="Contoh: Ustadz Ahmad Fauzi, M.Pd" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                          Topik / Tema Insya' Muwajjah
                        </label>
                        <select 
                          value={selectedTheme} 
                          onChange={e => setSelectedTheme(e.target.value)} 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
                        >
                          {THEMES.map(t => (
                            <option key={t.id} value={t.id} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                              {t.titleIndo} ({t.titleArabic}) — {t.grade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                          PIN Rahasia Guru
                        </label>
                        <input 
                          type="text" 
                          required
                          value={teacherPin} 
                          onChange={e => setTeacherPin(e.target.value)} 
                          placeholder="Contoh: 3103" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono font-bold tracking-widest text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                        />
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          PIN ini digunakan untuk mengamankan akses ke lembar penilaian siswa.
                        </p>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isCreating || !teacherName.trim() || !teacherPin.trim()} 
                        className="w-full py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isCreating ? 'Membuat Kelas...' : 'Buat Kelas & Dapatkan Kode'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleTeacherEnterExisting} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                          Kode Kelas Guru
                        </label>
                        <input 
                          type="text" 
                          required
                          value={existingTeacherCode} 
                          onChange={e => setExistingTeacherCode(e.target.value.toUpperCase())} 
                          placeholder="Contoh: AB12CD" 
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono font-bold uppercase tracking-widest text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                          PIN Rahasia Guru
                        </label>
                        <div className="relative">
                          <input 
                            type={showExistingPin ? "text" : "password"} 
                            required
                            value={existingTeacherPin} 
                            onChange={e => setExistingTeacherPin(e.target.value)} 
                            placeholder="PIN Guru" 
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono font-bold tracking-widest text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowExistingPin(!showExistingPin)}
                            className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title={showExistingPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                          >
                            {showExistingPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isEnteringExisting || !existingTeacherCode.trim()} 
                        className="w-full py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                      >
                        {isEnteringExisting ? 'Memverifikasi...' : 'Buka Dashboard Kelas'}
                      </button>

                      {/* Live Real-Time Sessions & Solo Submissions (Zero Effort for Teacher) */}
                      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            Daftar Sesi Real-Time & Latihan Mandiri Siswa
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                            {allLiveSessions.length} Sesi Terdeteksi
                          </span>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-lg text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setLiveSessionFilter('all')}
                            className={`flex-1 py-1 px-2 rounded-md transition-all ${
                              liveSessionFilter === 'all'
                                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                            }`}
                          >
                            Semua ({allLiveSessions.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setLiveSessionFilter('solo')}
                            className={`flex-1 py-1 px-2 rounded-md transition-all ${
                              liveSessionFilter === 'solo'
                                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                            }`}
                          >
                            Mandiri ({allLiveSessions.filter(s => s.isSoloPractice || s.teacherName === 'Latihan Mandiri').length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setLiveSessionFilter('kbm')}
                            className={`flex-1 py-1 px-2 rounded-md transition-all ${
                              liveSessionFilter === 'kbm'
                                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                            }`}
                          >
                            Kelas KBM ({allLiveSessions.filter(s => !s.isSoloPractice && s.teacherName !== 'Latihan Mandiri').length})
                          </button>
                        </div>

                        {/* Live Session List */}
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {allLiveSessions
                            .filter(s => {
                              const isSolo = s.isSoloPractice || s.teacherName === 'Latihan Mandiri';
                              if (liveSessionFilter === 'solo') return isSolo;
                              if (liveSessionFilter === 'kbm') return !isSolo;
                              return true;
                            })
                            .map((sess) => {
                              const isSolo = sess.isSoloPractice || sess.teacherName === 'Latihan Mandiri';
                              const themeObj = THEMES.find(t => t.id === sess.themeId);
                              return (
                                <div
                                  key={sess.id}
                                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/80 dark:bg-stone-800/80 hover:border-stone-300 dark:hover:border-stone-600 transition-all flex items-center justify-between gap-3 shadow-2xs"
                                >
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-extrabold text-burgundy-800 dark:text-burgundy-400 text-xs sm:text-sm">
                                        {sess.id}
                                      </span>
                                      {isSolo ? (
                                        <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[9px] font-bold border border-stone-300 dark:border-stone-600">
                                          Latihan Mandiri Siswa
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[9px] font-bold">
                                          Sesi KBM Kelas
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate font-medium">
                                      Tema: <span className="font-semibold text-stone-900 dark:text-stone-100">{themeObj?.titleIndo || sess.themeId}</span>
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onCreateSession(sess.id)}
                                    className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs shrink-0 transition-colors shadow-2xs"
                                  >
                                    Buka & Nilai
                                  </button>
                                </div>
                              );
                            })}

                          {allLiveSessions.length === 0 && (
                            <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-3 italic">
                              Belum ada sesi aktif terdeteksi. Sesi akan otomatis muncul begitu siswa mulai.
                            </p>
                          )}
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODE MANDIRI ================= */}
      {mainMode === 'mandiri' && (
        <div className="space-y-8">
          {/* Identity Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">Identitas Penulis:</span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Nama akan tertera pada lembar karangan dan dokumen rapor PDF.</p>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={soloStudentName === 'Siswa Mandiri' ? '' : soloStudentName}
                onChange={(e) => setSoloStudentName(e.target.value)}
                placeholder="Siswa Mandiri"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
              />
            </div>
          </div>

          {/* Saved Solo Sessions */}
          {savedSoloSessions.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 mx-4 sm:mx-0">
              <span className="text-[10px] sm:text-xs font-semibold text-stone-700 dark:text-stone-300">
                Riwayat Latihan:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedSoloSessions.map(item => {
                  const themeObj = THEMES.find(t => t.id === item?.themeId);
                  return (
                    <div 
                      key={item.sessionId}
                      className="p-2.5 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 block truncate">{themeObj?.titleIndo || 'Karangan Arab'}</span>
                          {soloReviews[item.sessionId] && (
                            <span className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-[9px] font-bold rounded-full border border-stone-300 dark:border-stone-600">
                              {soloReviews[item.sessionId].score !== undefined ? `Nilai: ${soloReviews[item.sessionId].score}/100` : 'Catatan Guru Masuk'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-arabic">{themeObj?.titleArabic}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.studentId) return;
                            onJoinSession(item.sessionId, item.studentId);
                          }}
                          className="px-2.5 py-1.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-lg text-[10px] font-semibold"
                        >
                          Buka
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeSoloSession(item.studentId!, item.sessionId, e)}
                          className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Topic Catalog */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-white">Katalog Tema Insya' Muwajjah</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Pilih tema tulisan untuk memulai alur pengerjaan.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400 dark:text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari topik atau arti..."
                  value={soloFilter}
                  onChange={(e) => setSoloFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSoloThemes.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleStartSoloPractice(topic.id)}
                  className="group text-left p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span>{topic.grade}</span>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-arabic font-bold text-stone-900 dark:text-white leading-relaxed" dir="rtl">
                        {topic.titleArabic}
                      </h3>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                        {topic.titleIndo}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2">
                      {topic.prompt}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center text-xs font-semibold text-burgundy-800 dark:text-burgundy-400">
                    <span>Mulai Menulis</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
