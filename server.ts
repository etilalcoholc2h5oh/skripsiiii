import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini API
  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.error("Failed to initialize Gemini:", e);
  }

  // Simple In-Memory Cache to reduce API calls
  const apiCache = new Map<string, { result: string, timestamp: number }>();
  const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
  
  function getCacheKey(prompt: string): string {
    return crypto.createHash('md5').update(prompt).digest('hex');
  }

  async function generateWithCache(prompt: string, model: string = "gemini-3.8-flash", customApiKey?: string): Promise<string> {
    let currentAi = ai;
    if (customApiKey) {
      currentAi = new GoogleGenAI({ 
        apiKey: customApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    
    if (!currentAi) throw new Error("AI tidak tersedia (API Key belum diatur. Silakan atur di menu Pengaturan)");
    
    const key = getCacheKey(prompt + model);
    const cached = apiCache.get(key);
    
    // Return cached if valid
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log("Serving from cache! Saving API Quota.");
      return cached.result;
    }

    // Otherwise call API
    try {
      const response = await currentAi.models.generateContent({
        model: model,
        contents: prompt
      });
      
      const resultText = response.text || "";
      
      // Save to cache
      apiCache.set(key, { result: resultText, timestamp: Date.now() });
      
      // Simple cleanup if cache gets too big (prevent memory leak)
      if (apiCache.size > 1000) {
        const oldestKey = apiCache.keys().next().value;
        if (oldestKey) apiCache.delete(oldestKey);
      }
      
      return resultText;
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes("429") || err.message?.includes("quota")) {
        throw new Error("Maaf, limit penggunaan AI sedang penuh. Silakan coba lagi dalam beberapa menit, atau gunakan API Key Anda sendiri di menu pengaturan.");
      }
      throw err;
    }
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Kitabah Touch API" });
  });

  const historyFile = path.join(process.cwd(), 'data_history.json');
  app.post("/api/sync", (req, res) => {
    try {
      fs.writeFileSync(historyFile, JSON.stringify(req.body, null, 2));
      res.json({ status: "ok" });
    } catch (err) {
      res.status(500).json({ error: "Failed to sync" });
    }
  });

  app.get("/api/sync", (req, res) => {
    try {
      if (fs.existsSync(historyFile)) {
        const data = fs.readFileSync(historyFile, "utf-8");
        res.json(JSON.parse(data));
      } else {
        res.json([]);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to load" });
    }
  });

  // AI Routes
  app.post("/api/ai/evaluate", async (req, res) => {
    try {
      const { text, theme, customApiKey } = req.body;
      const prompt = `Sebagai guru bahasa Arab tingkat Madrasah Aliyah Kelas 11, evaluasi karangan siswa berikut berdasarkan tema "${theme}".\n\nKarangan Siswa: "${text}"\n\nBerikan evaluasi terstruktur dalam bahasa Indonesia mencakup:\n1. Koreksi Nahwu/Sharaf dan Imla' jika ada.\n2. Saran perbaikan struktur kalimat (Tarkib) agar lebih fasih.\n3. Apresiasi dan masukan terkait alur gagasan/fikrah.\nGunakan format poin-poin yang mudah dipahami siswa.`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result });
    } catch (err: any) {
      console.error("Evaluate error:", err);
      res.status(500).json({ error: "Gagal mendapatkan evaluasi AI: " + (err.message || "") });
    }
  });

  app.post("/api/ai/rubric", async (req, res) => {
    try {
      const { text, theme, customApiKey } = req.body;
      const prompt = `Sebagai pakar penilaian Insya' Muwajjah (bahasa Arab) tingkat Madrasah Aliyah Kelas 11, lakukan penilaian analitis terhadap karangan siswa pada tema "${theme}".
Karangan: "${text}"

Berikan penilaian 4 aspek rubrik (skor integer masing-masing 0 - 25):
1. Fikrah (Kesesuaian Isi & Gagasan): 0 - 25
2. Tarkib (Struktur Kalimat & Kaidah Nahwu Kelas 11): 0 - 25
3. Mufradat (Kekayaan & Ketepatan Kosakata): 0 - 25
4. Imla (Ejaan, Penulisan Huruf & Harakat): 0 - 25

Dan berikan ulasan evaluasi singkat konstruktif dalam bahasa Indonesia.
KEMBALIKAN HANYA FORMAT JSON MURNI TANPA MARKDOWN BACKTICKS seperti ini:
{
  "fikrah": 22,
  "tarkib": 21,
  "mufradat": 23,
  "imla": 22,
  "total": 88,
  "feedback": "Koreksi dan saran perbaikan..."
}`;
      
      const rawResult = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      let parsed = null;
      try {
        const cleanJson = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (pe) {
        parsed = {
          fikrah: 20,
          tarkib: 20,
          mufradat: 20,
          imla: 20,
          total: 80,
          feedback: rawResult
        };
      }
      res.json({ result: parsed });
    } catch (err: any) {
      console.error("Rubric error:", err);
      res.status(500).json({ error: "Gagal mendapatkan penilaian rubrik: " + (err.message || "") });
    }
  });

  app.post("/api/ai/harakat", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const prompt = `Berikan harakat lengkap (tashkil) pada teks Arab gundul berikut dengan kaidah nahwu dan sharaf yang benar sesuai kurikulum Madrasah Aliyah.\nHanya kembalikan teks Arab berharakatnya saja tanpa penjelasan apapun.\n\nTeks: "${text}"`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result });
    } catch (err: any) {
      console.error("Harakat error:", err);
      res.status(500).json({ error: "Gagal memproses teks: " + (err.message || "") });
    }
  });

  app.post("/api/ai/suggest", async (req, res) => {
    try {
      const { text, theme, customApiKey } = req.body;
      const prompt = `Bertindaklah sebagai sesama pelajar Madrasah Aliyah kelas 11 yang sedang menyusun karangan bahasa Arab tentang "${theme}". Tulisan sejauh ini: "${text}"\n\nBerikan 2 ide kalimat bahasa Arab selanjutnya (lengkap dengan harakat) dengan gaya bahasa santri/siswa yang natural, sederhana, mengalir, tidak kaku, dan wajar selayaknya buatan manusia (agar tidak terdeteksi AI). Berikan juga terjemahannya.`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result });
    } catch (err: any) {
      console.error("Suggest error:", err);
      res.status(500).json({ error: "Gagal mendapatkan saran: " + (err.message || "") });
    }
  });

  app.post("/api/ai/fix", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const prompt = `Perbaiki tata bahasa (nahwu, sharaf, imla) pada teks bahasa Arab berikut agar tetap natural dan mempertahankan gaya tulisan siswa Madrasah Aliyah (tidak kaku dan tidak berlebihan). Hanya kembalikan teks Arab yang diperbaiki tanpa penjelasan.\n\nTeks: "${text}"`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result });
    } catch (err: any) {
      console.error("Fix error:", err);
      res.status(500).json({ error: "Gagal memperbaiki teks: " + (err.message || "") });
    }
  });

  app.post("/api/ai/translate", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const prompt = `Terjemahkan teks bahasa Arab berikut ke dalam bahasa Indonesia yang baik, lugas, dan benar.\n\nTeks: "${text}"`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result });
    } catch (err: any) {
      console.error("Translate error:", err);
      res.status(500).json({ error: "Gagal menerjemahkan teks: " + (err.message || "") });
    }
  });

  app.post("/api/ai/visual-prompt", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const prompt = `Anda adalah sutradara visual edukatif untuk materi bahasa Arab Madrasah Aliyah Kelas 11.
Analisis teks karangan bahasa Arab siswa berikut. Pecah menjadi 2-6 adegan berurutan yang menggambarkan alur cerita secara kronologis dan 100% SESUAI ARTI KATA ASLINYA (sangat akurat dan nyambung).

Untuk setiap adegan berikan objek JSON dengan properti:
1. "arabic": Potongan kalimat bahasa Arab aslinya (berharakat lengkap).
2. "indoMeaning": Terjemahan bahasa Indonesia yang jelas, akurat, dan tepat makna.
3. "sceneTitle": Judul adegan konkret (misal: "Membeli Buah Segar", "Memeriksa Pasien di Ruang Dokter", "Wukuf di Padang Arafah").
4. "visualSceneEn": Deskripsi foto fotorealistis nyata dalam bahasa Inggris yang detail menggambarkan aksi nyata di kalimat tersebut (contoh: "A customer holding fresh ripe fruits at a grocery fruit counter, authentic real photography, natural soft lighting, crisp 4k detail, no cartoons, no anime").
5. "categoryIcon": Emoji atau simbol yang paling merefleksikan adegan (contoh: "🛒", "🩺", "🕋", "✈️", "🌱", "💻").

Kembalikan HANYA format JSON valid tanpa tanda backtick markdown:
[
  {
    "arabic": "ذَهَبْتُ مَعَ أُمِّي إِلَى السُّوقِ الْمَرْكَزِيِّ",
    "indoMeaning": "Saya pergi bersama ibuku ke supermarket",
    "sceneTitle": "Pergi ke Supermarket Bersama Ibu",
    "visualSceneEn": "A mother and teenage son walking in a bright clean modern supermarket aisle with grocery shopping cart, realistic documentary photography, warm natural lighting",
    "categoryIcon": "🛒"
  }
]

Teks Bahasa Arab Siswa:
"${text}"`;
      
      const result = await generateWithCache(prompt, "gemini-3.8-flash", customApiKey);
      res.json({ result: result.trim() });
    } catch (err: any) {
      console.error("Visual prompt error:", err);
      res.status(500).json({ error: "Gagal memproses visual: " + (err.message || "") });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
