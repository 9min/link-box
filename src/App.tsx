import { Toaster } from 'sonner'
import { HomePage } from '@/pages/HomePage'

export default function App() {
  return (
    <>
      <HomePage />
      <Toaster position="bottom-right" richColors />
    </>
  )
}
