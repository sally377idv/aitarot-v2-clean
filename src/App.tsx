import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import DrawResultPage from './pages/DrawResultPage'
import InterpretationPage from './pages/InterpretationPage'
import FollowUpPage from './pages/FollowUpPage'
import { DivinationSession } from './types'

function App() {
  const [sessionCache, setSessionCache] = useState<DivinationSession | null>(null)

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage 
              onSessionCreated={(session) => setSessionCache(session)}
            />} 
          />
          <Route 
            path="/draw-result" 
            element={<DrawResultPage 
              cachedSession={sessionCache}
              onSessionUpdated={(session) => setSessionCache(session)}
            />} 
          />
          <Route 
            path="/interpretation" 
            element={<InterpretationPage 
              cachedSession={sessionCache}
              onSessionUpdated={(session) => setSessionCache(session)}
            />} 
          />
          <Route 
            path="/follow-up" 
            element={<FollowUpPage 
              cachedSession={sessionCache}
              onSessionUpdated={(session) => setSessionCache(session)}
            />} 
          />
          {/* 处理404路由 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">页面未找到</h1>
                <p className="text-gray-600 mt-2">请检查URL或返回首页</p>
                <a href="/" className="btn-primary mt-4 inline-block">返回首页</a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App