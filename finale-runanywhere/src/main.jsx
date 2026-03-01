import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppStateProvider } from './store/appStore'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </ErrorBoundary>
  </StrictMode>
)