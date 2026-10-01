import React from 'react';
import {
  PenTool,
  CheckCircle2,
  Lightbulb,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Compass
} from 'lucide-react';

export type MascotVariant = 'writer' | 'cheer' | 'thinking' | 'teacher' | 'award' | 'kitab' | 'digitalPen' | 'vocabCard';

interface VariantConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  cardBg: string;
}

const VARIANT_CONFIGS: Record<MascotVariant, VariantConfig> = {
  writer: {
    title: 'Panduan Menulis Insya\'',
    subtitle: 'Kaidah Komposisi & Struktur',
    icon: PenTool,
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    iconColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    cardBg: 'bg-blue-50/40 dark:bg-blue-950/20'
  },
  thinking: {
    title: 'Eksplorasi Ide & Gagasan',
    subtitle: 'Struktur Alur Cerita',
    icon: Lightbulb,
    iconBg: 'bg-stone-100 dark:bg-stone-800',
    iconColor: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-700',
    cardBg: 'bg-stone-50/50 dark:bg-stone-900/50'
  },
  teacher: {
    title: 'Bimbingan Guru Pengampu',
    subtitle: 'Evaluasi & Pendampingan',
    icon: GraduationCap,
    iconBg: 'bg-slate-100 dark:bg-slate-900/60',
    iconColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-800/60',
    cardBg: 'bg-slate-50/40 dark:bg-slate-950/20'
  },
  kitab: {
    title: 'Kaidah Nahwu & Sharaf',
    subtitle: 'Tata Bahasa & Tarkib',
    icon: BookOpen,
    iconBg: 'bg-teal-100 dark:bg-teal-950/60',
    iconColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-200 dark:border-teal-800/60',
    cardBg: 'bg-teal-50/40 dark:bg-teal-950/20'
  },
  award: {
    title: 'Rubrikasi & Pencapaian',
    subtitle: 'Tolok Ukur Kemahiran',
    icon: Award,
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    iconColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    cardBg: 'bg-blue-50/40 dark:bg-blue-950/20'
  },
  digitalPen: {
    title: 'Praktik Insya\' Terbimbing',
    subtitle: 'Studio Penulisan Digital',
    icon: FileText,
    iconBg: 'bg-purple-100 dark:bg-purple-950/60',
    iconColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    cardBg: 'bg-purple-50/40 dark:bg-purple-950/20'
  },
  vocabCard: {
    title: 'Bank Kosakata Tematik',
    subtitle: 'Pemberdayaan Mufradat',
    icon: Compass,
    iconBg: 'bg-stone-100 dark:bg-stone-800',
    iconColor: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-700',
    cardBg: 'bg-stone-50/50 dark:bg-stone-900/50'
  },
  cheer: {
    title: 'Umpan Balik & Motivasi',
    subtitle: 'Apresiasi Belajar',
    icon: CheckCircle2,
    iconBg: 'bg-stone-100 dark:bg-stone-800',
    iconColor: 'text-stone-700 dark:text-stone-300',
    borderColor: 'border-stone-200 dark:border-stone-700',
    cardBg: 'bg-stone-50/50 dark:bg-stone-900/50'
  }
};

const ICON_SIZE = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
  xl: 'w-8 h-8',
};

const BOX_SIZE = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

interface InstructionBadgeProps {
  variant: MascotVariant;
  quote?: string;
  subquote?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bubbleDirection?: 'top' | 'right' | 'left' | 'bottom';
  className?: string;
  badge?: string;
}

export const InstructionBadge: React.FC<InstructionBadgeProps> = ({
  variant,
  quote,
  subquote,
  size = 'md',
  className = '',
  badge,
}) => {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.writer;
  const Icon = config.icon;

  return (
    <div className={`flex items-start sm:items-center gap-3 w-full p-3 sm:p-3.5 rounded-2xl border ${config.borderColor} ${config.cardBg} shadow-xs ${className}`}>
      {/* Pedagogical Icon Badge */}
      <div className="shrink-0 flex items-center justify-center">
        <div className={`${BOX_SIZE[size]} rounded-xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center shadow-xs`}>
          <Icon className={`${ICON_SIZE[size]} ${config.iconColor}`} />
        </div>
      </div>

      {/* Structured Guidance Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              {config.title}
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-stone-400">
              {config.subtitle}
            </span>
          </div>
          {badge && (
            <span className="px-2 py-0.5 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px] rounded-md border border-stone-200 dark:border-stone-700 shrink-0 shadow-2xs">
              {badge}
            </span>
          )}
        </div>

        {quote && (
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
            {quote}
          </p>
        )}
        {subquote && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
            {subquote}
          </p>
        )}
      </div>
    </div>
  );
};

export const AvatarBadge: React.FC<{
  variant: MascotVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ variant, size = 'sm', className = '' }) => {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.writer;
  const Icon = config.icon;

  const sizeMap = {
    xs: { box: 'w-7 h-7', icon: "" },
    sm: { box: 'w-8 h-8', icon: "" },
    md: { box: 'w-10 h-10', icon: "" },
    lg: { box: 'w-12 h-12', icon: "" },
  };

  const current = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`inline-flex items-center justify-center rounded-xl border ${config.borderColor} ${config.iconBg} ${current.box} shrink-0 shadow-2xs ${className}`}>
      <Icon className={`${current.icon} ${config.iconColor}`} />
    </div>
  );
};
