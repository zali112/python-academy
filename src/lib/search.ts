import type { Level, MaterialType } from "@/types/content";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: MaterialType | "course";
  url: string;
  text: string;
  level?: Level;
  keywords?: string[];
}

export interface SearchFilters {
  type?: MaterialType | "course" | "all";
  level?: Level | "all";
  /** сортировка: relevance — по релевантности, progress — сначала непройденное */
  sort?: "relevance" | "alpha";
}

export interface ScoredItem extends SearchItem {
  score: number;
}

const TYPE_LABEL: Record<string, string> = {
  lesson: "Урок",
  task: "Задача",
  project: "Проект",
  reference: "Справочник",
  quiz: "Тест",
  course: "Курс",
};

export function typeLabel(type: SearchItem["type"]): string {
  return TYPE_LABEL[type] ?? "Материал";
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е");
}

/**
 * Поиск по индексу: совпадение по заголовку, ключевым словам и тексту.
 * Заголовок и ключевые слова весят больше, поэтому точные попадания выше.
 */
export function searchItems(
  items: SearchItem[],
  query: string,
  filters: SearchFilters = {},
): ScoredItem[] {
  const q = normalize(query.trim());
  const filtered = items.filter((item) => {
    if (filters.type && filters.type !== "all" && item.type !== filters.type) return false;
    if (filters.level && filters.level !== "all" && item.level !== filters.level) return false;
    return true;
  });

  if (!q) {
    return filtered.map((item) => ({ ...item, score: 0 }));
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const results: ScoredItem[] = [];

  for (const item of filtered) {
    const title = normalize(item.title);
    const subtitle = normalize(item.subtitle);
    const keywords = normalize((item.keywords ?? []).join(" "));
    const body = normalize(item.text);
    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      let termScore = 0;
      if (title === term) termScore += 100;
      else if (title.startsWith(term)) termScore += 60;
      else if (title.includes(term)) termScore += 40;
      if (keywords.includes(term)) termScore += 25;
      if (subtitle.includes(term)) termScore += 15;
      if (body.includes(term)) termScore += 8;
      if (termScore === 0) matchedAll = false;
      score += termScore;
    }

    if (matchedAll && score > 0) results.push({ ...item, score });
  }

  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ru"));
  return results;
}

/** Подсветка совпадений: возвращает фрагменты текста с признаком совпадения. */
export function highlightParts(text: string, query: string): { text: string; hit: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, hit: false }];
  const terms = q.split(/\s+/).filter(Boolean).map(normalize);
  const source = text;
  const marks: { start: number; end: number }[] = [];

  for (const term of terms) {
    if (!term) continue;
    const haystack = normalize(source);
    let from = 0;
    for (;;) {
      const idx = haystack.indexOf(term, from);
      if (idx === -1) break;
      marks.push({ start: idx, end: idx + term.length });
      from = idx + term.length;
    }
  }

  if (marks.length === 0) return [{ text: source, hit: false }];

  marks.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const m of marks) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) last.end = Math.max(last.end, m.end);
    else merged.push({ ...m });
  }

  const parts: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const m of merged) {
    if (m.start > cursor) parts.push({ text: source.slice(cursor, m.start), hit: false });
    parts.push({ text: source.slice(m.start, m.end), hit: true });
    cursor = m.end;
  }
  if (cursor < source.length) parts.push({ text: source.slice(cursor), hit: false });
  return parts;
}
