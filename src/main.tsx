import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Report design system — must come before Tailwind so Tailwind utilities can override when needed
import './assets/report.css'
import './index.css'
import App from './App.tsx'

// Load manifest for dynamic tab detection (used by GenericAnalysisTab)
fetch('./data/manifest.json')
  .then(r => r.json())
  .then(m => { (window as any).__CLAYTON_MANIFEST__ = m; })
  .catch(() => { /* manifest not available — tabs will show all */ });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
