import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPushNotifications } from './app/utils/notifications'
import { restoreLocale } from './app/i18n'
import { restoreDeviceId } from './app/utils/device'

// Restore the saved language from the native store BEFORE first paint, so a
// reopened app comes up directly in the user's language (incl. Arabic RTL).
Promise.allSettled([restoreLocale(), restoreDeviceId()]).finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})

initPushNotifications();
