import type { Product } from '../types';

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function getSearchableText(product: Product): string {
  return [
    product.name,
    product.series,
    product.categoryName,
    product.sku,
    product.description,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Computes Levenshtein edit distance between two lowercase strings.
 */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * Checks whether all search tokens match the product's searchable fields.
 */
export function matchesProductQuery(product: Product, rawQuery: string): boolean {
  const q = normalizeText(rawQuery);
  if (!q) return true;

  const haystack = getSearchableText(product);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export interface CatalogSearchResult {
  items: Product[];
  usedFuzzy: boolean;
  suggestedTerm: string | null;
}

/**
 * Searches products with exact token matching first, falling back to close
 * typo-tolerant matching (e.g. "manage" -> "manga") when no exact hits exist.
 */
export function searchCatalogProducts(
  products: Product[],
  rawQuery: string
): CatalogSearchResult {
  const q = normalizeText(rawQuery);
  if (!q) {
    return { items: products, usedFuzzy: false, suggestedTerm: null };
  }

  const exact = products.filter((p) => matchesProductQuery(p, q));
  if (exact.length > 0) {
    return { items: exact, usedFuzzy: false, suggestedTerm: null };
  }

  const tokens = q.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) {
    return { items: [], usedFuzzy: false, suggestedTerm: null };
  }

  let bestSuggestedWord: string | null = null;
  let bestGlobalDistance = Infinity;
  const matchedProducts: Array<{ product: Product; score: number }> = [];

  for (const product of products) {
    const words = Array.from(
      new Set(
        getSearchableText(product)
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3)
      )
    );

    let totalDistance = 0;
    let allTokensClose = true;

    for (const token of tokens) {
      const maxAllowed = token.length <= 4 ? 1 : 2;
      let minWordDist = Infinity;
      let closestWord: string | null = null;

      for (const word of words) {
        if (word.includes(token) || token.includes(word)) {
          minWordDist = 0;
          closestWord = word;
          break;
        }
        const dist = editDistance(token, word);
        if (dist < minWordDist) {
          minWordDist = dist;
          closestWord = word;
        }
      }

      if (minWordDist > maxAllowed) {
        allTokensClose = false;
        break;
      }

      totalDistance += minWordDist;
      if (closestWord && minWordDist < bestGlobalDistance) {
        bestGlobalDistance = minWordDist;
        bestSuggestedWord = closestWord;
      }
    }

    if (allTokensClose) {
      matchedProducts.push({ product, score: totalDistance });
    }
  }

  matchedProducts.sort((a, b) => a.score - b.score);

  return {
    items: matchedProducts.map((m) => m.product),
    usedFuzzy: matchedProducts.length > 0,
    suggestedTerm: matchedProducts.length > 0 ? bestSuggestedWord : null,
  };
}
