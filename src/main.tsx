import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ModoCtx, ehProfessor } from './curso'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModoCtx.Provider value={ehProfessor() ? 'professor' : 'aluno'}>
      <App />
    </ModoCtx.Provider>
  </StrictMode>,
)
