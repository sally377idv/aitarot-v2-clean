import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, saveSessionData } from '../services/sessionService'
import { DivinationSession } from '../types'

interface HomePageProps {
  onSessionCreated?: (session: DivinationSession) => void
}

const HomePage: React.FC<HomePageProps> = ({ onSessionCreated }) => {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 冥想引导提示词
  const meditationPrompts = [
    "深呼吸，让心灵平静下来，聚焦于你最想了解的问题...",
    "闭上眼睛，想象一道柔和的光芒笼罩着你，带来清晰的指引...",
    "你的内心深处，正在寻求什么样的答案？",
    "让思绪沉淀，感受内心的声音，它会指引你的方向..."
  ]

  const [currentPrompt, setCurrentPrompt] = useState(0)

  // 轮换冥想提示词
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % meditationPrompts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) {
      setError('请输入你的问题')
      return
    }

    if (question.length > 200) {
      setError('问题不能超过200字')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 创建新的占卜会话
      const session = await createSession(question)
      
      // 保存会话数据到本地存储
      saveSessionData(session)
      
      // 触发会话创建回调
      if (onSessionCreated) {
        onSessionCreated(session)
      }
      
      // 导航到抽牌页面
      setTimeout(() => {
        navigate('/draw-result', { state: { session } })
      }, 1000)
      
    } catch (err) {
      setError('创建会话失败，请重试')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
          🔮 AI塔罗-心灵奇旅
        </h1>
        <p className="text-lg text-gray-600">
          专业的AI塔罗牌占卜，为你提供心灵指引
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="w-full max-w-2xl">
        {/* 冥想引导 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600">💭</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">冥想引导</h2>
          </div>
          <p className="text-gray-700 italic transition-opacity duration-500">
            {meditationPrompts[currentPrompt]}
          </p>
        </div>

        {/* 问题输入表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <label htmlFor="question" className="block text-lg font-medium text-gray-700 mb-3">
              提出你的问题
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：我最近的工作发展前景如何？或者：我应该如何处理现在的关系问题？"
              className="input-field min-h-[120px] resize-none"
              maxLength={200}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>问题将作为AI解读的重要依据</span>
              <span>{question.length}/200</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="btn-primary w-full py-4 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                准备塔罗牌阵中...
              </div>
            ) : (
              '🔮 开始塔罗占卜'
            )}
          </button>
        </form>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• 提出具体、明确的问题能获得更准确的解读</li>
            <li>• AI将基于三张塔罗牌为你提供专业分析</li>
            <li>• 解读包含结论、分析和具体建议三部分</li>
            <li>• 如有疑问，可以在结果页面继续追问</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HomePage