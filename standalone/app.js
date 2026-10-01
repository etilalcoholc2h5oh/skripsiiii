/**
 * Kitabah Touch - Standalone Vanilla JS Controller
 * Built with sleek Gen Z responsive styles & complete offline support
 */

// 1. Theme Data (Madrasah Aliyah Curriculum Topics)
const THEMES = [
  {
    id: 'kesehatan',
    titleArabic: 'الصحة والخدمات الصحية',
    titleIndo: 'Kesehatan & Layanan Kesehatan',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    prompt: 'Tuliskan karangan singkat (insya\') minimal 3 kalimat tentang pentingnya menjaga kesehatan serta peran petugas medis atau rumah sakit dalam kehidupan sehari-hari.',
    mufradat: [
      { word: 'المستشفى', meaning: 'Rumah Sakit', pronunciation: 'al-mustashfa' },
      { word: 'الطبيب', meaning: 'Dokter', pronunciation: 'at-thabiib' },
      { word: 'الدواء', meaning: 'Obat', pronunciation: 'ad-dawaa\'' },
      { word: 'الصحة', meaning: 'Kesehatan', pronunciation: 'as-sihhah' },
      { word: 'المريض', meaning: 'Pasien', pronunciation: 'al-mariidh' },
      { word: 'الوقاية', meaning: 'Pencegahan', pronunciation: 'al-wiqaayah' },
      { word: 'العلاج', meaning: 'Pengobatan', pronunciation: 'al-\'ilaaj' },
      { word: 'الصيدلية', meaning: 'Apotek', pronunciation: 'as-shaidaliyyah' }
    ]
  },
  {
    id: 'remaja',
    titleArabic: 'حياة المراهقين والآمال',
    titleIndo: 'Kehidupan Remaja & Cita-Cita',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    prompt: 'Gambarkan kehidupan para remaja di lingkungan Madrasah Aliyah beserta cita-cita luhur yang ingin dicapai setelah lulus nanti.',
    mufradat: [
      { word: 'الشباب', meaning: 'Pemuda / Remaja', pronunciation: 'ash-shabaab' },
      { word: 'الأمنية', meaning: 'Cita-cita', pronunciation: 'al-umniyyah' },
      { word: 'الدراسة', meaning: 'Pembelajaran', pronunciation: 'ad-diraasah' },
      { word: 'المستقبل', meaning: 'Masa depan', pronunciation: 'al-mustaqbal' },
      { word: 'النجاح', meaning: 'Kesuksesan', pronunciation: 'an-najaah' },
      { word: 'الاجتهاد', meaning: 'Kesungguhan', pronunciation: 'al-ijtihad' },
      { word: 'الجامعة', meaning: 'Universitas', pronunciation: 'al-jaami\'ah' },
      { word: 'التعليم', meaning: 'Pendidikan', pronunciation: 'at-ta\'liim' }
    ]
  },
  {
    id: 'teknologi',
    titleArabic: 'المرافق العامة والتكنولوجيا',
    titleIndo: 'Fasilitas Umum & Teknologi',
    imageUrl: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&q=80&w=600',
    prompt: 'Uraikan pendapatmu dalam bahasa Arab tentang bagaimana teknologi komputer, internet, dan telepon pintar membantu siswa melakukan riset tugas sekolah.',
    mufradat: [
      { word: 'الهاتف الذكي', meaning: 'Smartphone', pronunciation: 'al-haatif adzdza-kiy' },
      { word: 'الحاسوب', meaning: 'Komputer', pronunciation: 'al-haasuub' },
      { word: 'الإنترنت', meaning: 'Internet', pronunciation: 'al-intarnit' },
      { word: 'التواصل', meaning: 'Komunikasi', pronunciation: 'at-tawaashul' },
      { word: 'التطبيق', meaning: 'Aplikasi', pronunciation: 'at-thathbiiq' },
      { word: 'الشبكة', meaning: 'Jaringan', pronunciation: 'ash-shabakah' },
      { word: 'المعلومات', meaning: 'Informasi', pronunciation: 'al-ma\'luumaat' },
      { word: 'التقدم', meaning: 'Kemajuan', pronunciation: 'at-taqaddum' }
    ]
  },
  {
    id: 'peradaban',
    titleArabic: 'الثقافة والحضارة الإسلامية',
    titleIndo: 'Kebudayaan & Peradaban Islam',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600',
    prompt: 'Ceritakan tentang situs bersejarah kebudayaan Islam, keindahan arsitektur masjid, atau pengaruh para ilmuwan muslim klasik terhadap ilmu pengetahuan modern.',
    mufradat: [
      { word: 'الثقافة', meaning: 'Kebudayaan', pronunciation: 'at-tsaqaafah' },
      { word: 'التاريخ', meaning: 'Sejarah', pronunciation: 'at-taariikh' },
      { word: 'العلم', meaning: 'Ilmu', pronunciation: 'al-\'ilmu' },
      { word: 'المسجد', meaning: 'Masjid', pronunciation: 'al-masjid' },
      { word: 'العلماء', meaning: 'Para Ilmuwan', pronunciation: 'al-\'ulamaa\'' },
      { word: 'التراث', meaning: 'Warisan sejarah', pronunciation: 'at-turaats' },
      { word: 'العمارة', meaning: 'Arsitektur', pronunciation: 'al-\'imaarah' },
      { word: 'التسامح', meaning: 'Toleransi', pronunciation: 'at-tasaamuh' }
    ]
  }
];

// 2. Harakat helper keys
const QUICK_HARAKAT = [
  { label: '◌َ', char: '\u064E', name: 'Fathah' },
  { label: '◌ُ', char: '\u064F', name: 'Dammah' },
  { label: '◌ِ', char: '\u0650', name: 'Kasrah' },
  { label: '◌ْ', char: '\u0652', name: 'Sukun' },
  { label: '◌ّ', char: '\u0651', name: 'Shaddah' },
  { label: '◌ً', char: '\u064B', name: 'Tanwin Fathah' },
  { label: '◌ٌ', char: '\u064C', name: 'Tanwin Dammah' },
  { label: '◌ٍ', char: '\u064D', name: 'Tanwin Kasrah' },
  { label: 'آ', char: 'آ', name: 'Alif Maddah' },
  { label: 'إ', char: 'إ', name: 'Alif Hamzah Bawah' },
  { label: 'أ', char: 'أ', name: 'Alif Hamzah Atas' },
  { label: 'ء', char: 'ء', name: 'Hamzah Mandiri' }
];

// 3. App Local State
let currentThemeId = 'kesehatan';
let showGridLine = true;
let brushColor = '#FF9480'; // soft peach defaults
let brushWidth = 5;
let strokes = [];
let currentStroke = [];
let isDrawing = false;
let historyItems = [];

// 4. DOM Selectors
const toastsContainer = document.getElementById('toasts-container');
const tabWorkspace = document.getElementById('tab-workspace');
const tabHistory = document.getElementById('tab-history');
const viewWorkspace = document.getElementById('view-workspace');
const viewHistory = document.getElementById('view-history');

// Theme selectors
const themeSelector = document.getElementById('theme-selector');
const themePrompt = document.getElementById('theme-prompt');
const themeHeroImg = document.getElementById('theme-hero-img');
const themeArabicTitle = document.getElementById('theme-arabic-title');
const themeIndoTitle = document.getElementById('theme-indo-title');
const mufradatGrid = document.getElementById('mufradat-grid');

// Canvas selectors
const canvas = document.getElementById('digital-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const btnToggleGrid = document.getElementById('btn-toggle-grid');
const btnUndoStroke = document.getElementById('btn-undo-stroke');
const btnClearCanvas = document.getElementById('btn-clear-canvas');
const canvasInkPicker = document.getElementById('canvas-ink-picker');
const canvasBrushPicker = document.getElementById('canvas-brush-picker');
const strokeCountIndicator = document.getElementById('stroke-count-indicator');
const drawHelperPrompt = document.getElementById('draw-helper-prompt');

// Typing elements
const typedLength = document.getElementById('typed-length');
const harakatBoardShell = document.getElementById('harakat-board-shell');
const typedCompositionInput = document.getElementById('typed-composition-input');
const btnClearTextareaText = document.getElementById('btn-clear-textarea-text');
const btnCopyComposition = document.getElementById('btn-copy-composition');
const btnSavePracticeDraft = document.getElementById('btn-save-practice-draft');

// History lists & stats selectors
const historyGridBox = document.getElementById('history-grid-box');
const historyEmptyStatus = document.getElementById('history-empty-status');
const btnEmptyStartWriting = document.getElementById('btn-empty-start-writing');
const statsTotalSessions = document.getElementById('stats-total-sessions');
const statsTotalChars = document.getElementById('stats-total-chars');
const statsTotalStrokes = document.getElementById('stats-total-strokes');

// Dialog/Modal elements
const detailsPreviewDialogOverlay = document.getElementById('details-preview-dialog-overlay');
const btnClosePreviewDialog = document.getElementById('btn-close-preview-dialog');
const modalThemeBadge = document.getElementById('modal-theme-badge');
const modalItemTimestamp = document.getElementById('modal-item-timestamp');
const modalCalligraphyImg = document.getElementById('modal-calligraphy-img');
const modalArabicTypographyText = document.getElementById('modal-arabic-typography-text');
const btnModalCopyText = document.getElementById('btn-modal-copy-text');
const btnModalLoadWork = document.getElementById('btn-modal-load-work');
let activePreviewItem = null;

// Initialize Workspace
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeSelector();
  initHarakatKeys();
  initCanvas();
  loadCachedState();
  syncActiveThemeDetails();
  renderHistoryView();

  // Resize listener
  adjustCanvasResolution();
  window.addEventListener('resize', () => {
    adjustCanvasResolution();
    redrawCanvasStrokes();
  });
});

// Navigation Toggle
function initNavigation() {
  const switchTab = (tab) => {
    if (tab === 'workspace') {
      tabWorkspace.className = "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 bg-gradient-to-r from-peach-accent to-pink-accent text-white shadow-md shadow-peach-accent/15 cursor-pointer";
      tabHistory.className = "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 text-charcoal-muted hover:text-charcoal-warm flex items-center gap-1.5 cursor-pointer";
      viewWorkspace.classList.remove('hidden');
      viewHistory.classList.add('hidden');
      adjustCanvasResolution();
      redrawCanvasStrokes();
    } else {
      tabWorkspace.className = "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 text-charcoal-muted hover:text-charcoal-warm cursor-pointer";
      tabHistory.className = "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 bg-gradient-to-r from-peach-accent to-pink-accent text-white shadow-md shadow-peach-accent/15 flex items-center gap-1.5 cursor-pointer";
      viewWorkspace.classList.add('hidden');
      viewHistory.classList.remove('hidden');
      renderHistoryView();
    }
  };

  tabWorkspace.addEventListener('click', () => switchTab('workspace'));
  tabHistory.addEventListener('click', () => switchTab('history'));
  btnEmptyStartWriting.addEventListener('click', () => switchTab('workspace'));
}

// Custom Bottom Toast
function triggerSleekToast(message, type = 'success') {
  const toastId = 'toast_' + Math.random().toString(36).substring(2, 8);
  const element = document.createElement('div');
  element.id = toastId;
  element.className = "w-full py-3.5 px-6 rounded-full text-center shadow-xl border backdrop-blur-lg animate-slide-up-toast bg-white/95 border-peach-soft/50 text-charcoal-warm font-sans font-medium text-sm flex items-center justify-center gap-3.5";
  element.innerHTML = `
    <div class="w-2.5 h-2.5 rounded-full ${type === 'success' ? 'bg-peach-accent animate-pulse' : 'bg-pink-accent'}"></div>
    <span class="tracking-tight">${message}</span>
  `;

  toastsContainer.appendChild(element);

  setTimeout(() => {
    element.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => element.remove(), 300);
  }, 3500);
}

// Themes list setup
function initThemeSelector() {
  themeSelector.innerHTML = THEMES.map(theme => `
    <option value="${theme.id}">${theme.titleIndo}</option>
  `).join('');

  themeSelector.addEventListener('change', (e) => {
    currentThemeId = e.target.value;
    syncActiveThemeDetails();
    triggerSleekToast('Tema latihan berhasil dipilih');
  });
}

function syncActiveThemeDetails() {
  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  themePrompt.textContent = currentTheme.prompt;
  themeHeroImg.src = currentTheme.imageUrl;
  themeArabicTitle.textContent = currentTheme.titleArabic;
  themeIndoTitle.textContent = currentTheme.titleIndo;

  // Render mufradat grids
  mufradatGrid.innerHTML = currentTheme.mufradat.map(m => `
    <button onclick="window.insertMufradatWord('${m.word}')" class="p-3.5 rounded-2xl border border-peach-blush bg-[#FFFDFD] text-right flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-peach-accent active:scale-95 group cursor-pointer" style="direction: rtl;">
      <span class="text-lg font-bold text-peach-deep font-arabic leading-none group-hover:text-pink-accent transition-colors select-none">${m.word}</span>
      <div class="w-full border-t border-dashed border-peach-soft/10 mt-2 pt-2 flex items-center justify-between">
        <span class="text-[10px] font-mono text-charcoal-muted font-semibold text-left select-none">/${m.pronunciation}/</span>
        <span class="text-[11px] text-charcoal-muted text-right select-none font-medium">${m.meaning}</span>
      </div>
    </button>
  `).join('');
}

// Injects mufradat words directly into typing stream
window.insertMufradatWord = function(word) {
  const start = typedCompositionInput.selectionStart;
  const end = typedCompositionInput.selectionEnd;
  const val = typedCompositionInput.value;

  typedCompositionInput.value = val.substring(0, start) + word + val.substring(end, val.length);
  typedCompositionInput.focus();

  const newPos = start + word.length;
  typedCompositionInput.setSelectionRange(newPos, newPos);
  checkLengthAndSaveActiveDraft();
  triggerSleekToast('Kosakata disisipkan');
};

// Harakat helper build
function initHarakatKeys() {
  harakatBoardShell.innerHTML = QUICK_HARAKAT.map(h => `
    <button data-char="${h.char}" class="py-1.5 rounded-xl text-center bg-white border border-peach-soft/30 hover:border-peach-accent hover:text-peach-deep font-bold text-lg cursor-pointer transition-all font-arabic" title="${h.name}">
      ${h.label}
    </button>
  `).join('');

  harakatBoardShell.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.getAttribute('data-char');
      const start = typedCompositionInput.selectionStart;
      const end = typedCompositionInput.selectionEnd;
      const val = typedCompositionInput.value;

      typedCompositionInput.value = val.substring(0, start) + symbol + val.substring(end, val.length);
      typedCompositionInput.focus();

      const newPos = start + symbol.length;
      typedCompositionInput.setSelectionRange(newPos, newPos);
      checkLengthAndSaveActiveDraft();
    });
  });
}

function checkLengthAndSaveActiveDraft() {
  typedLength.textContent = typedCompositionInput.value.length;
  saveWorkspaceSessionToAutosave();
}

typedCompositionInput.addEventListener('input', checkLengthAndSaveActiveDraft);

// Canvas handlers
function adjustCanvasResolution() {
  const bounding = canvas.getBoundingClientRect();
  canvas.width = bounding.width * 1.5;
  canvas.height = 240 * 1.5; // Aspect ratios lock
}

function initCanvas() {
  const getPointerPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDraw = (e) => {
    if (e.button && e.button !== 0) return;
    const pt = getPointerPos(e);
    if (!pt) return;

    isDrawing = true;
    currentStroke = [pt];
    if (e.cancelable) e.preventDefault();
  };

  const moveDraw = (e) => {
    if (!isDrawing) return;
    const pt = getPointerPos(e);
    if (!pt) return;

    currentStroke.push(pt);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;

    const previous = currentStroke[currentStroke.length - 2];
    if (previous) {
      ctx.beginPath();
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    if (e.cancelable) e.preventDefault();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentStroke.length > 0) {
      strokes.push({
        points: [...currentStroke],
        color: brushColor,
        width: brushWidth
      });
    }
    currentStroke = [];
    updateStrokeCounter();
    saveWorkspaceSessionToAutosave();
    redrawCanvasStrokes();
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);

  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', moveDraw);
  canvas.addEventListener('touchend', endDraw);

  // Brush sizing buttons
  canvasBrushPicker.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      brushWidth = parseInt(btn.getAttribute('data-width'), 10);
      canvasBrushPicker.querySelectorAll('button').forEach(b => {
        b.className = "px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer text-charcoal-muted hover:text-charcoal-warm";
      });
      btn.className = "px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer bg-[#FFE7E2] text-peach-deep";
    });
  });

  // Colors buttons
  canvasInkPicker.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      brushColor = btn.getAttribute('data-color');
      canvasInkPicker.querySelectorAll('button').forEach(b => {
        b.className = "w-6 h-6 rounded-full cursor-pointer opacity-70 hover:opacity-100";
      });
      btn.className = "w-6 h-6 rounded-full cursor-pointer ring-2 ring-peach-accent ring-offset-2 scale-105";
    });
  });

  // Action listeners
  btnToggleGrid.addEventListener('click', () => {
    showGridLine = !showGridLine;
    btnToggleGrid.className = showGridLine 
      ? "px-3.5 py-1.5 rounded-xl border text-[11px] font-bold bg-peach-accent text-white border-peach-accent transition-all cursor-pointer"
      : "px-3.5 py-1.5 rounded-xl border text-[11px] font-bold bg-[#FFF9F7] border-peach-soft text-charcoal-muted transition-all cursor-pointer";
    redrawCanvasStrokes();
  });

  btnUndoStroke.addEventListener('click', () => {
    if (strokes.length === 0) {
      triggerSleekToast('Kanvas telah kosong', 'alert');
      return;
    }
    strokes.pop();
    updateStrokeCounter();
    saveWorkspaceSessionToAutosave();
    redrawCanvasStrokes();
    triggerSleekToast('Sapuan dibatalkan');
  });

  btnClearCanvas.addEventListener('click', () => {
    strokes = [];
    updateStrokeCounter();
    saveWorkspaceSessionToAutosave();
    redrawCanvasStrokes();
    triggerSleekToast('Kanvas dibersihkan');
  });
}

function redrawCanvasStrokes() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Baselines guide
  if (showGridLine) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 148, 128, 0.18)';
    ctx.setLineDash([6, 6]);

    [100, 200, 300].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // Draw lines
  strokes.forEach(stroke => {
    if (stroke.points.length < 1) return;
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  });
}

function updateStrokeCounter() {
  strokeCountIndicator.textContent = strokes.length;
  if (strokes.length > 0) {
    drawHelperPrompt.style.display = 'none';
  } else {
    drawHelperPrompt.style.display = 'flex';
  }
}

// Typing actions
btnClearTextareaText.addEventListener('click', () => {
  typedCompositionInput.value = '';
  checkLengthAndSaveActiveDraft();
  triggerSleekToast('Teks ketikan dikosongkan');
});

btnCopyComposition.addEve
