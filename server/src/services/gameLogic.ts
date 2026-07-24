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
    for (let number = 1; number <= 10; number++) {
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
 * 判定手牌牌型 (A-10 牌组, 40张)
 * 倍率规则:
 * - 炸弹:     6x (4张相同点数, 优先级最高)
 * - 五小牛:   5x (5张点数都 <= 5 且总和 <= 10)
 * - 牛双十:   5x (剩余两张都是10的牛牛)
 * - 牛牛:     4x (任意3张凑10的倍数, 剩余2张也是10的倍数)
 * - 牛九:     3x
 * - 牛八:     2x
 * - 牛1~牛7:  1x
 * - 无牛:     1x
 */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length !== 5) {
    return { rank: HandRank.NoBull, rankName: '无牛', multiplier: 1, maxCard: cards[0], isBoom: false };
  }

  const sorted = sortCards(cards);

  // ====== 1. 炸弹优先 (4张相同点数, 6倍) ======
  if (checkBoom(sorted.map(c => c.number))) {
    return {
      rank: HandRank.Bomb,
      rankName: '炸弹',
      multiplier: 6,
      maxCard: sorted[0],
      isBoom: true,
    };
  }

  // ====== 2. 五小牛: 5张牌每张斗牛点数 <= 5 且总和 <= 10 ======
  const points = sorted.map(c => pointValue(c.number));
  const totalSum = points.reduce((a, b) => a + b, 0);
  if (points.every(n => n <= 5) && totalSum <= 10) {
    return {
      rank: HandRank.FiveSmall,
      rankName: '五小牛',
      multiplier: 5,
      maxCard: sorted[0],
      isBoom: false,
    };
  }

  // ====== 3. 寻找牛 ======
  const pair = findBullPair(sorted);
  if (!pair) {
    return {
      rank: HandRank.NoBull,
      rankName: '无牛',
      multiplier: 1,
      maxCard: sorted[0],
      isBoom: false,
    };
  }

  const [, remaining] = pair;
  const remainingNums = remaining.map(i => sorted[i].number);
  const remainingSum = pointValue(sorted[remaining[0]].number) + pointValue(sorted[remaining[1]].number);
  const bullPoint = remainingSum >= 10 ? remainingSum % 10 : remainingSum;

  // ====== 4. 牛双十: 剩余两张都是10 (5倍) ======
  if (remainingNums.every(n => n === 10)) {
    return {
      rank: HandRank.DoubleTen,
      rankName: '牛双十',
      multiplier: 5,
      maxCard: sorted[0],
      isBoom: false,
    };
  }

  // ====== 5. 牛牛: 剩余2张也是10的倍数 (4倍) ======
  if (bullPoint === 0) {
    return {
      rank: HandRank.BullBull,
      rankName: '牛牛',
      multiplier: 4,
      maxCard: sorted[0],
      isBoom: false,
    };
  }

  // ====== 6. 牛1~牛9 ======
  const multiplier =
    bullPoint === 9 ? 3 :
    bullPoint === 8 ? 2 :
    1;

  return {
    rank: bullPoint,
    rankName: `牛${bullPoint}`,
    multiplier,
    maxCard: sorted[0],
    isBoom: false,
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
