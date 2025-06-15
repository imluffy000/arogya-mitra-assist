
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'; // Import i18n configuration
import { Suspense } from 'react';

createRoot(document.getElementById("root")!).render(
  <Suspense fallback="Loading...">
    <App />
  </Suspense>
);
