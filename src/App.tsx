import { Toaster } from 'sonner'
import { HomePage } from '@/pages/HomePage'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <HomePage />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  )
}
