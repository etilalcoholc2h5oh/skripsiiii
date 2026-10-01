import React, { useState } from 'react';
import { Trash2, MessageCircle, Edit3, Save, X } from 'lucide-react';
import { PanelEvaluasiBawah, RubrikScores } from './PanelEvaluasiBawah';

interface Point { x: number; y: number; }
interface Stroke { points: Point[]; color: string; width: number; }

interface SavedHistoryItem {
  id: string;
  themeId: string;
  themeTitle: string;
  text: string;
  strokes: Stroke[];
  timestamp: string;
  teacherFeedback?: string;
  studentName?: string;
  rubric?: RubrikScores;
}

interface HistoryItemProps {
  item: SavedHistoryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SavedHistoryItem>) => void;
  isDarkMode: boolean;
  borderColor: string;
  cardBg: string;
}

export function HistoryItem({ item, onDelete, onUpdate, isDarkMode, borderColor, cardBg }: HistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentName, setEditStudentName] = useState(item.studentName || '');
  const [editTeacherFeedback, setEditTeacherFeedback] = useState(item.teacherFeedback || '');
  const [editRubric, setEditRubric] = useState<RubrikScores | undefined>(item.rubric);

  const handleSave = () => {
    onUpdate(item.id, {
      studentName: editStudentName,
      teacherFeedback: editTeacherFeedback,
      rubric: editRubric
    });
    setIsEditing(false);
  };

  return (
    <div className={`p-4 rounded-xl border ${borderColor} ${cardBg} flex flex-col gap-4 relative`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{item.themeTitle}</span>
            <span className="text-sm text-stone-500"> {new Date(item.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" title="Edit Penilaian">
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => onDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1">Nama Siswa</label>
              <input 
                type="text" 
                value={editStudentName} 
                onChange={(e) => setEditStudentName(e.target.value)}
                className={`w-full p-2 rounded-lg border ${borderColor} bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Masukkan nama siswa..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-1">Catatan Guru</label>
              <textarea 
                value={editTeacherFeedback} 
                onChange={(e) => setEditTeacherFeedback(e.target.value)}
                className={`w-full h-24 p-2 rounded-lg border ${borderColor} bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Berikan feedback atau evaluasi di sini..."
              />
            </div>

            <PanelEvaluasiBawah 
              teksKarangan={item.text} 
              isDarkMode={isDarkMode} 
              rubrik={editRubric}
              onChange={setEditRubric}
              title="Rubrik Penilaian Guru"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="px-4 py-2 text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Penilaian
              </button>
            </div>
          </div>
        ) : (
          <>
            {item.studentName && (
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">Siswa: {item.studentName}</p>
            )}
            <p className="mt-2 text-xl font-arabic" dir="rtl">{item.text}</p>
            {item.strokes.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md mt-2 inline-block">Ada Canvas Tulis Tangan</span>}
            
            {item.teacherFeedback && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-stone-800 rounded-lg border border-blue-100 dark:border-stone-700">
                <p className="text-xs font-bold text-blue-500 flex items-center gap-1 mb-1"><MessageCircle className="w-3 h-3" /> Catatan Guru</p>
                <p className="text-sm whitespace-pre-wrap">{item.teacherFeedback}</p>
              </div>
            )}

            {item.rubric && (
              <div className="mt-4">
                <PanelEvaluasiBawah 
                  teksKarangan={item.text} 
                  isDarkMode={isDarkMode} 
                  rubrik={item.rubric}
                  title="Rubrik Penilaian"
                  readOnly={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
