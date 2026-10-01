export interface Mufradat {
  word: string;
  meaning: string;
  pronunciation: string;
  imageUrl?: string;
  icon?: string;
  category?: string;
}

export interface TarkibPattern {
  name: string;
  patternArabic: string;
  example: string;
  explanation: string;
}

export interface ThemeTopic {
  id: string;
  titleArabic: string;
  titleIndo: string;
  grade: string;
  imageUrl: string;
  prompt: string;
  mufradat: Mufradat[];
  tarkib: TarkibPattern[];
  contohInsya: string;
  kesalahanUmum: string[];
}

export const THEMES: ThemeTopic[] = [
  {
    id: 'tasawwuq',
    titleArabic: 'التَّسَوُّقُ (فِي السُّوقِ التَّقْلِيدِيِّ وَالْمَرْكَزِيِّ)',
    titleIndo: 'Berbelanja di Pasar Tradisional & Supermarket',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan karangan singkat tentang pengalamanmu berbelanja kebutuhan di pasar tradisional atau supermarket (سُوق مَرْكَزِيّ), barang yang kamu beli, dan bagaimana proses tawar-menawar atau pembayarannya.',
    mufradat: [
      { 
        word: 'سُوقٌ مَرْكَزِيٌّ', 
        meaning: 'Supermarket / Swalayan', 
        pronunciation: 'Suuqun markaziyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'سُوقٌ تَقْلِيدِيٌّ', 
        meaning: 'Pasar Tradisional', 
        pronunciation: 'Suuqun taqliidiyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'قِسْمُ الْمَلَابِسِ', 
        meaning: 'Bagian Pakaian', 
        pronunciation: 'Qismul malaabis', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'قِسْمُ الْمَأْكُولَاتِ', 
        meaning: 'Bagian Makanan & Buah', 
        pronunciation: 'Qismul ma\'kuulaat', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'بَائِعٌ', 
        meaning: 'Penjual', 
        pronunciation: 'Baa\'i\'un', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'مُشْتَرٍ', 
        meaning: 'Pembeli / Pelanggan', 
        pronunciation: 'Musytarin', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'كَاشِير / أَمِينُ الصُّنْدُوقِ', 
        meaning: 'Kasir Pembayaran', 
        pronunciation: 'Amiinush shunduuq', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'تَخْفِيضٌ / خَصْمٌ', 
        meaning: 'Diskon / Potongan Harga', 
        pronunciation: 'Takhfiidhun / Khasymun', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'ثَمَنٌ / سِعْرٌ', 
        meaning: 'Harga Barang', 
        pronunciation: 'Tsamanun / Si\'run', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'نَقْدًا', 
        meaning: 'Secara Tunai (Cash)', 
        pronunciation: 'Naqdan', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'رَخِيصٌ', 
        meaning: 'Murah Terjangkau', 
        pronunciation: 'Rakhiishun', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'غَالٍ', 
        meaning: 'Mahal / Premium', 
        pronunciation: 'Ghaalin', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      }
    ],
    tarkib: [
      {
        name: 'An-Na\'at wal Man\'ut / Sifat & Benda (النعت والمنعوت)',
        patternArabic: 'مَنْعُوتٌ (الِاسْمُ) + نَعْتٌ مُطَابِقٌ (الصِّفَةُ)',
        example: 'اشْتَرَيْتُ الْفَوَاكِهَ الطَّازَجَةَ وَالْقَمِيصَ الْجَدِيدَ بِثَمَنٍ رَخِيصٍ',
        explanation: 'Kata sifat (na\'at) menyelaraskan harakat, jenis (mudzakkar/muannats), dan keumuman (ma\'rifah/nakirah) dengan benda yang disifati (man\'ut) saat mendeskripsikan barang belanjaan.'
      },
      {
        name: 'Huruf Jar & Zharaf Tempat (حروف الجر والظرف)',
        patternArabic: 'حَرْفُ الْجَرِّ / ظَرْفُ الْمَكَانِ + اسْمٌ مَجْرُورٌ',
        example: 'أَذْهَبُ مَعَ أُمِّي إِلَى قِسْمِ الْمَأْكُولَاتِ فِي السُّوقِ الْمَرْكَزِيِّ',
        explanation: 'Menyusun keterangan arah dan tempat belanja yang runtut menggunakan huruf jar (إِلَى، فِي، مِنْ، مَعَ).'
      },
      {
        name: 'Jumlah Fi\'liyyah & Objek Manshub (فعل + فاعل + مفعول به)',
        patternArabic: 'فِعْلٌ + فَاعِلٌ + مَفْعُولٌ بِهِ مَنْصُوبٌ',
        example: 'يَبِيعُ الْبَائِعُ الْفَوَاكِهَ الطَّازَجَةَ بِثَمَنٍ رَخِيصٍ',
        explanation: 'Menyusun kalimat verba aktif, di mana objek (maf\'ul bih) berharakat fathah/manshub.'
      },
      {
        name: 'Tarkib Li Ta\'lil / Alasan Tujuan (لِـ + الفعل المضارع)',
        patternArabic: 'لِـ + فِعْلٌ مُضَارِعٌ مَنْصُوبٌ بِالْفَتْحَةِ',
        example: 'ذَهَبْنَا إِلَى السُّوقِ الْمَرْكَزِيِّ لِنَشْتَرِيَ حَاجَاتِ الْبَيْتِ',
        explanation: 'Huruf \'li\' (untuk/agar) menashabkan fi\'il mudhari\' guna menerangkan maksud tujuan berbelanja.'
      }
    ],
    contohInsya: 'فِي يَوْمِ الْأَحَدِ، ذَهَبْتُ مَعَ أُمِّي إِلَى السُّوقِ الْمَرْكَزِيِّ لِشِرَاءِ حَاجَاتِ الْبَيْتِ. دَخَلْنَا قِسْمَ الْمَأْكُولَاتِ وَاشْتَرَيْنَا الْفَوَاكِهَ وَالْخُضْرَاوَاتِ الطَّازَجَةَ. بَعْدَ ذَلِكَ، تَوَجَّهْنَا إِلَى قِسْمِ الْمَلَابِسِ لِشِرَاءِ قَمِيصٍ جَدِيدٍ، وَكَانَ عَلَيْهِ تَخْفِيضٌ كَبِيرٌ. دَفَعْتُ الثَّمَنَ لِلْكَاشِيرِ نَقْدًا وَرَجَعْنَا إِلَى الْبَيْتِ مَسْرُورَيْنِ.',
    kesalahanUmum: [
      'Ketidaksesuaian kata sifat (na\'at) dengan kata bendanya (man\'ut), misalnya memasangkan kata muannats dengan sifat mudzakkar (seharusnya: الْفَوَاكِهَ الطَّازَجَةَ bukan الطَّازَجَ).',
      'Lupa memberikan tanda fathah pada maf\'ul bih (kata objek setelah fi\'il dan fa\'il).'
    ]
  },
  {
    id: 'sihhah',
    titleArabic: 'الصِّحَّةُ وَالرِّعَايَةُ الصِّحِّيَّةُ',
    titleIndo: 'Kesehatan & Layanan Medis',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan karangan tentang pengalaman berobat atau memeriksakan kesehatan di klinik/rumah sakit, nasihat dokter untuk pola hidup sehat, serta peran apotek dalam menyediakan obat.',
    mufradat: [
      { 
        word: 'مُسْتَشْفَى', 
        meaning: 'Rumah Sakit', 
        pronunciation: 'Mustasyfaa', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'طَبِيبٌ', 
        meaning: 'Dokter', 
        pronunciation: 'Thabiibun', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'مُمَرِّضَةٌ', 
        meaning: 'Perawat', 
        pronunciation: 'Mumarridhatun', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'مَرِيضٌ', 
        meaning: 'Pasien / Orang Sakit', 
        pronunciation: 'Mariidhun', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'صَيْدَلِيَّةٌ', 
        meaning: 'Apotek', 
        pronunciation: 'Shaidaliyyatun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'دَوَاءٌ', 
        meaning: 'Obat / Resep', 
        pronunciation: 'Dawaa\'un', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'سَمَّاعَةُ الطَّبِيبِ', 
        meaning: 'Stetoskop', 
        pronunciation: 'Sammaa\'atuth thabiib', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'عِيَادَةٌ', 
        meaning: 'Klinik / Ruang Periksa', 
        pronunciation: '\'Iyaadatun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'حُمَّى وَصُدَاعٌ', 
        meaning: 'Demam & Sakit Kepala', 
        pronunciation: 'Hummaa wa shudaa\'', 
        imageUrl: "",
        icon: "", 
        category: 'Perasaan' 
      },
      { 
        word: 'مِقْيَاسُ الْحَرَارَةِ', 
        meaning: 'Termometer Suhu', 
        pronunciation: 'Miqyaasul haraarah', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'صِحَّةٌ وَعَافِيَةٌ', 
        meaning: 'Kesehatan & Kebugaran', 
        pronunciation: 'Shihhatun wa \'aafiyah', 
        imageUrl: "",
        icon: "", 
        category: 'Perasaan' 
      },
      { 
        word: 'وِقَايَةٌ', 
        meaning: 'Pencegahan Penyakit', 
        pronunciation: 'Wiqaayatun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      }
    ],
    tarkib: [
      {
        name: 'Huruf Athaf (حروف العطف: الواو، الفاء، ثم، أو)',
        patternArabic: 'مَعْطُوفٌ عَلَيْهِ + حَرْفُ الْعَطْفِ (ثُمَّ / فَـ / وَ) + مَعْطُوفٌ',
        example: 'فَحَصَ الطَّبِيبُ الْمَرِيضَ ثُمَّ كَتَبَ لَهُ الْوَصْفَةَ الطِّبِّيَّةَ',
        explanation: 'Kata sambung berurutan (athaf) seperti \'tsumma\' (kemudian) dan \'fa\' (lalu) menyelaraskan i\'rab kata setelahnya.'
      },
      {
        name: 'Tarkib Fi\'il Mudhari\' Manshub dengan \'An\' (أَنْ + الفعل المضارع)',
        patternArabic: 'يَجِبُ / يَنْبَغِي + أَنْ + فِعْلٌ مُضَارِعٌ مَنْصُوبٌ',
        example: 'يَنْبَغِي لِلْمَرِيضِ أَنْ يَتَنَاوَلَ الدَّوَاءَ فِي وَقْتِهِ',
        explanation: 'Setelah huruf nashab \'an\' (أَنْ), fi\'il mudhari\' dibaca fathah (manshub).'
      },
      {
        name: 'Kaidah Na\'at & Man\'ut dalam Istilah Medis',
        patternArabic: 'مَنْعُوتٌ + نَعْتٌ مُطَابِقٌ',
        example: 'الْوِقَايَةُ خَيْرٌ مِنَ الْعِلَاجِ فِي الرِّعَايَةِ الصِّحِّيَّةِ',
        explanation: 'Sifat (na\'at) mengikuti isim yang disifati (man\'ut) dalam segi harakat, jenis kelamin, dan ma\'rifah/nakirah.'
      }
    ],
    contohInsya: 'شَعَرْتُ بِحُمَّى شَدِيدَةٍ وَصُدَاعٍ فِي الصَّبَاحِ، فَذَهَبْتُ مَعَ أَبِي إِلَى الْمُسْتَشْفَى. قَابَلْنَا الطَّبِيبَ فِي الْعِيَادَةِ، فَفَحَصَنِي بِسَمَّاعَةِ الطَّبِيبِ وَقَاسَ حَرَارَتِي. قَالَ الطَّبِيبُ: "عَلَيْكَ أَنْ تَسْتَرِيحَ وَتَشْرَبَ الْمَاءَ الْكَثِيرَ". ثُمَّ كَتَبَ لِي وَصْفَةَ الدَّوَاءِ، فَاشْتَرَيْنَاهَا مِنَ الصَّيْدَلِيَّةِ. الْحَمْدُ لِلَّهِ، شَعَرْتُ بِتَحَسُّنٍ كَبِيرٍ.',
    kesalahanUmum: [
      'Menulis fi\'il mudhari\' setelah \'an\' (أَنْ) dengan harakat dhommah (seharusnya fathah: أَنْ يَتَنَاوَلَ).',
      'Ketidaksesuaian jenis kelamin antara fa\'il muannats dan fi\'ilnya (misal: فَحَصَ الْمُمَرِّضَةُ seharusnya فَحَصَتِ الْمُمَرِّضَةُ).'
    ]
  },
  {
    id: 'siyahah',
    titleArabic: 'السَّفَرُ وَالسِّيَاحَةُ',
    titleIndo: 'Bepergian & Pariwisata',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan karangan tentang rencana atau pengalaman wisatamu saat liburan ke destinasi alam atau kota bersejarah, pemesanan tiket, dan keindahan tempat yang dikunjungi.',
    mufradat: [
      { 
        word: 'مَطَارٌ', 
        meaning: 'Bandara Udara', 
        pronunciation: 'Mathaarun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'طَائِرَةٌ', 
        meaning: 'Pesawat Terbang', 
        pronunciation: 'Thaa\'iratun', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'قِطَارٌ', 
        meaning: 'Kereta Api', 
        pronunciation: 'Qithaarun', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'جَوَازُ السَّفَرِ', 
        meaning: 'Paspor Perjalanan', 
        pronunciation: 'Jawaazus safar', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'تَذْكِرَةٌ', 
        meaning: 'Tiket Perjalanan', 
        pronunciation: 'Tadzkiratun', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'فُنْدُقٌ', 
        meaning: 'Hotel Penginapan', 
        pronunciation: 'Funduqun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'حَقِيبَةُ السَّفَرِ', 
        meaning: 'Koper Wisata', 
        pronunciation: 'Haqiibatus safar', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'شَاطِئُ الْبَحْرِ', 
        meaning: 'Pantai Laut', 
        pronunciation: 'Syaathi\'ul bahr', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'جَبَلٌ', 
        meaning: 'Gunung Alam', 
        pronunciation: 'Jabalun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'مَتْحَفٌ', 
        meaning: 'Museum Bersejarah', 
        pronunciation: 'Mathafun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'مَنْظَرٌ طَبِيعِيٌّ', 
        meaning: 'Pemandangan Alami', 
        pronunciation: 'Manzharun thabi\'iyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Wisata' 
      },
      { 
        word: 'دَلِيلٌ سِيَاحِيٌّ', 
        meaning: 'Pemandu Wisata (Tour Guide)', 
        pronunciation: 'Daliilun siyaahiyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      }
    ],
    tarkib: [
      {
        name: 'Isim Tafdhil Pola Komparatif (اسْمُ التَّفْضِيلِ: أَفْعَلُ مِنْ)',
        patternArabic: 'اسْمٌ + أَفْعَلُ + مِنْ + اسْمٌ',
        example: 'هَذَا الشَّاطِئُ أَجْمَلُ مِنْ ذَاكَ، وَالْقِطَارُ أَسْرَعُ مِنَ الْحَافِلَةِ',
        explanation: 'Pola \'af\'alu min\' (أَفْعَلُ مِنْ) digunakan untuk membandingkan dua tempat atau sarana transportasi (lebih indah, lebih cepat, lebih luas).'
      },
      {
        name: 'Huruf Nashab Li Ta\'lil (لِـ / لِكَيْ / حَتَّى)',
        patternArabic: 'لِـ / كَيْ + فِعْلٌ مُضَارِعٌ مَنْصُوبٌ',
        example: 'سَافَرْنَا إِلَى لُومْبُوك لِنُشَاهِدَ الْمَنَاظِرَ الطَّبِيعِيَّةَ الْخَلَّابَةَ',
        explanation: 'Huruf \'li\' (untuk/agar) menashabkan fi\'il mudhari\' untuk menyatakan tujuan perjalanan wisata.'
      },
      {
        name: 'Zharaf Zaman & Keterangan Waktu Lampau',
        patternArabic: 'فِي الْعُطْلَةِ الْمَاضِيَةِ / قَبْلَ يَوْمَيْنِ',
        example: 'فِي الْعُطْلَةِ الْمَدْرَسِيَّةِ، حَجَزْنَا غُرْفَةً فِي الْفُنْدُقِ',
        explanation: 'Penanda waktu awal paragraf untuk mengalirkan karangan naratif secara kronologis.'
      }
    ],
    contohInsya: 'فِي الْعُطْلَةِ الْمَاضِيَةِ، قَرَّرْتُ أَنَا وَأُسْرَتِي السَّفَرَ إِلَى جَزِيرَةِ بَالِي. حَجَزَ أَبِي التَّذَاكِرَ عَبْرَ الْإِنْتَرْنِت وَحَزَمْنَا حَقَائِبَ السَّفَرِ. رَكِبْنَا الطَّائِرَةَ مِنَ الْمَطَارِ صَبَاحًا. عِنْدَمَا وَصَلْنَا، أَقَمْنَا فِي فُنْدُقٍ قَرِيبٍ مِنَ الشَّاطِئِ. كَانَ مَنْظَرُ الْبَحْرِ أَجْمَلَ مِمَّا تَوَقَّعْتُ، وَشَاهَدْنَا غُرُوبَ الشَّمْسِ الرَّائِعَ.',
    kesalahanUmum: [
      'Menulis isim tafdhil dengan tanwin (misal: أَجْمَلٌ مِنْ seharusnya أَجْمَلُ مِنْ tanpa tanwin karena mamnu\' minash sharf).',
      'Salah menggunakan huruf perbandingan (menggunakan عَنْ bukannya مِنْ).'
    ]
  },
  {
    id: 'hajj',
    titleArabic: 'الْحَجُّ وَالْعُمْرَةُ',
    titleIndo: 'Ibadah Haji & Umrah',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan deskripsi mengenai rangkaian manasik ibadah haji dan umrah, mulai dari niat ihram di miqat, thawaf di Ka\'bah, sa\'i di Shafa-Marwah, hingga wukuf di padang Arafah.',
    mufradat: [
      { 
        word: 'الْكَعْبَةُ الْمُشَرَّفَةُ', 
        meaning: 'Ka\'bah Al-Musyarrafah', 
        pronunciation: 'Al-Ka\'batul musyarrafah', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'الْمَسْجِدُ الْحَرَامُ', 
        meaning: 'Masjidil Haram Makkah', 
        pronunciation: 'Al-Masjidul haraam', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'إِحْرَامٌ', 
        meaning: 'Kain & Niat Ihram', 
        pronunciation: 'Ihraamun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'طَوَافٌ', 
        meaning: 'Thawaf Keliling Ka\'bah', 
        pronunciation: 'Thawaafun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'سَعْيٌ', 
        meaning: 'Sa\'i Shafa & Marwah', 
        pronunciation: 'Sa\'yun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'وُقُوفٌ بِعَرَفَاتٍ', 
        meaning: 'Wukuf di Padang Arafah', 
        pronunciation: 'Wuquufun bi \'arafaat', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'مَاءُ زَمْزَمَ', 
        meaning: 'Air Zamzam Berkah', 
        pronunciation: 'Maa\'u zamzam', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'الْمَسْجِدُ النَّبَوِيُّ', 
        meaning: 'Masjid Nabawi Madinah', 
        pronunciation: 'Al-Masjidun nabawiyyu', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'حَاجٌّ / حُجَّاجٌ', 
        meaning: 'Jamaah Haji', 
        pronunciation: 'Haajjun / Hujjaaj', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'تَلْبِيَةٌ', 
        meaning: 'Talbiyah (Labbaykallahumma)', 
        pronunciation: 'Talbiyatun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'رَمْيُ الْجَمَرَاتِ', 
        meaning: 'Lempar Jumrah di Mina', 
        pronunciation: 'Ramyul jamaraat', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'مَقَامُ إِبْرَاهِيمَ', 
        meaning: 'Maqam Ibrahim', 
        pronunciation: 'Maqaamu Ibraahiim', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      }
    ],
    tarkib: [
      {
        name: 'Fi\'il Mabni Majhul & Na\'ibul Fa\'il (الْفِعْلُ الْمَبْنِيُّ لِلْمَجْهُولِ وَنَائِبُ الْفَاعِلِ)',
        patternArabic: 'فُعِلَ / يُفْعَلُ + نَائِبُ الْفَاعِلِ (مَرْفُوعٌ)',
        example: 'تُؤَدَّى مَنَاسِكُ الْحَجِّ فِي شَهْرِ ذِي الْحِجَّةِ',
        explanation: 'Kalimat pasif (mabni majhul) diawali fi\'il berpola dhumma awwaluhu dan diikuti subjek pengganti (na\'ibul fa\'il) yang berharakat dhommah.'
      },
      {
        name: 'Zharaf Makan Khusus Tanah Suci (حَوْلَ / بَيْنَ)',
        patternArabic: 'ظَرْفٌ (حَوْلَ / بَيْنَ) + مُضَافٌ إِلَيْهِ مَجْرُورٌ',
        example: 'يَطُوفُ الْحُجَّاجُ سَبْعَةَ أَشْوَاطٍ حَوْلَ الْكَعْبَةِ الْمُشَرَّفَةِ',
        explanation: 'Penggunaan keterangan tempat spesifik seperti \'haula\' (mengelilingi) dan \'baina\' (antara Shafa dan Marwah).'
      },
      {
        name: 'Tarkib Masdar Sharih dalam Ibadah',
        patternArabic: 'فِعْلٌ + مَصْدَرٌ صَرِيحٌ',
        example: 'يَبْدَأُ الْإِحْرَامُ بِعَقْدِ النِّيَّةِ مِنَ الْمِيقَاتِ',
        explanation: 'Menggunakan kata benda verbal (masdar) seperti al-ihram, ath-thawaf, as-sa\'yu untuk menjabarkan rukun haji.'
      }
    ],
    contohInsya: 'الْحَجُّ هُوَ الرُّكْنُ الْخَامِسُ مِنْ أَرْكَانِ الْإِسْلَامِ. يَبْدَأُ الْحَاجُّ رِحْلَتَهُ بِالْإِحْرَامِ مِنَ الْمِيقَاتِ، وَيُرَدِّدُ التَّلْبِيَةَ قَائِلًا: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ". عِنْدَ وُصُولِهِ إِلَى الْمَسْجِدِ الْحَرَامِ، يَطُوفُ حَوْلَ الْكَعْبَةِ سَبْعَةَ أَشْوَاطٍ، ثُمَّ يَسْعَى بَيْنَ الصَّفَا وَالْمَرْوَةِ. وَفِي يَوْمِ عَرَفَةَ، يَقِفُ جَمِيعُ الْحُجَّاجِ بِعَرَفَاتٍ مُتَضَرِّعِينَ إِلَى اللَّهِ بِالدُّعَاءِ.',
    kesalahanUmum: [
      'Memberikan harakat fathah pada na\'ibul fa\'il (seharusnya marfu\'/dhommah: تُؤَدَّى الْمَنَاسِكُ bukan الْمَنَاسِكَ).',
      'Lupa menyelaraskan fi\'il dengan na\'ibul fa\'il muannats (misalnya: يُؤَدَّى الْمَنَاسِكُ seharusnya تُؤَدَّى الْمَنَاسِكُ).'
    ]
  },
  {
    id: 'tiknulujiya',
    titleArabic: 'تِكْنُولُوجِيَا الْإِعْلَامِ وَالِاتِّصَالِ',
    titleIndo: 'Teknologi Informasi & Komunikasi',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Jelaskan bagaimana kamu memanfaatkan teknologi informasi, internet, komputer, dan smartphone untuk menunjang kegiatan belajarmu sehari-hari secara positif.',
    mufradat: [
      { 
        word: 'هَاتِفٌ ذَكِيٌّ', 
        meaning: 'Smartphone / Ponsel Pintar', 
        pronunciation: 'Haatifun dzakiyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Perangkat' 
      },
      { 
        word: 'حَاسُوبٌ مَحْمُولٌ', 
        meaning: 'Laptop / Komputer Jinjing', 
        pronunciation: 'Haasuubun mahmuul', 
        imageUrl: "",
        icon: "", 
        category: 'Perangkat' 
      },
      { 
        word: 'شَبَكَةُ الْإِنْتَرْنِت', 
        meaning: 'Jaringan Internet Global', 
        pronunciation: 'Syabakatul internet', 
        imageUrl: "",
        icon: "", 
        category: 'Teknologi' 
      },
      { 
        word: 'مَوْقِعٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Situs Web / Website', 
        pronunciation: 'Mauqi\'un iliktuuruuniyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Teknologi' 
      },
      { 
        word: 'وَسَائِلُ التَّوَاصُلِ', 
        meaning: 'Media Sosial', 
        pronunciation: 'Wasaa\'ilut tawaashul', 
        imageUrl: "",
        icon: "", 
        category: 'Komunikasi' 
      },
      { 
        word: 'بَرِيدٌ إِلِكْتُرُونِيٌّ', 
        meaning: 'Surel / Email', 
        pronunciation: 'Bariidun iliktuuruuniyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَطْبِيقٌ تَعْلِيمِيٌّ', 
        meaning: 'Aplikasi Pembelajaran', 
        pronunciation: 'Tathbliqun ta\'liimiyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Teknologi' 
      },
      { 
        word: 'بَحْثٌ عَنِ الْمَعْلُومَاتِ', 
        meaning: 'Pencarian Informasi Digital', 
        pronunciation: 'Bahtsun \'anil ma\'luumaat', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'شَاشَةٌ', 
        meaning: 'Layar Monitor', 
        pronunciation: 'Syaasyatun', 
        imageUrl: "",
        icon: "", 
        category: 'Perangkat' 
      },
      { 
        word: 'رِسَالَةٌ قَصِيرَةٌ', 
        meaning: 'Pesan Singkat (Chat)', 
        pronunciation: 'Risaalatun qashiiratun', 
        imageUrl: "",
        icon: "", 
        category: 'Komunikasi' 
      },
      { 
        word: 'تَحْمِيلُ الْمَلَفَّاتِ', 
        meaning: 'Download / Unduh Berkas', 
        pronunciation: 'Tahmiilul malaffaat', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'مُفِيدٌ وَسَرِيعٌ', 
        meaning: 'Bermanfaat & Cepat', 
        pronunciation: 'Mufiidun wa sarii\'un', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      }
    ],
    tarkib: [
      {
        name: 'Tashrif Fi\'il Tsulatsi Mazid (تَصْرِيفُ الْفِعْلِ الْمَزِيدِ: اِسْتَخْدَمَ / يُسَهِّلُ / تَوَاصَلَ)',
        patternArabic: 'اِسْتَفْعَلَ (يَسْتَخْدِمُ) / فَعَّلَ (يُسَهِّلُ) / تَفَاعَلَ (يَتَوَاصَلُ)',
        example: 'يَسْتَخْدِمُ الطَّالِبُ الْحَاسُوبَ لِيُسَهِّلَ عَمَلِيَّةَ التَّعَلُّمِ',
        explanation: 'Menggunakan kata kerja berimbuhan wazan mazid yang sangat kaya dalam mendeskripsikan teknologi modern.'
      },
      {
        name: 'Tarkib Maf\'ul Liajlih (مفعول لأجله)',
        patternArabic: 'فِعْلٌ + مَفْعُولٌ لِأَجْلِهِ (مَنْصُوبٌ)',
        example: 'أَتَصَفَّحُ الْمَوَاقِعَ التَّعْلِيمِيَّةَ رَغْبَةً فِي زِيَادَةِ الْمَعْرِفَةِ',
        explanation: 'Kata keterangan alasan (raghbatan / thalaban) berharakat fathatain untuk menerangkan motif menggunakan internet.'
      },
      {
        name: 'Struktur Idhafah Istilah TIK',
        patternArabic: 'مُضَافٌ + مُضَافٌ إِلَيْهِ',
        example: 'وَسَائِلُ التَّوَاصُلِ الْحَدِيثَةُ سَيْفٌ ذُو حَدَّيْنِ',
        explanation: 'Penggabungan dua isim tanpa tanwin pada kata pertama (mudhaf) dan kasrah pada kata kedua (mudhaf ilaih).'
      }
    ],
    contohInsya: 'أَصْبَحَتْ تِكْنُولُوجِيَا الْإِعْلَامِ وَالِاتِّصَالِ جُزْءًا مُهِمًّا فِي حَيَاتِنَا الْيَوْمِيَّةِ. أَسْتَخْدِمُ حَاسُوبِي الْمَحْمُولَ وَهَاتِفِي الذَّكِيَّ لِلْبَحْثِ عَنِ الْمَعْلُومَاتِ الدِّرَاسِيَّةِ عَبْرَ شَبَكَةِ الْإِنْتَرْنِت. كَمَا أَتَوَاصَلُ مَعَ مُعَلِّمِي وَزُمَلَائِي عَبْرَ الْبَرِيدِ الْإِلِكْتُرُونِيِّ وَتَطْبِيقَاتِ الْمُحَادَثَةِ. إِنَّ التِّكْنُولُوجِيَا تُسَهِّلُ لَنَا التَّعَلُّمَ إِذَا اسْتَخْدَمْنَاهَا بِحِكْمَةٍ.',
    kesalahanUmum: [
      'Menambahkan alif lam pada kata mudhaf (misal: الْوَسَائِلُ التَّوَاصُلِ seharusnya وَسَائِلُ التَّوَاصُلِ).',
      'Kesalahan penulisan hamzah qatha\' dan washal pada fi\'il mazid (misal: إِسْتَخْدَمَ seharusnya اِسْتَخْدَمَ).'
    ]
  },
  {
    id: 'tasamuh',
    titleArabic: 'الْأَدْيَانُ وَالتَّسَامُحُ فِي إِنْدُونِيسِيَا',
    titleIndo: 'Keberagaman Agama & Toleransi di Indonesia',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan karangan tentang indahnya keberagaman suku dan agama di Indonesia, pentingnya sikap toleransi (تَسَامُح), gotong royong, dan saling menghormati antarumat beragama.',
    mufradat: [
      { 
        word: 'تَسَامُحٌ', 
        meaning: 'Toleransi & Kerukunan', 
        pronunciation: 'Tasaamuhun', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'مَسْجِدٌ', 
        meaning: 'Masjid Tempat Ibadah', 
        pronunciation: 'Masjidun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'كَنِيسَةٌ', 
        meaning: 'Gereja', 
        pronunciation: 'Kaniisatun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'مَعْبَدٌ / بَيْتُ الْعِبَادَةِ', 
        meaning: 'Candi / Rumah Ibadah', 
        pronunciation: 'Ma\'badun / Baitul \'ibaadah', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'وَحْدَةٌ وَطَنِيَّةٌ', 
        meaning: 'Persatuan Bangsa (Bhinneka)', 
        pronunciation: 'Wahdatun wathaniyyah', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'سَلَامٌ وَأَمْنٌ', 
        meaning: 'Kedamaian & Keamanan', 
        pronunciation: 'Salaamun wa amnun', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'مُجْتَمَعٌ', 
        meaning: 'Masyarakat Majemuk', 
        pronunciation: 'Mujtama\'un', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'مُوَاطِنٌ', 
        meaning: 'Warga Negara', 
        pronunciation: 'Muwaathinun', 
        imageUrl: "",
        icon: "", 
        category: 'Tokoh' 
      },
      { 
        word: 'إِخَاءٌ إِنْسَانِيٌّ', 
        meaning: 'Persaudaraan Kemanusiaan', 
        pronunciation: 'Ikhaa\'un insaaniyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'تَعَاوُنٌ / تَكَافُلٌ', 
        meaning: 'Gotong Royong & Saling Bantu', 
        pronunciation: 'Ta\'aawunun / Takaafulun', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'احْتِرَامٌ مُتَبَادَلٌ', 
        meaning: 'Saling Menghormati', 
        pronunciation: 'Ihtiraamun mutabaadal', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'دِينٌ / أَدْيَانٌ', 
        meaning: 'Agama-agama', 
        pronunciation: 'Diinun / Adyaan', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      }
    ],
    tarkib: [
      {
        name: 'Kana wa Akhwatuha (كَانَ وَأَخَوَاتُهَا: كَانَ، صَارَ، لَيْسَ، أَصْبَحَ)',
        patternArabic: 'كَانَ / أَصْبَحَ + اسْمُ كَانَ (مَرْفُوعٌ) + خَبَرُ كَانَ (مَنْصُوبٌ)',
        example: 'كَانَ التَّسَامُحُ الدِّينِيُّ أَسَاسًا لِوَحْدَةِ الشَّعْبِ الْإِنْدُونِيسِيِّ',
        explanation: 'Isim Kana berharakat dhommah (marfu\') dan Khabar Kana berharakat fathah/fathatain (manshub).'
      },
      {
        name: 'Inna wa Akhwatuha (إِنَّ وَأَخَوَاتُهَا: إِنَّ، أَنَّ، لَكِنَّ، لَعَلَّ)',
        patternArabic: 'إِنَّ + اسْمُ إِنَّ (مَنْصُوبٌ) + خَبَرُ إِنَّ (مَرْفُوعٌ)',
        example: 'إِنَّ إِخْلَاصَ الْمُوَاطِنِينَ فِي التَّعَاوُنِ سَبَبٌ لِاسْتِقْرَارِ الْبِلَادِ',
        explanation: 'Isim Inna berharakat fathah (manshub) dan Khabar Inna berharakat dhommah (marfu\').'
      },
      {
        name: 'Jumlah Ismiyyah dengan Khabar Syibhul Jumlah',
        patternArabic: 'مُبْتَدَأٌ + فِي / عَلَى + اسْمٌ مَجْرُورٌ',
        example: 'فِي إِنْدُونِيسِيَا تَنَوُّعٌ دِينِيٌّ وَثَقَافِيٌّ رَائِعٌ',
        explanation: 'Mendahulukan keterangan tempat (khabar muqaddam) sebelum subjek (mubtada muakhkhar).'
      }
    ],
    contohInsya: 'إِنَّ إِنْدُونِيسِيَا بَلَدٌ عَظِيمٌ يَتَمَيَّزُ بِتَنَوُّعِ الْأَدْيَانِ وَالثَّقَافَاتِ. يَعِيشُ الْمُسْلِمُونَ وَالْمَسِيحِيُّونَ وَالْهُنْدُوسُ وَالْبُوذِيُّونَ فِي سَلَامٍ وَأَمْنٍ. يَتَعَاوَنُ جَمِيعُ الْمُوَاطِنِينَ فِي بِنَاءِ الْوَطَنِ عَلَى أَسَاسِ التَّسَامُحِ وَالِاحْتِرَامِ الْمُتَبَادَلِ. كَانَ هَذَا التَّسَامُحُ رَمْزًا لِوَحْدَةِ بِلَادِنَا "الْوَحْدَةُ فِي التَّنَوُّعِ" (Bhinneka Tunggal Ika).',
    kesalahanUmum: [
      'Membalik harakat antara Isim Inna dan Khabar Inna (seharusnya Isim Inna fathah, Khabar Inna dhommah).',
      'Lupa merubah khabar Kana menjadi fathatain/manshub.'
    ]
  },
  {
    id: 'biah',
    titleArabic: 'الْمُحَافَظَةُ عَلَى الْبِيئَةِ',
    titleIndo: 'Pelestarian Lingkungan Hidup',
    grade: 'Kelas XI',
    imageUrl: "",
    prompt: 'Tuliskan karangan tentang pentingnya menjaga kebersihan lingkungan sekolah dan tempat tinggal, gerakan menanam pohon (penghijauan), serta bahaya membuang sampah sembarangan.',
    mufradat: [
      { 
        word: 'بِيئَةٌ نَظِيفَةٌ', 
        meaning: 'Lingkungan Bersih Sehat', 
        pronunciation: 'Bii\'atun nazhiifatun', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      },
      { 
        word: 'نَظَافَةٌ', 
        meaning: 'Kebersihan', 
        pronunciation: 'Nazhaafatun', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'شَجَرَةٌ / أَشْجَارٌ', 
        meaning: 'Pohon / Pepohonan Hijau', 
        pronunciation: 'Syajaratun / Asyjaar', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      },
      { 
        word: 'غَابَةٌ', 
        meaning: 'Hutan Rindang', 
        pronunciation: 'Ghaabatun', 
        imageUrl: "",
        icon: "", 
        category: 'Tempat' 
      },
      { 
        word: 'تَدْوِيرُ النِّفَايَاتِ', 
        meaning: 'Daur Ulang Sampah', 
        pronunciation: 'Tadwiirun nifaayaat', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'زِرَاعَةُ الْأَشْجَارِ', 
        meaning: 'Menanam Pohon (Reboisasi)', 
        pronunciation: 'Ziraa\'atul asyjaar', 
        imageUrl: "",
        icon: "", 
        category: 'Fiil' 
      },
      { 
        word: 'هَوَاءٌ نَقِيٌّ', 
        meaning: 'Udara Segar & Murni', 
        pronunciation: 'Hawaa\'un naqiyyun', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      },
      { 
        word: 'تَلَوُّثُ الْهَوَاءِ', 
        meaning: 'Polusi Udara / Asap', 
        pronunciation: 'Talawwutsul hawaa\'', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      },
      { 
        word: 'صُنْدُوقُ الْقُمَامَةِ', 
        meaning: 'Tempat Sampah', 
        pronunciation: 'Shunduuqul qumaamah', 
        imageUrl: "",
        icon: "", 
        category: 'Isim' 
      },
      { 
        word: 'حِمَايَةُ الطَّبِيعَةِ', 
        meaning: 'Perlindungan Konservasi Alam', 
        pronunciation: 'Himaayatuth thabii\'ah', 
        imageUrl: "",
        icon: "", 
        category: 'Nilai' 
      },
      { 
        word: 'مَاءٌ صَافٍ', 
        meaning: 'Air Jernih Bersih', 
        pronunciation: 'Maa\'un shaafin', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      },
      { 
        word: 'جَفَافٌ', 
        meaning: 'Kekeringan', 
        pronunciation: 'Jafaafun', 
        imageUrl: "",
        icon: "", 
        category: 'Lingkungan' 
      }
    ],
    tarkib: [
      {
        name: 'Al-Haal & Shahibul Haal (الْحَالُ وَصَاحِبُ الْحَالِ)',
        patternArabic: 'فِعْلٌ + فَاعِلٌ (مَعْرِفَةٌ) + حَالٌ (مُفْرَدٌ نَكِرَةٌ مَنْصُوبٌ)',
        example: 'يَزْرَعُ الطُّلَّابُ الْأَشْجَارَ مُتَعَاوِنِينَ فِي فِنَاءِ الْمَدْرَسَةِ',
        explanation: 'Keadaan subjek ketika melakukan aktivitas (Haal) berbentuk isim nakirah dan berharakat fathah / ya\' nūn untuk jamak mudzakkar salim.'
      },
      {
        name: 'An-Na\'at wal Man\'ut (النعت والمنعوت)',
        patternArabic: 'مَنْعُوتٌ + نَعْتٌ مُطَابِقٌ (فِي التَّذْكِيرِ وَالتَّأْنِيثِ وَالْإِعْرَابِ)',
        example: 'نَحْتَاجُ إِلَى هَوَاءٍ نَقِيٍّ وَبِيئَةٍ نَظِيفَةٍ لِحَيَاةٍ صِحِّيَّةٍ',
        explanation: 'Kata sifat (na\'at) menyelaraskan secara utuh harakat dan status nakirah/ma\'rifah dari kata yang disifati (man\'ut).'
      },
      {
        name: 'Tarkib Larangan & Perintah Lingkungan (لا الناهية + الأمر)',
        patternArabic: 'لَا + فِعْلٌ مُضَارِعٌ مَجْزُومٌ (لَا تَرْمِ الْقُمَامَةَ)',
        example: 'لَا تَرْمِ الْقُمَامَةَ فِي مَجْرَى الْمَاءِ، وَحَافِظْ عَلَى نَظَافَةِ بِيئَتِكَ',
        explanation: 'Huruf laa nahiyah (larangan) menjazamkan fi\'il mudhari\' (dengan sukun atau membuang huruf \'illah).'
      }
    ],
    contohInsya: 'الْبِيئَةُ نِعْمَةٌ كَبِيرَةٌ مِنَ اللَّهِ يَجِبُ عَلَيْنَا أَنْ نُحَافِظَ عَلَيْهَا. فِي مَدْرَسَتِنَا، نَقُومُ بِحَمْلَةِ نَظَافَةٍ كُلَّ أُسْبُوعٍ حَيْثُ يَجْمَعُ الطُّلَّابُ الْقُمَامَةَ وَيَضَعُونَهَا فِي الصُّنْدُوقِ الْمُخَصَّصِ. كَمَا قُمْنَا بِزِرَاعَةِ الْأَشْجَارِ الْمُتَنَوِّعَةِ لِتَنْقِيَةِ الْهَوَاءِ وَتَجْمِيلِ الْمَنْظَرِ. إِنَّ النَّظَافَةَ مِنَ الْإِيمَانِ، وَالْبِيئَةُ النَّظِيفَةُ تَجْلِبُ الصِّحَّةَ وَالسَّعَادَةَ.',
    kesalahanUmum: [
      'Menulis kata Haal dalam bentuk ma\'rifah dengan alif lam (seharusnya nakirah: مُتَعَاوِنِينَ bukan الْمُتَعَاوِنِينَ).',
      'Lupa menjazamkan fi\'il setelah laa nahiyah.'
    ]
  }
];
