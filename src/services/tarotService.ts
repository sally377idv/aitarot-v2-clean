// 直接导入 JSON 数据，确保生产环境可用
import tarotCardsData from '../data/tarotCards.json'

// 异步加载塔罗牌数据 (保持异步接口兼容性)
async function loadTarotCardsData() {
  return tarotCardsData
}

export interface TarotCard {
  id: string;
  name: string;
  keywords: string[];
  element: string;
  description: string;
  imageUrl: string;
  upright: string;
  reversed: string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  position: number;
}

// 获取所有塔罗牌
export async function getAllTarotCards(): Promise<TarotCard[]> {
  const data = await loadTarotCardsData();
  const allCards: TarotCard[] = [
    ...data.majorArcana,
    ...data.cups,
    ...data.swords,
    ...data.wands,
    ...data.pentacles
  ];
  return allCards;
}

// 随机抽取指定数量的牌
export async function drawCards(count: number = 3): Promise<DrawnCard[]> {
  const allCards = await getAllTarotCards();
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const selectedCards = shuffled.slice(0, count);
  
  return selectedCards.map((card, index) => ({
    ...card,
    isReversed: Math.random() > 0.5,
    position: index + 1
  }));
}

// 根据牌ID获取牌信息
export async function getCardById(id: string): Promise<TarotCard | undefined> {
  const allCards = await getAllTarotCards();
  return allCards.find(card => card.id === id);
}

// 获取牌的关键词显示
export function getCardKeywords(card: TarotCard): string {
  return card.keywords.join(' · ');
}

// 获取牌的完整描述（包含正逆位）
export function getCardFullDescription(card: DrawnCard): string {
  const orientation = card.isReversed ? '逆位' : '正位';
  const meaning = card.isReversed ? card.reversed : card.upright;
  return `${card.name} ${orientation} - ${meaning}`;
}

// 验证抽牌结果的有效性
export function validateDrawResult(cards: DrawnCard[]): boolean {
  if (!cards || cards.length === 0) return false;
  if (cards.length > 5) return false; // 最多5张牌
  
  const uniqueIds = new Set(cards.map(card => card.id));
  return uniqueIds.size === cards.length; // 不允许重复抽牌
}