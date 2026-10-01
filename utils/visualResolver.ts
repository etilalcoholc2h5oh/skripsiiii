// Comprehensive, Ultra-Fast & 100% Precise Visual & Semantic Resolver for Arabic Learning (Class 11 Madrasah Aliyah)

export interface StoryboardScene {
  arabic: string;
  indoMeaning: string;
  sceneTitle: string;
  imageUrl: string;
  categoryIcon: string;
}

/**
 * Normalizes Arabic text: strips harakat, tashkeel, tatweel, and normalizes alefs/yahs
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // remove harakat and tatweel
    .replace(/[إأآا]/g, 'ا') // normalize alef variants
    .replace(/ى/g, 'ي') // normalize alif maqsura
    .replace(/ة/g, 'ه') // normalize ta marbuta
    .replace(/[^\u0621-\u064A\sa-zA-Z0-9]/g, ' ') // clean punctuation
    .trim()
    .toLowerCase();
}

interface VisualItem {
  id: string;
  keywordsArabic: string[];
  keywordsIndo: string[];
  title: string;
  icon: string;
  url: string;
  defaultIndoTemplate?: (arabicText: string) => string;
}

// Deeply curated hyper-realistic photographic library matching all Class 11 MA themes and vocabulary
const REALISTIC_IMAGE_COLLECTION: VisualItem[] = [
  // ==========================================
  // 1. KESEHATAN, RUMAH SAKIT & MEDIS (الصحة والمستشفى)
  // ==========================================
  {
    id: 'hospital_building',
    keywordsArabic: ['مستشفي', 'مستشفيات', 'طوارئ', 'اسعاف', 'مستوصف', 'مركز صحي'],
    keywordsIndo: ['rumah sakit', 'rs', 'gedung rumah sakit', 'ruang perawatan', 'ugd', 'ambulans'],
    title: 'Gedung Rumah Sakit & Layanan Kesehatan',
    icon: "",
    url: ""
  },
  {
    id: 'doctor_stethoscope',
    keywordsArabic: ['سماعه', 'سماعه الطبيب', 'فحص بالسماعه', 'يقيس النبض', 'ضغط الدم', 'ميزان الحراره', 'حراره'],
    keywordsIndo: ['stetoskop', 'memeriksa dengan stetoskop', 'cek detak jantung', 'tensi', 'termometer', 'suhu tubuh'],
    title: 'Pemeriksaan Menggunakan Stetoskop',
    icon: "",
    url: ""
  },
  {
    id: 'doctor_examining',
    keywordsArabic: ['طبيب', 'طبيبه', 'يفحص', 'فحص', 'استشاره', 'يعالج', 'عياده', 'طبيب الاسنان', 'كشف'],
    keywordsIndo: ['dokter', 'memeriksa', 'konsultasi dokter', 'pemeriksaan medis', 'mengobati', 'klinik'],
    title: 'Pemeriksaan & Konsultasi Dokter',
    icon: "",
    url: ""
  },
  {
    id: 'nurse_caring',
    keywordsArabic: ['ممرض', 'ممرضه', 'تمريض', 'رعايه صحيه', 'حقنه', 'عنايه'],
    keywordsIndo: ['perawat', 'suster', 'layanan suster', 'perawatan medis'],
    title: 'Pelayanan Ramah Perawat Medis',
    icon: "",
    url: ""
  },
  {
    id: 'pharmacy_medicine',
    keywordsArabic: ['صيدليه', 'صيدلي', 'دواء', 'ادويه', 'وصفه', 'روشته', 'اقراص', 'حبوب', 'شراب'],
    keywordsIndo: ['apotek', 'obat', 'resep obat', 'membeli obat', 'farmasi', 'tablet', 'sirup'],
    title: 'Pengambilan Obat di Apotek',
    icon: "",
    url: ""
  },
  {
    id: 'patient_resting',
    keywordsArabic: ['مريض', 'مرضي', 'مرض', 'سقيم', 'سرير', 'يستريح', 'شفاء', 'صحه وعافيه', 'الم'],
    keywordsIndo: ['pasien', 'sakit', 'istirahat', 'ranjang pasien', 'sembuh', 'menjenguk orang sakit'],
    title: 'Pasien Beristirahat untuk Pemulihan',
    icon: "",
    url: ""
  },
  {
    id: 'fitness_health',
    keywordsArabic: ['صحه', 'عافيه', 'رياضه', 'جري', 'تمارين', 'نشاط', 'قوه', 'جسم سليم'],
    keywordsIndo: ['kesehatan', 'kebugaran', 'olahraga', 'sehat bugar', 'lari pagi', 'tubuh sehat'],
    title: 'Pola Hidup Sehat & Berolahraga',
    icon: "",
    url: ""
  },

  // ==========================================
  // 2. BELANJA, PASAR & SUPERMARKET (التسوق والسوق)
  // ==========================================
  {
    id: 'supermarket_modern',
    keywordsArabic: ['سوق مركزي', 'سوبرماركت', 'مول', 'مركز تجاري', 'عربه التسوق', 'ممر'],
    keywordsIndo: ['supermarket', 'swalayan', 'mall', 'troli belanja', 'pasar modern', 'lorong belanja'],
    title: 'Berbelanja di Supermarket Modern',
    icon: "",
    url: ""
  },
  {
    id: 'traditional_market',
    keywordsArabic: ['سوق تقليدي', 'سوق شعبي', 'سوق', 'اسواق', 'دكان', 'دكاكين', 'بسطه'],
    keywordsIndo: ['pasar tradisional', 'pasar', 'kios', 'pedagang pasar', 'los pasar'],
    title: 'Aktivitas di Pasar Tradisional',
    icon: "",
    url: ""
  },
  {
    id: 'fresh_fruits',
    keywordsArabic: ['فاكهه', 'فواكه', 'تفاح', 'برتقال', 'موز', 'عنب', 'بطيخ', 'تمر', 'طازج'],
    keywordsIndo: ['buah', 'buah-buahan', 'apel', 'jeruk', 'pisang', 'anggur', 'segar'],
    title: 'Memilih Buah-buahan Segar',
    icon: "",
    url: ""
  },
  {
    id: 'fresh_vegetables',
    keywordsArabic: ['خضار', 'خضراوات', 'طماطم', 'بصل', 'بطاطس', 'جزر', 'خيار'],
    keywordsIndo: ['sayur', 'sayur-mayur', 'sayuran', 'tomat', 'bawang', 'wortel', 'kentang'],
    title: 'Memilih Sayuran Segar',
    icon: "",
    url: ""
  },
  {
    id: 'clothing_fashion',
    keywordsArabic: ['ملابس', 'قسم الملابس', 'ثوب', 'قميص', 'بنطلون', 'فستان', 'حجاب', 'ازياء', 'مقاس'],
    keywordsIndo: ['pakaian', 'bagian pakaian', 'baju', 'kaos', 'kemeja', 'celana', 'busana', 'toko baju', 'fashion'],
    title: 'Memilih Pakaian & Busana',
    icon: "",
    url: ""
  },
  {
    id: 'discount_sale',
    keywordsArabic: ['تخفيض', 'تخفيضات', 'تخفيض كبير', 'تخفيضا كبيرا', 'خصم', 'عروض', 'تنزيلات', 'اوكازيون'],
    keywordsIndo: ['diskon', 'potongan harga', 'diskon besar', 'sale', 'promo', 'harga hemat'],
    title: 'Potongan Harga & Diskon Spesial di Toko',
    icon: "",
    url: ""
  },
  {
    id: 'cashier_payment',
    keywordsArabic: ['كاشير', 'امين الصندوق', 'دفع', 'يدفع', 'حساب', 'فاتوره', 'طابور', 'دفعت الثمن'],
    keywordsIndo: ['kasir', 'meja kasir', 'membayar', 'antrean kasir', 'struk pembayaran', 'nota'],
    title: 'Pembayaran di Meja Kasir',
    icon: "",
    url: ""
  },
  {
    id: 'money_rupiah',
    keywordsArabic: ['نقود', 'نقدا', 'فلوس', 'ثمن', 'سعر', 'روبيه', 'ريال', 'دينار', 'غالي', 'رخيص'],
    keywordsIndo: ['uang', 'tunai', 'rupiah', 'harga', 'lembaran uang', 'membayar tunai', 'uang kertas'],
    title: 'Transaksi Pembayaran Tunai',
    icon: "",
    url: ""
  },
  {
    id: 'return_home_happy',
    keywordsArabic: ['رجعنا', 'رجعنا الي البيت', 'رجعنا مسرورين', 'عدنا', 'العوده الي البيت', 'فرحانين', 'مسرورين', 'سعداء'],
    keywordsIndo: ['kembali ke rumah', 'pulang ke rumah', 'senang', 'gembira', 'membawa belanjaan', 'pulang bersama'],
    title: 'Kembali Pulang ke Rumah dengan Senang',
    icon: "",
    url: ""
  },
  {
    id: 'seller_buyer',
    keywordsArabic: ['بائع', 'مشتري', 'زبون', 'عميل', 'يشتري', 'يبيع', 'تجاره'],
    keywordsIndo: ['penjual', 'pembeli', 'pelanggan', 'berbelanja', 'transaksi jual beli'],
    title: 'Interaksi Penjual dan Pembeli',
    icon: "",
    url: ""
  },

  // ==========================================
  // 3. PARIWISATA, PERJALANAN & TRANSPORTASI (السفر والسياحة)
  // ==========================================
  {
    id: 'airport_terminal',
    keywordsArabic: ['مطار', 'صاله المطار', 'بوابه المغادره', 'مهبط'],
    keywordsIndo: ['bandara', 'airport', 'terminal bandara', 'ruang tunggu bandara'],
    title: 'Bandara Udara Internasional',
    icon: "",
    url: ""
  },
  {
    id: 'airplane_flying',
    keywordsArabic: ['طائره', 'طيران', 'يطير', 'تحلق', 'رحله جويه', 'مضيفه', 'طيار'],
    keywordsIndo: ['pesawat', 'pesawat terbang', 'penerbangan', 'mengudara', 'terbang'],
    title: 'Pesawat Terbang di Udara',
    icon: "",
    url: ""
  },
  {
    id: 'train_station',
    keywordsArabic: ['قطار', 'محطه', 'محطه القطار', 'سكه حديد', 'رصيف'],
    keywordsIndo: ['kereta', 'kereta api', 'stasiun', 'stasiun kereta', 'rel'],
    title: 'Perjalanan Naik Kereta Api',
    icon: "",
    url: ""
  },
  {
    id: 'car_bus_travel',
    keywordsArabic: ['حافله', 'سياره', 'مركبه', 'طريق', 'سائق', 'موقف'],
    keywordsIndo: ['bus', 'mobil', 'kendaraan', 'perjalanan darat', 'jalan raya'],
    title: 'Perjalanan Wisata dengan Kendaraan',
    icon: "",
    url: ""
  },
  {
    id: 'ticket_passport',
    keywordsArabic: ['تذكره', 'تذاكر', 'جواز', 'جواز السفر', 'تاشيره', 'حجز'],
    keywordsIndo: ['tiket', 'paspor', 'paspor perjalanan', 'tiket pesawat', 'boarding pass', 'visa'],
    title: 'Tiket Perjalanan & Paspor',
    icon: "",
    url: ""
  },
  {
    id: 'hotel_room',
    keywordsArabic: ['فندق', 'غرفه', 'استقبال', 'نزيل', 'اقامه', 'منتجع'],
    keywordsIndo: ['hotel', 'kamar hotel', 'penginapan', 'resepsionis hotel', 'menginap'],
    title: 'Penginapan Nyaman di Hotel',
    icon: "",
    url: ""
  },
  {
    id: 'beach_sea',
    keywordsArabic: ['شاطئ', 'بحر', 'رمال', 'امواج', 'ساحل', 'محيط', 'جزيره'],
    keywordsIndo: ['pantai', 'laut', 'pesisir', 'ombak', 'pantai pasir putih', 'wisata pantai'],
    title: 'Pemandangan Wisata Pantai & Laut',
    icon: "",
    url: ""
  },
  {
    id: 'mountain_nature',
    keywordsArabic: ['جبل', 'جبال', 'طبيعه', 'منظر', 'شلال', 'غابه', 'قمه', 'هضبه'],
    keywordsIndo: ['gunung', 'pegunungan', 'alam', 'pemandangan alam', 'bukit', 'air terjun'],
    title: 'Panorama Pegunungan & Alam Asri',
    icon: "",
    url: ""
  },
  {
    id: 'museum_history',
    keywordsArabic: ['متحف', 'اثار', 'تاريخ', 'معلم', 'تمثال', 'تراث'],
    keywordsIndo: ['museum', 'sejarah', 'candi', 'benda bersejarah', 'kunjungan museum'],
    title: 'Kunjungan Museum Bersejarah',
    icon: "",
    url: ""
  },
  {
    id: 'luggage_suitcase',
    keywordsArabic: ['حقيبه', 'حقائب', 'امتعه', 'شنطه', 'حزم'],
    keywordsIndo: ['koper', 'tas perjalanan', 'koper pakaian', 'berkemas'],
    title: 'Mempersiapkan Koper Perjalanan',
    icon: "",
    url: ""
  },

  // ==========================================
  // 4. HAJI DAN UMRAH (الحج والعمرة)
  // ==========================================
  {
    id: 'kaaba_tawaf',
    keywordsArabic: ['كعبه', 'طواف', 'يطوف', 'المطاف', 'حجر الاسود', 'ملتزم', 'مقام ابراهيم'],
    keywordsIndo: ['ka\'bah', 'kaabah', 'thawaf', 'mengelilingi ka\'bah', 'hajar aswad', 'pelataran thawaf'],
    title: 'Thawaf Mengelilingi Ka\'bah Al-Musyarrafah',
    icon: "",
    url: ""
  },
  {
    id: 'masjidil_haram',
    keywordsArabic: ['مسجد الحرام', 'مكه', 'مكه المكرمه', 'الحرم المكي'],
    keywordsIndo: ['masjidil haram', 'makkah', 'kota makkah', 'pelataran masjidil haram'],
    title: 'Kemegahan Masjidil Haram Makkah',
    icon: "",
    url: ""
  },
  {
    id: 'ihram_pilgrims',
    keywordsArabic: ['احرام', 'ثوب الاحرام', 'حاج', 'حجاج', 'معتمر', 'تلبيه', 'لبيك اللهم لبيك'],
    keywordsIndo: ['ihram', 'pakaian ihram', 'jamaah haji', 'jamaah umrah', 'talbiyah'],
    title: 'Jamaah Mengenakan Kain Ihram',
    icon: "",
    url: ""
  },
  {
    id: 'masjid_nabawi',
    keywordsArabic: ['مسجد نبوي', 'المسجد النبوي', 'مدينه', 'المدينه المنوره', 'روضه', 'قبه خضراء'],
    keywordsIndo: ['masjid nabawi', 'madinah', 'kota madinah', 'kubah hijau', 'raudhah'],
    title: 'Masjid Nabawi di Madinah Al-Munawwarah',
    icon: "",
    url: ""
  },
  {
    id: 'sai_shafa_marwah',
    keywordsArabic: ['سعي', 'يسعي', 'صفا', 'مروه', 'المسعي'],
    keywordsIndo: ['sa\'i', 'shafa', 'marwah', 'shafa dan marwah', 'melakukan sa\'i'],
    title: 'Ibadah Sa\'i Antara Shafa dan Marwah',
    icon: "",
    url: ""
  },
  {
    id: 'arafah_mina',
    keywordsArabic: ['عرفات', 'عscript', 'مني', 'مزدلفه', 'رمي الجمار', 'وقوف'],
    keywordsIndo: ['arafah', 'padang arafah', 'wukuf', 'mina', 'muzdalifah', 'lempar jumrah'],
    title: 'Wukuf di Padang Arafah & Mina',
    icon: "",
    url: ""
  },
  {
    id: 'zamzam_water',
    keywordsArabic: ['زمزم', 'ماء زمزم', 'يشرب ماء', 'سقيا'],
    keywordsIndo: ['zamzam', 'air zamzam', 'minum air zamzam', 'sumur zamzam'],
    title: 'Meminum Air Zamzam Berkah',
    icon: "",
    url: ""
  },

  // ==========================================
  // 5. TEKNOLOGI & KOMUNIKASI (تكنولوجيا الإعلام والاتصال)
  // ==========================================
  {
    id: 'smartphone_mobile',
    keywordsArabic: ['هاتف', 'هاتف ذكي', 'جوال', 'موبايل', 'شاشه اللمس', 'اتصال'],
    keywordsIndo: ['smartphone', 'hp', 'handphone', 'ponsel', 'telepon genggam'],
    title: 'Penggunaan Smartphone Digital',
    icon: "",
    url: ""
  },
  {
    id: 'laptop_computer',
    keywordsArabic: ['حاسوب', 'كمبيوتر', 'لابتوب', 'حاسب الي', 'لوحه المفاتيح', 'يكتب علي الحاسوب'],
    keywordsIndo: ['laptop', 'komputer', 'mengetik di laptop', 'layar monitor', 'pc'],
    title: 'Belajar dan Mengetik di Komputer Laptop',
    icon: "",
    url: ""
  },
  {
    id: 'internet_network',
    keywordsArabic: ['انترنت', 'شبكه', 'موقع', 'تصفح', 'واي فاي', 'رابط'],
    keywordsIndo: ['internet', 'jaringan', 'browsing', 'website', 'web', 'koneksi internet'],
    title: 'Akses Jaringan Informasi & Internet',
    icon: "",
    url: ""
  },
  {
    id: 'chat_messaging',
    keywordsArabic: ['رساله', 'رسائل', 'بريد', 'بريد الكتروني', 'محادثه', 'تواصل', 'وسائل التواصل'],
    keywordsIndo: ['pesan', 'chat', 'email', 'sosial media', 'kirim pesan', 'berkomunikasi'],
    title: 'Komunikasi & Pesan Digital',
    icon: "",
    url: ""
  },

  // ==========================================
  // 6. TOLERANSI, AGAMA, KELUARGA & MASYARAKAT (التسامح والمجتمع والأسرة)
  // ==========================================
  {
    id: 'tolerance_harmony',
    keywordsArabic: ['تسامح', 'اخاء', 'سلام', 'تصافح', 'محبه', 'تعايش', 'وحده'],
    keywordsIndo: ['toleransi', 'kerukunan', 'persaudaraan', 'damai', 'saling menghargai', 'bersalaman'],
    title: 'Kerukunan & Toleransi Antarumat',
    icon: "",
    url: ""
  },
  {
    id: 'mosque_prayer',
    keywordsArabic: ['مسجد', 'صلاه', 'يصلي', 'وضوء', 'اذان', 'محراب', 'منبر', 'امام'],
    keywordsIndo: ['masjid', 'shalat', 'ibadah shalat', 'berwudhu', 'jamaah masjid'],
    title: 'Ibadah Shalat di Masjid',
    icon: "",
    url: ""
  },
  {
    id: 'church_temple',
    keywordsArabic: ['كنيسه', 'معبد', 'دور العباده', 'اديان'],
    keywordsIndo: ['gereja', 'candi', 'rumah ibadah', 'tempat ibadah'],
    title: 'Keberagaman Rumah Ibadah',
    icon: "",
    url: ""
  },
  {
    id: 'family_home',
    keywordsArabic: ['ابي', 'امي', 'والد', 'والده', 'اسره', 'عائله', 'اخ', 'اخت', 'بيت', 'منزل'],
    keywordsIndo: ['keluarga', 'ayah', 'ibu', 'orang tua', 'saudara', 'rumah', 'bersama keluarga'],
    title: 'Kebersamaan Hangat Bersama Keluarga',
    icon: "",
    url: ""
  },
  {
    id: 'gotong_royong',
    keywordsArabic: ['تعاون', 'يتعاون', 'مساعده', 'يساعد', 'مجتمع', 'اهل القريه', 'جيران'],
    keywordsIndo: ['gotong royong', 'tolong menolong', 'membantu', 'masyarakat', 'warga', 'kerja bakti'],
    title: 'Persatuan & Gotong Royong Masyarakat',
    icon: "",
    url: ""
  },

  // ==========================================
  // 7. LINGKUNGAN HIDUP & PELESTARIAN ALAM (المحافظة على البيئة)
  // ==========================================
  {
    id: 'tree_planting',
    keywordsArabic: ['شجر', 'اشجار', 'زراعه', 'يغرس', 'نبات', 'شجره', 'غرس', 'حديقه'],
    keywordsIndo: ['menanam pohon', 'pohon', 'bibit tanaman', 'reboisasi', 'penghijauan', 'kebun'],
    title: 'Aksi Menanam Pohon Penghijauan',
    icon: "",
    url: ""
  },
  {
    id: 'lush_forest',
    keywordsArabic: ['بيئه', 'غابه', 'طبيعه', 'حدائق', 'اشجار خضراء', 'محميه'],
    keywordsIndo: ['lingkungan', 'hutan', 'alam asri', 'taman hijau', 'kelestarian alam'],
    title: 'Kelestarian Lingkungan Hutan yang Asri',
    icon: "",
    url: ""
  },
  {
    id: 'cleaning_trash',
    keywordsArabic: ['نظافه', 'ينظف', 'قمامه', 'صندوق القمامه', 'كنس', 'شارع نظيف'],
    keywordsIndo: ['kebersihan', 'membersihkan', 'tempat sampah', 'sampah', 'menyapu', 'menjaga kebersihan'],
    title: 'Menjaga Kebersihan Lingkungan Hidup',
    icon: "",
    url: ""
  },
  {
    id: 'recycling_waste',
    keywordsArabic: ['تدوير', 'اعاده التدوير', 'نفايات', 'فرز القمامه'],
    keywordsIndo: ['daur ulang', 'recycle', 'pilah sampah', 'pengelolaan limbah'],
    title: 'Pengelolaan & Daur Ulang Ramah Lingkungan',
    icon: "",
    url: ""
  },
  {
    id: 'clean_water_air',
    keywordsArabic: ['هواء', 'نقي', 'ماء', 'صافي', 'نهر', 'ينبوع', 'عذب'],
    keywordsIndo: ['udara bersih', 'air jernih', 'sungai', 'sumber air', 'udara segar'],
    title: 'Udara Segar & Sumber Air Jernih Alami',
    icon: "",
    url: ""
  },

  // ==========================================
  // 8. SEKOLAH, KELAS & BELAJAR (المدرسة والتعليم)
  // ==========================================
  {
    id: 'school_building',
    keywordsArabic: ['مدرسه', 'معهد', 'مبني المدرسه', 'فناء المدرسه'],
    keywordsIndo: ['sekolah', 'madrasah', 'gedung sekolah', 'halaman sekolah'],
    title: 'Gedung Madrasah / Sekolah',
    icon: "",
    url: ""
  },
  {
    id: 'classroom_teacher',
    keywordsArabic: ['فصل', 'صف', 'استاذ', 'معلم', 'مدرس', 'يشرح', 'سبوره'],
    keywordsIndo: ['kelas', 'ruang kelas', 'guru', 'ustadz', 'mengajar', 'papan tulis'],
    title: 'Suasana Belajar di Ruang Kelas Bersama Guru',
    icon: "",
    url: ""
  },
  {
    id: 'writing_notes',
    keywordsArabic: ['كتاب', 'دفتر', 'قلم', 'يكتب', 'قراءه', 'يقرا', 'واجب'],
    keywordsIndo: ['menulis', 'catatan', 'buku', 'pena', 'membaca', 'mengerjakan tugas'],
    title: 'Menulis Catatan & Mengerjakan Tugas',
    icon: "",
    url: ""
  },
  {
    id: 'library_reading',
    keywordsArabic: ['مكتبه', 'رف الكتب', 'مطالعه', 'مراجع'],
    keywordsIndo: ['perpustakaan', 'membaca di perpustakaan', 'rak buku'],
    title: 'Membaca Buku di Perpustakaan',
    icon: "",
    url: ""
  },
  {
    id: 'students_discussion',
    keywordsArabic: ['طالب', 'طلاب', 'تلميذ', 'تلاميذ', 'صديق', 'اصدقاء', 'زملاء', 'مناقشه', 'حوار'],
    keywordsIndo: ['siswa', 'santri', 'teman', 'sahabat', 'berdiskusi', 'belajar kelompok'],
    title: 'Siswa Belajar dan Berdiskusi Bersama',
    icon: "",
    url: ""
  }
];

// Fallback pool for general scenes
const GENERAL_FALLBACKS = [
  {
    url: "",
    title: 'Aktivitas Belajar dan Berdiskusi',
    icon: ""
  },
  {
    url: "",
    title: 'Suasana Ruang Belajar Sekolah',
    icon: ""
  },
  {
    url: "",
    title: 'Menulis Catatan Belajar',
    icon: ""
  }
];

/**
 * Fast Arabic to Indonesian dictionary lookup for instant realistic translation
 */
const ARABIC_PHRASE_DICTIONARY: { arabic: string; indo: string }[] = [
  { arabic: 'ذهبت الي المستشفي', indo: 'Saya pergi ke rumah sakit' },
  { arabic: 'ذهبت مع امي الي السوق المركزي', indo: 'Saya pergi bersama ibu ke supermarket' },
  { arabic: 'ذهبت مع امي الي السوق', indo: 'Saya pergi bersama ibu ke pasar' },
  { arabic: 'ذهبت الي السوق المركزي', indo: 'Saya pergi ke pasar swalayan' },
  { arabic: 'ذهبت الي السوق التقليدي', indo: 'Saya pergi ke pasar tradisional' },
  { arabic: 'توجهنا الي قسم الملابس', indo: 'Kami menuju ke bagian pakaian' },
  { arabic: 'توجهت الي قسم الملابس', indo: 'Saya menuju ke bagian pakaian' },
  { arabic: 'وكان عليه تخفيض كبير', indo: 'Dan terdapat potongan harga (diskon) yang besar' },
  { arabic: 'وكان عليه تخفيضا كبيرا', indo: 'Dan terdapat potongan harga (diskon) yang besar' },
  { arabic: 'دفعت الثمن للكاشير نقدا', indo: 'Saya membayar harganya ke kasir secara tunai' },
  { arabic: 'دفعت الثمن عند الكاشير', indo: 'Saya membayar harga belanjaan di kasir' },
  { arabic: 'رجعنا الي البيت مسرورين', indo: 'Kami kembali pulang ke rumah dengan senang' },
  { arabic: 'عدنا الي البيت مسرورين', indo: 'Kami kembali pulang ke rumah dengan gembira' },
  { arabic: 'ذهبت الي المدرسه', indo: 'Saya pergi ke sekolah' },
  { arabic: 'ذهبت الي المطار', indo: 'Saya pergi ke bandara' },
  { arabic: 'ذهبت الي الشاطئ', indo: 'Saya pergi ke pantai' },
  { arabic: 'ذهبت الي الجبل', indo: 'Saya pergi ke gunung' },
  { arabic: 'ذهبت الي مكه المكرمه', indo: 'Saya pergi ke Makkah Al-Mukarramah' },
  { arabic: 'ذهبت الي المدينه المنوره', indo: 'Saya pergi ke Madinah Al-Munawwarah' },
  { arabic: 'قابلت الطبيب', indo: 'Saya bertemu dengan dokter' },
  { arabic: 'فحصني الطبيب بالسماعه', indo: 'Dokter memeriksa saya dengan stetoskop' },
  { arabic: 'فحص الطبيب المريض', indo: 'Dokter memeriksa pasien' },
  { arabic: 'كتب الطبيب وصفه الدواء', indo: 'Dokter menuliskan resep obat' },
  { arabic: 'اشتريت الدواء من الصيدليه', indo: 'Saya membeli obat dari
