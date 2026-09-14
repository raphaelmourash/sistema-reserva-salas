import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // 1. Mude de BrowserRouter para HashRouter

// Importações do PrimeReact e ícones
import 'primereact/resources/themes/lara-light-cyan/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* 2. Troque a tag para <HashRouter> */}
      <App />
    </HashRouter>
  </StrictMode>,
)