import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Eraser, PenTool, Check, ShieldCheck, Minus, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  pressure: number;
  time: number;
}

interface HandwritingCanvasProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  isDarkMode: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ initialDataUrl, onSave, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState(isDarkMode ? '#F4F3EE' : '#1C1917');
  const [baseSize, setBaseSize] = useState(3);
  const [paperStyle, setPaperStyle] = useState<'dots' | 'lines' | 'blank' | 'grid'>('dots');
  const [stylusOnly, setStylusOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const lastLiveUpdateRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setStrokeColor(isDarkMode ? '#F4F3EE' : '#1C1917');
  }, [isDarkMode]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    // High-DPI Setup
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const h = isFullscreen ? window.innerHeight - 100 : (window.innerWidth < 640 ? 320 : 400);
    canvas.width = rect.width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    drawGuidelines(ctx, rect.width, h, isDarkMode);

    if (initialDataUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, h);
      };
      img.src = initialDataUrl;
    }
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [isDarkMode, isFullscreen, paperStyle]);

  const drawGuidelines = (ctx: CanvasRenderingContext2D, width: number, height: number, dark: boolean) => {
    ctx.fillStyle = dark ? '#0F172A' : '#FFFFFF'; 
    ctx.fillRect(0, 0, width, height);

    if (paperStyle === 'blank') return;

    // Background pattern
    const dotSpacing = 24;
    const dotSize = 0.8;
    
    if (paperStyle === 'dots') {
      ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)';
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (paperStyle === 'grid') {
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';
      ctx.lineWidth = 0.5;
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }

    if (paperStyle === 'lines' || paperStyle === 'dots') {
      // Main base lines
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.1)';
      ctx.lineWidth = 0.5;
      for (let y = 48; y < height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  const getDistance = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stylusOnly && e.pointerType !== 'pen') return;
    if (!e.isPrimary) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;

    setIsDrawing(true);
    const newPoint = { x, y, pressure, time: Date.now() };
    setPoints([newPoint]);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? (isDarkMode ? '#0F172A' : '#F8FAFC') : strokeColor;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (stylusOnly && e.pointerType !== 'pen') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure || 0.5;
    const time = Date.now();

    const newPoint = { x, y, pressure, time };
    const lastPoint = points[points.length - 1];

    const dist = getDistance(lastPoint, newPoint);
    if (dist < 1.2) return;

    // Velocity-based stroke width
    const dt = time - lastPoint.time;
    const velocity = dist / Math.max(dt, 1);
    
    // Adaptive width: slower = thicker, faster = thinner
    let targetWidth = tool === 'eraser' 
      ? baseSize * 8 
      : baseSize * (0.8 + pressure * 1.5) * (1 / (1 + velocity * 0.15));
    
    targetWidth = Math.max(baseSize * 0.4, Math.min(targetWidth, baseSize * 3));

    // Smooth width transition
    ctx.lineWidth = (ctx.lineWidth + targetWidth) / 2;

    const midX = (lastPoint.x + x) / 2;
    const midY = (lastPoint.y + y) / 2;
    
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    setPoints(prev => [...prev, newPoint]);

    const now = Date.now();
    if (now - lastLiveUpdateRef.current > 1500) {
      lastLiveUpdateRef.current = now;
      onSave(canvas.toDataURL('image/webp', 0.3));
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setPoints([]);
    triggerAutoSave();
  };

  const triggerAutoSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    drawGuidelines(ctx, rect.width, canvas.height / (window.devicePixelRatio || 1), isDarkMode);
    triggerAutoSave();
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-3 sm:space-y-4 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-stone-50 dark:bg-slate-950 p-4 sm:p-6 overflow-hidden' : 'relative'}`}
    >
      {/* Premium Notes Toolbar - Floating Style */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 sm:p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg transition-all ${isFullscreen ? 'max-w-4xl mx-auto mb-4' : ''}`}>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          {/* Tool Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl shrink-0">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold ${tool === 'pen' ? 'bg-white dark:bg-slate-700 text-burgundy-900 dark:text-burgundy-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              PENA
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold ${tool === 'eraser' ? 'bg-white dark:bg-slate-700 text-burgundy-900 dark:text-burgundy-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              HAPUS
            </button>
          </div>

          {/* Color Palette (Scrollable on mobile) */}
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {[
              { c: isDarkMode ? '#F4F3EE' : '#1C1917', label: 'Default' },
              { c: '#0369a1', label: 'Blue' },
              { c: '#b91c1c', label: 'Red' },
              { c: '#15803d', label: 'Green' }
            ].map((item) => (
              <button
                key={item.c}
                onClick={() => { setStrokeColor(item.c); setTool('pen'); }}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shrink-0 ${strokeColor === item.c ? 'border-burgundy-500 ring-4 ring-burgundy-500/10 scale-110' : 'border-white/50 dark:border-black/50'}`}
                style={{ backgroundColor: item.c }}
              />
            ))}
          </div>
        </div>

        {/* Width & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1 px-2 py-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
            {[2, 3.5, 5].map((s) => (
              <button
                key={s}
                onClick={() => setBaseSize(s)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${baseSize === s ? 'bg-white dark:bg-slate-700 shadow-sm text-burgundy-900 dark:text-burgundy-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <div 
                  className="rounded-full bg-current"
                  style={{ width: s * 1.5, height: s * 1.5 }}
                />
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
              {(['dots', 'lines', 'blank', 'grid'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPaperStyle(s)}
                  className={`px-2 py-1 rounded-lg transition-all text-[8px] font-black ${paperStyle === s ? 'bg-white dark:bg-slate-700 shadow-sm text-burgundy-900 dark:text-burgundy-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <button
              onClick={() => setStylusOnly(!stylusOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                stylusOnly 
                  ? 'bg-burgundy-600 text-white border-burgundy-600 shadow-md shadow-burgundy-500/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>STYLUS</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold ${isFullscreen ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
            >
              LAYAR
            </button>

            <button
              onClick={clearCanvas}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
              title="Hapus Kanvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className={`relative group rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl bg-white dark:bg-slate-950 transition-all ${isFullscreen ? 'h-full max-w-5xl mx-auto' : ''}`}>
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className={`w-full cursor-crosshair touch-none select-none ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[320px] sm:h-[400px]'}`}
        />
        
        {savedSuccess && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 text-xs font-bold rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span>Tersimpan Otomatis</span>
          </div>
        )}

        {/* Floating Tooltip for Precision */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="px-2 py-1 bg-white/50 dark:bg-black/30 backdrop-blur-[2px] rounded-md text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-200/50 dark:border-slate-800/50">
            Kanvas Khat Digital v2.0
          </div>
        </div>
      </div>

      {!isFullscreen && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium tracking-widest uppercase flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
          Tinta Dinamis Hasil Rapi Otomatis
          <span className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
        </p>
      )}
    </div>
  );
};
