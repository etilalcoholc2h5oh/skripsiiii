import React, { useState, useEffect } from 'react';
import { subscribeToStudents, updateStudentProgress, StudentProgress, ClassSession, RubricScores } from '../lib/db';
import { THEMES } from '../data';
import { 
  CheckCircle2, Search, Copy, Check, 
  Users, Eye, PenTool, Send, FileText,
  Lock, EyeOff, ShieldCheck, Printer, ArrowLeft, X
} from 'lucide-react';
import { PrintPdfModal } from './PrintPdfModal';

interface TeacherDashboardProps {
  session: ClassSession;
  isDarkMode: boolean;
  onExit?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ session, isDarkMode, onExit }) => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  // Feedback & Rubric state
  const [feedbackText, setFeedbackText] = useState('');
  const [rubric, setRubric] = useState<RubricScores>({
    fikrah: 20,
    tarkib: 20,
    mufradat: 20,
    imla: 20,
    total: 80
  });
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStudents(session.id, (data) => {
      setStudents(data);
      if (selectedStudent) {
        const updated = data.find(s => s.id === selectedStudent.id);
        if (updated) {
          setSelectedStudent(updated);
        }
      }
    });
    return () => unsub();
  }, [session.id, selectedStudent?.id]);

  const handleSelectStudent = (student: StudentProgress) => {
    setSelectedStudent(student);
    setFeedbackText(student.feedback || '');
    setTeacherNotes(student.teacherNotes || '');
    if (student.rubricScores) {
      setRubric(student.rubricScores);
    } else {
      setRubric({ fikrah: 20, tarkib: 20, mufradat: 20, imla: 20, total: 80 });
    }
  };

  const updateRubricScore = (field: keyof Omit<RubricScores, 'total'>, val: number) => {
    const clamped = Math.max(0, Math.min(25, val));
    const newRubric = { ...rubric, [field]: clamped };
    newRubric.total = newRubric.fikrah + newRubric.tarkib + newRubric.mufradat + newRubric.imla;
    setRubric(newRubric);
  };

  const handleSaveAssessment = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    try {
      await updateStudentProgress(session.id, selectedStudent.id, {
        feedback: feedbackText,
        teacherNotes: teacherNotes,
        rubricScores: rubric,
        status: 'reviewed'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?code=${session.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const insertQuickFeedback = (text: string) => {
    setFeedbackText(prev => prev ? `${prev}\n${text}` : `${text}`);
  };

  const theme = THEMES.find(t => t.id === session?.themeId) || THEMES[0];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const submittedCount = students.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
  const gradedCount = students.filter(s => s.status === 'reviewed' || s.rubricScores).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Teacher Top Bar Summary */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-900 dark:text-white">Instruktur: {session.teacherName || 'Pengampu'}</span>
            <span>{theme.grade}</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-white flex flex-wrap items-center gap-2">
            <span>{theme.titleIndo}</span>
            <span className="text-stone-400 font-arabic font-normal text-base sm:text-lg" dir="rtl">({theme.titleArabic})</span>
            {session.isSoloPractice && (
              <span className="px-2 py-0.5 bg-burgundy-100 dark:bg-burgundy-950 text-burgundy-800 dark:text-burgundy-400 text-[9px] sm:text-[10px] font-bold rounded-full border border-burgundy-200 dark:border-burgundy-800 uppercase tracking-tight">
                Review Mandiri
              </span>
            )}
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">
            {students.length} Siswa {submittedCount} Terkirim {gradedCount} Dinilai
          </p>
        </div>

        {/* Access Code & PIN Panel */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 sm:py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            title="Bagikan Tautan Masuk Otomatis ke Siswa"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-stone-100 dark:text-stone-900" /> : <Send className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Otomatis Siswa'}</span>
          </button>

          <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between sm:justify-start gap-3">
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-semibold uppercase block">KODE KELAS</span>
              <span className="font-mono font-bold text-sm sm:text-lg text-burgundy-800 dark:text-burgundy-400">{session.id}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 sm:p-2 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg shadow-2xs border border-stone-200 dark:border-stone-600 transition-colors"
              title="Salin Kode Kelas"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-stone-700 dark:text-stone-200" /> : <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />}
            </button>
          </div>

          <div className="px-3 py-2 sm:py-2.5 bg-stone-50 dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700 text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mb-0.5">
              <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold">PIN</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-stone-900 dark:text-white text-sm sm:text-base">
              <span>{showPin ? (session.teacherPin || '3103') : '••••'}</span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-2 sm:py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 shrink-0"
              title="Lihat Daftar Sesi Real-Time & Latihan Mandiri Siswa"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Sesi Mandiri Lain</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Roster & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Student List Roster (5 cols) */}
        <div className={`lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4 ${selectedStudent ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-stone-500 dark:text-stone-400" /> Roster Siswa ({students.length})
            </span>
            <div className="relative w-44">
              <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-stone-400 dark:text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400 dark:text-stone-500">
                {students.length === 0 ? 'Belum ada siswa yang bergabung dengan kode ini.' : 'Tidak ada siswa yang cocok.'}
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedStudent?.id === st.id;
                const draftWords = (st.draft || '').trim() ? (st.draft || '').trim().split(/\s+/).length : 0;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStudent(st)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-burgundy-800 dark:border-burgundy-600 bg-burgundy-50/60 dark:bg-burgundy-950/50'
                        : 'border-stone-200 dark:border-stone-700/80 bg-stone-50/50 dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <span className="font-semibold text-xs text-stone-900 dark:text-white block truncate">
                        {st.name}
                      </span>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                        <span>Langkah {st.step || 1}/3</span>
                        <span>{draftWords} Kata</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {st.rubricScores ? (
                        <span className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-md">
                          {st.rubricScores.total} / 100
                        </span>
                      ) : st.status === 'submitted' ? (
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/70 border border-blue-200/50 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-[10px] font-semibold rounded-md">
                          Terkirim
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 dark:text-stone-400">
                          Menulis
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Student Evaluation & Rubric Desk (7 cols) */}
        <div className="lg:col-span-7">
          {selectedStudent ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-6">
              
              {/* Student Header Details */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <button 
                    onClick={() => setSelectedStudent(null)} 
                    className="lg:hidden text-xs text-stone-500 dark:text-stone-400 font-semibold mb-2 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Roster
                  </button>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Langkah Saat Ini: {selectedStudent.step}/3 {selectedStudent.status === 'submitted' ? 'Draf Telah Diserahkan' : 'Sedang Mengerjakan'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/80 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Rapor</span>
                </button>
              </div>

              {/* Student Draft Inspection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    Naskah Karangan Siswa:
                  </span>
                  {selectedStudent.writingMode === 'handwriting' && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-stone-600 dark:bg-stone-300" />
                      <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-widest">Pena Aktif</span>
                    </div>
                  )}
                </div>

                {selectedStudent.writingMode === 'handwriting' || selectedStudent.handwritingDataUrl ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-stone-100 dark:bg-stone-800 rounded-xl -z-10" />
                    <img 
                      src={selectedStudent.handwritingDataUrl} 
                      alt="Handwriting" 
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#16171A] shadow-sm min-h-[200px] object-contain"
                    />
                    <div className="mt-2 text-[10px] text-stone-400 dark:text-stone-500 italic flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Memantau proses penulisan tangan secara real-time
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#15171A] border border-stone-200 dark:border-stone-700 min-h-[140px] text-lg font-arabic rtl-dir leading-[2.4] text-stone-900 dark:text-stone-100">
                    {selectedStudent.draft || (
                      <span className="text-xs font-sans text-stone-400 dark:text-stone-500 ltr-dir not-italic">
                        (Siswa belum menuliskan kalimat pada lembar karangan)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Rubric Evaluation Form */}
              <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Penilaian Rubrik 4 Dimensi (Maks 25 per aspek)
                  </span>
                  <div className="text-xs font-bold text-burgundy-800 dark:text-burgundy-400">
                    Total: {rubric.total} / 100
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'fikrah' as const, label: '1. Gagasan & Isi (Fikrah)', desc: 'Alur ide pembuka, inti, dan penutup' },
                    { key: 'tarkib' as const, label: '2. Kaidah Nahwu (Tarkib)', desc: 'Kesesuaian fi\'il-fa\'il & struktur kalimat' },
                    { key: 'mufradat' as const, label: '3. Kosakata (Mufradat)', desc: 'Kekayaan dan ketepatan kata tematik' },
                    { key: 'imla' as const, label: '4. Ejaan & Khat (Imla\')', desc: 'Hamzah, ta\' marbuthah, tanda baca' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{label}</span>
                        <input
                          type="number"
                          min={0}
                          max={25}
                          value={rubric[key]}
                          onChange={(e) => updateRubricScore(key, parseInt(e.target.value) || 0)}
                          className="w-14 px-2 py-1 text-center font-bold text-xs rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Feedback Notes */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Catatan Umpan Balik Guru (Feedback Tertulis):
                </span>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Berikan saran konstruktif untuk siswa..."
                  className="w-full p-3.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#15171A] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
                />

                {/* Quick Feedback Shortcuts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Mumtaz! Susunan kalimat sangat runut.',
                    'Perhatikan kesesuaian fi\'il dan fa\'il.',
                    'Gunakan lebih banyak mufradat tematik.',
                    'Tambahkan harakat pada kata kunci penting.'
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertQuickFeedback(phrase)}
                      className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 text-[11px] font-medium rounded-md transition-colors"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Follow-up Notes (Susulan) */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    {session.isSoloPractice ? 'Catatan Review Guru (Susulan):' : 'Tanggapan/Catatan Tambahan Guru:'}
                  </span>
                  {session.isSoloPractice && (
                    <span className="text-[10px] bg-burgundy-100 dark:bg-burgundy-950 text-burgundy-800 dark:text-burgundy-400 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                      Review Manusia
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Berikan catatan tambahan atau koreksi manual di sini..."
                  className="w-full p-3.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#15171A] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-burgundy-800/30"
                />
              </div>

              {/* Save & Confirm Action */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                {saveSuccess ? (
                  <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Nilai & Umpan Balik Tersimpan
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Siswa akan langsung melihat pembaruan nilai di layar mereka.
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveAssessment}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow-xs"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Nilai & Kirim Umpan Balik'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* PDF Export Modal */}
      {selectedStudent && (
        <PrintPdfModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={{
            ...selectedStudent,
            name: selectedStudent.name || 'Siswa',
            draft: selectedStudent.draft || '',
            ideas: selectedStudent.ideas || []
          }}
          theme={theme}
          sessionId={session.id}
          isTeacher={true}
        />
      )}
    </div>
  );
};
