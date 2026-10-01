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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring
