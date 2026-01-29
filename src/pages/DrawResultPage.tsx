import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TarotCardDeck from '../components/TarotCardDeck'
import { DrawnCard, DivinationSession } from '../types'
import { trackPageView, trackButtonClick } from '../services/sessionService'

interface DrawResultPageProps {
  cachedSession?: DivinationSession | null
  onSessionUpdated?: (session: DivinationSession) => void
}

const DrawResultPage: React.FC<DrawResultPageProps> = ({ 
  cachedSession = null,
  onSessionUpdated 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<DivinationSession | null>(null)
  const [cardsDrawn, setCardsDrawn] = useState(false)

  useEffect(() => {
    trackPageView('page2')
    
    if (cachedSession) {
      setSession(cachedSession)
      setCardsDrawn(true)
    } else if (location.state?.session) {
      setSession(location.state.session)
      setCardsDrawn(true)
    } else {
      // 如果没有会话数据，返回首页
      navigate('/')
    }
  }, [location, navigate, cachedSession])

  const handleCardsDrawn = (cards: DrawnCard[]) => {
    if (session) {
      const updatedSession = {
        ...session,
        tarotResult: cards
      }
      setSession(updatedSession)
      setCardsDrawn(true)
      
      // 触发会话更新回调
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession)
      }
    }
  }

  const handleGoToInterpretation = () => {
    if (session && cardsDrawn) {
      trackButtonClick('detail')
      navigate('/interpretation', { state: { session } })
    }
  }

  const handleGoBack = () => {
    trackButtonClick('back1')
    navigate(-1)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-2">
          塔罗牌阵结果
        </h1>
        <p className="text-gray-600">基于你的问题进行抽取的三张塔罗牌</p>
        
        {/* 显示用户问题 */}
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800 font-medium">你的问题：</p>
            <p className="text-purple-900 mt-1">{session.firstQuestion}</p>
          </div>
        </div>
      </div>

      {/* 抽牌区域 */}
      <div className="mb-8">
        {!cardsDrawn ? (
          <TarotCardDeck 
            cardCount={3}
            onCardsDrawn={handleCardsDrawn}
            autoDraw={true}
          />
        ) : (
          <TarotCardDeck 
            cardCount={3}
            onCardsDrawn={handleCardsDrawn}
            preDrawnCards={session?.tarotResult}
          />
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          onClick={handleGoBack}
          className="btn-secondary px-8"
        >
          ↩️ 返回上一页
        </button>
        
        <button 
          onClick={handleGoToInterpretation}
          disabled={!cardsDrawn}
          className="btn-primary px-8"
        >
          {cardsDrawn ? '✨ 查看详细解读' : '请先抽取塔罗牌'}
        </button>

        {!cardsDrawn && (
          <button 
            onClick={() => setCardsDrawn(false)}
            className="btn-secondary px-8"
          >
            🔄 重新抽牌
          </button>
        )}
      </div>

      {/* 牌阵说明 */}
      {cardsDrawn && (
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              三牌阵解读说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">位置1：现状</div>
                <p className="mt-1">代表当前的问题状况和影响因素</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">位置2：挑战</div>
                <p className="mt-1">显示需要面对的挑战和障碍</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">位置3：未来</div>
                <p className="mt-1">预示未来可能的发展方向</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600 text-sm">
                AI将结合这三张牌的牌面、元素、关键词进行综合解读，为你提供专业的分析建议。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrawResultPage