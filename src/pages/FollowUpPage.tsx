import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DivinationSession, AIInterpretation } from '../types'
import { getFollowUpInterpretation } from '../services/aiService'
import { addFollowUpQuestion, trackPageView, trackButtonClick } from '../services/sessionService'

interface FollowUpPageProps {
  cachedSession?: DivinationSession | null
  onSessionUpdated?: (session: DivinationSession) => void
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ 
  cachedSession = null,
  onSessionUpdated 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<DivinationSession | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState<AIInterpretation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showMiracle, setShowMiracle] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    trackPageView('page4')
    
    if (cachedSession) {
      setSession(cachedSession)
    } else if (location.state?.session) {
      setSession(location.state.session)
    } else {
      navigate('/')
    }
  }, [location, navigate, cachedSession])

  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!followUpQuestion.trim()) {
      setError('请输入追问问题')
      return
    }

    if (followUpQuestion.length > 200) {
      setError('追问问题不能超过200字')
      return
    }

    if (!session) {
      setError('会话数据丢失，请重新开始')
      return
    }

    setIsLoading(true)
    setError('')
    setShowMiracle(false)

    try {
      const request = {
        question: session.firstQuestion,
        tarotCards: session.tarotResult,
        sessionId: session.sessionId
      }

      const response = await getFollowUpInterpretation(request, followUpQuestion)
      
      if (response.success) {
        setFollowUpAnswer(response.interpretation)
        setShowMiracle(true) // 直接显示奇迹见证效果
        
        // 更新会话数据
        const updatedSession = {
          ...session,
          followUpQuestions: [
            ...session.followUpQuestions,
            {
              question: followUpQuestion,
              answer: `${response.interpretation.conclusion} ${response.interpretation.analysis} ${response.interpretation.advice}`,
              timestamp: new Date().toISOString()
            }
          ]
        }
        
        // 保存追问记录
        addFollowUpQuestion(
          session.sessionId, 
          followUpQuestion, 
          `${response.interpretation.conclusion} ${response.interpretation.analysis} ${response.interpretation.advice}`
        )
        
        // 触发会话更新回调
        if (onSessionUpdated) {
          onSessionUpdated(updatedSession)
        }
      } else {
        setError('追问解读生成失败，请重试')
      }
    } catch (err) {
      setError('追问失败：' + (err instanceof Error ? err.message : '未知错误'))
      console.error('追问失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    trackButtonClick('back3')
    navigate(-1)
  }

  const handleNewQuestion = () => {
    trackButtonClick('new_question')
    navigate('/')
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
          继续追问
        </h1>
        <p className="text-gray-600">针对之前的解读提出新的疑问</p>
        
        {/* 显示原始问题 */}
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800 font-medium">原始问题：</p>
            <p className="text-purple-900 mt-1 text-sm">{session.firstQuestion}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* 追问表单 */}
        {!followUpAnswer && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">提出新问题</h2>
            </div>
            
            <form onSubmit={handleSubmitFollowUp}>
              <div className="mb-6">
                <label htmlFor="followup" className="block text-lg font-medium text-gray-700 mb-3">
                  你想追问什么？
                </label>
                <textarea
                  id="followup"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="例如：具体该如何实施这些建议？或者：这个发展前景什么时候会实现？"
                  className="input-field min-h-[100px] resize-none"
                  maxLength={200}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>追问将结合原始牌阵进行深度分析</span>
                  <span>{followUpQuestion.length}/200</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !followUpQuestion.trim()}
                className="btn-primary w-full py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    AI思考中...
                  </div>
                ) : (
                  '🌟 获取奇迹解读'
                )}
              </button>
            </form>
          </div>
        )}

        {/* 追问结果 */}
        {followUpAnswer && (
          <div className="space-y-6 mb-8">
            {/* 追问问题显示 */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-medium">你的追问：</p>
              <p className="text-blue-900 mt-1">{followUpQuestion}</p>
            </div>

            {/* 追问解读结果 */}
            <div className={showMiracle ? 'animate-fade-in' : ''}>
              {/* 结论部分 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600">💡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-purple-800">追问结论</h3>
                </div>
                <p className="text-lg text-purple-900 font-medium">{followUpAnswer.conclusion}</p>
              </div>

              {/* 分析部分 */}
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-800">深度解析</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{followUpAnswer.analysis}</p>
              </div>

              {/* 建议部分 */}
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600">🌟</span>
                  </div>
                  <h3 className="text-xl font-semibold text-green-800">具体指导</h3>
                </div>
                <p className="text-green-900 font-medium">{followUpAnswer.advice}</p>
              </div>
            </div>

            {/* 奇迹见证效果 */}
            {showMiracle && (
              <div className="text-center mt-6 p-6 bg-yellow-50 rounded-xl border-l-4 border-yellow-500 animate-pulse">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-yellow-800 font-medium">奇迹正在发生！相信你的直觉和选择</p>
                <p className="text-yellow-600 text-sm mt-2">塔罗牌的指引会给你带来新的启示</p>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleGoBack}
            className="btn-secondary px-8"
          >
            ↩️ 返回解读页面
          </button>
          
          {followUpAnswer ? (
            <button 
              onClick={handleNewQuestion}
              className="btn-primary px-8"
            >
              🔮 提出新问题
            </button>
          ) : (
            <button 
              onClick={handleGoBack}
              className="btn-secondary px-8"
            >
              ↩️ 返回
            </button>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-3">追问功能说明</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• 追问会结合原始塔罗牌阵和当前问题进行深度分析</li>
            <li>• 奇迹见证功能会给予额外的正能量鼓励</li>
            <li>• 你可以无限次追问，每次都会获得专业的解答</li>
            <li>• 所有对话记录都会保存在本地，方便回顾</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FollowUpPage

// 添加淡入动画样式
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
`