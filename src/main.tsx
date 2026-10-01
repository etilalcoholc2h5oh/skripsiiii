import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  PenTool, Moon, Sun, BookOpen, Users, LogOut, CheckCircle2, 
  RotateCcw, Download, Sparkles, Volume2, Award, Eraser, 
  FileText, ChevronRight, UserCheck, Layers, RefreshCw
} from 'lucide-react';

// --- DATA PEMBELAJARAN INSYA' ---
interface Mufradat {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface ThemeTopic {
  id: string;
  titleArabic: string;
  titleIndo: string;
  grade: string;
  prompt: string;
  mufradat: Mufradat[];
  tarkib: string;
  contohInsya: string;
}

const THEMES: ThemeTopic[] = [
  {
    id: 'tasawwuq',
    titleArabic: 'التَّسَوُّقُ فِي السُّوقِ التَّقْلِيدِيِّ',
    titleIndo: 'Berbelanja di Pasar Tradisional',
    grade: 'Kelas XI MA',
    prompt: 'Tuliskan karangan singkat tentang pengalamanmu berbelanja kebutuhan di pasar tradisional, barang yang kamu beli, dan bagaimana proses tawar-menawar.',
    mufradat: [
      { word: 'سُوقٌ تَقْلِيدِيٌّ', meaning: 'Pasar Tradisional', pronunciation: 'Suuqun taqliidiyyun' },
      { word: 'خُضْرَاوَاتٌ', meaning: 'Sayur-sayuran', pronunciation: 'Khudhraawaatun' },
      { word: 'فَوَاكِهُ', meaning: 'Buah-buahan', pronunciation: 'Fawaakihu' },
      { word: 'ثَمَنٌ / سِعْرٌ', meaning: 'Harga', pronunciation: 'Tsamanun / Si\'run' },
      { word: 'بَائِعٌ وَمُشْتَرٍ', meaning: 'Penjual dan Pembeli', pronunciation: 'Baa-i\'un wa musytarin' }
    ],
    tarkib: 'Susunan Jumlah Fi\'liyyah (فعل + فاعل + مفعول به)',
    contohInsya: 'ذَهَبْتُ إِلَى السُّوقِ التَّقْلِيدِيِّ مَعَ أُمِّي فِي الصَّبَاحِ الْبَاكِرِ. اشْتَرَتْ أُمِّي الْخُضْرَاوَاتِ وَالْفَوَاكِهَ الطَّازَجَةَ.'
  },
  {
    id: 'hiwayah',
    titleArabic: 'الْهِوَايَةُ الْمُفَضَّلَةُ',
    titleIndo: 'Hobi dan Kegemaran',
    grade: 'Kelas X MA',
    prompt: 'Ceritakan hobi yang paling kamu sukai di waktu luang, alasan kamu menyukainya, dan manfaatnya bagi dirimu.',
    mufradat: [
      { word: 'قِرَاءَةُ الْكُتُبِ', meaning: 'Membaca Buku', pronunciation: 'Qiraa-atul kutubi' },
      { word: 'كُرَةُ الْقَدَمِ', meaning: 'Sepak Bola', pronunciation: 'Kurratul qadami' },
      { word: 'الرَّسْمُ وَالْخَطُّ', meaning: 'Melukis & Kaligrafi', pronunciation: 'Ar-rasmu wal khaththu' },
      { word: 'وَقْتُ الْفَرَاغِ', meaning: 'Waktu Luang', pronunciation: 'Waqtul faraaghi' }
    ],
    tarkib: 'Mubtada\' + Khabar (Jumlah Ismiyyah)',
    contohInsya: 'هِوَايَتِي الْمُفَضَّلَةُ هِيَ كِتَابَةُ الْخَطِّ الْعَرَبِيِّ فِي وَقْتِ الْفَرَاغِ، لِأَنَّهَا تُعَلِّمُنِي الصَّبْرَ وَالْجَمَالَ.'
  }
];

interface Submission {
  id: string;
  studentName: string;
  themeTitle: string;
  text: string;
  canvasImage?: string;
  score: number;
  feedback: string;
  timestamp: string;
}

// --- KOMPONEN KANVAS MENULIS ARAB ---
function HandwritingCanvas({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e293b');
  const [penSize, setPenSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolusi kanvas
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 260;
    drawGuidelines(ctx, canvas.width, canvas.height);
  }, []);

  const drawGuidelines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Garis bantu penulisan Arab (Khat Naskhi)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 60; y < height; y += 70) {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(10, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();

      // Garis bantu tengah putus-putus
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#cbd5e1';
      ctx.moveTo(10, y - 25);
      ctx.lineTo(width - 10, y - 25);
      ctx.stroke();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    drawGuidelines(ctx, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-lg flex items-center gap-1 ${!isEraser ? 'bg-white dark:bg-slate-700 shadow text-emerald-600' : 'text-slate-600'}`}
          >
            <PenTool className="w-3.5 h-3.5" /> Pena
          </button>
          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-lg flex items-center gap-1 ${isEraser ? 'bg-white dark:bg-slate-700 shadow text-amber-600' : 'text-slate-600'}`}
          >
            <Eraser className="w-3.5 h-3.5" /> Penghapus
          </button>
          <div className="flex gap-1 items-center ml-2">
            {['#1e293b', '#047857', '#b91c1c', '#1d4ed8'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setPenColor(c); setIsEraser(false); }}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border-2 ${penColor === c && !isEraser ? 'border-amber-400 scale-110' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={clearCanvas}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Hapus Semua
        </button>
      </div>

      <div className="relative border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full touch-none cursor-crosshair"
        />
      </div>
      <p className="text-[11px] text-slate-500 text-right italic">
        *Tuliskan huruf atau kalimat Arab di atas garis bantu menggunakan stylus atau jari Anda.
      </p>
    </div>
  );
}

// --- APLIKASI UTAMA ---
function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState<'selection' | 'student' | 'teacher'>('selection');
  const [studentName, setStudentName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeTopic>(THEMES[0]);
  const [essayText, setEssayText] = useState('');
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ score: number; feedback: string } | null>(null);
  
  // Riwayat Pengumpulan (Tersimpan Lokal)
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('kitabah_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const playVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEvaluate = () => {
    if (!essayText.trim() && !canvasDataUrl) {
      alert('Harap ketik karangan insya atau tuliskan di kanvas terlebih dahulu.');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    // Simulasi Evaluasi Rubrik Maharah Kitabah
    setTimeout(() => {
      let score = 85;
      const textLen = essayText.trim().split(/\s+/).length;
      if (textLen >= 15) score += 10;
      else if (textLen >= 8) score += 5;
      else score -= 5;

      if (canvasDataUrl) score = Math.min(100, score + 5);

      const feedback = `Mumtaz! Karangan Anda menggunakan kosa kata bertema "${selectedTheme.titleIndo}" dengan sangat baik. Susunan struktur kalimat Arab sudah sesuai dengan kaidah tarkib yang dipelajari. Pertahankan kelenturan goresan huruf pada kanvas tulis!`;

      const newResult = { score: Math.min(100, Math.max(70, score)), feedback };
      setEvaluationResult(newResult);

      // Simpan ke riwayat guru
      const newSub: Submission = {
        id: Date.now().toString(),
        studentName: studentName || 'Siswa Mandiri',
        themeTitle: selectedTheme.titleIndo,
        text: essayText,
        canvasImage: canvasDataUrl,
        score: newResult.score,
        feedback: newResult.feedback,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [newSub, ...submissions];
      setSubmissions(updated);
      localStorage.setItem('kitabah_submissions', JSON.stringify(updated));
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors font-sans pb-12`}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-bold text-lg">
            ك
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-emerald-800 dark:text-emerald-400">Kitabah Touch</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Media Pembelajaran Maharah Kitabah Madrasah Aliyah</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'selection' && (
            <button
              onClick={() => setRole('selection')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Menu
            </button>
          )}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* HALAMAN PEMILIHAN PERAN */}
        {role === 'selection' && (
          <div className="py-12 space-y-6 text-center">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                Eksperimen Maharah Kitabah
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Selamat Datang di Kitabah Touch
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Silakan pilih peran untuk memulai latihan menulis insya atau mengelola ruang evaluasi belajar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
              <div 
                onClick={() => setRole('student')}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer shadow-sm hover:shadow-md transition text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Masuk sebagai Siswa</h3>
                <p className="text-xs text-slate-500 mt-1">Latihan menulis karangan Arab (Insya) dengan kanvas stylus & evaluasi langsung.</p>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 gap-1">
                  Mulai Menulis <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div 
                onClick={() => setRole('teacher')}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md transition text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dashboard Guru</h3>
                <p className="text-xs text-slate-500 mt-1">Pantau hasil tulisan siswa, rekap skor rubrik, dan kelola tugas kelas.</p>
                <div className="mt-4 flex items-center text-xs font-bold text-blue-600 gap-1">
                  Buka Pantauan <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE SISWA */}
        {role === 'student' && (
          <div className="space-y-6">
            {/* Input Nama Siswa & Pilihan Tema */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Siswa:</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Contoh: Muhammad Farhan"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Tema Karangan:</label>
                  <select
                    value={selectedTheme.id}
                    onChange={(e) => {
                      const t = THEMES.find(x => x.id === e.target.value);
                      if (t) setSelectedTheme(t);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-emerald-500"
                  >
                    {THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.titleIndo} ({t.grade})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box Tema Terpilih */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">{selectedTheme.titleIndo}</h3>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-400 mt-0.5">{selectedTheme.prompt}</p>
                  </div>
                  <span className="font-arabic text-xl font-bold text-emerald-800 dark:text-emerald-300 dir-rtl text-right">
                    {selectedTheme.titleArabic}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Kosakata (Mufradat) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bank Mufradat Bantu
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedTheme.mufradat.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-500">{m.meaning}</span>
                      <button 
                        type="button" 
                        onClick={() => playVoice(m.word)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-emerald-600"
                        title="Dengarkan Suara"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-arabic font-bold text-right text-slate-900 dark:text-white" dir="rtl">
                      {m.word}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanvas Menulis Goresan Arab */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="text-sm font-bold text-
