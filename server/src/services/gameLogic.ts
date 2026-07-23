import { Card, Suit, HandRank, HandResult } from '../types';

// 牌面花色排序: 黑桃 > 红桃 > 梅花 > 方块
const suitOrder: Suit[] = ['Spade', 'Heart', 'Club', 'Diamond'];

/**
 * 斗牛点数换算: A=1, 2-10=照算, J/Q/K=10
 * 牌面原始 number 1-13 不参与牛运算，一律走这个函数转换
 */
function pointValue(number: number): number {
  return number > 10 ? 10 : number;
}

/** 创建一���完整扑克牌 (1-10, J/Q/K) */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suitOrder) {
    for (let number = 1; number <= 13; number++) {
      deck.push({ suit, number });
    }
  }
  return deck;
}

/** 洗牌 (Fisher-Yates) */
export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 比较两张牌大小 (先比数字，再比花色) */
function compareCards(a: Card, b: Card): number {
  if (a.number !== b.number) return a.number - b.number;
  return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
}

/** 对牌排序 (降序) */
function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => compareCards(b, a));
}

/**
 * 从5张牌中找到任意3张能否凑成10的倍数
 * 返回: [能凑成的3张索引数组, 剩余2张索引数组] 或 null
 */
function findBullPair(cards: Card[]): [number[], number[]] | null {
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (let k = j + 1; k < 5; k++) {
        const sum = pointValue(cards[i].number) + pointValue(cards[j].number) + pointValue(cards[k].number);
        if (sum % 10 === 0) {
          const used = [i, j, k];
          const remaining = [0, 1, 2, 3, 4].filter(n => !used.includes(n));
          return [used, remaining];
        }
      }
    }
  }
  return null;
}

/**
 * 判定手牌牌型
 * 规则:
 * - 五小牛: 5张牌点数都 <= 5 且总和 <= 10
 * - 五花牛: 5张牌全是 J/Q/K (>= 11)
 * - 牛牛~无牛: 任意3张凑10的倍数，剩余2张之和的个位数
 * - 炸弹: 4张相同点数
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length !== 5) {
    return { rank: HandRank.NoBull, rankName: '无牛', multiplier: 1, maxCard: cards[0], isBoom: false };
  }

  const sorted = sortCards(cards);

  // 检查炸弹 (4张相同点数 — 用原始 number 判定)
  const isBoom = checkBoom(sorted.map(c => c.number));

  // 五小牛: 5张牌每张点数 <= 5 且总点数 <= 10 (用斗牛点数)
  const points = sorted.map(c => pointValue(c.number));
  const totalSum = points.reduce((a, b) => a + b, 0);
  const isFiveSmall = points.every(n => n <= 5) && totalSum <= 10;
  if (isFiveSmall) {
    return {
      rank: HandRank.FiveSmall,
      rankName: '五小牛',
      multiplier: 5,
      maxCard: sorted[0],
      isBoom,
    };
  }

  // 五花牛: 5张牌全是 J/Q/K (用原始 number >= 11)
  const isFullFlower = sorted.every(c => c.number >= 11);
  if (isFullFlower) {
    return {
      rank: HandRank.FullFlower,
      rankName: '五花牛',
      multiplier: 5,
      maxCard: sorted[0],
      isBoom,
    };
  }

  // 寻找牛 (用斗牛点数)
  const pair = findBullPair(sorted);
  if (!pair) {
    return {
      rank: HandRank.NoBull,
      rankName: '无牛',
      multiplier: 1,
      maxCard: sorted[0],
      isBoom,
    };
  }

  const [, remaining] = pair;
  const remainingSum = pointValue(sorted[remaining[0]].number) + pointValue(sorted[remaining[1]].number);
  const bullPoint = remainingSum >= 10 ? remainingSum % 10 : remainingSum;

  // 牛牛 (剩余2张也是10的倍数)
  if (bullPoint === 0) {
    return {
      rank: HandRank.BullBull,
      rankName: '牛牛',
      multiplier: 3,
      maxCard: sorted[0],
      isBoom,
    };
  }

  // 牛1~牛9: 牛8开始翻倍
  return {
    rank: bullPoint,
    rankName: `牛${bullPoint}`,
    multiplier: bullPoint >= 8 ? 2 : 1,
    maxCard: sorted[0],
    isBoom,
  };
}

function checkBoom(numbers: number[]): boolean {
  const count: Record<number, number> = {};
  for (const n of numbers) {
    count[n] = (count[n] || 0) + 1;
  }
  return Object.values(count).some(c => c >= 4);
}

/**
 * 比较两个手牌结果 (先比牌型等级，再比最大牌)
 * 返回正数表示 a 赢, 负数 b 赢, 0 平
 */
export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  // 同等级比较最大牌
  return compareCards(a.maxCard, b.maxCard);
}

/**
 * 庄家 vs 闲家结算
 * 返回闲家输赢金额(正=闲家赢，负=闲家输)
 */
export function settle(
  bankerResult: HandResult,
  playerResult: HandResult,
  bet: number
): number {
  const cmp = compareHands(playerResult, bankerResult);
  if (cmp > 0) {
    // 闲家赢
    return bet * playerResult.multiplier;
  } else if (cmp < 0) {
    // 庄家赢
    return -bet * bankerResult.multiplier;
  }
  return 0; // 平局
}
