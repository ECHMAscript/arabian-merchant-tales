export interface BookProduct {
  id: number | string;
  name: string;
  arabicName?: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: "books" | "school-supplies";
  subcategory: string;
  quantityLeft: number;
  description?: string;
  author?: string;
  volumes?: number;
  publisher?: string;
}

export const booksData: BookProduct[] = [
  // Tafseer Books
  {
    id: 1001,
    name: "Tafseer Ibn Kathir",
    arabicName: "تفسير ابن كثير",
    price: 89.99,
    rating: 4.9,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Tafseer",
    quantityLeft: 15,
    description: "A comprehensive exegesis of the Holy Quran by Ibn Kathir",
    author: "Ibn Kathir",
    volumes: 10,
    publisher: "Dar-us-Salam"
  },
  {
    id: 1002,
    name: "Tafseer As-Sa'di",
    arabicName: "تفسير السعدي",
    price: 65.00,
    rating: 4.8,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Tafseer",
    quantityLeft: 8,
    description: "A simplified and accessible Quran commentary",
    author: "Sheikh As-Sa'di",
    volumes: 3,
    publisher: "International Islamic Publishing House"
  },
  {
    id: 1003,
    name: "Tafseer Al-Jalalayn",
    arabicName: "تفسير الجلالين",
    price: 45.00,
    rating: 4.7,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Tafseer",
    quantityLeft: 0,
    description: "Classic tafseer by two great scholars",
    author: "Jalal ad-Din al-Mahalli & Jalal ad-Din as-Suyuti",
    volumes: 2,
    publisher: "Dar Al-Kotob Al-Ilmiyah"
  },
  // Fiqh Books
  {
    id: 1004,
    name: "Fiqh Us-Sunnah",
    arabicName: "فقه السنة",
    price: 55.00,
    rating: 4.9,
    reviewCount: 312,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Fiqh",
    quantityLeft: 25,
    description: "A comprehensive guide to Islamic jurisprudence",
    author: "Sayyid Sabiq",
    volumes: 5,
    publisher: "American Trust Publications"
  },
  {
    id: 1005,
    name: "Al-Fiqh Al-Islami",
    arabicName: "الفقه الإسلامي",
    price: 120.00,
    rating: 4.8,
    reviewCount: 87,
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Fiqh",
    quantityLeft: 5,
    description: "Comprehensive Islamic jurisprudence encyclopedia",
    author: "Dr. Wahbah al-Zuhayli",
    volumes: 8,
    publisher: "Dar Al-Fikr"
  },
  {
    id: 1006,
    name: "Bidayat Al-Mujtahid",
    arabicName: "بداية المجتهد",
    price: 48.00,
    rating: 4.6,
    reviewCount: 145,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Fiqh",
    quantityLeft: 12,
    description: "A comparative study of Islamic jurisprudence",
    author: "Ibn Rushd",
    volumes: 2,
    publisher: "Garnet Publishing"
  },
  // Seerah Books
  {
    id: 1007,
    name: "The Sealed Nectar",
    arabicName: "الرحيق المختوم",
    price: 25.00,
    rating: 5.0,
    reviewCount: 567,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Seerah",
    quantityLeft: 50,
    description: "Award-winning biography of Prophet Muhammad ﷺ",
    author: "Safi-ur-Rahman al-Mubarakpuri",
    volumes: 1,
    publisher: "Dar-us-Salam"
  },
  {
    id: 1008,
    name: "Muhammad: His Life Based on Earliest Sources",
    arabicName: "محمد: سيرته",
    price: 35.00,
    rating: 4.9,
    reviewCount: 423,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Seerah",
    quantityLeft: 18,
    description: "Detailed prophetic biography from authentic sources",
    author: "Martin Lings",
    volumes: 1,
    publisher: "Islamic Texts Society"
  },
  {
    id: 1009,
    name: "Seerah Ibn Hisham",
    arabicName: "سيرة ابن هشام",
    price: 75.00,
    rating: 4.7,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Seerah",
    quantityLeft: 3,
    description: "The classic biography of the Prophet",
    author: "Ibn Hisham",
    volumes: 4,
    publisher: "Dar Al-Kotob Al-Ilmiyah"
  },
  // Hadeeth Books
  {
    id: 1010,
    name: "Sahih Al-Bukhari",
    arabicName: "صحيح البخاري",
    price: 95.00,
    rating: 5.0,
    reviewCount: 789,
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Hadeeth",
    quantityLeft: 30,
    description: "The most authentic collection of Prophetic traditions",
    author: "Imam Al-Bukhari",
    volumes: 9,
    publisher: "Dar-us-Salam"
  },
  {
    id: 1011,
    name: "Sahih Muslim",
    arabicName: "صحيح مسلم",
    price: 85.00,
    rating: 5.0,
    reviewCount: 654,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Hadeeth",
    quantityLeft: 22,
    description: "Second most authentic collection of hadith",
    author: "Imam Muslim",
    volumes: 7,
    publisher: "Dar-us-Salam"
  },
  {
    id: 1012,
    name: "Riyad As-Salihin",
    arabicName: "رياض الصالحين",
    price: 30.00,
    rating: 4.9,
    reviewCount: 432,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop",
    category: "books",
    subcategory: "Hadeeth",
    quantityLeft: 45,
    description: "Gardens of the Righteous - Selected hadith compilation",
    author: "Imam An-Nawawi",
    volumes: 2,
    publisher: "Dar-us-Salam"
  },
];

export const schoolSuppliesData: BookProduct[] = [
  {
    id: 2001,
    name: "Arabic Calligraphy Notebook Set",
    price: 18.99,
    rating: 4.7,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Notebooks",
    quantityLeft: 100,
    description: "Set of 5 premium notebooks for Arabic writing practice"
  },
  {
    id: 2002,
    name: "Quran Stand - Wooden Rahle",
    price: 35.00,
    rating: 4.9,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Accessories",
    quantityLeft: 25,
    description: "Handcrafted wooden Quran holder"
  },
  {
    id: 2003,
    name: "Arabic Learning Flashcards",
    price: 15.99,
    rating: 4.6,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1632749695578-6f72edef28a5?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Learning Aids",
    quantityLeft: 0,
    description: "300+ flashcards for Arabic vocabulary"
  },
  {
    id: 2004,
    name: "Islamic Studies Workbook Pack",
    price: 28.00,
    rating: 4.8,
    reviewCount: 112,
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Workbooks",
    quantityLeft: 35,
    description: "Complete Islamic studies curriculum for grades 1-6"
  },
  {
    id: 2005,
    name: "Premium Calligraphy Pen Set",
    price: 42.00,
    rating: 4.9,
    reviewCount: 78,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Writing Tools",
    quantityLeft: 15,
    description: "Professional Arabic calligraphy pen set with 6 nibs"
  },
  {
    id: 2006,
    name: "Tajweed Rules Poster Set",
    price: 22.00,
    rating: 4.7,
    reviewCount: 167,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Learning Aids",
    quantityLeft: 8,
    description: "Set of 4 large educational posters for Tajweed rules"
  },
  {
    id: 2007,
    name: "Arabic Alphabet Magnetic Board",
    price: 32.00,
    rating: 4.8,
    reviewCount: 95,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Learning Aids",
    quantityLeft: 2,
    description: "Interactive magnetic board with Arabic letters"
  },
  {
    id: 2008,
    name: "Islamic School Bag",
    price: 45.00,
    rating: 4.5,
    reviewCount: 203,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
    category: "school-supplies",
    subcategory: "Accessories",
    quantityLeft: 40,
    description: "Durable school bag with Islamic geometric patterns"
  },
];

export const bookCategories = [
  { name: "Tafseer", arabicName: "التفسير", description: "Quranic Exegesis" },
  { name: "Fiqh", arabicName: "الفقه", description: "Islamic Jurisprudence" },
  { name: "Seerah", arabicName: "السيرة", description: "Prophetic Biography" },
  { name: "Hadeeth", arabicName: "الحديث", description: "Prophetic Traditions" },
];

export const schoolSupplyCategories = [
  { name: "Notebooks", description: "Writing supplies" },
  { name: "Learning Aids", description: "Educational tools" },
  { name: "Writing Tools", description: "Pens and calligraphy" },
  { name: "Workbooks", description: "Practice books" },
  { name: "Accessories", description: "School accessories" },
];
