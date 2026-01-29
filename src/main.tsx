import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}// Force rebuild Wed Jan 28 14:23:54 CST 2026
