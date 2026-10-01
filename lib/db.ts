import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp, firestore } from './firebase';
import { THEMES } from '../data';

export interface RubricScores {
  fikrah: number;    // Kesesuaian Isi & Gagasan (0-25)
  tarkib: number;    // Struktur Kalimat / Nahwu (0-25)
  mufradat: number;  // Kekayaan & Ketepatan Kosakata (0-25)
  imla: number;      // Ejaan / Khat / Tanda Baca (0-25)
  total: number;     // Total (0-100)
}

export interface StudentProgress {
  id: string;
  name: string;
  themeId: string;
  step: number; // 1: Brainstorming, 2: Mufradat & Tarkib, 3: Drafting
  ideas: string[];
  selectedMufradat: string[];
  selectedTarkib: string[];
  draft: string;
  writingMode?: 'type' | 'handwriting';
  handwritingDataUrl?: string;
  feedback: string;
  teacherNotes?: string;
  rubricScores?: RubricScores;
  status: 'draft' | 'submitted' | 'reviewed';
  lastUpdated: any;
}

export interface ClassSession {
  id: string;
  teacherName: string;
  teacherPin?: string;
  active: boolean;
  themeId: string;
  isSoloPractice?: boolean;
  createdAt: any;
}

export const createSession = async (teacherName: string, themeId: string, customPin?: string, isSoloPractice: boolean = false) => {
  const prefix = isSoloPractice ? 'SL' : '';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sessionId = isSoloPractice ? `${prefix}${randomPart}` : Math.random().toString(36).substring(2, 8).toUpperCase();
  const pin = customPin?.trim() || Math.floor(1000 + Math.random() * 9000).toString();
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await setDoc(sessionRef, {
    id: sessionId,
    teacherName: teacherName.trim(),
    teacherPin: pin,
    active: true,
    themeId: themeId || THEMES[0].id,
    isSoloPractice: isSoloPractice,
    createdAt: serverTimestamp()
  });
  return sessionId;
};

export const verifyTeacherAccess = async (sessionId: string, enteredPin: string): Promise<{ valid: boolean; session?: ClassSession; message?: string }> => {
  const cleanId = sessionId.trim().toUpperCase();
  const session = await getSession(cleanId);
  if (!session) {
    return { valid: false, message: `Kelas dengan kode "${cleanId}" tidak ditemukan di database.` };
  }
  // If session has teacherPin set, check it
  if (session.teacherPin && session.teacherPin.trim() !== enteredPin.trim()) {
    return { 
      valid: false, 
      message: 'PIN Pengajar salah! Siswa dilarang masuk ke panel guru. Hanya guru yang memiliki PIN resmi yang dapat mengakses.' 
    };
  }
  return { valid: true, session };
};

export const getSession = async (sessionId: string): Promise<ClassSession | null> => {
  const cleanId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanId);
  const snap = await getDoc(sessionRef);
  if (snap.exists()) {
    return snap.data() as ClassSession;
  }
  return null;
};

export const joinSession = async (sessionId: string, studentName: string) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanSessionId);
  const sessionSnap = await getDoc(sessionRef);

  let themeId = THEMES[0].id;
  if (!sessionSnap.exists()) {
    throw new Error(`Kode kelas "${cleanSessionId}" tidak ditemukan. Pastikan kode kelas yang dimasukkan sudah benar.`);
  }

  const sessionData = sessionSnap.data() as ClassSession;
  if (sessionData?.themeId) {
    themeId = sessionData?.themeId;
  }

  const studentId = Math.random().toString(36).substring(2, 9);
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);

  const initialData: StudentProgress = {
    id: studentId,
    name: studentName.trim(),
    themeId: themeId,
    step: 1,
    ideas: ['', '', ''],
    selectedMufradat: [],
    selectedTarkib: [],
    draft: '',
    writingMode: 'type',
    feedback: '',
    status: 'draft',
    lastUpdated: serverTimestamp()
  };

  await setDoc(studentRef, initialData);
  return { studentId, cleanSessionId, themeId };
};

export const updateStudentProgress = async (sessionId: string, studentId: string, data: Partial<StudentProgress>) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);
  await updateDoc(studentRef, {
    ...data,
    lastUpdated: serverTimestamp()
  });
};

export const subscribeToSession = (sessionId: string, callback: (session: ClassSession | null) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanSessionId);
  return onSnapshot(sessionRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ClassSession);
    } else {
      callback(null);
    }
  });
};

export const subscribeToStudents = (sessionId: string, callback: (students: StudentProgress[]) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentsRef = collection(firestore, `sessions/${cleanSessionId}/students`);
  return onSnapshot(studentsRef, (snapshot) => {
    const students: StudentProgress[] = [];
    snapshot.forEach((doc) => {
      students.push(doc.data() as StudentProgress);
    });
    callback(students);
  });
};

export const subscribeToStudent = (sessionId: string, studentId: string, callback: (student: StudentProgress | null) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);
  return onSnapshot(studentRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as StudentProgress);
    } else {
      callback(null);
    }
  });
};

export const subscribeToAllSessions = (callback: (sessions: ClassSession[]) => void) => {
  const sessionsRef = collection(firestore, 'sessions');
  return onSnapshot(sessionsRef, (snapshot) => {
    const list: ClassSession[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as ClassSession);
    });
    callback(list);
  }, (error) => {
    console.error('Error subscribing to all sessions:', error);
  });
};
