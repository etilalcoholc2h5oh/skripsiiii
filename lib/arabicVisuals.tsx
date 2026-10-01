import React from 'react';

const ImgIcon = ({ src }: { src: string }) => null;

export const arabicVisualDictionary: Record<string, React.ReactNode> = {
  'طلاب': null,
  'رياضة': null, 
  'مدرسة': null, 
  'يذهب': null, 
  'اذهب': null, 
  'تذهب': null, 
  'نذهب': null, 
  'ذهاب': null,
  'مشي': null, 
  'اقدام': null,
};

export function removeHarakat(text: string) {
  return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
}

export function getVisualsForText(text: string) {
  if (!text) return [];
  
  const words = text.split(/[\s\n،.؛?؟]+/);
  
  return words.map(word => {
    if (!word.trim()) return null;
    
    let cleanWord = removeHarakat(word.trim());
    
    // TYPO CORRECTION / SMART AI NORMALIZATION
    const typoCorrections: Record<string, string> = {
      'ادهب': 'اذهب',
      'المدرشة': 'مدرسة',
      'مدرشة': 'مدرسة',
      'بالمسيا': 'مشي',
      'مسيا': 'مشي',
      'الاقدام': 'اقدام'
    };

    if (typoCorrections[cleanWord]) {
      cleanWord = typoCorrections[cleanWord];
    }
    
    if (cleanWord.length > 3 && cleanWord.startsWith('ال') && !typoCorrections[cleanWord]) {
      cleanWord = cleanWord.substring(2);
    }
    
    const normalized = cleanWord
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه');
    
    const icon = arabicVisualDictionary[cleanWord] || 
                 arabicVisualDictionary[normalized] || 
                 null;
                 
    const isKnown = !!icon;
                 
    return { word, icon, isKnown };
  }).filter(Boolean) as { word: string, icon: React.ReactNode, isKnown: boolean }[];
}
