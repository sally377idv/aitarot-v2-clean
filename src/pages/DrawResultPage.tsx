import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DivinationSession } from '../types'
import { trackPageView, trackButtonClick } from '../services/sessionService'
import { drawCards } from '../services/tarotService'

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
  const [isDrawing, setIsDrawing] = useState(false)

  // 初始化会话数据
  useEffect(() => {
    trackPageView('page2')
    
    if (cachedSession) {
      setSession(cachedSession)
      setCardsDrawn(!!cachedSession.tarotResult && cachedSession.tarotResult.length > 0)
    } else if (location.state?.session) {
      setSession(location.state.session)
      setCardsDrawn(!!location.state.session.tarotResult && location.state.session.tarotResult.length > 0)
    } else {
      navigate('/')
    }
  }, [location, navigate, cachedSession])

  // 自动抽牌逻辑
  useEffect(() => {
    const autoDraw = async () => {
      // 只有在session存在且尚未抽牌且没有正在抽牌时才执行
      if (session && !cardsDrawn && !isDrawing) {
        setIsDrawing(true)
        try {
          // 模拟一点延迟感
          await new Promise(resolve => setTimeout(resolve, 800))
          const cards = await drawCards(3)
          
          const updatedSession = {
            ...session,
            tarotResult: cards
          }
          setSession(updatedSession)
          setCardsDrawn(true)
          
          if (onSessionUpdated) {
            onSessionUpdated(updatedSession)
          }
        } catch (error) {
          console.error("抽牌失败:", error)
        } finally {
          setIsDrawing(false)
        }
      }
    }
    
    autoDraw()
  }, [session, cardsDrawn, isDrawing, onSessionUpdated])

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
        <div className="text-center p-6">
          <p className="text-gray-600">正在加载会话...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-2">
          塔罗牌阵结果
        </h1>
        <p className="text-gray-600">基于你的问题进行抽取的三张塔罗牌</p>
        
        {/* 显示用户问题 */}
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="bg-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-800 font-medium">你的问题：</p>
            <p className="text-purple-900 mt-1 font-medium">{session.firstQuestion}</p>
          </div>
        </div>
      </div>

      {/* 核心抽牌区域 - 降维打击版 */}
      <div className="mb-10 max-w-4xl mx-auto">
        {isDrawing ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-purple-700 font-medium">正在感应塔罗能量...</p>
          </div>
        ) : cardsDrawn && session.tarotResult && session.tarotResult.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {session.tarotResult.map((card, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* 紫色卡牌方块 */}
                <div className="w-full h-64 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 opacity-80"></div>
                  <div className="text-4xl mb-4">🎴</div>
                  <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${card.isReversed ? 'bg-red-500' : 'bg-green-500'}`}>
                    {card.isReversed ? '逆位' : '正位'}
                  </span>
                  <div className="mt-4 text-xs opacity-80 text-center">
                    {card.keywords.slice(0, 3).join(' • ')}
                  </div>
                </div>
                <div className="mt-3 font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                  位置 {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 防白屏警告 */
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-center">
            <p className="text-red-700 font-bold">⚠️ 调试信息：会话中没有塔罗牌数据</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-red-600 underline"
            >
              点击刷新重试
            </button>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
        <button 
          onClick={handleGoBack}
          className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
        >
          ↩️ 返回上一页
        </button>
        
        <button 
          onClick={handleGoToInterpretation}
          disabled={!cardsDrawn || isDrawing}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cardsDrawn ? '✨ 查看详细解读' : '等待抽牌...'}
        </button>
      </div>

      {/* 牌阵说明 - 仅在有结果时显示 */}
      {cardsDrawn && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            三牌阵解读说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="font-bold text-blue-800 mb-1 text-lg">1. 现状</div>
              <p>代表当前的问题状况和影响因素</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="font-bold text-green-800 mb-1 text-lg">2. 挑战</div>
              <p>显示需要面对的挑战和障碍</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="font-bold text-purple-800 mb-1 text-lg">3. 未来</div>
              <p>预示未来可能的发展方向</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrawResultPage

export default DrawResultPage