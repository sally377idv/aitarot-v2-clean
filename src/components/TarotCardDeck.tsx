import { useState, useEffect, useCallback } from 'react'
import { DrawnCard } from '../types'
import { drawCards } from '../services/tarotService'

interface TarotCardDeckProps {
  cardCount?: number
  onCardsDrawn?: (cards: DrawnCard[]) => void
  autoDraw?: boolean
  preDrawnCards?: DrawnCard[] // 新增：预抽牌的卡片数据
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
    
    // 模拟抽牌动画延迟
    setTimeout(async () => {
      const drawnCards = await drawCards(cardCount)
      setCards(drawnCards)
      setIsDrawing(false)
      setShowCards(true)
      
      if (onCardsDrawn) {
        onCardsDrawn(drawnCards)
      }
    }, 1500)
  }, [cardCount, onCardsDrawn])

  useEffect(() => {
    if (autoDraw) {
      handleDrawCards()
    }
  }, [autoDraw, handleDrawCards])

  // 处理预抽牌数据
  useEffect(() => {
    if (preDrawnCards && preDrawnCards.length > 0) {
      setCards(preDrawnCards)
      setShowCards(true)
    }
  }, [preDrawnCards])

  return (
    <div className="flex flex-col items-center">
      {/* 抽牌按钮 */}
      {!autoDraw && (
        <button 
          onClick={handleDrawCards}
          disabled={isDrawing}
          className="btn-primary mb-8 hover:shadow-lg transition-all"
        >
          {isDrawing ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              正在抽取中...
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
              <div className="w-32 h-48 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">🌙</div>
              </div>
              {/* 抽牌动画效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl opacity-0 animate-ping"></div>
            </div>
          ))}
        </div>
      )}

      {/* 抽牌结果 */}
      {showCards && cards.length > 0 && (
        <div className="w-full max-w-4xl mx-auto">
          {/* 牌阵标题 */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              你的塔罗牌阵
            </h3>
            <p className="text-gray-600">共抽取 {cards.length} 张牌</p>
          </div>
          
          {/* 牌阵展示区域 */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <div key={card.id} className="text-center">
                  {/* 位置标识 */}
                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      位置 {index + 1}
                    </span>
                  </div>
                  
                  {/* 卡牌信息卡片 */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-shadow">
                    {/* 牌名和正逆位 */}
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        {card.name}
                      </h4>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        card.isReversed 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {card.isReversed ? '逆位' : '正位'}
                      </div>
                    </div>
                    
                    {/* 元素和关键词 */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">元素:</span> {card.element}
                      </div>
                      <div className="flex flex-wrap justify-center gap-1">
                        {card.keywords.slice(0, 3).map((keyword, kwIndex) => (
                          <span 
                            key={kwIndex} 
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 牌义描述 */}
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="font-medium mb-1">牌义:</p>
                      <p className="text-xs">
                        {card.isReversed ? card.reversed : card.upright}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 牌阵解释 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-800 mb-3 text-lg">三牌阵解读说明</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-blue-800 mb-1">位置1：现状</div>
                <p className="text-gray-700">代表当前的问题状况和影响因素</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-green-800 mb-1">位置2：挑战</div>
                <p className="text-gray-700">显示需要面对的挑战和障碍</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-medium text-purple-800 mb-1">位置3：未来</div>
                <p className="text-gray-700">预示未来可能的发展方向</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              AI将结合这三张牌的牌面、元素、关键词进行综合解读，为你提供专业的分析建议。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TarotCardDeck