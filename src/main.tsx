import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import SearchChatPage from './pages/search-chat.tsx'
import ChatPage from './pages/chat.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/search-chat",
    element: <ProtectedRoute><SearchChatPage /></ProtectedRoute>,
  },
  {
    path: "/chat/:id",
    element: <ProtectedRoute><ChatPage /></ProtectedRoute>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)

