export type EntryCategory = "movie" | "book" | "theater" | "exhibition" | "concert";

export interface CulturalEntry {
  id: string;
  title: string;
  category: EntryCategory;
  date: string; // YYYY-MM-DD
  rating: number; // 1-5
  creatorOrVenue: string;
  notes: string;
}

export const CATEGORY_LABELS: Record<EntryCategory, string> = {
  movie: "Movie",
  book: "Book",
  theater: "Theater",
  exhibition: "Exhibition",
  concert: "Concert",
};