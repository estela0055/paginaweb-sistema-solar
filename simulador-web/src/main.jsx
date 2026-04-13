/*
  Archivo root/main.jsx:
  Es el primer script que React ejecuta al cargar. 
  Toma el componente <App /> y lo inserta dentro del <div id="root"></div> 
  que definimos en el archivo index.html.
*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
