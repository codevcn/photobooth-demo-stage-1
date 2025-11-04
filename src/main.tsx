import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './styles/fonts.css'
import './styles/animations.css'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')!).render(<App />)
