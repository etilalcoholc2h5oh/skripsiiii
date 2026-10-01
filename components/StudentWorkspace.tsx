import React, { useState, useEffect, useRef } from 'react';
import { THEMES, ThemeTopic, Mufradat, TarkibPattern } from '../data';
import { generateInstantStoryboardLocally, resolveScenePhoto, resolveQuickTranslation, StoryboardScene } from '../utils/visualResolver';
import { updateStudentProgress, subscribeToStudent, subscribeToSession, StudentProgress, ClassSession } from '../lib/db';
import { 
  Lightbulb, CheckCircle2, Volume2, 
  BookOpen, Search as SearchIcon, ArrowLeft, ArrowRight, 
  Award, Check, PenTool, Keyboard, AlertCircle,
  Copy, Printer, Compass, FileText, X, ShieldCheck, Eye, EyeOff,
  ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { PrintPdfModal } from './PrintPdfModal';

interface StudentWorkspaceProps {
  sessionId: string;
  studentId: string;
  isDarkMode: boolean;
  onExit?: () => void;
}

const ARABIC_DIACRITICS = [
  { label: 'Fathah', char: 'َ', display: 'ـَ' },
  { label: 'Kasrah', char: 'ِ', display: 'ـِ' },
  { label: 'Dhommah', char: 'ُ', display: 'ـُ' },
  { label: 'Fathatain', char: 'ً', display: 'ـً' },
  { label: 'Kasratain', char: 'ٍ', display: 'ـٍ' },
  { label: 'Dhommatain', char: 'ٌ', display: 'ـٌ' },
  { label: 'Tasydid', char: 'ّ', display: 'ـّ' },
  { label: 'Sukun', char: 'ْ', display: 'ـْ' },
  { label: 'Kasheeda', char: 'ـ', display: 'ـ' },
];

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({ 
  sessionId, 
  studentId, 
  isDarkMode,
  onExit 
}) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [localDraft, setLocalDraft] = useState<string>('');
  const [localIdeas, setLocalIdeas] = useState<string[]>(['', '', '']);
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ideasTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiActionType, setAiActionType] = useState<'ide' | 'evaluasi' | 'harakat' | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [stepLockWarning, setStepLockWarning] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'keyboard' | 'handwriting'>('keyboard');
  const [showReferences, setShowReferences] = useState(false); // Collapsed by default on mobile

  const isSolo = session?.isSoloPractice || session?.teacherName === 'Latihan Mandiri' || sessionId.startsWith('SL');

  useEffect(() => {
    const unsubStudent = subscribeToStudent(sessionId, studentId, (data) => {
      setProgress(data);
      if (data) {
        if (!draftTimeoutRef.current) {
          setLocalDraft(data.draft || '');
        }
        if (!ideasTimeoutRef.current && data.ideas) {
          setLocalIdeas(data.ideas);
        }
      }
    });

    const unsubSession = subscribeToSession(sessionId, (data) => {
      setSession(data);
    });

    return () => {
      if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
      if (ideasTimeoutRef.current) clearTimeout(ideasTimeoutRef.current);
      unsubStudent();
      unsubSession();
    };
  }, [sessionId, studentId]);

  useEffect(() => {
    const text = localDraft || progress?.draft || '';
    if (!text || text.trim().length < 3) {
      return;
    }
  }, [localDraft]);

  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-burgundy-800 rounded-full animate-spin" />
        <p className="text-xs font-medium text-stone-500">Menghubungkan lembar kerja siswa...</p>
      </div>
    );
  }

  const resolvedThemeId = progress?.themeId || session?.themeId || THEMES[0].id;
  const theme: ThemeTopic = THEMES.find(t => t.id === resolvedThemeId) || THEMES[0];

  const activeIdeas = localIdeas.length > 0 ? localIdeas : (progress.ideas || []);
  const filledIdeasCount = activeIdeas.filter(i => i && i.trim().length >= 1).length;
  const isStep1Done = filledIdeasCount === 3; 
  
  // Wajib memilih minimal 1 kosakata DAN minimal 1 kaidah agar bisa pindah ke draf
  const isStep2Done = (progress.selectedMufradat?.length || 0) >= 1 && (progress.selectedTarkib?.length || 0) >= 1; 

  const isStepAccessible = (targetStep: number): boolean => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return isStep1Done;
    if (targetStep === 3) return isStep1Done && isStep2Done;
    return false;
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateIdea = (index: number, val: string) => {
    const newIdeas = [...activeIdeas];
    newIdeas[index] = val;
    setLocalIdeas(newIdeas);
    if (stepLockWarning) setStepLockWarning(null);

    if (ideasTimeoutRef.current) {
      clearTimeout(ideasTimeoutRef.current);
    }
    ideasTimeoutRef.current = setTimeout(() => {
      updateStudentProgress(sessionId, studentId, { ideas: newIdeas });
      ideasTimeoutRef.current = null;
    }, 400);
  };

  const handleDraftChange = (newVal: string) => {
    setLocalDraft(newVal);
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }
    draftTimeoutRef.current = setTimeout(() => {
      updateStudentProgress(sessionId, studentId, { draft: newVal });
      draftTimeoutRef.current = null;
    }, 450);
  };

  const flushDraftImmediately = (overrideText?: string) => {
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
      draftTimeoutRef.current = null;
    }
    const textToSave = overrideText !== undefined ? overrideText : localDraft;
    updateStudentProgress(sessionId, studentId, { draft: textToSave });
  };

  const toggleTarkib = (patternName: string) => {
    const current = progress.selectedTarkib || [];
    const isSelected = current.includes(patternName);
    const updated = isSelected ? current.filter(p => p !== patternName) : [...current, patternName];
    updateStudentProgress(sessionId, studentId, { selectedTarkib: updated });
    if (stepLockWarning) setStepLockWarning(null);
  };

  const toggleMufradat = (word: string) => {
    const current = progress.selectedMufradat || [];
    const isSelected = current.includes(word);
    const updated = isSelected ? current.filter(w => w !== word) : [...current, word];
    updateStudentProgress(sessionId, studentId, { selectedMufradat: updated });
    if (stepLockWarning) setStepLockWarning(null);
  };

  const setStep = (stepNumber: number) => {
    if (ideasTimeoutRef.current) {
      clearTimeout(ideasTimeoutRef.current);
      ideasTimeoutRef.current = null;
      updateStudentProgress(sessionId, studentId, { ideas: localIdeas });
    }
    if (draftTimeoutRef.current) {
      flushDraftImmediately();
    }

    if (stepNumber === 2 && !isStep1Done) {
      // Recalculate in case of state lag
      const currentFilledIdeas = (localIdeas || []).filter(i => typeof i === 'string' && i.trim().length >= 1).length;
      if (currentFilledIdeas < 3) {
        setStepLockWarning(`Silakan lengkapi ketiga tahap gagasan pokok (Pembuka, Inti, Penutup) di Langkah 1 terlebih dahulu.`);
        return;
      }
    }

    if (stepNumber === 3) {
      const currentFilledIdeas = (localIdeas || []).filter(i => typeof i === 'string' && i.trim().length >= 1).length;
      if (currentFilledIdeas < 3) {
        setStepLockWarning('Lengkapi ketiga tahap gagasan pokok di Langkah 1 terlebih dahulu.');
        return;
      }
      
      const currentSelectedTarkib = (progress?.selectedTarkib?.length || 0);
      if (currentSelectedTarkib < 1) {
        setStepLockWarning('Wajib memilih minimal 1 pola kaidah di Langkah 2 (Kamus) sebelum lanjut ke Draf.');
        return;
      }

      const currentSelectedMufradat = (progress?.selectedMufradat?.length || 0);
      if (currentSelectedMufradat < 1) {
        setStepLockWarning('Pilih minimal 1 kosakata di Langkah 2 (Kamus) terlebih dahulu.');
        return;
      }
    }

    setStepLockWarning(null);

    const currentDraft = localDraft || progress.draft || '';
    if (stepNumber === 3 && (!currentDraft || currentDraft.trim() === '')) {
      const validIdeas = activeIdeas.filter(i => i && i.trim() !== '');
      let autoStarter = '';
      if (validIdeas.length > 0) {
        autoStarter = validIdeas.join('.\n') + '.\n';
      }
      setLocalDraft(autoStarter);
      updateStudentProgress(sessionId, studentId, { step: stepNumber, draft: autoStarter });
    } else {
      updateStudentProgress(sessionId, studentId, { step: stepNumber });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInsertDiacritic = (char: string) => {
    const textarea = document.getElementById('draft-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      const updated = localDraft + char;
      setLocalDraft(updated);
      handleDraftChange(updated);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localDraft;
    const updated = text.substring(0, start) + char + text.substring(end);
    
    setLocalDraft(updated);
    handleDraftChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 50);
  };

  const handleAskAI = async (action: 'ide' | 'evaluasi' | 'harakat') => {
    flushDraftImmediately();
    setLoadingAi(true);
    setAiActionType(action);
    setAiSuggestion(null);

    const customKey = localStorage.getItem('geminiApiKey') || '';
    let endpoint = '/api/ai/suggest';
    let body: any = { theme: theme.titleIndo, customApiKey: customKey };

    const currentDraftText = localDraft || progress?.draft || '';
    const currentIdeas = progress?.ideas || localIdeas;

    if (action === 'ide') {
      endpoint = '/api/ai/suggest';
      body.text = currentIdeas.filter(Boolean).join('. ') || currentDraftText || theme.prompt;
    } else if (action === 'harakat') {
      endpoint = '/api/ai/harakat';
      body.text = currentDraftText;
    } else if (action === 'evaluasi') {
      endpoint = '/api/ai/evaluate';
      body.text = currentDraftText;
      body.ideas = currentIdeas;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.result) {
        if (action === 'harakat') {
          setLocalDraft(data.result);
          updateStudentProgress(sessionId, studentId, { draft: data.result });
          setAiSuggestion('Harakat otomatis telah diterapkan pada draf tulisan Anda.');
        } else {
          setAiSuggestion(data.result);
        }
      } else if (data.error) {
        setAiSuggestion(`Sistem Pemeriksa: ${data.error}`);
      } else {
        setAiSuggestion('Sistem sedang memproses. Silakan coba beberapa saat lagi.');
      }
    } catch (e: any) {
      setAiSuggestion(`Gagal menghubungi sistem pemeriksaan: ${e.message || 'Koneksi terputus'}`);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopyDraft = () => {
    const textToCopy = localDraft || progress?.draft;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handleSubmitToTeacher = async () => {
    flushDraftImmediately();
    setIsSubmitting(true);
    await updateStudentProgress(sessionId, studentId, { 
      draft: localDraft || progress?.draft || '',
      status: 'submitted' 
    });
    setIsSubmitting(false);
    setSubmitNotice(true);
    setTimeout(() => setSubmitNotice(false), 4000);
  };

  const wordCount = (localDraft || progress.draft || '').trim() ? (localDraft || progress.draft || '').trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Workspace Top Banner - Compact for Mobile */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3 sm:p-6 shadow-xs space-y-3 sm:space-y-6 mx-3 sm:mx-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-white truncate max-w-[100px]">{progress.name}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sessionId);
                  setCopyToast(true);
                  setTimeout(() => setCopyToast(false), 2000);
                }}
                className="hover:underline font-mono font-bold text-stone-700 dark:text-stone-300"
                title="Klik untuk menyalin Kode Sesi untuk diberikan ke Guru"
              >
                {isSolo ? `Kode Latihan: ${sessionId}` : `Kelas: ${sessionId}`}
              </button>
              {progress.status === 'reviewed' ? (
                <>
                  <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-[10px] border border-stone-300 dark:border-stone-600">
                    Dinilai Guru {progress.rubricScores ? `(${progress.rubricScores.total}/100)` : ''}
                  </span>
                </>
              ) : progress.status === 'submitted' ? (
                <>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Terkirim ke Guru</span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-3xl font-arabic font-bold text-stone-900 dark:text-white" dir="rtl">
                {theme.titleArabic}
              </h1>
              <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 sm:hidden" />
              <p className="text-[10px] sm:text-sm text-stone-600 dark:text-stone-300 font-medium sm:hidden truncate">
                {theme.titleIndo}
              </p>
            </div>
            <p className="hidden sm:block text-[10px] sm:text-sm text-stone-600 dark:text-stone-300">
              Tema: <span className="font-semibold text-stone-900 dark:text-white">{theme.titleIndo}</span> &mdash; {theme.prompt}
            </p>
          </div>

          {/* Stepper Tabs - Responsive Grid on Mobile */}
          <div className="grid grid-cols-3 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700/80 shrink-0">
            {[
              { num: 1, label: 'Ide', isDone: isStep1Done },
              { num: 2, label: 'Kamus', isDone: isStep2Done },
              { num: 3, label: 'Draf', isDone: !!(progress.draft && progress.draft.trim().length > 10) }
            ].map(({ num, label, isDone }) => {
              const isActive = progress.step === num;
              const isAccessible = isStepAccessible(num);
              return (
                <button
                  key={num}
                  onClick={() => setStep(num)}
                  disabled={!isAccessible}
                  className={`flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                      : !isAccessible
                      ? 'text-stone-400 dark:text-stone-600 cursor-not-allowed opacity-50'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] border ${
                    isActive ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent' : 'border-stone-300 dark:border-stone-600'
                  }`}>
                    {num}
                  </div>
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {stepLockWarning && (
          <div className="p-3.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span>{stepLockWarning}</span>
            </div>
            <button onClick={() => setStepLockWarning(null)} className="text-[10px] uppercase font-bold opacity-80 hover:opacity-100 px-2 py-0.5 bg-stone-800 dark:bg-stone-200 rounded">
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Evaluation & Score Banner (Only shown if student has submitted or has rubric / teacher review / feedback) */}
      {(progress.rubricScores || progress.teacherNotes || progress.feedback || progress.status === 'submitted' || progress.status === 'reviewed') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-100 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs mx-3 sm:mx-0 transition-all">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {(progress.status === 'reviewed' || progress.teacherNotes || (progress.feedback && !isSolo)) ? (
                <span className="px-2.5 py-0.5 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-[10px] uppercase tracking-wider">
                  Ulasan Guru Telah Tersedia
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  {progress.status === 'submitted' ? 'Draf Menunggu Penilaian Guru' : (isSolo ? 'Evaluasi Penulisan Mandiri' : 'Hasil Penilaian Instruktur')}
                </span>
              )}

              {progress.rubricScores && (
                <span className="font-extrabold text-stone-900 dark:text-white text-xs sm:text-sm ml-1">
                  Nilai Total: {progress.rubricScores.total} / 100
                </span>
              )}
            </div>

            <div className="text-xs text-stone-700 dark:text-stone-300 space-y-1">
              {progress.feedback && (
                <p className="line-clamp-2">
                  <span className="font-bold text-stone-900 dark:text-white">Masukan Guru:</span> "{progress.feedback}"
                </p>
              )}
              {progress.teacherNotes && (
                <p className="line-clamp-2 text-stone-600 dark:text-stone-300">
                  <span className="font-bold text-stone-900 dark:text-white">Catatan Tambahan:</span> "{progress.teacherNotes}"
                </p>
              )}
              {!progress.feedback && !progress.teacherNotes && (
                <p className="text-stone-600 dark:text-stone-400 text-xs font-med
