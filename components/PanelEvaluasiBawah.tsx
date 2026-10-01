import React, { useState } from 'react';
import { CircleCheck, Circle, BookOpen, ChevronDown, CheckSquare, Edit3 } from 'lucide-react';

export interface RubrikScores {
  muhtawa: number;
  tanzhim: number;
  mufradat: number;
  qawaid: number;
  imla: number;
}

interface PanelEvaluasiBawahProps {
  teksKarangan?: string;
  isDarkMode?: boolean;
  rubrik?: RubrikScores;
  onChange?: (rubrik: RubrikScores) => void;
  title?: string;
  readOnly?: boolean;
}

export function PanelEvaluasiBawah({ 
  teksKarangan = '', 
  isDarkMode = false,
  rubrik: externalRubrik,
  onChange,
  title = "Rubrik Penilaian Mandiri (Self-Assessment)",
  readOnly = false
}: PanelEvaluasiBawahProps) {
  // Rubrik 5 kriteria (Maks 20 poin: 4 poin per kriteria)
  const [internalRubrik, setInternalRubrik] = useState<RubrikScores>({
    muhtawa: 0,
    tanzhim: 0,
    mufradat: 0,
    qawaid: 0,
    imla: 0
  });

  const rubrik = externalRubrik || internalRubrik;
  const [isRubrikOpen, setIsRubrikOpen] = useState(false);

  const totalScore = rubrik.muhtawa + rubrik.tanzhim + rubrik.mufradat + rubrik.qawaid + rubrik.imla;

  const setScore = (kriteria: keyof typeof rubrik, score: number) => {
    if (readOnly) return;
    const newRubrik = { ...rubrik, [kriteria]: score };
    if (onChange) {
      onChange(newRubrik);
    } else {
      setInternalRubrik(newRubrik);
    }
  };

  const textColor = isDarkMode ? 'text-stone-300' : 'text-stone-700';
  const mutedText = isDarkMode ? 'text-stone-500' : 'text-stone-400';
  const borderColor = isDarkMode ? 'border-stone-800' : 'border-[#FFE7E2]';
  const bgColor = isDarkMode ? 'bg-[#2D211F]' : 'bg-white';
  const popoverBgColor = isDarkMode ? 'bg-[#1E1514]' : 'bg-white';
  const hoverBg = isDarkMode ? 'hover:bg-[#3D211F]' : 'hover:bg-[#FFF7F5]';

  const kriteriaList = [
    { key: 'muhtawa', name: 'Al-Muhtawa (Isi/Konten)', desc: 'Kesesuaian isi dengan tema dan kelengkapan gagasan.' },
    { key: 'tanzhim', name: 'Al-Tanzhim (Organisasi)', desc: 'Kejelasan alur dan kohesi paragraf.' },
    { key: 'mufradat', name: 'Al-Mufradat (Kosakata)', desc: 'Ketepatan dan keberagaman kosakata.' },
    { key: 'qawaid', name: 'Al-Qawaid (Tata Bahasa)', desc: 'Kebenaran struktur kalimat (Nahwu & Sharaf).' },
    { key: 'imla', name: 'Al-Imla\' (Ejaan)', desc: 'Ketepatan penulisan huruf dan harakat.' }
  ] as const;

  return (
    <div className={`mt-6 rounded-2xl border ${borderColor} ${bgColor} shadow-sm transition-colors duration-300`}>
      <div className={`p-4 border-b ${borderColor} flex justify-between items-center cursor-pointer`} onClick={() => setIsRubrikOpen(!isRubrikOpen)}>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-2xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>{totalScore} / 20</div>
            <div className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Total Skor</div>
          </div>
          <ChevronDown className={`w-5 h-5 ${mutedText} transition-transform duration-200 ${isRubrikOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isRubrikOpen && (
        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {kriteriaList.map((item) => (
            <div key={item.key} className={`p-3 rounded-xl border ${borderColor} ${popoverBgColor}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className={`font-semibold ${textColor}`}>{item.name}</h4>
                  <p className={`text-xs ${mutedText} mt-0.5`}>{item.desc}</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(score => (
                    <button
                      key={score}
                      onClick={() => setScore(item.key, score)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors border ${
                        rubrik[item.key] >= score 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : `${borderColor} ${textColor} ${hoverBg}`
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className={`text-xs ${mutedText} flex items-start gap-2 bg-blue-500/10 p-3 rounded-xl`}>
            <Edit3 className="w-4 h-4 text-blue-500 shrink-0" />
            <p>Gunakan rubrik ini untuk mengevaluasi tulisanmu secara mandiri. Skor 1 (Kurang), 2 (Cukup), 3 (Baik), 4 (Sangat Baik).</p>
          </div>
        </div>
      )}
    </div>
  );
}
