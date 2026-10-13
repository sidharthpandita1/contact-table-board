import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { seedContacts } from './data/contacts'
import './index.css'
import { ContactsProvider } from './store/ContactsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContactsProvider initialContacts={seedContacts}>
      <App />
    </ContactsProvider>
  </StrictMode>,
)
