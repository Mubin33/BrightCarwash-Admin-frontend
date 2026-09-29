// src/utils/lexorank.ts
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const MIN_CHAR = '0';
const MAX_CHAR = 'z';
const MID_CHAR = 'i';
const DEFAULT_STEP = 65536;

export function getLexoRankBetween(prev: string | null, next: string | null): string {
  // Empty column or first lead
  if (!prev && !next) return DEFAULT_STEP.toString().padStart(12, '0');

  // Check if ranks are numeric format (backend 12-digit integer representation)
  const isPrevNumeric = !prev || /^\d+$/.test(prev);
  const isNextNumeric = !next || /^\d+$/.test(next);

  if (isPrevNumeric && isNextNumeric) {
    const pNum = prev ? parseInt(prev, 10) : null;
    const nNum = next ? parseInt(next, 10) : null;

    if (pNum === null && nNum !== null) {
      const mid = Math.floor(nNum / 2);
      return mid.toString().padStart(12, '0');
    }
    if (pNum !== null && nNum === null) {
      const nextVal = pNum + DEFAULT_STEP;
      return nextVal.toString().padStart(12, '0');
    }
    if (pNum !== null && nNum !== null) {
      if (nNum - pNum > 1) {
        const mid = Math.floor((pNum + nNum) / 2);
        return mid.toString().padStart(12, '0');
      }
    }
  }

  // Alphanumeric LexoRank midpoint fallback
  const cleanPrev = prev ? prev.replace(/^[0-9]+\|/, '').replace(/:$/, '') : null;
  const cleanNext = next ? next.replace(/^[0-9]+\|/, '').replace(/:$/, '') : null;

  if (!cleanPrev && cleanNext) {
    return '0|' + calculateMidpoint(MIN_CHAR.repeat(cleanNext.length), cleanNext) + ':';
  }
  if (cleanPrev && !cleanNext) {
    return '0|' + appendRank(cleanPrev) + ':';
  }
  return '0|' + calculateMidpoint(cleanPrev!, cleanNext!) + ':';
}

function calculateMidpoint(prev: string, next: string): string {
  let rank = '';
  let i = 0;
  while (true) {
    const pChar = prev[i] || MIN_CHAR;
    const nChar = next[i] || MAX_CHAR;
    if (pChar === nChar) {
      rank += pChar;
      i++;
      continue;
    }
    const pIdx = ALPHABET.indexOf(pChar);
    const nIdx = ALPHABET.indexOf(nChar);
    if (nIdx - pIdx > 1) {
      const midIdx = Math.floor((pIdx + nIdx) / 2);
      return rank + ALPHABET[midIdx];
    }
    rank += pChar;
    i++;
    const remainder = prev.slice(i);
    return rank + (remainder ? calculateMidpoint(remainder, MAX_CHAR) : MID_CHAR);
  }
}

function appendRank(prev: string): string {
  const lastChar = prev[prev.length - 1];
  const lastIdx = ALPHABET.indexOf(lastChar);
  if (lastIdx < ALPHABET.length - 1) {
    return prev.slice(0, -1) + ALPHABET[lastIdx + 1];
  }
  return prev + MID_CHAR;
}

/**
 * Generate initial spaced 12-digit ranks for a list of items.
 */
export function generateInitialRank(index: number): string {
  const rankNum = (index + 1) * DEFAULT_STEP;
  return rankNum.toString().padStart(12, '0');
}

/**
 * Compare two rank strings for ascending order.
 */
export function compareLexoRanks(aRank?: string | null, bRank?: string | null): number {
  if (aRank && bRank) {
    return aRank.localeCompare(bRank);
  }
  if (aRank && !bRank) return -1;
  if (!aRank && bRank) return 1;
  return 0;
}
