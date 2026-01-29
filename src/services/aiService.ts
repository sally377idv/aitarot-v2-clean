import { DrawnCard, AIInterpretation } from '../types'

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = 'sk-d20e3e5963754634ab8d9d391bf5bd3d' // 用户提供的API密钥

export interface AIRequest {
  question: string
  tarotCards: DrawnCard[]
  sessionId: string
}

export interface AIResponse {
  interpretation: AIInterpretation
  success: boolean
  error?: string
}

// 构建塔罗解读的提示词模板
function buildInterpretationPrompt(request: AIRequest): string {
  const { question, tarotCards } = request
  
  const cardsDescription = tarotCards.map((card, index) => {
    const orientation = card.isReversed ? '逆位' : '正位'
    return `位置${index + 1}: ${card.name} ${orientation}
    - 关键词: ${card.keywords.join('、')}
    - 元素: ${card.element}
    - 描述: ${card.description}
    - 牌义: ${card.isReversed ? card.reversed : card.upright}`
  }).join('\n\n')

  return `
你是一位精通塔罗牌意和占星学的大师。请基于以下信息进行专业的塔罗牌解读：

## 用户问题：
${question}

## 抽牌结果（三牌阵）：
${cardsDescription}

## 解读要求：
请你给出包含以下三部分的专业解读，每部分都要严格遵守字数限制：

1. **结论**（20字以内）：用一句话概括整体解读
2. **分析**（100字以内）：详细解析牌阵的含义和关联
3. **建议**（50字以内）：给出具体可行的建议

**注意：**
- 必须严格控制在字数限制内
- 分析要结合牌阵、牌面元素、关键词进行综合解读
- 语言要通俗易懂，避免过于专业的术语
- 建议要具体可行，具有实际指导意义

请严格按照以下JSON格式输出，不要包含其他内容：
{
  "conclusion": "你的结论，控制在20字以内",
  "analysis": "你的分析，控制在100字以内", 
  "advice": "你的建议，控制在50字以内"
}
`.trim()
}

// 解析AI响应
function parseAIResponse(responseText: string): AIInterpretation {
  try {
    // 尝试直接解析JSON
    const result = JSON.parse(responseText)
    
    // 验证必需字段
    if (!result.conclusion || !result.analysis || !result.advice) {
      throw new Error('响应缺少必需字段')
    }
    
    // 验证字数限制
    if (result.conclusion.length > 20) {
      result.conclusion = result.conclusion.substring(0, 20)
    }
    if (result.analysis.length > 100) {
      result.analysis = result.analysis.substring(0, 100)
    }
    if (result.advice.length > 50) {
      result.advice = result.advice.substring(0, 50)
    }
    
    return {
      conclusion: result.conclusion,
      analysis: result.analysis,
      advice: result.advice
    }
  } catch (error) {
    // 如果JSON解析失败，尝试从文本中提取
    return extractInterpretationFromText(responseText)
  }
}

// 从文本中提取解读内容（备用方案）
function extractInterpretationFromText(text: string): AIInterpretation {
  const lines = text.split('\n').filter(line => line.trim())
  
  let conclusion = ''
  let analysis = ''
  let advice = ''
  
  // 简单的关键词匹配提取
  lines.forEach(line => {
    const lowerLine = line.toLowerCase()
    if (lowerLine.includes('结论') || lowerLine.includes('概括') || lowerLine.includes('总结')) {
      conclusion = line.replace(/^(结论|概括|总结)[：:]\s*/, '').trim()
    } else if (lowerLine.includes('分析') || lowerLine.includes('解析')) {
      analysis = line.replace(/^(分析|解析)[：:]\s*/, '').trim()
    } else if (lowerLine.includes('建议') || lowerLine.includes('指导')) {
      advice = line.replace(/^(建议|指导)[：:]\s*/, '').trim()
    }
  })
  
  // 如果没找到明确的分段，尝试智能分割
  if (!conclusion && !analysis && !advice) {
    const sentences = text.split(/[。！？]/).filter(s => s.trim())
    if (sentences.length >= 3) {
      conclusion = sentences[0].trim()
      analysis = sentences[1].trim()
      advice = sentences[2].trim()
    } else if (sentences.length > 0) {
      // 简单分割
      const mid = Math.ceil(sentences.length / 3)
      conclusion = sentences.slice(0, mid).join('。')
      analysis = sentences.slice(mid, mid * 2).join('。')
      advice = sentences.slice(mid * 2).join('。')
    }
  }
  
  // 应用字数限制
  return {
    conclusion: conclusion.substring(0, 20),
    analysis: analysis.substring(0, 100),
    advice: advice.substring(0, 50)
  }
}

// 调用DeepSeek API获取解读
export async function getAIInterpretation(request: AIRequest): Promise<AIResponse> {
  try {
    const prompt = buildInterpretationPrompt(request)
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的塔罗牌占卜大师，精通塔罗牌意和占星学。请严格按照要求的格式和字数限制进行解读。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content
    
    if (!responseText) {
      throw new Error('API响应格式错误')
    }
    
    const interpretation = parseAIResponse(responseText)
    
    return {
      interpretation,
      success: true
    }
    
  } catch (error) {
    console.error('AI服务调用失败:', error)
    
    // 降级方案：使用预定义的解读模板
    const fallbackInterpretation = getFallbackInterpretation(request)
    
    return {
      interpretation: fallbackInterpretation,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

// 降级方案：预定义的解读模板
function getFallbackInterpretation(request: AIRequest): AIInterpretation {
  const { tarotCards } = request
  const positiveCards = tarotCards.filter(card => !card.isReversed).length
  const isPositiveOutlook = positiveCards >= 2
  
  if (isPositiveOutlook) {
    return {
      conclusion: "整体趋势较为积极，充满可能性",
      analysis: "牌阵显示当前局势有利于发展，多数牌面为正位，表明能量流动顺畅。需要把握机遇，但也要注意平衡。",
      advice: "积极行动，保持开放心态，注重人际关系"
    }
  } else {
    return {
      conclusion: "需要谨慎应对当前挑战",
      analysis: "牌阵提示存在一些挑战和需要克服的困难，逆位牌较多表明能量受阻。建议深入思考问题本质。",
      advice: "保持耐心，重新评估计划，寻求支持"
    }
  }
}

// 追问解读服务
export async function getFollowUpInterpretation(
  originalRequest: AIRequest,
  followUpQuestion: string
): Promise<AIResponse> {
  const enhancedRequest = {
    ...originalRequest,
    question: `原始问题：${originalRequest.question}\n追问：${followUpQuestion}`
  }
  
  return getAIInterpretation(enhancedRequest)
}

// 验证API密钥是否配置
export function isAIConfigured(): boolean {
  return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 10 && DEEPSEEK_API_KEY.startsWith('sk-')
}