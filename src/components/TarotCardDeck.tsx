import { useState, useEffect, useCallback } from 'react'
import { DrawnCard } from '../types'
import { drawCards } from '../services/tarotService'

interface TarotCardDeckProps {
  cardCount?: number
  onCardsDrawn?: (cards: DrawnCard[]) => void
  autoDraw?: boolean
  preDrawnCards?: DrawnCard[]
}

const TarotCardDeck: React.FC<TarotCardDeckProps> = ({ 
  cardCount = 3, 
  onCardsDrawn,
  autoDraw = false,
  preDrawnCards 
}) => {
  const [cards, setCards] = useState<DrawnCard[]>(preDrawnCards || [])
  const [isDrawing, setIsDrawing] = useState(false)
  const [showCards, setShowCards] = useState(false)

  const handleDrawCards = useCallback(async () => {
    setIsDrawing(true)
    setShowCards(false)
    
    try {
      const drawnCards = await drawCards(cardCount)
      setTimeout(() => {
        setCards(drawnCards)
        setIsDrawing(false)
        setShowCards(true)
        onCardsDrawn?.(drawnCards)
      }, 1500)
    } catch (error) {
      console.error('抽牌失败:', error)
      setIsDrawing(false)
      setShowCards(false)
    }
  }, [cardCount, onCardsDrawn])

  useEffect(() => {
    if (autoDraw) {
      handleDrawCards()
    }
  }, [autoDraw, handleDrawCards])

  useEffect(() => {
    if (preDrawnCards?.length) {
      setCards(preDrawnCards)
      setShowCards(true)
    }
  }, [preDrawnCards])

  // 防弹卡片渲染函数 - 完全不依赖图片
  const renderCard = (card: DrawnCard, index: number) => (
    <div key={card.id || index} className="text-center">
      {/* 位置标识 */}
      <div className="mb-4">
        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          位置 {index + 1}
        </span>
      </div>
      
      {/* 卡牌显示区域 */}
      <div className="w-32 h-48 mx-auto">
        {/* 牌面显示 */}
        <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-lg flex flex-col justify-center items-center p-3 transition-all duration-300 hover:shadow-xl">
          {/* 牌名 */}
          <div className="font-bold text-lg text-purple-800 mb-2">
            {card.name}
          </div>
          
          {/* 正逆位标识 */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium mb-3 ${
            card.isReversed 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {card.isReversed ? '逆位' : '正位'}
          </div>
          
          {/* 元素和关键词 */}
          <div className="text-xs text-gray-600 mb-1">
            元素: {card.element}
          </div>
          
          {/* 简洁关键词显示 */}
          {card.keywords?.slice(0, 2).map((keyword, i) => (
            <div key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mb-1">
              {keyword}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center">
      {/* 抽牌按钮 */}
      {!autoDraw && (
        <button 
          onClick={handleDrawCards}
          disabled={isDrawing}
          className="btn-primary mb-8 hover:shadow-lg transition-all px-8 py-3"
        >
          {isDrawing ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              抽牌中...
            </div>
          ) : '🔮 抽取塔罗牌'}
        </button>
      )}

      {/* 抽牌动画 */}
      {isDrawing && (
        <div className="flex gap-6 mb-12">
          {[...Array(cardCount)].map((_, index) => (
            <div key={index} className="relative">
              {/* 牌背动画 */}
              <div className="w-32 h-48 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">✨</div>
              </div>
              {/* 抽牌光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl opacity-0 animate-ping"></div>
            </div>
          ))}
        </div>
      )}

      {/* 抽牌结果 */}
      {showCards && cards.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              你的塔罗牌阵
            </h3>
            <p className="text-gray-600">共抽取 {cards.length} 张牌</p>
          </div>
          
          {/* 牌阵展示 - 完全防弹版本 */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map(renderCard)}
            </div>
          </div>

          {/* 简化的牌阵说明 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
            <h4 className="font-bold text-purple-800 text-lg mb-4">三牌阵解读</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-blue-800">现状</div>
                <p className="mt-1 text-gray-700">当前状况和影响因素</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-green-800">挑战</div>
                <p className="mt-1 text-gray-700">需要面对的挑战</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-purple-800">未来</div>
                <p className="mt-1 text-gray-700">未来发展方向</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TarotCardDeck