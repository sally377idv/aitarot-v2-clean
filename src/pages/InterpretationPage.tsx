import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DivinationSession, AIInterpretation } from '../types'
import { getAIInterpretation } from '../services/aiService'
import { updateSessionInterpretation, trackPageView, trackButtonClick } from '../services/sessionService'
import TarotCardDeck from '../components/TarotCardDeck'

interface InterpretationPageProps {
  cachedSession?: DivinationSession | null
  onSessionUpdated?: (session: DivinationSession) => void
}

const InterpretationPage: React.FC<InterpretationPageProps> = ({ 
  cachedSession = null,
  onSessionUpdated 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<DivinationSession | null>(null)
  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAIConfigured, setIsAIConfigured] = useState(true)

  useEffect(() => {
    trackPageView('page3')
    
    if (cachedSession) {
      setSession(cachedSession)
      
      // 检查是否已有解读结果
      if (cachedSession.aiInterpretation.conclusion) {
        setInterpretation(cachedSession.aiInterpretation)
        setIsLoading(false)
      } else {
        // 调用AI服务获取解读
        generateInterpretation(cachedSession)
      }
    } else if (location.state?.session) {
      const sessionData = location.state.session
      setSession(sessionData)
      
      // 检查是否已有解读结果
      if (sessionData.aiInterpretation.conclusion) {
        setInterpretation(sessionData.aiInterpretation)
        setIsLoading(false)
      } else {
        // 调用AI服务获取解读
        generateInterpretation(sessionData)
      }
    } else {
      navigate('/')
    }
  }, [location, navigate, cachedSession])

  const generateInterpretation = async (sessionData: DivinationSession) => {
    setIsLoading(true)
    setError('')
    
    try {
      const request = {
        question: sessionData.firstQuestion,
        tarotCards: sessionData.tarotResult,
        sessionId: sessionData.sessionId
      }
      
      const response = await getAIInterpretation(request)
      
      if (response.success) {
        setInterpretation(response.interpretation)
        
        // 更新会话数据
        const updatedSession = {
          ...sessionData,
          aiInterpretation: response.interpretation
        }
        setSession(updatedSession)
        updateSessionInterpretation(sessionData.sessionId, response.interpretation)
        
        // 触发会话更新回调
        if (onSessionUpdated) {
          onSessionUpdated(updatedSession)
        }
        
        if (!response.success) {
          setIsAIConfigured(false)
        }
      } else {
        setError('AI服务暂时不可用，已使用预设解读')
        setInterpretation(response.interpretation)
        setIsAIConfigured(false)
      }
    } catch (err) {
      setError('获取解读失败，请重试')
      console.error('解读生成失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToFollowUp = () => {
    if (session) {
      trackButtonClick('askmore')
      navigate('/follow-up', { state: { session } })
    }
  }

  const handleGoBack = () => {
    trackButtonClick('back2')
    navigate(-1)
  }

  const handleRetryInterpretation = () => {
    if (session) {
      generateInterpretation(session)
    }
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
          AI专业解读
        </h1>
        <p className="text-gray-600">基于塔罗牌阵的深度分析和建议</p>
      </div>

      {/* 牌阵展示 */}
      <div className="max-w-4xl mx-auto mb-8">
        <TarotCardDeck 
          cardCount={3}
          autoDraw={true}
        />
      </div>

      {/* 解读结果 */}
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">AI正在深度解读塔罗牌阵...</p>
              <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟时间</p>
            </div>
          </div>
        ) : interpretation ? (
          <div className="space-y-6">
            {/* 结论部分 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-l-4 border-purple-500">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-purple-800">核心结论</h3>
              </div>
              <p className="text-lg text-purple-900 font-medium">{interpretation.conclusion}</p>
              <div className="text-right text-sm text-purple-600 mt-2">
                {interpretation.conclusion.length}/20字
              </div>
            </div>

            {/* 分析部分 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-800">深度分析</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{interpretation.analysis}</p>
              <div className="text-right text-sm text-gray-500 mt-2">
                {interpretation.analysis.length}/100字
              </div>
            </div>

            {/* 建议部分 */}
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600">🌟</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800">具体建议</h3>
              </div>
              <p className="text-green-900 font-medium">{interpretation.advice}</p>
              <div className="text-right text-sm text-green-600 mt-2">
                {interpretation.advice.length}/50字
              </div>
            </div>

            {/* AI配置提示 */}
            {!isAIConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ 当前使用预设解读模式。如需完整AI功能，请配置DeepSeek API密钥。
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">解读生成失败</p>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <button 
              onClick={handleRetryInterpretation}
              className="btn-primary mt-4"
            >
              重试解读
            </button>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        <button 
          onClick={handleGoBack}
          className="btn-secondary px-8"
        >
          ↩️ 返回抽牌结果
        </button>
        
        <button 
          onClick={handleGoToFollowUp}
          disabled={!interpretation}
          className="btn-primary px-8"
        >
          💬 我要追问
        </button>
      </div>

      {/* 使用说明 */}
      {interpretation && (
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            如果对解读有任何疑问，可以点击"我要追问"继续咨询。
            追问将结合当前的牌阵结果和你的新问题进行深度分析。
          </p>
        </div>
      )}
    </div>
  )
}

export default InterpretationPage