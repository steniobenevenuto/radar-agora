
export type NewsCategory =
  | "Ceará"
  | "Fortaleza"
  | "Interior"
  | "Política"
  | "Segurança"
  | "Trânsito"
  | "Economia"
  | "Esportes"
  | "Entretenimento"
  | "Serviços";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl?: string;
  featured?: boolean;
};

export const news: NewsItem[] = [];
