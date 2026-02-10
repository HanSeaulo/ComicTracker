function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, " ");
}

function dedupeTitles(values) {
  const seen = new Set();
  const result = [];
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

function parseImportedTitle(rawTitle) {
  const normalized = normalizeWhitespace(rawTitle);
  if (!normalized) {
    return { mainTitle: "", altTitles: [] };
  }

  const altTitles = [];
  const withoutParens = normalized.replace(/\(([^)]+)\)/g, (_match, inside) => {
    const parts = String(inside)
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

console.log(
  "The Dimensional Mercenary (Other World Warrior):",
  parseImportedTitle("The Dimensional Mercenary (Other World Warrior)")
);
console.log(
  "(Doom Breaker) Reincarnation Of The Suicidal Battle God:",
  parseImportedTitle("(Doom Breaker) Reincarnation Of The Suicidal Battle God")
);
