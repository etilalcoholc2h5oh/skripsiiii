import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Printer
} from 'lucide-react';
import { StudentProgress } from '../lib/db';
import { ThemeTopic } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Partial<StudentProgress> & { name: string; draft?: string; ideas?: string[] };
  theme: ThemeTopic;
  sessionId?: string;
  isTeacher?: boolean;
}

export const PrintPdfModal: React.FC<PrintPdfModalProps> = ({
  isOpen,
  onClose,
  student,
  theme,
  sessionId = 'MANDIRI',
  isTeacher = false
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const rubric = student.rubricScores || {
    fikrah: 20,
    tarkib: 20,
    mufradat: 20,
    imla: 20,
    total: 80
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    try {
      setIsGeneratingPdf(true);
      showToast('Sedang memproses & menyusun dokumen PDF...');

      const element = printContentRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        windowWidth: 1024
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const totalPdfHeight = (canvasHeight * pageWidth) / canvasWidth;

      let heightLeft = totalPdfHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Subsequent pages if any
      while (heightLeft > 0) {
        position = heightLeft - totalPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, totalPdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const safeName = (student.name || 'Siswa').replace(/[^a-zA-Z0-9]/g, '');
      const safeTheme = (theme.titleIndo || 'Karangan').replace(/[^a-zA-Z0-9]/g, '');
      pdf.save(`Kitabah_Insya_${safeName}_${safeTheme}.pdf`);
      showToast('Berhasil mengunduh file PDF!');
    } catch (err) {
      console.error('Error generating PDF with canvas:', err);
      showToast('Mengalihkan ke jendela Cetak...');
      handleOpenInNewTab();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (!printContentRef.current) return;
    const contentHtml = printContentRef.current.innerHTML;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Kitabah Insya' ${student.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              background-color: #FAF9F6;
              color: #171615;
              padding: 20px;
            }
            .font-arabic, [dir="rtl"] { 
              font-family: 'Noto Naskh Arabic', 'Amiri', serif; 
              letter-spacing: normal !important;
              text-rendering: optimizeLegibility;
              font-feature-settings: "liga" 1, "calt" 1;
            }
            @media print {
              body { background-color: #ffffff; padding: 0; }
              .no-print { display: none !important; }
              @page { margin: 15mm; size: A4; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl shadow-xs border border-stone-200">
            <div>
              <h2 class="font-bold text-stone-800 text-sm">Pratinjau Cetak Lembar Insya'</h2>
              <p class="text-xs text-stone-500">Gunakan tombol Cetak di bawah atau tekan Ctrl+P</p>
            </div>
            <button onclick="window.print()" class="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center gap-2">
              Cetak atau Simpan PDF
            </button>
          </div>
          <div class="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-stone-200">
            ${contentHtml}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyAll = () => {
    const text = `
KITABAH INSYA'
LEMBAR KERJA SISWA INSYA' MUWAJJAH
Nama Siswa: ${student.name}
Kelas atau Sesi: ${sessionId}
Tema: ${theme.titleIndo} (${theme.titleArabic})
Tanggal: ${currentDate}

====================================
Gagasan Alur (الأفكار):
1. Awal: ${student.ideas?.[0] || ''}
2. Inti: ${student.ideas?.[1] || ''}
3. Penutup: ${student.ideas?.[2] || ''}

====================================
Naskah Karangan (الإنشاء):
${student.draft || '(Belum ada draf)'}

${student.feedback ? `Catatan Guru: ${student.feedback}\n` : ''}${student.teacherNotes ? `Catatan Tambahan Guru: ${student.teacherNotes}\n` : ''}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Teks lembar kerja berhasil disalin!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Top Action Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-burgundy-100 dark:bg-burgundy-950/50 text-burgundy-800 dark:text-burgundy-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight">
                Dokumen Lembar Kerja Insya'
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Siswa: <strong className="text-stone-700 dark:text-stone-300">{student.name}</strong> Tema: {theme.titleIndo}
              </p>
            </div>
          </div>

            {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
              title="Unduh file PDF ke perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold transition-all shadow-xs"
              title="Buka pratinjau cetak di tab baru browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Buka Tab Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors"
              title="Salin isi lembar kerja"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Salin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2 text-xs font-semibold text-center shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Printable Paper Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100 dark:bg-stone-950/80">
          <div 
            ref={printContentRef}
            className="w-full max-w-[800px] mx-auto bg-white text-stone-900 p-8 sm:p-12 space-y-6 font-sans border border-stone-200 rounded-xl shadow-xs"
            style={{ minHeight: '960px', boxSizing: 'border-box' }}
          >
            {/* Header Kop Lembar Kerja Resmi */}
            <div className="text-center space-y-2 pb-4 border-b-2 border-stone-900">
              <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-[0.2em]">
                  KITABAH INSYA'
                </span>
                <span className="font-arabic font-bold text-base text-stone-900 tracking-normal leading-loose py-0.5 inline-block" dir="rtl">
                  إِنْشَاءٌ مُوَجَّهٌ
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-950 uppercase pt-1">
                LEMBAR KERJA SISWA INSYA' MUWAJJAH
              </h1>
              <p className="text-xs text-stone-600 font-medium tracking-wide">
                Pembelajaran Maharah Al-Kitabah Berbasis Process-Genre
              </p>
            </div>

            {/* Student & Class Identity Box */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div>
                    <span className="text-stone-500 font-medium">Nama Siswa: </span>
                    <strong className="text-stone-950 font-bold text-sm">{student.name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Kelas / Sesi: </span>
                    <strong className="font-mono text-stone-800 font-bold">{sessionId}</strong>
                    <span className="ml-2 text-stone-600 font-semibold">({theme.grade})</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Tanggal: </span>
                    <span className="text-stone-700 font-medium">{currentDate}</span>
                  </div>
                </div>

                <div className="space-y-1 text-left sm:text-right">
                  <div>
                    <span className="text-stone-500 font-medium">Tema: </span>
                    <strong className="text-stone-950 font-bold">{theme.titleIndo}</strong>
                  </div>
                  <div className="pt-1 pb-0.5">
                    <span className="font-arabic font-bold text-lg text-stone-950 block leading-[2.2] py-1" dir="rtl">
                      {theme.titleArabic}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Alur Gagasan */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  1. Kerangka Gagasan Pokok
                </h3>
                <span className="font-arabic font-bold text-sm text-stone-700 tracking-normal leading-loose py-0.5 inline-block" dir="rtl">
                  الْفِكْرَةُ الْأَسَاسِيَّةُ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="font-bold text-stone-900 text-xs flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold">1. Awal</span>
                    <span className="font-arabic font-bold text-xs text-stone-800 leading-relaxed py-0.5" dir="rtl">المقدمة</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed pt-0.5 text-xs" dir="auto">
                    {student.ideas?.[0] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="font-bold text-stone-900 text-xs flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold">2. Inti</span>
                    <span className="font-arabic font-bold text-xs text-stone-800 leading-relaxed py-0.5" dir="rtl">الموضوع</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed pt-0.5 text-xs" dir="auto">
                    {student.ideas?.[1] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                  <div className="font-bold text-stone-900 text-xs flex items-center justify-between border-b border-stone-200/80 pb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold">3. Penutup</span>
                    <span className="font-arabic font-bold text-xs text-stone-800 leading-relaxed py-0.5" dir="rtl">الخاتمة</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed pt-0.5 text-xs" dir="auto">
                    {student.ideas?.[2] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Kosakata dan Kaidah Terpilih */}
            {(student.selectedMufradat?.length || student.selectedTarkib?.length) ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    2. Kosakata dan Kaidah Terpilih
                  </h3>
                  <span className="font-arabic font-bold text-sm text-stone-700 tracking-normal leading-loose py-0.5 inline-block" dir="rtl">
                    المُفْرَدَاتُ وَالتَّرْكِيْبُ
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(student.selectedMufradat || []).map((m) => (
                    <span key={m} className="px-3 py-2 rounded-lg bg-stone-100 border border-stone-300 font-arabic text-sm font-bold text-stone-900 leading-[2] my-0.5" dir="rtl">
                      {m}
                    </span>
                  ))}
                  {(student.selectedTarkib || []).map((t) => (
                    <span key={t} className="px-3 py-2 rounded-lg bg-stone-100 border border-stone-300 text-xs font-semibold text-stone-800 leading-[1.8] my-0.5" dir="auto">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Section 3: Naskah Karangan Insya' (Utama) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  3. Naskah Karangan Siswa
                </h3>
                <span className="font-arabic font-bold text-base text-stone-800 tracking-normal leading-loose py-0.5 inline-block" dir="rtl">
                  نَصُّ الْإِنْشَاءِ
                </span>
              </div>

              <div className="p-6 sm:p-8 rounded-xl border border-stone-300 bg-stone-50/30 min-h-[240px]">
                {student.draft ? (
                  <p 
                    className="font-arabic text-2xl sm:text-[26px] leading-[2.8] text-stone-950 text-right whitespace-pre-wrap tracking-normal py-2" 
                    dir="auto"
                    style={{ 
                      wordSpacing: '0.08em',
                      lineHeight: '2.8',
                      letterSpacing: 'normal',
                      textRendering: 'optimizeLegibility',
                      fontFeatureSettings: '"liga" 1, "calt" 1'
                    }}
                  >
                    {student.draft}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 italic text-center py-10">
                    (Belum ada draf karangan yang ditulis)
                  </p>
                )}
              </div>

              {/* Handwriting snapshot if available */}
              {student.handwritingDataUrl && (
                <div className="p-4 rounded-xl border border-stone-300 bg-stone-50/40 space-y-2">
                  <div className="text-[11px] font-bold text-stone-700">Hasil Khat dan Tulisan Tangan:</div>
                  <img
                    src={student.handwritingDataUrl}
                    alt="Tulis Tangan Siswa"
     
