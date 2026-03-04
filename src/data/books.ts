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
