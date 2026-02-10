export type ParsedTitle = {
  mainTitle: string;
  altTitles: string[];
};

export const PAREN_KEEP_KEYWORDS = [
  "remake",
  "season",
  "part",
  "s2",
  "s3",
  "vol",
  "volume",
  "spin-off",
];

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function dedupeTitles(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export function shouldKeepParenInTitle(value: string, keywords = PAREN_KEEP_KEYWORDS): boolean {
  const lowered = value.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword));
}

export function parseImportedTitle(
  rawTitle: string,
  keywords = PAREN_KEEP_KEYWORDS,
): ParsedTitle {
  const normalized = normalizeWhitespace(rawTitle);
  if (!normalized) {
    return { mainTitle: "", altTitles: [] };
  }

  const altTitles: string[] = [];
  const withoutParens = normalized.replace(/\(([^)]+)\)/g, (match, inside) => {
    const content = normalizeWhitespace(String(inside));
    if (!content || shouldKeepParenInTitle(content, keywords)) {
      return match;
    }
    const parts = content
      .split(/[;,/]/)
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean);
    altTitles.push(...parts);
    return " ";
  });

  const mainTitle = normalizeWhitespace(withoutParens);
  return {
    mainTitle,
    altTitles: dedupeTitles(altTitles),
  };
}
