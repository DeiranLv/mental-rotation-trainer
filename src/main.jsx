import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAuth } from './firebase/firebaseConfig.js'

initAuth().then(() => {
  createRoot(document.getElementById('root')).render(
    <App />
  );
})
