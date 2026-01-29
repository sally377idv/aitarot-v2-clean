import { DivinationSession } from '../types'
import { drawCards } from './tarotService'

// 生成用户身份编码（基于IP和设备信息）
export function generateUserId(): string {
  // 在实际应用中，这里会结合设备信息和时间戳生成唯一ID
  // 简化实现：使用时间戳和随机数
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 3)
  return `uid_${timestamp}${random}`
}

// 获取用户IP地址（简化实现）
export function getUserIp(): string {
  // 在实际应用中，这里会从请求头或服务端获取真实IP
  // 简化实现：返回本地IP标识
  return 'local_ip'
}

// 创建新的占卜会话
export async function createSession(firstQuestion: string): Promise<DivinationSession> {
  const sessionId = generateSessionId()
  const timestamp = new Date().toISOString()
  const eventDay = timestamp.split('T')[0]
  
  // 抽三张牌
  const tarotResult = await drawCards(3)
  
  const session: DivinationSession = {
    sessionId,
    uid: generateUserId(),
    ip: getUserIp(),
    timestamp,
    firstQuestion,
    tarotResult,
    aiInterpretation: {
      conclusion: '',
      analysis: '',
      advice: ''
    },
    followUpQuestions: []
  }

  return session
}

// 生成会话ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 保存会话数据到本地存储
export function saveSessionData(session: DivinationSession): void {
  try {
    const sessions = getStoredSessions()
    sessions.push(session)
    localStorage.setItem('tarot_sessions', JSON.stringify(sessions))
  } catch (error) {
    console.error('保存会话数据失败:', error)
  }
}

// 获取存储的会话数据
export function getStoredSessions(): DivinationSession[] {
  try {
    const stored = localStorage.getItem('tarot_sessions')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('获取会话数据失败:', error)
    return []
  }
}

// 获取最近的会话
export function getLatestSession(): DivinationSession | null {
  const sessions = getStoredSessions()
  return sessions.length > 0 ? sessions[sessions.length - 1] : null
}

// 更新会话的AI解读结果
export function updateSessionInterpretation(
  sessionId: string, 
  interpretation: { conclusion: string; analysis: string; advice: string }
): boolean {
  try {
    const sessions = getStoredSessions()
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId)
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].aiInterpretation = interpretation
      localStorage.setItem('tarot_sessions', JSON.stringify(sessions))
      return true
    }
    return false
  } catch (error) {
    console.error('更新解读结果失败:', error)
    return false
  }
}

// 添加追问问题和答案
export function addFollowUpQuestion(
  sessionId: string, 
  question: string, 
  answer: string
): boolean {
  try {
    const sessions = getStoredSessions()
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId)
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].followUpQuestions.push({
        question,
        answer,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('tarot_sessions', JSON.stringify(sessions))
      return true
    }
    return false
  } catch (error) {
    console.error('添加追问失败:', error)
    return false
  }
}

// 收集用户行为数据
export function trackUserAction(action: string, metadata?: any): void {
  try {
    const actions = JSON.parse(localStorage.getItem('user_actions') || '[]')
    actions.push({
      action,
      timestamp: new Date().toISOString(),
      metadata,
      uid: generateUserId(),
      ip: getUserIp()
    })
    localStorage.setItem('user_actions', JSON.stringify(actions))
  } catch (error) {
    console.error('跟踪用户行为失败:', error)
  }
}

// 页面展示打点
export function trackPageView(page: string): void {
  trackUserAction(`${page}_show`)
}

// 按钮点击打点
export function trackButtonClick(button: string): void {
  trackUserAction(`${button}_click`)
}