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
                <p className="text-stone-600 dark:text-stone-400 text-xs font-medium">
                  {progress.status === 'submitted' 
                    ? 'Karangan Anda telah berhasil dikirim ke guru. Menunggu koreksi & masukan.' 
                    : 'Evaluasi rubrik dan catatan telah tersedia.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsScoreModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-colors shadow-2xs"
            >
              Lihat Rapor & Masukan
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors text-xs font-semibold"
            >
              Cetak PDF
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 1: GAGASAN POKOK ================= */}
      {progress.step === 1 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-white">
              Langkah 1: Perumusan Gagasan Pokok
            </h2>
            <p className="text-[11px] sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Tuliskan poin ide utama untuk 3 bagian struktur paragraf karangan Anda (Pembuka, Inti Cerita, dan Penutup). <span className="font-bold text-burgundy-800 dark:text-burgundy-400">Lengkapi ketiga bagian untuk lanjut ke langkah berikutnya.</span>
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              { idx: 0, title: '1. Muqaddimah (Pembuka)', desc: 'Zaman & Makan (Waktu & Tempat).' },
              { idx: 1, title: '2. Fikrah (Inti)', desc: 'Fa\'il (Tokoh) & Aktivitas.' },
              { idx: 2, title: '3. Khotimah (Penutup)', desc: 'Natijah (Kesimpulan).' },
            ].map(({ idx, title, desc }) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <label className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200">
                    {title}
                  </label>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 hidden xs:inline">{desc}</span>
                </div>
                <textarea
                  rows={2}
                  value={activeIdeas[idx] || ''}
                  onChange={(e) => updateIdea(idx, e.target.value)}
                  onBlur={() => flushDraftImmediately()}
                  placeholder="Ketik ide pokok di sini..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
                />
              </div>
            ))}
          </div>


          <div className="flex justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Done}
              className="px-6 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-xs"
            >
              Lanjut ke Kamus
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: KOSAKATA & KAIDAH TARKIB ================= */}
      {progress.step === 2 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 sm:p-8 space-y-6 sm:space-y-8 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-white">
              Langkah 2: Kamus (Kosakata & Kaidah)
            </h2>
            <p className="text-[11px] sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Pilih kosakata dan pola kaidah yang relevan dengan tema karangan Anda.
            </p>
          </div>

          {/* Mufradat Section */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
              Pilihan Kosakata (Mufradat)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {(theme.mufradat || []).map((m, idx) => {
                const isSelected = (progress.selectedMufradat || []).includes(m.word);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-burgundy-800 dark:border-burgundy-600 bg-burgundy-50/60 dark:bg-burgundy-950/50 shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 hover:border-stone-300'
                    }`}
                    onClick={() => toggleMufradat(m.word)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-arabic font-bold text-stone-900 dark:text-white" dir="rtl">
                        {m.word}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSpeech(m.word);
                        }}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                        title="Dengarkan Pengucapan"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-[11px] font-medium text-stone-800 dark:text-stone-200">{m.meaning}</p>
                      <p className="text-[9px] text-stone-400 italic">{m.pronunciation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tarkib Section */}
          <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Pola Kaidah Kalimat (Tarkib Nahwu)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  Wajib Dipilih (Min. 1)
                </span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                {(progress.selectedTarkib?.length || 0) > 0 
                  ? `${progress.selectedTarkib?.length} kaidah dipilih` 
                  : 'Belum ada kaidah dipilih'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(theme.tarkib || []).map((t, idx) => {
                const isSelected = (progress.selectedTarkib || []).includes(t.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTarkib(t.name)}
                    className={`text-left p-4 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-burgundy-800 dark:border-burgundy-600 bg-burgundy-50/60 dark:bg-burgundy-950/50'
                        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-900 dark:text-white">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-burgundy-800 dark:text-burgundy-400" />}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mb-2">{t.explanation}</p>
                    <div className="text-right text-sm font-arabic font-semibold text-stone-900 dark:text-stone-100" dir="rtl">
                      {t.example}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white text-center sm:text-left"
            >
              Kembali ke Gagasan Pokok
            </button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {!isStep2Done && (
                <span className="text-[11px] text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-center sm:text-right font-medium">
                  {(progress.selectedTarkib?.length || 0) === 0
                    ? 'Wajib memilih minimal 1 pola kaidah untuk ke Draf'
                    : 'Pilih minimal 1 kosakata'}
                </span>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={!isStep2Done}
                className="px-6 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-xs"
              >
                Lanjut ke Lembar Karangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: LEMBAR KARANGAN ================= */}
      {progress.step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Reference Drawer (4 cols on lg screen) - Mobile Collapsible */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden mx-3 sm:mx-0">
                <button 
                  onClick={() => setShowReferences(!showReferences)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 lg:pointer-events-none"
                >
                  <span className="text-[11px] sm:text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Rujukan Alur & Kosakata
                  </span>
                  <div className="lg:hidden text-[10px] font-bold text-stone-400">
                    {showReferences ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                </button>

                <div className={`${showReferences ? 'block' : 'hidden lg:block'} px-4 sm:px-5 pb-5 space-y-4 border-t lg:border-t-0 border-stone-100 dark:border-stone-800 pt-4 lg:pt-0`}>
                  {/* Ideas Summary */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Gagasan Pokok:</span>
                    <div className="space-y-1.5 text-xs">
                      {activeIdeas.map((idea, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-200">
                          <span className="font-semibold text-stone-500 dark:text-stone-400 mr-1.5">{i + 1}.</span>
                          {idea || '(Belum diisi)'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Tarkib Patterns */}
                  {progress.selectedTarkib && progress.selectedTarkib.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                        Pola Kaidah Terpilih ({progress.selectedTarkib.length}):
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {progress.selectedTarkib.map((tName, i) => {
                          const patternObj = (theme.tarkib || []).find(t => t.name === tName);
                          return (
                            <div key={i} className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
                              <span className="font-semibold text-stone-800 dark:text-stone-200 block text-[11px]">
                                {tName}
                              </span>
                              {patternObj?.example && (
                                <p className="text-stone-700 dark:text-stone-300 font-arabic text-xs text-right" dir="rtl">
                                  {patternObj.example}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Mufradat */}
                  {progress.selectedMufradat && progress.selectedMufradat.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                        Kosakata Terpilih ({progress.selectedMufradat.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {progress.selectedMufradat.map((word, i) => {
                          const mObj = (theme.mufradat || []).find(m => m.word === word);
                          return (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] text-stone-800 dark:text-stone-200 font-medium"
                            >
                              <span className="font-arabic font-bold text-xs" dir="rtl">{word}</span>
                              {mObj?.meaning && <span className="text-stone-500 dark:text-stone-400 text-[9px]">({mObj.meaning})</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Central Writing Area (8 cols on lg screen) */}
            <div className="lg:col-span-8 space-y-4">

              {/* Dedicated Teacher Feedback Card (Visible directly on Step 3) */}
              {(progress.feedback || progress.teacherNotes || progress.status === 'reviewed') && (
                <div className="bg-stone-100 dark:bg-stone-800/90 rounded-2xl border border-stone-300 dark:border-stone-700 p-4 sm:p-5 shadow-xs space-y-3 mx-3 sm:mx-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shrink-0 shadow-xs">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          Catatan & Koreksi dari Guru
                        </h3>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          Gunakan masukan ini sebagai panduan merevisi karangan Anda
                        </span>
                      </div>
                    </div>

                    {progress.rubricScores && (
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-right shadow-2xs">
                        <span className="text-[9px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-bold">Total Nilai</span>
                        <span className="text-sm font-black text-stone-900 dark:text-white">
                          {progress.rubricScores.total} <span className="text-[10px] font-normal text-stone-400">/ 100</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Primary Feedback Text */}
                  {progress.feedback && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed shadow-2xs">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1 text-[11px]">
                        Umpan Balik Guru:
                      </span>
                      {progress.feedback}
                    </div>
                  )}

                  {/* Additional Teacher Notes if any */}
                  {progress.teacherNotes && (
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 whitespace-pre-wrap leading-relaxed shadow-2xs">
                      <span className="font-bold text-stone-900 dark:text-stone-200 block mb-1 text-[11px]">
                        Catatan Tambahan Guru:
                      </span>
                      {progress.teacherNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsScoreModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Buka Rapor Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors shadow-2xs"
                    >
                      Cetak Rapor PDF
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3 sm:p-6 shadow-xs space-y-3 sm:space-y-4 mx-3 sm:mx-0">
                
                {/* Writing Toolbar - Compact on mobile */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="inline-flex p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200/60 dark:border-stone-700/60 w-full xs:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('keyboard');
                        updateStudentProgress(sessionId, studentId, { writingMode: 'type' });
                      }}
                      className={`flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${
                        inputMode === 'keyboard' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs' : 'text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      Ketik
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode('handwriting');
                        updateStudentProgress(sessionId, studentId, { writingMode: 'handwriting' });
                      }}
                      className={`flex-1 xs:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${
                        inputMode === 'handwriting' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs' : 'text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      Tulis Tangan
                    </button>
                  </div>

                  <div className="flex items-center justify-between xs:justify-end gap-3 text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <span>{wordCount} Kata</span>
                      <button onClick={handleCopyDraft} className="hover:text-stone-900 dark:hover:text-white px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-[9px] font-bold" title="Salin Teks Karangan">
                        SALIN
                      </button>
                    </div>
                  </div>
                </div>

                {/* Diacritics Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs -mx-1 px-1">
                  {ARABIC_DIACRITICS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInsertDiacritic(d.char)}
                      className="w-8 h-8 flex items-center justify-center font-arabic text-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700/60 rounded-lg shrink-0 transition-colors"
                      title={d.label}
                    >
                      {d.display || d.char}
                    </button>
                  ))}
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 mx-1 shrink-0" />
                  <button
                    type="button"
                    onClick={() => handleAskAI('harakat')}
                    disabled={loadingAi || !localDraft.trim()}
                    className="px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700/60 rounded-lg shrink-0 disabled:opacity-40 transition-colors"
                  >
                    <span className="whitespace-nowrap">Tasykil Otomatis</span>
                  </button>
                </div>

                {/* Main Input Element */}
                {inputMode === 'keyboard' ? (
                  <textarea
                    id="draft-textarea"
                    rows={12}
                    value={localDraft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    placeholder="اكتب هنا موضوعك باللغة العربية..."
                    className="w-full p-5 sm:p-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#15171A] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30 text-xl font-arabic arabic-writing-line rtl-dir leading-[2.6]"
                    dir="rtl"
                    style={{ letterSpacing: 'normal', lineHeight: '2.6' }}
                  />
                ) : (
                  <HandwritingCanvas
                    initialDataUrl={progress.handwritingDataUrl}
                    onSave={(canvasDataUrl) => {
                      updateStudentProgress(sessionId, studentId, { handwritingDataUrl: canvasDataUrl });
                    }}
                    isDarkMode={isDarkMode}
                  />
                )}

                {aiSuggestion && (
                  <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs flex items-center justify-between">
                    <span>{aiSuggestion}</span>
                    <button 
                      type="button" 
                      onClick={() => setAiSuggestion(null)} 
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 ml-2"
                    >
                      TUTUP
                    </button>
                  </div>
                )}

                {/* Primary Submission Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  >
                    Kembali ke Kamus
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => flushDraftImmediately()}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      Simpan Draf
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitToTeacher}
                      disabled={isSubmitting || !localDraft.trim()}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                    >
                      <span>{isSubmitting ? 'Mengirim...' : 'Kirim Tugas ke Guru'}</span>
                    </button>
                  </div>
                </div>

                {submitNotice && (
                  <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200">
                    <span>Tugas karangan Anda berhasil disimpan dan diteruskan ke Guru Pengampu.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {progress && (
        <PrintPdfModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={{
            ...progress,
            name: progress.name || 'Siswa',
            draft: localDraft || progress.draft || '',
            ideas: (progress.ideas && progress.ideas.some(i => i.trim())) ? progress.ideas : localIdeas
          }}
          theme={theme}
          sessionId={sessionId}
          isTeacher={false}
        />
      )}

      {/* Academic Score Modal */}
      {isScoreModalOpen && progress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-stone-900 dark:text-white">
                  Rapor Hasil Evaluasi Karangan
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {session?.teacherName ? `Dinilai oleh: ${session.teacherName}` : 'Evaluasi Rubrik Insya\''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="text-[10px] font-bold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                TUTUP
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              {/* Total Score Summary - Clean Light Card */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1">Capaian Nilai Karangan</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-stone-900 dark:text-white">
                      {progress.rubricScores?.total || 0}
                    </span>
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {theme.titleIndo}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 font-arabic" dir="rtl">
                    {theme.titleArabic}
                  </div>
                </div>
              </div>

              {/* 4 Rubric Breakdown - Editorial Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.15em]">
                    Parameter Penilaian Analitis
                  </span>
                  <div className="h-px flex-1 bg-stone-100 dark:bg-stone-800 ml-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Fikrah (Gagasan)', val: progress.rubricScores?.fikrah ?? '-', max: 25, desc: 'Kesesuaian isi dengan tema' },
                    { label: 'Tarkib (Kaidah)', val: progress.rubricScores?.tarkib ?? '-', max: 25, desc: 'Ketepatan struktur nahwu' },
                    { label: 'Mufradat (Kosakata)', val: progress.rubricScores?.mufradat ?? '-', max: 25, desc: 'Kekayaan pilihan kata' },
                    { label: 'Imla\' (Penulisan)', val: progress.rubricScores?.imla ?? '-', max: 25, desc: 'Ejaan & harakat khat' },
                  ].map(({ label, val, max, desc }) => (
                    <div key={label} className="p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 shadow-xs hover:border-stone-200 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-stone-900 dark:text-white">{label}</span>
                        <div className="text-xs font-black text-stone-900 dark:text-white flex items-baseline gap-0.5">
                          <span>{val}</span>
                          <span className="text-[9px] text-stone-400 font-medium">/ {max}</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full overflow-hidden mb-2">
                        <div 
                          className="bg-burgundy-800 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(Number(val) || 0) / max * 100}%` }} 
                        />
                      </div>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400 leading-tight">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-4">
                {/* Primary Feedback (AI for Solo without review, Teacher for KBM or if reviewed) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 block">
                    {progress.status === 'reviewed' || (!isSolo && progress.feedback) 
                      ? 'Umpan Balik Guru / Instruktur' 
                      : (isSolo ? 'Analisis Otomatis Sistem' : 'Umpan Balik Instruktur')}
                  </span>
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                    {progress.feedback || (isSolo ? 'Belum ada catatan dari sistem.' : 'Belum ada catatan dari guru.')}
                  </div>
                </div>

                {progress.teacherNotes && (
                  <div className="space-y-1.5 p-4 rounded-xl bg-burgundy-50/40 dark:bg-burgundy-950/30 border border-burgundy-200 dark:border-burgundy-900/60 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-1">
                      <span className="text-xs font-bold text-burgundy-800 dark:text-burgundy-400 uppercase tracking-wide">
                        Catatan Tambahan Guru
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed font-medium">
                      {progress.teacherNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsScoreModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors"
              >
                Cetak Lembar Rapor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
