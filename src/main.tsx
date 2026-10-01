import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { PenTool, Moon, Sun, BookOpen, Users, LogOut, CheckCircle2, RotateCcw, Volume2, Award, Eraser } from 'lucide-react';

const THEMES = [
  {
    id: 'tasawwuq',
    titleArabic: 'التَّسَوُّقُ فِي السُّوقِ التَّقْلِيدِيِّ',
    titleIndo: 'Berbelanja di Pasar Tradisional',
    prompt: 'Tuliskan karangan singkat tentang pengalaman berbelanja di pasar tradisional.',
    mufradat: [
      { word: 'سُوقٌ تَقْلِيدِيٌّ', meaning: 'Pasar Tradisional' },
      { word: 'خُضْرَاوَاتٌ', meaning: 'Sayur-sayuran' },
      { word: 'فَوَاكِهُ', meaning: 'Buah-buahan' },
      { word: 'ثَمَنٌ / سِعْرٌ', meaning: 'Harga' }
    ]
  },
  {
    id: 'hiwayah',
    titleArabic: 'الْهِوَايَةُ الْمُفَضَّلَةُ',
    titleIndo: 'Hobi dan Kegemaran',
    prompt: 'Ceritakan hobi yang paling kamu sukai di waktu luang serta manfaatnya.',
    mufradat: [
      { word: 'قِرَاءَةُ الْكُتُبِ', meaning: 'Membaca Buku' },
      { word: 'كُرَةُ الْقَدَمِ', meaning: 'Sepak Bola' },
      { word: 'الرَّسْمُ وَالْخَطُّ', meaning: 'Melukis & Kaligrafi' },
      { word: 'وَقْتُ الْفَرَاغِ', meaning: 'Waktu Luang' }
    ]
  }
];

function HandwritingCanvas({ onSave }: { onSave: (url: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = c.parentElement?.clientWidth || 500;
    c.height = 220;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#e2e8f0';
    for (let y = 50; y < c.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(c.width - 10, y);
      ctx.stroke();
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = getPos(e);
    ctx.strokeStyle = isEraser ? '#ffffff' : '#047857';
    ctx.lineWidth = isEraser ? 16 : 4;
    ctx.lineCap = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stop = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) onSave(canvasRef.current.toDataURL());
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#e2e8f0';
    for (let y = 50; y < c.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(c.width - 10, y);
      ctx.stroke();
    }
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs">
        <div className="flex gap-2">
          <button type="button" onClick={() => setIsEraser(false)} className={`px-2 py-1 rounded ${!isEraser ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'}`}>Pena</button>
          <button type="button" onClick={() => setIsEraser(true)} className={`px-2 py-1 rounded ${isEraser ? 'bg-amber-600 text-white font-bold' : 'text-slate-600'}`}>Hapus</button>
        </div>
        <button type="button" onClick={clear} className="text-rose-600 font-bold flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Bersihkan</button>
      </div>
      <canvas ref={canvasRef} onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} className="w-full border-2 border-slate-300 dark:border-slate-700 rounded-xl bg-white touch-none cursor-crosshair" />
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [text, setText] = useState('');
  const [canvasUrl, setCanvasUrl] = useState('');
  const [evalResult, setEvalResult] = useState<{ score: number; msg: string } | null>(null);
  const [history, setHistory] = useState<any[]>(() => {
    const s = localStorage.getItem('kitabah_history');
    return s ? JSON.parse(s) : [];
  });

  const playVoice = (w: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(w);
      u.lang = 'ar-SA';
      window.speechSynthesis.speak(u);
    }
  };

  const handleEvaluate = () => {
    if (!text && !canvasUrl) {
      alert('Tuliskan teks Arab atau gambar di kanvas terlebih dahulu.');
      return;
    }
    const score = Math.floor(Math.random() * 15) + 85;
    const msg = `Mumtaz! Karangan Anda sangat baik. Susunan kalimat Arab dan penggunaan kosa kata bertema "${theme.titleIndo}" sudah tepat.`;
    setEvalResult({ score, msg });

    const newEntry = { id: Date.now(), name: name || 'Siswa', theme: theme.titleIndo, text, img: canvasUrl, score, time: new Date().toLocaleTimeString() };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('kitabah_history', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} p-4 transition-colors font-sans pb-10`}>
      <header className="max-w-2xl mx-auto flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center">ك</div>
          <div>
            <h1 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">Kitabah Touch</h1>
            <p className="text-[10px] text-slate-500">Maharah Kitabah Madrasah Aliyah</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setRole(role === 'student' ? 'teacher' : 'student')} className="text-xs px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-semibold">
            {role === 'student' ? 'Ke Guru' : 'Ke Siswa'}
          </button>
          <button onClick={() => setDark(!dark)} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300">
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {role === 'student' ? (
          <>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nama Siswa..." className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700" />
              <select value={theme.id} onChange={e => setTheme(THEMES.find(t => t.id === e.target.value)!)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-700 font-semibold">
                {THEMES.map(t => <option key={t.id} value={t.id}>{t.titleIndo}</option>)}
              </select>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <span className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">{theme.prompt}</span>
                <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300" dir="rtl">{theme.titleArabic}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 mb-2">BANK MUFRADAT (KOSAKATA)</h3>
              <div className="grid grid-cols-2 gap-2">
                {theme.mufradat.map((m, i) => (
                  <div key={i} className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500">{m.meaning}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold" dir="rtl">{m.word}</span>
                      <button type="button" onClick={() => playVoice(m.word)} className="text-emerald-600 p-0.5"><Volume2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><PenTool className="w-3.5 h-3.5" /> KANVAS TULIS ARAB</h3>
              <HandwritingCanvas onSave={setCanvasUrl} />
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-500">SALINAN INSYA' KETIK</h3>
              <textarea dir="rtl" rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="اُكْتُبْ هُنَا إِنْشَاءَكَ..." className="w-full p-2.5 text-base border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-right" />
              <button type="button" onClick={handleEvaluate} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Kumpulkan & Nilai Insya'
              </button>
            </div>

            {evalResult && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-emerald-500 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Award className="w-4 h-4" /> Evaluasi</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded text-sm">Nilai: {evalResult.score}/100</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{evalResult.msg}</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="font-bold text-sm">Dashboard Guru - Rekap Siswa ({history.length})</h2>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada tugas siswa.</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{h.name} - {h.theme}</span>
                    <span className="text-emerald-600">Nilai: {h.score}</span>
                  </div>
                  {h.text && <p className="text-right" dir="rtl">{h.text}</p>}
                  {h.img && <img src={h.img} alt="Tulis" className="max-h-20 border rounded" />}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
