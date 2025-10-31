import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EditPage from '@/pages/edit/Page'
import PaymentPage from './pages/payment/Page'
import NotFound from '@/pages/NotFound'
import { LocalStorageHelper } from './utils/localstorage'
import TimelapsePage from './pages/timelasp/Timelasp'
import Temp from './dev/pages/Temp'

const queryClient = new QueryClient()

function App() {
  LocalStorageHelper.clearAllMockupImages()

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<TimelapsePage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/temp" element={<Temp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
