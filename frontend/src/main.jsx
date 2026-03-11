import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.jsx'
import { RewardProvider } from "./context/RewardContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RewardProvider>
      <App />
    </RewardProvider>
  </StrictMode>,
)
