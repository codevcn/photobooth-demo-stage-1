import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EditPage from '@/pages/edit/Page'
import PaymentPage from './pages/payment/Page'
import NotFound from '@/pages/NotFound'
import { LocalStorageHelper } from './utils/localstorage'
import TimelapsePage from './pages/timelasp/Timelasp'
import Temp from './dev/pages/Temp'
import { ToastContainer } from 'react-toastify'

function App() {
  LocalStorageHelper.clearAllMockupImages()

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // "light" | "dark" | "colored"
      />
      <Routes>
        <Route path="/" element={<TimelapsePage />} />
        <Route path="/edit" element={<EditPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/temp" element={<Temp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
